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
    global mongo_client, db
    print("🚀 Connecting to MongoDB...")
    try:
        mongo_client = MongoClient(MONGO_URI)
        db = mongo_client[DB_NAME]
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
        return f"http://localhost:8000/static/{rel_path}".replace("\\", "/") # Ensure forward slashes for URL
    except ValueError:
        return None

# --- Pydantic Models for Response ---

@app.get("/")
def read_root():
    return {"status": "online", "message": "Findeka AI Service is running"}

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

    # 5. Fetch Candidates from DB
    targets = list(db[target_col_name].find())
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
    image: UploadFile = File(None)
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
        "created_at": datetime.now(),
        "status": "active" # active, resolved
    }

    result = db[collection_name].insert_one(item_doc)
    
    return {"status": "success", "id": str(result.inserted_id), "message": "Item registered successfully"}
