"""Match lifecycle endpoints: confirm, accept, reject, complete, and fetch."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app_state import (
    append_match_timeline,
    create_user_notification,
    get_user_summary,
    require_db,
    utc_now,
)

router = APIRouter()


class ConfirmMatchRequest(BaseModel):
    requester_uid: str
    matched_item_id: str
    requester_post_type: str
    requester_item_name: str


@router.post("/matches/confirm")
async def confirm_match(body: ConfirmMatchRequest):
    """Confirm a potential match and notify both sides."""
    # This creates (or reuses) a match conversation between two different users.
    db = require_db()

    requester_uid = (body.requester_uid or "").strip()
    requester_post_type = (body.requester_post_type or "").strip().lower()
    requester_item_name = (body.requester_item_name or "").strip() or "an item"

    if not requester_uid:
        raise HTTPException(status_code=400, detail="requester_uid is required")
    if requester_post_type not in ["lost", "found"]:
        raise HTTPException(status_code=400, detail="requester_post_type must be 'lost' or 'found'")

    from bson import ObjectId

    # Item can live in either collection, so check both.
    matched_item = None
    for coll_name in ["lost_items", "found_items"]:
        try:
            matched_item = db[coll_name].find_one({"_id": ObjectId(body.matched_item_id)})
            if matched_item:
                break
        except Exception:
            continue

    if not matched_item:
        raise HTTPException(status_code=404, detail="Matched item not found")

    matched_uid = (matched_item.get("uid") or "").strip()
    if not matched_uid:
        raise HTTPException(status_code=400, detail="Matched item has no owner uid")

    if matched_uid == requester_uid:
        raise HTTPException(status_code=400, detail="Cannot confirm match with your own listing")

    counterpart_role = "owner" if requester_post_type == "found" else "finder"
    matched_item_name = (matched_item.get("name") or "your listing").strip()
    requester_info = get_user_summary(requester_uid)
    target_info = get_user_summary(matched_uid)

    # Avoid creating duplicate active match records for same requester/item pair.
    existing_match = db["matches"].find_one(
        {
            "requester_uid": requester_uid,
            "matched_item_id": body.matched_item_id,
            "status": {"$in": ["confirmed", "accepted"]},
        }
    )

    if existing_match:
        match_id = str(existing_match["_id"])
        current_status = existing_match.get("status", "confirmed")
    else:
        match_doc = {
            "requester_uid": requester_uid,
            "target_uid": matched_uid,
            "matched_item_id": body.matched_item_id,
            "requester_post_type": requester_post_type,
            "requester_item_name": requester_item_name,
            "matched_item_name": matched_item_name,
            "status": "confirmed",
            "timeline": [
                {
                    "status": "confirmed",
                    "by_uid": requester_uid,
                    "note": "Requester confirmed potential match",
                    "at": utc_now(),
                }
            ],
            "created_at": utc_now(),
            "updated_at": utc_now(),
        }
        insert_result = db["matches"].insert_one(match_doc)
        match_id = str(insert_result.inserted_id)
        current_status = "confirmed"

    # Notify owner/finder first with requester contact details.
    create_user_notification(
        matched_uid,
        "Potential match confirmed",
        f"A user confirmed '{requester_item_name}' as a match to '{matched_item_name}'. Please check contact details to connect with the {counterpart_role}.",
        "match",
        {
            "match_id": match_id,
            "matched_item_id": body.matched_item_id,
            "match_status": current_status,
            "match_action": "review",
            "counterpart_uid": requester_info.get("uid"),
            "counterpart_name": requester_info.get("name"),
            "counterpart_phone": requester_info.get("phone"),
            "counterpart_location": requester_info.get("location"),
            "counterpart_role": counterpart_role,
            "counterpart_item_name": requester_item_name,
        },
    )

    # Confirm back to requester so UI can show a clear state.
    create_user_notification(
        requester_uid,
        "Match confirmation sent",
        f"We notified the listing owner/finder for '{matched_item_name}'. They can now contact you.",
        "match",
        {
            "match_id": match_id,
            "matched_item_id": body.matched_item_id,
            "match_status": current_status,
            "match_action": "none",
            "counterpart_uid": target_info.get("uid"),
            "counterpart_name": target_info.get("name"),
            "counterpart_phone": target_info.get("phone"),
            "counterpart_location": target_info.get("location"),
            "counterpart_role": "owner" if counterpart_role == "finder" else "finder",
            "counterpart_item_name": matched_item_name,
        },
    )

    return {
        "status": "success",
        "message": "Match confirmed and notifications sent",
        "match_id": match_id,
        "match_status": current_status,
    }


@router.get("/matches/{match_id}")
async def get_match(match_id: str, uid: str):
    # Only participants can view match details.
    db = require_db()
    from bson import ObjectId

    try:
        match_doc = db["matches"].find_one({"_id": ObjectId(match_id)})
    except Exception:
        match_doc = None

    if not match_doc:
        raise HTTPException(status_code=404, detail="Match not found")

    if uid not in [match_doc.get("requester_uid"), match_doc.get("target_uid")]:
        raise HTTPException(status_code=403, detail="Forbidden")

    match_doc["_id"] = str(match_doc["_id"])
    return {"match": match_doc}


@router.post("/matches/{match_id}/accept")
async def accept_match(match_id: str, uid: str):
    # Accepting opens two-way contact and enables completion action.
    db = require_db()
    from bson import ObjectId

    match_doc = db["matches"].find_one({"_id": ObjectId(match_id)})
    if not match_doc:
        raise HTTPException(status_code=404, detail="Match not found")

    requester_uid = match_doc.get("requester_uid")
    target_uid = match_doc.get("target_uid")
    if uid not in [requester_uid, target_uid]:
        raise HTTPException(status_code=403, detail="Forbidden")

    if match_doc.get("status") in ["rejected", "completed"]:
        raise HTTPException(status_code=400, detail="Match is already closed")

    updated_timeline = append_match_timeline(match_doc, "accepted", uid, "Counterpart accepted match")
    db["matches"].update_one(
        {"_id": ObjectId(match_id)},
        {
            "$set": {
                "status": "accepted",
                "timeline": updated_timeline,
                "updated_at": utc_now(),
            }
        },
    )

    # Notify both sides with counterpart contact information.
    for participant_uid in [requester_uid, target_uid]:
        counterpart_uid = target_uid if participant_uid == requester_uid else requester_uid
        counterpart_role = "owner" if participant_uid == requester_uid else "finder"
        counterpart_item_name = (
            match_doc.get("matched_item_name")
            if participant_uid == requester_uid
            else match_doc.get("requester_item_name")
        )
        counterpart_info = get_user_summary(counterpart_uid)
        create_user_notification(
            participant_uid,
            "Match accepted",
            "Both sides can now contact each other. Mark as completed after handover.",
            "match",
            {
                "match_id": match_id,
                "matched_item_id": match_doc.get("matched_item_id"),
                "match_status": "accepted",
                "match_action": "complete",
                "counterpart_uid": counterpart_info.get("uid"),
                "counterpart_name": counterpart_info.get("name"),
                "counterpart_phone": counterpart_info.get("phone"),
                "counterpart_location": counterpart_info.get("location"),
                "counterpart_role": counterpart_role,
                "counterpart_item_name": counterpart_item_name,
            },
        )

    return {"status": "success", "match_status": "accepted"}


@router.post("/matches/{match_id}/reject")
async def reject_match(match_id: str, uid: str):
    # Rejecting closes the current match thread.
    db = require_db()
    from bson import ObjectId

    match_doc = db["matches"].find_one({"_id": ObjectId(match_id)})
    if not match_doc:
        raise HTTPException(status_code=404, detail="Match not found")

    requester_uid = match_doc.get("requester_uid")
    target_uid = match_doc.get("target_uid")
    if uid not in [requester_uid, target_uid]:
        raise HTTPException(status_code=403, detail="Forbidden")

    if match_doc.get("status") in ["rejected", "completed"]:
        raise HTTPException(status_code=400, detail="Match is already closed")

    updated_timeline = append_match_timeline(match_doc, "rejected", uid, "Counterpart rejected match")
    db["matches"].update_one(
        {"_id": ObjectId(match_id)},
        {
            "$set": {
                "status": "rejected",
                "timeline": updated_timeline,
                "updated_at": utc_now(),
            }
        },
    )

    other_uid = requester_uid if uid == target_uid else target_uid
    create_user_notification(
        other_uid,
        "Match rejected",
        "The other user marked this as not a valid match.",
        "match",
        {
            "match_id": match_id,
            "matched_item_id": match_doc.get("matched_item_id"),
            "match_status": "rejected",
            "match_action": "none",
        },
    )

    return {"status": "success", "match_status": "rejected"}


@router.post("/matches/{match_id}/complete")
async def complete_match(match_id: str, uid: str):
    # Completion is only valid after both sides reached accepted state.
    db = require_db()
    from bson import ObjectId

    match_doc = db["matches"].find_one({"_id": ObjectId(match_id)})
    if not match_doc:
        raise HTTPException(status_code=404, detail="Match not found")

    requester_uid = match_doc.get("requester_uid")
    target_uid = match_doc.get("target_uid")
    if uid not in [requester_uid, target_uid]:
        raise HTTPException(status_code=403, detail="Forbidden")

    if match_doc.get("status") != "accepted":
        raise HTTPException(status_code=400, detail="Only accepted matches can be completed")

    updated_timeline = append_match_timeline(match_doc, "completed", uid, "Handover completed")
    db["matches"].update_one(
        {"_id": ObjectId(match_id)},
        {
            "$set": {
                "status": "completed",
                "timeline": updated_timeline,
                "updated_at": utc_now(),
                "completed_at": utc_now(),
            }
        },
    )

    for participant_uid in [requester_uid, target_uid]:
        create_user_notification(
            participant_uid,
            "Handover completed",
            "This match has been marked as completed.",
            "update",
            {
                "match_id": match_id,
                "matched_item_id": match_doc.get("matched_item_id"),
                "match_status": "completed",
                "match_action": "none",
            },
        )

    return {"status": "success", "match_status": "completed"}
