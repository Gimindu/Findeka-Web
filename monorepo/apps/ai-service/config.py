"""Central configuration for paths, model files, and Mongo connection settings."""

import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent
STORAGE_DIR = BASE_DIR / "storage"
LOST_IMG_FOLDER = STORAGE_DIR / "lost_images"
FOUND_IMG_FOLDER = STORAGE_DIR / "found_images"
MODELS_FOLDER = STORAGE_DIR / "saved_models"

# Ensure directories exist
for p in [STORAGE_DIR, LOST_IMG_FOLDER, FOUND_IMG_FOLDER, MODELS_FOLDER]:
    p.mkdir(parents=True, exist_ok=True)

# Database
# Note: In production, use environment variables!
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://Gimindu:oOLgMNHtR3X87s22@cluster0.hu5yjav.mongodb.net/?appName=Cluster0")
DB_NAME = "lost_and_found"
