"""Utility functions for image handling, OCR prep, and feature helpers."""

import os
import cv2
import numpy as np
from datetime import datetime
from sklearn.cluster import KMeans
import easyocr

# use kmeans to get dominant colors
def get_dominant_colors(img_path, k=3):
    """EXTRACTOR: Finds top 3 colors (Palette Matching)"""
    try:
        if not img_path or not os.path.exists(img_path): return []
        img = cv2.imread(str(img_path))
        if img is None: return []
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (50, 50))
        pixels = img.reshape((-1, 3))
        kmeans = KMeans(n_clusters=k, n_init=10)
        kmeans.fit(pixels)
        return kmeans.cluster_centers_.astype(int)
    except Exception as e:
        print(f"Error in get_dominant_colors: {e}")
        return []

def check_color_match(user_color_txt, image_colors):
    """LOGIC: Checks if user's color exists in image palette"""
    if not user_color_txt: return 0.5
    
    color_map = {
        "red": [255, 0, 0], "black": [0, 0, 0], "white": [255, 255, 255],
        "blue": [0, 0, 255], "green": [0, 255, 0], "yellow": [255, 255, 0],
        "brown": [165, 42, 42], "gray": [128, 128, 128], "pink": [255, 192, 203]
    }
    target = color_map.get(user_color_txt.lower().strip())
    if target is None: return 0.5

    for color in image_colors:
        dist = np.linalg.norm(np.array(target) - color)
        if dist < 70: return 1.0
    return 0.0

def calculate_location_score(q_loc, t_loc):
    """LOGIC: Transit-Aware Filtering (Bus/Train vs Static)"""
    if not q_loc or not t_loc: return 0.5
    
    q, t = q_loc.lower(), t_loc.lower()
    transit_keywords = ['bus', 'train', 'highway', 'route', 'flight']
    is_transit = any(k in q for k in transit_keywords) or any(k in t for k in transit_keywords)

    if is_transit:
        q_words = set(q.split())
        t_words = set(t.split())
        if q_words.intersection(t_words): return 1.0
        return 0.5
    else:
        return 1.0 if q in t or t in q else 0.0

def get_time_decay(date_q, date_t):
    """LOGIC: Freshness Factor"""
    try:
        if not date_q or not date_t: return 1.0
        # Handle cases where date might be datetime object or string
        d1 = datetime.strptime(str(date_q)[:10], "%Y-%m-%d")
        d2 = datetime.strptime(str(date_t)[:10], "%Y-%m-%d")
        diff = abs((d1 - d2).days)
        return 1.0 / (1.0 + (0.05 * diff))
    except: return 1.0

def get_image_quality(img_path):
    """
    Measures image sharpness.
    Higher value = Sharper image.
    Lower value (< 100) = Likely blurry/low quality.
    """
    try:
        if not img_path or not os.path.exists(img_path): return 500
        img = cv2.imread(str(img_path))
        if img is None: return 500
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        return cv2.Laplacian(gray, cv2.CV_64F).var()
    except:
        return 500

# Moving run_ocr to usage inside models_loader or here, but it needs the reader.
# We'll make it accept a reader instance.
def run_ocr(img_path, reader):
    """EXTRACTOR: Reads text from ID cards using EasyOCR"""
    try:
        if not img_path or not os.path.exists(img_path): return ""
        if reader is None: return ""
        result = reader.readtext(str(img_path))
        return " ".join([text[1] for text in result]).lower()
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""
