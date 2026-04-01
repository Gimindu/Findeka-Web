"""User-facing endpoints: profile, settings, user items, and notifications."""

from datetime import datetime

from fastapi import APIRouter, HTTPException

from app_state import get_image_url, get_user_phone, require_db

router = APIRouter()


@router.get("/user/items")
async def get_user_items(uid: str):
    """Fetches all items submitted by a specific user."""
    # Personal history endpoint; includes pending/rejected posts too.
    db = require_db()

    user_items = []
    for coll_name, item_type in [("lost_items", "lost"), ("found_items", "found")]:
        items = list(db[coll_name].find({"uid": uid}))
        for item in items:
            item["_id"] = str(item["_id"])
            item["type"] = item_type
            item["image_url"] = get_image_url(item.get("image_path"))
            item["phone"] = get_user_phone(item.get("uid"))
            user_items.append(item)

    user_items.sort(key=lambda x: x.get("created_at", datetime.min), reverse=True)
    return {"items": user_items}


@router.get("/user/profile")
async def get_user_profile(uid: str):
    # Return a sane default profile so first-time users get usable UI immediately.
    db = require_db()
    user = db["users"].find_one({"firebase_uid": uid})
    if not user:
        return {
            "firebase_uid": uid,
            "firstName": "New User",
            "lastName": "",
            "location": "Unknown",
            "stats": {"points": 0, "items_found": 0, "matches": 0},
        }

    user["_id"] = str(user["_id"])
    return user


@router.put("/user/profile")
async def update_user_profile(uid: str, data: dict):
    # Prevent accidental overwrite of Mongo _id from client payload.
    db = require_db()

    if "_id" in data:
        del data["_id"]

    db["users"].update_one(
        {"firebase_uid": uid},
        {"$set": data},
        upsert=True,
    )
    return {"status": "success"}


@router.get("/user/settings")
async def get_user_settings(uid: str):
    # Default settings keep alerts on unless user opts out.
    db = require_db()

    settings = db["user_settings"].find_one({"firebase_uid": uid})
    if not settings:
        return {
            "firebase_uid": uid,
            "emailNotifications": True,
            "pushNotifications": True,
            "matchAlerts": True,
            "newsletter": False,
            "publicProfile": True,
            "locationSharing": False,
        }

    settings["_id"] = str(settings["_id"])
    return settings


@router.put("/user/settings")
async def update_user_settings(uid: str, data: dict):
    # Upsert lets frontend save settings even if row does not exist yet.
    db = require_db()

    if "_id" in data:
        del data["_id"]

    db["user_settings"].update_one(
        {"firebase_uid": uid},
        {"$set": data},
        upsert=True,
    )
    return {"status": "success"}


@router.get("/user/notifications")
async def get_user_notifications(uid: str):
    # Latest first, hard cap for predictable payload size.
    db = require_db()

    notifications = []
    for notif in db["notifications"].find({"uid": uid}).sort("created_at", -1).limit(100):
        notif["_id"] = str(notif["_id"])
        notifications.append(notif)
    return {"notifications": notifications}


@router.post("/user/notifications/read-all")
async def mark_all_notifications_read(uid: str):
    # Bulk mark to reduce repeated API calls from the client.
    db = require_db()

    db["notifications"].update_many(
        {"uid": uid, "read": False},
        {"$set": {"read": True, "read_at": datetime.now()}},
    )
    return {"status": "success"}


@router.post("/user/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, uid: str):
    # Single-item read endpoint for notification detail view.
    db = require_db()
    from bson import ObjectId

    result = db["notifications"].update_one(
        {"_id": ObjectId(notification_id), "uid": uid},
        {"$set": {"read": True, "read_at": datetime.now()}},
    )
    if not result.matched_count:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "success"}


@router.delete("/user/notifications/clear")
async def clear_user_notifications(uid: str):
    # Hard clear for users who want a clean inbox quickly.
    db = require_db()

    result = db["notifications"].delete_many({"uid": uid})
    return {"status": "success", "deleted": result.deleted_count}
