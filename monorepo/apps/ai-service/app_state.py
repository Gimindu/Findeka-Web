"""Shared app state and helper utilities for DB, timestamps, and notifications."""

from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import HTTPException
from pymongo import MongoClient

from config import DB_NAME, MONGO_URI, STORAGE_DIR

mongo_client: Optional[MongoClient] = None
db = None


def init_db() -> None:
    # Single Mongo client shared by the API process.
    global mongo_client, db
    mongo_client = MongoClient(MONGO_URI)
    db = mongo_client[DB_NAME]

    # Enforce: one user can only report the same item once.
    db["reports"].create_index(
        [("item_id", 1), ("reporter_uid", 1)],
        unique=True,
        name="uniq_item_reporter",
    )
    db["notifications"].create_index(
        [("uid", 1), ("created_at", -1)],
        name="idx_notifications_user_time",
    )


def close_db() -> None:
    # Called during shutdown; safe to call multiple times.
    global mongo_client
    if mongo_client:
        mongo_client.close()
        mongo_client = None


def get_db():
    # Light accessor used by helper methods.
    return db


def require_db():
    # Fail fast when startup did not initialize the database.
    current_db = get_db()
    if current_db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    return current_db


def utc_now() -> datetime:
    # Always use UTC timestamps to avoid timezone drift between clients.
    return datetime.now(timezone.utc)


def append_match_timeline(match_doc: dict, status: str, by_uid: str, note: str = ""):
    # Immutable-style update so callers can write one clean $set to Mongo.
    timeline = list(match_doc.get("timeline") or [])
    timeline.append(
        {
            "status": status,
            "by_uid": by_uid,
            "note": note,
            "at": utc_now(),
        }
    )
    return timeline


def get_image_url(image_path: str) -> Optional[str]:
    """Converts local absolute path to a static URL."""
    if not image_path:
        return None
    try:
        p = Path(image_path)
        rel_path = p.relative_to(STORAGE_DIR)
        return f"http://localhost:8001/static/{rel_path}".replace("\\", "/")
    except ValueError:
        return None


def get_user_phone(uid: Optional[str]) -> Optional[str]:
    # Helper for list endpoints that expose contact details.
    current_db = get_db()
    if current_db is None or not uid:
        return None
    user_doc = current_db["users"].find_one({"firebase_uid": uid})
    phone = (user_doc or {}).get("phone")
    if isinstance(phone, str):
        phone = phone.strip()
    return phone or None


def get_user_summary(uid: Optional[str]) -> Dict[str, Any]:
    # Small public profile block used in match notifications.
    current_db = get_db()
    if current_db is None or not uid:
        return {"uid": uid, "name": None, "phone": None, "location": None}

    user_doc = current_db["users"].find_one({"firebase_uid": uid}) or {}
    first = (user_doc.get("firstName") or "").strip()
    last = (user_doc.get("lastName") or "").strip()
    full_name = (f"{first} {last}").strip() or None

    phone = user_doc.get("phone")
    if isinstance(phone, str):
        phone = phone.strip() or None

    location = user_doc.get("location")
    if isinstance(location, str):
        location = location.strip() or None

    return {
        "uid": uid,
        "name": full_name,
        "phone": phone,
        "location": location,
    }


def create_user_notification(
    uid: str,
    title: str,
    message: str,
    notif_type: str = "update",
    extra: Optional[Dict[str, Any]] = None,
) -> None:
    # Centralized notification format to keep payloads consistent.
    current_db = get_db()
    if current_db is None or not uid:
        return

    doc = {
        "uid": uid,
        "title": title,
        "message": message,
        "type": notif_type,
        "read": False,
        "created_at": utc_now(),
    }
    if extra:
        doc.update(extra)
    current_db["notifications"].insert_one(doc)


def require_admin(uid: str) -> None:
    # Simple guard used by all admin routes.
    if not uid:
        raise HTTPException(status_code=403, detail="Admin UID required")

    current_db = require_db()
    user = current_db["users"].find_one({"firebase_uid": uid})
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden: admin access only")
