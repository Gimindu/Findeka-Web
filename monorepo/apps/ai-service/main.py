import shutil
import uuid
import os
from pathlib import Path
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from pydantic import BaseModel

from models_loader import model_manager
from config import MONGO_URI, DB_NAME, LOST_IMG_FOLDER, FOUND_IMG_FOLDER, STORAGE_DIR, LOST_IMG_FOLDER
from logic import extract_features, calculate_match_score

# DB Client
mongo_client: MongoClient = None
db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global db
    print("🚀 Connecting to MongoDB...")
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        # Enforce: one user can only report the same item once.
        db["reports"].create_index(
            [("item_id", 1), ("reporter_uid", 1)],
            unique=True,
            name="uniq_item_reporter"
        )
        db["notifications"].create_index(
            [("uid", 1), ("created_at", -1)],
            name="idx_notifications_user_time"
        )
        print("✅ Connected to MongoDB")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")

    model_manager.load_models()
    yield
    # Shutdown
    if mongo_client:
        mongo_client.close()
    print("🛑 Shutting down AI Service")

app = FastAPI(lifespan=lifespan, title="Findeka AI Service")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for Response ---
class ItemMatch(BaseModel):
    id: str
    name: str
    description: str
    score: float
    image_url: Optional[str] = None
    # Add other fields as needed


class UserNotificationRequest(BaseModel):
    uid: str

from fastapi.staticfiles import StaticFiles

# --- Endpoints ---

app.mount("/static", StaticFiles(directory=STORAGE_DIR), name="static")

def get_image_url(image_path: str) -> Optional[str]:
    """Converts local absolute path to static URL"""
    if not image_path:
        return None
    try:
        # Assuming image_path is inside STORAGE_DIR
        # We need the part relative to STORAGE_DIR
        # e.g. .../storage/lost_images/abc.jpg -> lost_images/abc.jpg
        p = Path(image_path)
        rel_path = p.relative_to(STORAGE_DIR)
        # For localhost testing. In prod this should be env var
        return f"http://localhost:8001/static/{rel_path}".replace("\\", "/") # Ensure forward slashes for URL
    except ValueError:
        return None


def create_user_notification(uid: str, title: str, message: str, notif_type: str = "update"):
    if db is None or not uid:
        return
    db["notifications"].insert_one(
        {
            "uid": uid,
            "title": title,
            "message": message,
            "type": notif_type,
            "read": False,
            "created_at": datetime.now(),
        }
    )

# --- Pydantic Models for Response ---

@app.get("/")
def read_root():
    return {
        "status": "online", 
        "message": "Findeka AI Service is running",
        "models": {
            "bert": model_manager.bert_model is not None,
            "clip": model_manager.clip_model is not None,
            "mobilenet": model_manager.mobilenet_model is not None,
            "ocr": model_manager.ocr_reader is not None
        }
    }

@app.post("/search")
async def search_items(
    type: str = Form(...), # 'lost' or 'found'
    name: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    subcategory: str = Form(...),
    color: str = Form(...),
    location: str = Form(...),
    date: str = Form(...),
    image: UploadFile = File(None)
):
    """
    Receives an item report & image.
    Scans the OPPOSITE collection (if type='lost', scan 'found_items').
    Returns list of potential matches.
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # 1. Determine modes
    mode = type.lower()
    if mode not in ['lost', 'found']:
        raise HTTPException(status_code=400, detail="Invalid type. Must be 'lost' or 'found'")
    
    target_col_name = "found_items" if mode == "lost" else "lost_items"
    
    # 2. Handle Image Upload (Temp Save)
    query_img_path = None
    if image:
        # Create temp folder
        temp_dir = STORAGE_DIR / "temp"
        temp_dir.mkdir(exist_ok=True)
        ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        query_img_path = temp_dir / filename
        
        with open(query_img_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        query_img_path = str(query_img_path)

    # 3. Build Query Object
    query_item = {
        "name": name,
        "description": description,
        "category": category,
        "subcategory": subcategory,
        "color": color,
        "location": location,
        "date_lost" if mode == "lost" else "date_found": date,
    }

    # 4. Extract Query Features
    try:
        q_feats = extract_features(query_item, query_img_path)
    except Exception as e:
        print(f"Feature extraction failed: {e}")
        return {"matches": [], "message": f"Feature extraction failed: {str(e)}"}

    # 5. Fetch Candidates from DB – only approved (active) items
    targets = list(db[target_col_name].find({"status": "active"}))
    matches = []

    print(f"🔄 Scanning {len(targets)} items in {target_col_name}...")

    for t in targets:
        # --- STAGE 1: FILTERING (Basic) ---
        # Category Gate
        if str(query_item.get('category','')).lower().strip() != str(t.get('category','')).lower().strip():
            continue
        
        # Extract features for target
        try:
            t_path = t.get('image_path')
            # Only match if t_path exists or we accept text-only matches with lower score
            # The script assumes existing paths. 
            t_feats = extract_features(t, t_path)
            
            score = calculate_match_score(query_item, query_img_path, q_feats, t, t_path, t_feats)
            
            if score > 0.4: # Threshold
                # Convert ObjectId to string for JSON
                t['_id'] = str(t['_id'])
                t['final_score'] = score
                t['image_url'] = get_image_url(t.get('image_path'))
                matches.append(t)
        except Exception as e:
            print(f"Error processing target {t.get('_id')}: {e}")
            continue

    # Sort matches
    matches = sorted(matches, key=lambda x: x['final_score'], reverse=True)
    
    # Limit to top 5
    return {"matches": matches[:5]}


@app.post("/submit")
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
    uid: str = Form(None)
):
    """
    Saves the item to the database (if no match was found/accepted).
    Moves temp image to permanent storage.
    """
    if db is None:
         raise HTTPException(status_code=500, detail="Database not connected")

    mode = type.lower()
    if mode not in ['lost', 'found']:
         raise HTTPException(status_code=400, detail="Invalid type")
    
    collection_name = "lost_items" if mode == "lost" else "found_items"
    target_folder = LOST_IMG_FOLDER if mode == "lost" else FOUND_IMG_FOLDER

    # Handle Image
    saved_img_path = None
    if image:
        ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        saved_img_path = target_folder / filename
        
        with open(saved_img_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        saved_img_path = str(saved_img_path)

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
        "status": "pending"  # pending → admin approves → active | rejected
    }

    result = db[collection_name].insert_one(item_doc)
    
    return {"status": "success", "id": str(result.inserted_id), "message": "Item registered successfully"}

@app.get("/items")
async def get_all_items():
    """
    Fetches all items from both 'lost_items' and 'found_items' collections.
    Returns them combined, with IDs converted to strings and image URLs resolved.
    """
    global db
    _db = db
    if _db is None:
         # Fallback connection if global db is not set
         try:
             client = MongoClient(MONGO_URI)
             _db = client[DB_NAME]
         except Exception as e:
             raise HTTPException(status_code=500, detail="Database not connected")


    all_items = []
    
    # Fetch lost items – only "active" ones are visible to regular users
    lost_items = list(_db["lost_items"].find({"status": "active"}))
    for item in lost_items:
        item["_id"] = str(item["_id"])
        item["type"] = "lost"
        item["image_url"] = get_image_url(item.get("image_path"))
        all_items.append(item)
        
    # Fetch found items – only "active" ones
    found_items = list(_db["found_items"].find({"status": "active"}))
    for item in found_items:
        item["_id"] = str(item["_id"])
        item["type"] = "found"
        item["image_url"] = get_image_url(item.get("image_path"))
        all_items.append(item)

    # Sort by creation date descending
    all_items.sort(key=lambda x: x.get("created_at", datetime.min), reverse=True)
    
    return {"items": all_items}


@app.get("/user/items")
async def get_user_items(uid: str):
    """Fetches all items submitted by a specific user, regardless of moderation status."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    user_items = []

    for coll_name, item_type in [("lost_items", "lost"), ("found_items", "found")]:
        items = list(db[coll_name].find({"uid": uid}))
        for item in items:
            item["_id"] = str(item["_id"])
            item["type"] = item_type
            item["image_url"] = get_image_url(item.get("image_path"))
            user_items.append(item)

    user_items.sort(key=lambda x: x.get("created_at", datetime.min), reverse=True)
    return {"items": user_items}

# --- User Profile & Settings ---

@app.get("/user/profile")
async def get_user_profile(uid: str):
    if db is None:
         raise HTTPException(status_code=500, detail="Database not connected")
    user = db["users"].find_one({"firebase_uid": uid})
    if not user:
         return {"firebase_uid": uid, "firstName": "New User", "lastName": "", "location": "Unknown", "stats": {"points": 0, "items_found": 0, "matches": 0}}
    user["_id"] = str(user["_id"])
    return user

@app.put("/user/profile")
async def update_user_profile(uid: str, data: dict):
    if db is None:
         raise HTTPException(status_code=500, detail="Database not connected")
    
    # Exclude _id if present in data
    if "_id" in data:
        del data["_id"]

    db["users"].update_one(
        {"firebase_uid": uid},
        {"$set": data},
        upsert=True
    )
    return {"status": "success"}

@app.get("/user/settings")
async def get_user_settings(uid: str):
    if db is None:
         raise HTTPException(status_code=500, detail="Database not connected")
    settings = db["user_settings"].find_one({"firebase_uid": uid})
    if not settings:
         return {
             "firebase_uid": uid, 
             "emailNotifications": True, 
             "pushNotifications": True,
             "matchAlerts": True,
             "newsletter": False,
             "publicProfile": True,
             "locationSharing": False
         }
    settings["_id"] = str(settings["_id"])
    return settings

@app.put("/user/settings")
async def update_user_settings(uid: str, data: dict):
    if db is None:
         raise HTTPException(status_code=500, detail="Database not connected")

    if "_id" in data:
        del data["_id"]

    db["user_settings"].update_one(
        {"firebase_uid": uid},
        {"$set": data},
        upsert=True
    )
    return {"status": "success"}


@app.get("/user/notifications")
async def get_user_notifications(uid: str):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    notifications = []
    for notif in db["notifications"].find({"uid": uid}).sort("created_at", -1).limit(100):
        notif["_id"] = str(notif["_id"])
        notifications.append(notif)
    return {"notifications": notifications}


@app.post("/user/notifications/read-all")
async def mark_all_notifications_read(uid: str):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    db["notifications"].update_many(
        {"uid": uid, "read": False},
        {"$set": {"read": True, "read_at": datetime.now()}},
    )
    return {"status": "success"}


@app.post("/user/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, uid: str):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    from bson import ObjectId

    result = db["notifications"].update_one(
        {"_id": ObjectId(notification_id), "uid": uid},
        {"$set": {"read": True, "read_at": datetime.now()}},
    )
    if not result.matched_count:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "success"}

@app.delete("/items/{item_id}")
async def delete_item(item_id: str):
    if db is None:
         raise HTTPException(status_code=500, detail="Database not connected")
    from bson import ObjectId
    import os
    
    collections = ['lost_items', 'found_items']
    for coll in collections:
        try:
            item = db[coll].find_one({"_id": ObjectId(item_id)})
            if item:
                img_path = item.get('image_path')
                if img_path and os.path.exists(img_path):
                    try:
                        os.remove(img_path)
                    except Exception as e:
                        print(f"Failed to delete image: {e}")
                
                result = db[coll].delete_one({"_id": ObjectId(item_id)})
                return {"status": "success", "message": "Item deleted successfully"}
        except Exception as e:
            continue
            
    raise HTTPException(status_code=404, detail="Item not found")


# ─────────────────────────────────────────────────────────────
#  REPORTING – Any user can flag a post as suspicious
# ─────────────────────────────────────────────────────────────

class ReportRequest(BaseModel):
    reporter_uid: str
    reason: str

@app.post("/items/{item_id}/report")
async def report_item(item_id: str, body: ReportRequest):
    """Flag an item as suspicious. Creates a record in the 'reports' collection."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    from bson import ObjectId

    # Verify the item exists
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

    # Prevent duplicate reports by the same user for the same item.
    existing = db["reports"].find_one({
        "item_id": item_id,
        "reporter_uid": body.reporter_uid,
    })
    if existing:
        raise HTTPException(status_code=409, detail="You already reported this listing")

    report_doc = {
        "item_id": item_id,
        "reporter_uid": body.reporter_uid,
        "reason": body.reason,
        "status": "pending",   # pending | resolved | rejected
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


# ─────────────────────────────────────────────────────────────
#  ADMIN – All endpoints require the client to send
#  X-Admin-UID header; we verify role == "admin" in DB.
# ─────────────────────────────────────────────────────────────

def _require_admin(uid: str):
    """Raise 403 if uid does not belong to an admin account."""
    if not uid:
        raise HTTPException(status_code=403, detail="Admin UID required")
    user = db["users"].find_one({"firebase_uid": uid})
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden: admin access only")


@app.get("/admin/stats")
async def admin_stats(uid: str):
    """Summary counts for the admin dashboard."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    _require_admin(uid)

    lost_total   = db["lost_items"].count_documents({})
    found_total  = db["found_items"].count_documents({})
    pending      = (db["lost_items"].count_documents({"status": "pending"}) +
                    db["found_items"].count_documents({"status": "pending"}))
    rejected     = (db["lost_items"].count_documents({"status": "rejected"}) +
                    db["found_items"].count_documents({"status": "rejected"}))
    total_users  = db["users"].count_documents({})
    open_reports = db["reports"].count_documents({"status": "pending"})

    return {
        "total_posts": lost_total + found_total,
        "pending_review": pending,
        "rejected_posts": rejected,
        "total_users": total_users,
        "open_reports": open_reports,
    }


@app.get("/admin/posts/pending")
async def admin_pending_posts(uid: str):
    """All items with status == 'pending', waiting for admin review."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    _require_admin(uid)

    items = []
    for coll, item_type in [("lost_items", "lost"), ("found_items", "found")]:
        for item in db[coll].find({"status": "pending"}):
            item["_id"] = str(item["_id"])
            item["type"] = item_type
            item["image_url"] = get_image_url(item.get("image_path"))
            items.append(item)

    items.sort(key=lambda x: x.get("created_at", datetime.min), reverse=True)
    return {"items": items}


@app.post("/admin/posts/{item_id}/approve")
async def admin_approve_post(item_id: str, uid: str):
    """Set item status to 'active' so it appears in the public search."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    _require_admin(uid)
    from bson import ObjectId

    for coll in ["lost_items", "found_items"]:
        try:
            item = db[coll].find_one({"_id": ObjectId(item_id)})
            result = db[coll].update_one(
                {"_id": ObjectId(item_id)},
                {"$set": {"status": "active", "reviewed_at": datetime.now()}}
            )
            if result.matched_count:
                if item and item.get("uid"):
                    create_user_notification(
                        item.get("uid"),
                        "Listing approved",
                        "Your listing has been approved and is now visible.",
                        "update",
                    )
                return {"status": "success", "message": "Post approved"}
        except Exception:
            pass
    raise HTTPException(status_code=404, detail="Item not found")


@app.post("/admin/posts/{item_id}/reject")
async def admin_reject_post(item_id: str, uid: str, reason: str = ""):
    """Move item to recycling bin (status = 'rejected')."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    _require_admin(uid)
    from bson import ObjectId

    for coll in ["lost_items", "found_items"]:
        try:
            item = db[coll].find_one({"_id": ObjectId(item_id)})
            result = db[coll].update_one(
                {"_id": ObjectId(item_id)},
                {"$set": {"status": "rejected", "reject_reason": reason, "reviewed_at": datetime.now()}}
            )
            if result.matched_count:
                if item and item.get("uid"):
                    create_user_notification(
                        item.get("uid"),
                        "Listing rejected",
                        "Your listing was moved to recycling bin by admin review.",
                        "alert",
                    )
                return {"status": "success", "message": "Post rejected and moved to recycling bin"}
        except Exception:
            pass
    raise HTTPException(status_code=404, detail="Item not found")


@app.get("/admin/posts/recycled")
async def admin_recycled_posts(uid: str):
    """Items in the recycling bin (status == 'rejected')."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    _require_admin(uid)

    items = []
    for coll, item_type in [("lost_items", "lost"), ("found_items", "found")]:
        for item in db[coll].find({"status": "rejected"}):
            item["_id"] = str(item["_id"])
            item["type"] = item_type
            item["image_url"] = get_image_url(item.get("image_path"))
            items.append(item)

    items.sort(key=lambda x: x.get("reviewed_at", datetime.min), reverse=True)
    return {"items": items}


@app.post("/admin/posts/{item_id}/restore")
async def admin_restore_post(item_id: str, uid: str):
    """Restore a rejected item back to 'pending' for re-review."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    _require_admin(uid)
    from bson import ObjectId

    for coll in ["lost_items", "found_items"]:
        try:
            result = db[coll].update_one(
                {"_id": ObjectId(item_id)},
                {"$set": {"status": "pending"}, "$unset": {"reject_reason": "", "reviewed_at": ""}}
            )
            if result.matched_count:
                return {"status": "success", "message": "Post restored to pending review"}
        except Exception:
            pass
    raise HTTPException(status_code=404, detail="Item not found")


@app.delete("/admin/posts/{item_id}/permanent")
async def admin_delete_post_permanent(item_id: str, uid: str):
    """Permanently delete an item (removes image file too)."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    _require_admin(uid)
    from bson import ObjectId
    import os

    for coll in ["lost_items", "found_items"]:
        try:
            item = db[coll].find_one({"_id": ObjectId(item_id)})
            if item:
                img_path = item.get("image_path")
                if img_path and os.path.exists(img_path):
                    try:
                        os.remove(img_path)
                    except Exception:
                        pass
                db[coll].delete_one({"_id": ObjectId(item_id)})
                return {"status": "success", "message": "Item permanently deleted"}
        except Exception:
            pass
    raise HTTPException(status_code=404, detail="Item not found")


@app.get("/admin/users")
async def admin_get_users(uid: str):
    """List all registered users."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    _require_admin(uid)

    users = []
    for user in db["users"].find():
        user["_id"] = str(user["_id"])
        users.append(user)
    return {"users": users}


@app.post("/admin/users/{target_uid}/suspend")
async def admin_suspend_user(target_uid: str, uid: str):
    """Suspend a user account (sets suspended: true)."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    _require_admin(uid)

    db["users"].update_one(
        {"firebase_uid": target_uid},
        {"$set": {"suspended": True}},
        upsert=True
    )
    return {"status": "success", "message": "User suspended"}


@app.post("/admin/users/{target_uid}/unsuspend")
async def admin_unsuspend_user(target_uid: str, uid: str):
    """Re-enable a previously suspended user."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    _require_admin(uid)

    db["users"].update_one(
        {"firebase_uid": target_uid},
        {"$set": {"suspended": False}},
        upsert=True
    )
    return {"status": "success", "message": "User unsuspended"}


@app.delete("/admin/users/{target_uid}")
async def admin_delete_user(target_uid: str, uid: str):
    """Remove a user record and all their posts from the database."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    _require_admin(uid)
    import os

    # Delete their posts
    for coll in ["lost_items", "found_items"]:
        items = list(db[coll].find({"uid": target_uid}))
        for item in items:
            img_path = item.get("image_path")
            if img_path and os.path.exists(img_path):
                try:
                    os.remove(img_path)
                except Exception:
                    pass
        db[coll].delete_many({"uid": target_uid})

    db["users"].delete_one({"firebase_uid": target_uid})
    db["user_settings"].delete_one({"firebase_uid": target_uid})
    return {"status": "success", "message": "User and all their data deleted"}


@app.get("/admin/reports")
async def admin_get_reports(uid: str):
    """List all user-submitted reports, with item details embedded."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    _require_admin(uid)
    from bson import ObjectId

    reports = []
    for report in db["reports"].find().sort("created_at", -1):
        report["_id"] = str(report["_id"])
        item_id = report.get("item_id")
        report["item"] = None
        if item_id:
            for coll, item_type in [("lost_items", "lost"), ("found_items", "found")]:
                try:
                    item = db[coll].find_one({"_id": ObjectId(item_id)})
                    if item:
                        item["_id"] = str(item["_id"])
                        item["type"] = item_type
                        item["image_url"] = get_image_url(item.get("image_path"))
                        report["item"] = item
                        break
                except Exception:
                    pass
        reports.append(report)
    return {"reports": reports}


@app.post("/admin/reports/{report_id}/resolve")
async def admin_resolve_report(report_id: str, uid: str):
    """Mark a report as resolved."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    _require_admin(uid)
    from bson import ObjectId

    report = db["reports"].find_one({"_id": ObjectId(report_id)})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    result = db["reports"].update_one(
        {"_id": ObjectId(report_id)},
        {"$set": {"status": "resolved", "resolved_at": datetime.now()}}
    )
    if not result.matched_count:
        raise HTTPException(status_code=404, detail="Report not found")

    create_user_notification(
        report.get("reporter_uid"),
        "Report resolved",
        "An admin reviewed your report and marked it resolved.",
        "update",
    )

    return {"status": "success", "message": "Report resolved"}


@app.post("/admin/reports/{report_id}/reject")
async def admin_reject_report(report_id: str, uid: str):
    """Reject a report (report closed, item kept)."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    _require_admin(uid)
    from bson import ObjectId

    report = db["reports"].find_one({"_id": ObjectId(report_id)})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    result = db["reports"].update_one(
        {"_id": ObjectId(report_id)},
        {
            "$set": {
                "status": "rejected",
                "resolved_at": datetime.now(),
                "review_action": "report_rejected",
            }
        }
    )
    if not result.matched_count:
        raise HTTPException(status_code=404, detail="Report not found")

    create_user_notification(
        report.get("reporter_uid"),
        "Report rejected",
        "An admin reviewed your report and decided to keep the listing.",
        "alert",
    )

    return {"status": "success", "message": "Report rejected"}


@app.post("/admin/reports/{report_id}/remove-item")
async def admin_remove_item_from_report(report_id: str, uid: str):
    """Delete the reported item and resolve the report."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    _require_admin(uid)
    from bson import ObjectId
    import os

    report = db["reports"].find_one({"_id": ObjectId(report_id)})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    item_id = report.get("item_id")
    item_deleted = False
    owner_uid = None

    if item_id:
        for coll in ["lost_items", "found_items"]:
            try:
                item = db[coll].find_one({"_id": ObjectId(item_id)})
                if item:
                    owner_uid = item.get("uid")
                    img_path = item.get("image_path")
                    if img_path and os.path.exists(img_path):
                        try:
                            os.remove(img_path)
                        except Exception:
                            pass
                    db[coll].delete_one({"_id": ObjectId(item_id)})
                    item_deleted = True
                    break
            except Exception:
                pass

    db["reports"].update_one(
        {"_id": ObjectId(report_id)},
        {
            "$set": {
                "status": "resolved",
                "resolved_at": datetime.now(),
                "review_action": "item_removed" if item_deleted else "item_missing_report_closed",
            }
        }
    )

    create_user_notification(
        report.get("reporter_uid"),
        "Reported item removed",
        "Admin removed the listing you reported. Thank you for helping keep the community safe.",
        "system",
    )

    if owner_uid:
        create_user_notification(
            owner_uid,
            "Your listing was removed",
            "An admin removed your listing after a safety review.",
            "alert",
        )

    if item_deleted:
        return {"status": "success", "message": "Item removed and report resolved"}
    return {"status": "success", "message": "Item not found. Report closed"}


@app.post("/admin/setup")
async def admin_setup(secret: str, target_uid: str):
    """
    One-time endpoint to grant admin role to a Firebase UID.
    Requires ADMIN_SETUP_SECRET env variable to be set.
    """
    import os as _os
    expected = _os.environ.get("ADMIN_SETUP_SECRET", "")
    if not expected or secret != expected:
        raise HTTPException(status_code=403, detail="Invalid setup secret")
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    db["users"].update_one(
        {"firebase_uid": target_uid},
        {"$set": {"firebase_uid": target_uid, "role": "admin"}},
        upsert=True
    )
    return {"status": "success", "message": f"User {target_uid} is now an admin"}
