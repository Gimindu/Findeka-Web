"""Admin moderation endpoints: review posts, users, and safety reports."""

import os
from datetime import datetime

from fastapi import APIRouter, HTTPException

from app_state import create_user_notification, get_image_url, require_admin, require_db

router = APIRouter()


@router.get("/admin/stats")
async def admin_stats(uid: str):
    # Dashboard counters shown on the admin home screen.
    db = require_db()
    require_admin(uid)

    lost_total = db["lost_items"].count_documents({})
    found_total = db["found_items"].count_documents({})
    pending = db["lost_items"].count_documents({"status": "pending"}) + db["found_items"].count_documents(
        {"status": "pending"}
    )
    rejected = db["lost_items"].count_documents({"status": "rejected"}) + db["found_items"].count_documents(
        {"status": "rejected"}
    )
    total_users = db["users"].count_documents({})
    open_reports = db["reports"].count_documents({"status": "pending"})

    return {
        "total_posts": lost_total + found_total,
        "pending_review": pending,
        "rejected_posts": rejected,
        "total_users": total_users,
        "open_reports": open_reports,
    }


@router.get("/admin/posts/pending")
async def admin_pending_posts(uid: str):
    # Queue used by admins to review new listings.
    db = require_db()
    require_admin(uid)

    items = []
    for coll, item_type in [("lost_items", "lost"), ("found_items", "found")]:
        for item in db[coll].find({"status": "pending"}):
            item["_id"] = str(item["_id"])
            item["type"] = item_type
            item["image_url"] = get_image_url(item.get("image_path"))
            items.append(item)

    items.sort(key=lambda x: x.get("created_at", datetime.min), reverse=True)
    return {"items": items}


@router.post("/admin/posts/{item_id}/approve")
async def admin_approve_post(item_id: str, uid: str):
    # Approve means public users can see this listing.
    db = require_db()
    require_admin(uid)
    from bson import ObjectId

    for coll in ["lost_items", "found_items"]:
        try:
            item = db[coll].find_one({"_id": ObjectId(item_id)})
            result = db[coll].update_one(
                {"_id": ObjectId(item_id)},
                {"$set": {"status": "active", "reviewed_at": datetime.now()}},
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


@router.post("/admin/posts/{item_id}/reject")
async def admin_reject_post(item_id: str, uid: str, reason: str = ""):
    # Keep rejected items for recycle-bin style recovery.
    db = require_db()
    require_admin(uid)
    from bson import ObjectId

    for coll in ["lost_items", "found_items"]:
        try:
            item = db[coll].find_one({"_id": ObjectId(item_id)})
            result = db[coll].update_one(
                {"_id": ObjectId(item_id)},
                {"$set": {"status": "rejected", "reject_reason": reason, "reviewed_at": datetime.now()}},
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


@router.get("/admin/posts/recycled")
async def admin_recycled_posts(uid: str):
    # Recycle bin view for previously rejected posts.
    db = require_db()
    require_admin(uid)

    items = []
    for coll, item_type in [("lost_items", "lost"), ("found_items", "found")]:
        for item in db[coll].find({"status": "rejected"}):
            item["_id"] = str(item["_id"])
            item["type"] = item_type
            item["image_url"] = get_image_url(item.get("image_path"))
            items.append(item)

    items.sort(key=lambda x: x.get("reviewed_at", datetime.min), reverse=True)
    return {"items": items}


@router.post("/admin/posts/{item_id}/restore")
async def admin_restore_post(item_id: str, uid: str):
    # Put back into pending so another admin can re-check it.
    db = require_db()
    require_admin(uid)
    from bson import ObjectId

    for coll in ["lost_items", "found_items"]:
        try:
            result = db[coll].update_one(
                {"_id": ObjectId(item_id)},
                {"$set": {"status": "pending"}, "$unset": {"reject_reason": "", "reviewed_at": ""}},
            )
            if result.matched_count:
                return {"status": "success", "message": "Post restored to pending review"}
        except Exception:
            pass
    raise HTTPException(status_code=404, detail="Item not found")


@router.delete("/admin/posts/{item_id}/permanent")
async def admin_delete_post_permanent(item_id: str, uid: str):
    # Hard delete: remove DB record and image from disk.
    db = require_db()
    require_admin(uid)
    from bson import ObjectId

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


@router.get("/admin/users")
async def admin_get_users(uid: str):
    # Basic user listing for moderation/admin panels.
    db = require_db()
    require_admin(uid)

    users = []
    for user in db["users"].find():
        user["_id"] = str(user["_id"])
        users.append(user)
    return {"users": users}


@router.post("/admin/users/{target_uid}/suspend")
async def admin_suspend_user(target_uid: str, uid: str):
    # Soft block account activity without deleting user data.
    db = require_db()
    require_admin(uid)

    db["users"].update_one(
        {"firebase_uid": target_uid},
        {"$set": {"suspended": True}},
        upsert=True,
    )
    return {"status": "success", "message": "User suspended"}


@router.post("/admin/users/{target_uid}/unsuspend")
async def admin_unsuspend_user(target_uid: str, uid: str):
    # Re-enable account after review.
    db = require_db()
    require_admin(uid)

    db["users"].update_one(
        {"firebase_uid": target_uid},
        {"$set": {"suspended": False}},
        upsert=True,
    )
    return {"status": "success", "message": "User unsuspended"}


@router.delete("/admin/users/{target_uid}")
async def admin_delete_user(target_uid: str, uid: str):
    # Cleanup user-owned posts first so we do not leave orphan image files.
    db = require_db()
    require_admin(uid)

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


@router.get("/admin/reports")
async def admin_get_reports(uid: str):
    # Report inbox with linked item details for faster moderation decisions.
    db = require_db()
    require_admin(uid)
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


@router.post("/admin/reports/{report_id}/resolve")
async def admin_resolve_report(report_id: str, uid: str):
    # Resolve when report is handled but listing stays.
    db = require_db()
    require_admin(uid)
    from bson import ObjectId

    report = db["reports"].find_one({"_id": ObjectId(report_id)})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    result = db["reports"].update_one(
        {"_id": ObjectId(report_id)},
        {"$set": {"status": "resolved", "resolved_at": datetime.now()}},
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


@router.post("/admin/reports/{report_id}/reject")
async def admin_reject_report(report_id: str, uid: str):
    # Reject means report closed and listing remains active.
    db = require_db()
    require_admin(uid)
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
        },
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


@router.post("/admin/reports/{report_id}/remove-item")
async def admin_remove_item_from_report(report_id: str, uid: str):
    # Main moderation path when a report is valid: remove item and close report.
    db = require_db()
    require_admin(uid)
    from bson import ObjectId

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
        },
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


@router.post("/admin/setup")
async def admin_setup(secret: str, target_uid: str):
    """One-time endpoint to grant admin role to a Firebase UID."""
    # Protected by env secret to avoid open admin creation.
    expected = os.environ.get("ADMIN_SETUP_SECRET", "")
    if not expected or secret != expected:
        raise HTTPException(status_code=403, detail="Invalid setup secret")

    db = require_db()
    db["users"].update_one(
        {"firebase_uid": target_uid},
        {"$set": {"firebase_uid": target_uid, "role": "admin"}},
        upsert=True,
    )
    return {"status": "success", "message": f"User {target_uid} is now an admin"}
