"""Public item endpoints: search, submit, list, delete, and report flows."""

import os
import shutil
import uuid
from datetime import datetime

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from pymongo.errors import DuplicateKeyError

from app_state import create_user_notification, get_image_url, get_user_phone, require_db
from config import FOUND_IMG_FOLDER, LOST_IMG_FOLDER, STORAGE_DIR
from logic import calculate_match_score, extract_features

router = APIRouter()


@router.post("/search")
async def search_items(
    type: str = Form(...),
    name: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    subcategory: str = Form(...),
    color: str = Form(...),
    location: str = Form(...),
    date: str = Form(...),
    image: UploadFile = File(None),
):
    """
    Receives an item report & image.
    Scans the opposite collection and returns potential matches.
    """
    # Search is read-heavy; keep the flow explicit and easy to tune later.
    db = require_db()

    mode = type.lower()
    if mode not in ["lost", "found"]:
        raise HTTPException(status_code=400, detail="Invalid type. Must be 'lost' or 'found'")

    # Lost searches against found listings, and vice versa.
    target_col_name = "found_items" if mode == "lost" else "lost_items"

    # Save uploaded query image to temp folder so feature extractors can read it.
    query_img_path = None
    if image:
        temp_dir = STORAGE_DIR / "temp"
        temp_dir.mkdir(exist_ok=True)
        ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        query_img_path = temp_dir / filename

        with open(query_img_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        query_img_path = str(query_img_path)

    # Normalized query payload consumed by text/image scoring.
    query_item = {
        "name": name,
        "description": description,
        "category": category,
        "subcategory": subcategory,
        "color": color,
        "location": location,
        "date_lost" if mode == "lost" else "date_found": date,
    }

    try:
        q_feats = extract_features(query_item, query_img_path)
    except Exception as e:
        print(f"Feature extraction failed: {e}")
        return {"matches": [], "message": f"Feature extraction failed: {str(e)}"}

    # Only active posts should be match candidates.
    targets = list(db[target_col_name].find({"status": "active"}))
    matches = []

    print(f"Scanning {len(targets)} items in {target_col_name}...")

    for t in targets:
        # Fast category gate before expensive model calls.
        if str(query_item.get("category", "")).lower().strip() != str(t.get("category", "")).lower().strip():
            continue

        try:
            t_path = t.get("image_path")
            t_feats = extract_features(t, t_path)
            score = calculate_match_score(query_item, query_img_path, q_feats, t, t_path, t_feats)

            # Tunable threshold. Raise for precision, lower for recall.
            if score > 0.4:
                t["_id"] = str(t["_id"])
                t["final_score"] = score
                t["image_url"] = get_image_url(t.get("image_path"))
                t["phone"] = get_user_phone(t.get("uid"))
                matches.append(t)
        except Exception as e:
            print(f"Error processing target {t.get('_id')}: {e}")
            continue

    # Return top 5 best candidates to keep response quick and focused.
    matches = sorted(matches, key=lambda x: x["final_score"], reverse=True)
    return {"matches": matches[:5]}


@router.post("/submit")
async def submit_item(
    type: str = Form(...),
    name: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    subcategory: str = Form(...),
    color: str = Form(...),
    location: str = Form(...),
    date: str = Form(...),
    image: UploadFile = File(None),
    uid: str = Form(None),
):
    """Saves the item to the database."""
    # Submissions start in pending; admins decide visibility.
    db = require_db()

    mode = type.lower()
    if mode not in ["lost", "found"]:
        raise HTTPException(status_code=400, detail="Invalid type")

    collection_name = "lost_items" if mode == "lost" else "found_items"
    target_folder = LOST_IMG_FOLDER if mode == "lost" else FOUND_IMG_FOLDER

    saved_img_path = None
    if image:
        ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        saved_img_path = target_folder / filename

        with open(saved_img_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        saved_img_path = str(saved_img_path)

    # Keep date field aligned with post type for easier legacy compatibility.
    item_doc = {
        "name": name,
        "description": description,
        "category": category,
        "subcategory": subcategory,
        "color": color,
        "location": location,
        "date_lost" if mode == "lost" else "date_found": date,
        "image_path": saved_img_path,
        "uid": uid,
        "created_at": datetime.now(),
        "status": "pending",
    }

    result = db[collection_name].insert_one(item_doc)
    return {"status": "success", "id": str(result.inserted_id), "message": "Item registered successfully"}


@router.get("/items")
async def get_all_items():
    """Fetches active items from both collections."""
    # Public listing endpoint used by browse/search pages.
    _db = require_db()

    all_items = []

    lost_items = list(_db["lost_items"].find({"status": "active"}))
    for item in lost_items:
        item["_id"] = str(item["_id"])
        item["type"] = "lost"
        item["image_url"] = get_image_url(item.get("image_path"))
        item["phone"] = get_user_phone(item.get("uid"))
        all_items.append(item)

    found_items = list(_db["found_items"].find({"status": "active"}))
    for item in found_items:
        item["_id"] = str(item["_id"])
        item["type"] = "found"
        item["image_url"] = get_image_url(item.get("image_path"))
        item["phone"] = get_user_phone(item.get("uid"))
        all_items.append(item)

    all_items.sort(key=lambda x: x.get("created_at", datetime.min), reverse=True)
    return {"items": all_items}


@router.delete("/items/{item_id}")
async def delete_item(item_id: str):
    # Remove uploaded image as part of cleanup to avoid disk leaks.
    db = require_db()
    from bson import ObjectId

    for coll in ["lost_items", "found_items"]:
        try:
            item = db[coll].find_one({"_id": ObjectId(item_id)})
            if item:
                img_path = item.get("image_path")
                if img_path and os.path.exists(img_path):
                    try:
                        os.remove(img_path)
                    except Exception as e:
                        print(f"Failed to delete image: {e}")

                db[coll].delete_one({"_id": ObjectId(item_id)})
                return {"status": "success", "message": "Item deleted successfully"}
        except Exception:
            continue

    raise HTTPException(status_code=404, detail="Item not found")


class ReportRequest(BaseModel):
    reporter_uid: str
    reason: str


@router.post("/items/{item_id}/report")
async def report_item(item_id: str, body: ReportRequest):
    """Flag an item as suspicious."""
    # Reporting creates a moderation ticket for admin review.
    db = require_db()
    from bson import ObjectId

    found = False
    for coll in ["lost_items", "found_items"]:
        try:
            if db[coll].find_one({"_id": ObjectId(item_id)}):
                found = True
                break
        except Exception:
            pass

    if not found:
        raise HTTPException(status_code=404, detail="Item not found")

    # App-level duplicate guard (DB unique index exists as backup safety).
    existing = db["reports"].find_one(
        {
            "item_id": item_id,
            "reporter_uid": body.reporter_uid,
        }
    )
    if existing:
        raise HTTPException(status_code=409, detail="You already reported this listing")

    report_doc = {
        "item_id": item_id,
        "reporter_uid": body.reporter_uid,
        "reason": body.reason,
        "status": "pending",
        "created_at": datetime.now(),
    }

    try:
        result = db["reports"].insert_one(report_doc)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="You already reported this listing")

    create_user_notification(
        body.reporter_uid,
        "Report submitted",
        "Your report was sent to admins for review.",
        "system",
    )

    return {"status": "success", "report_id": str(result.inserted_id)}
