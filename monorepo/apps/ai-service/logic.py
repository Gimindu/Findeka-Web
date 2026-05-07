"""Feature extraction and match scoring logic for lost-and-found comparison."""

import torch
import numpy as np
import os
from PIL import Image
import clip
from sklearn.metrics.pairwise import cosine_similarity
from thefuzz import fuzz
from keras.preprocessing import image as keras_image
from keras.applications.mobilenet_v2 import preprocess_input

from models_loader import model_manager
from utils import run_ocr, check_color_match, get_dominant_colors, calculate_location_score, get_time_decay, get_image_quality

def scale_sim(sim, threshold=0.1):
    """Shifts and scales similarity so that anything below threshold is 0.0"""
    return max(0.0, (sim - threshold) / (1.0 - threshold))

def extract_features(item: dict, img_path: str):
    """
    Extracts multimodal features from an item dict and its image.
    Uses: BERT, CLIP (Text & Image), MobileNetV2, OCR
    """
    # Build text representation
    txt = f"{item.get('name', '')} {item.get('description', '')} {item.get('color', '')} {item.get('subcategory', '')}"
    
    feats = {
        "bert": None, 
        "clip_txt": None, 
        "mob": None, 
        "clip_img": None, 
        "ocr_txt": ""
    }

    # 1. BERT Encoding
    if model_manager.bert_model:
        feats["bert"] = model_manager.bert_model.encode(txt)

    # 2. CLIP Text Encoding
    if model_manager.clip_model:
        # Truncate to 76 tokens (CLIP limit)
        text_token = clip.tokenize([txt[:76]], truncate=True).to(model_manager.device)
        with torch.no_grad():
            feats["clip_txt"] = model_manager.clip_model.encode_text(text_token).cpu().numpy().flatten()

    # 3. Image Features (MobileNet & CLIP Image) + OCR
    if img_path and os.path.exists(img_path):
        try:
            # MobileNet
            if model_manager.mobilenet_model:
                img_m = keras_image.load_img(img_path, target_size=(224, 224))
                img_array = keras_image.img_to_array(img_m)
                expanded = np.expand_dims(img_array, axis=0)
                preprocessed = preprocess_input(expanded)
                feats["mob"] = model_manager.mobilenet_model.predict(preprocessed, verbose=0).flatten()

            # CLIP Image
            if model_manager.clip_model:
                img_c = model_manager.clip_preprocess(Image.open(img_path)).unsqueeze(0).to(model_manager.device)
                with torch.no_grad():
                    feats["clip_img"] = model_manager.clip_model.encode_image(img_c).cpu().numpy().flatten()

            # OCR
            # Run OCR if category suggests it's useful
            cat_check = item.get('category', '').lower()
            if cat_check in ['documents', 'wallet', 'id', 'electronics']:
                feats["ocr_txt"] = run_ocr(img_path, model_manager.ocr_reader)
                
        except Exception as e:
            print(f"Error extracting image features: {e}")

    return feats

def calculate_match_score(query_item, query_img_path, query_feats, target_item, target_img_path, target_feats):
    """
    Calculates a similarity score between a query item and a target item.
    Returns: float (0.0 to 1.0)
    """
    # --- STAGE 1: TEMPORAL FILTER (Already handled in main loop? Or here?) ---
    # We'll do it purely as scoring calculation here.
    
    # Extract dates
    q_date = query_item.get('date_lost') or query_item.get('date_found')
    t_date = target_item.get('date_found') or target_item.get('date_lost') # Opposite of query typically

    # --- STAGE 2: NEURAL RANKING ---
    q_quality = get_image_quality(query_img_path)
    t_quality = get_image_quality(target_img_path)
    # Check if we actually HAVE an image (quality != 500 default or path check)
    has_q_img = query_img_path and os.path.exists(query_img_path)
    
    if not has_q_img:
        # If no query image, Text is 100% of the base score
        w_img, w_txt = (0.0, 1.0)
    else:
        is_blurry = q_quality < 100 or t_quality < 100
        w_img, w_txt = (0.20, 0.80) if is_blurry else (0.50, 0.50)

    # Multiplier for subcategory match
    q_sub = query_item.get('subcategory', '').lower()
    t_sub = target_item.get('subcategory', '').lower()
    
    # Improved Subcategory Logic: Fuzzy match for plurals (Watch vs Watches)
    if q_sub == t_sub:
        multiplier = 1.0
    elif fuzz.ratio(q_sub, t_sub) > 80:
        multiplier = 0.9
    else:
        multiplier = 0.3

    # Similarity Calculations
    s_tt = 0.0
    if query_feats['bert'] is not None and target_feats['bert'] is not None:
        s_tt = scale_sim(float(cosine_similarity([query_feats['bert']], [target_feats['bert']])[0][0]), 0.1)
    
    s_ii = 0.0
    if query_feats['clip_img'] is not None and target_feats['clip_img'] is not None:
        clip_sim = scale_sim(float(cosine_similarity([query_feats['clip_img']], [target_feats['clip_img']])[0][0]), 0.1)
        if query_feats['mob'] is not None and target_feats['mob'] is not None:
             mob_sim = scale_sim(float(cosine_similarity([query_feats['mob']], [target_feats['mob']])[0][0]), 0.1)
             s_ii = (clip_sim * 0.7) + (mob_sim * 0.3)
        else:
             s_ii = clip_sim
    elif query_feats['mob'] is not None and target_feats['mob'] is not None:
        mob_sim = scale_sim(float(cosine_similarity([query_feats['mob']], [target_feats['mob']])[0][0]), 0.1)
        s_ii = mob_sim

    s_ti = 0.0
    # CLIP Text->Image
    if query_feats['clip_txt'] is not None and target_feats['clip_img'] is not None:
         s_ti = scale_sim(float(cosine_similarity([query_feats['clip_txt']], [target_feats['clip_img']])[0][0]), 0.1)

    s_it = 0.0
    # CLIP Image->Text
    if query_feats['clip_img'] is not None and target_feats['clip_txt'] is not None:
         s_it = scale_sim(float(cosine_similarity([query_feats['clip_img']], [target_feats['clip_txt']])[0][0]), 0.1)

    # Fuzzy Text
    q_name_str = query_item.get('name','').lower()
    t_name_str = target_item.get('name', '').lower()
    name_fuzzy = max(fuzz.ratio(q_name_str, t_name_str), fuzz.token_set_ratio(q_name_str, t_name_str)) / 100.0
    desc_fuzzy = fuzz.token_set_ratio(query_item.get('description','').lower(), target_item.get('description', '').lower()) / 100.0
    
    # Keyword & Brand Clash Detector
    clash_groups = [
        ["backpack", "handbag", "duffle", "purse", "wallet", "suitcase", "briefcase", "tote"],
        [
            "adidas", "nike", "puma", "gucci", "louis vuitton", "prada", "chanel", "hermes",
            "apple", "samsung", "google", "sony", "dell", "hp", "lenovo",
            "rolex", "casio", "seiko", "fossil", "poshi", "citizen", "omega", "tag heuer", "garmin", "fitbit"
        ],
        ["watch", "ring", "necklace", "earring", "bracelet"]
    ]
    q_text = f"{query_item.get('name', '')} {query_item.get('description', '')}".lower()
    t_text = f"{target_item.get('name', '')} {target_item.get('description', '')}".lower()
    
    clash_penalty = 1.0
    for group in clash_groups:
        q_matches = set([w for w in group if w in q_text])
        t_matches = set([w for w in group if w in t_text])
        if q_matches and t_matches and not q_matches.intersection(t_matches):
            clash_penalty *= 0.5 # Halve the text score for each distinct clash

    # Check if BERT loaded
    if query_feats['bert'] is not None:
         # Reduced name weight from 0.2 to 0.1, increased desc to 0.2
         text_logic_score = ((s_tt * 0.7) + (name_fuzzy * 0.1) + (desc_fuzzy * 0.2)) * clash_penalty
    else:
         # Fallback: Rely 100% on Fuzzy Match if BERT missing
         print("⚠️ BERT missing, using fuzzy fallback")
         # Reduced name weight from 0.6 to 0.2, increased desc to 0.8
         text_logic_score = ((name_fuzzy * 0.2) + (desc_fuzzy * 0.8)) * clash_penalty

    # Visual Score (Context-Aware)
    has_q_clip = query_feats['clip_img'] is not None
    has_t_clip = target_feats['clip_img'] is not None
    has_q_mob = query_feats['mob'] is not None
    has_t_mob = target_feats['mob'] is not None
    
    if has_q_clip and has_t_clip:
        visual_score = (s_ii * 0.7) + (s_ti * 0.15) + (s_it * 0.15)
    elif has_q_mob and has_t_mob:
        visual_score = s_ii
    elif not has_q_clip and has_t_clip:
        visual_score = s_ti
    elif has_q_clip and not has_t_clip:
        visual_score = s_it
    else:
        visual_score = 0.0
        # CRITICAL FIX: If visual extraction completely failed (models missing), 
        # do not penalize the base_score with a 0.0 visual_score.
        w_img, w_txt = (0.0, 1.0)

    # Base Score
    base_score = (visual_score * w_img + text_logic_score * w_txt)

    # Feature Scores
    col_score = 0.0
    if target_img_path:
        # Compute colors on the fly if not cached? 
        # Ideally target feats should contain colors? Or we recompute. 
        # For performance, we should probably assume target_feats has it. 
        # But for now, we'll recompute as per user script logic which passed t['image_path'] to get_dominant_colors
        
        # User script: check_color_match(query_item['color'], get_dominant_colors(t.get('image_path')))
        # This is expensive to do for every target if not cached. 
        # But we will follow the script for now.
        t_colors = get_dominant_colors(target_img_path)
        col_score = check_color_match(query_item.get('color', ''), t_colors)
    else:
        # Fallback to text match
        if query_item.get('color','').lower() in target_item.get('color','').lower():
            col_score = 1.0

    loc_score = calculate_location_score(query_item.get('location', ''), target_item.get('location', ''))
    time_score = get_time_decay(q_date, t_date)

    # OCR Boost
    ocr_boost = 0.0
    q_name = query_item.get('name', '').lower()
    if (query_feats['ocr_txt'] and q_name in query_feats['ocr_txt']) or \
       (target_feats['ocr_txt'] and q_name in target_feats['ocr_txt']):
        ocr_boost = 0.2

    final_score = ((base_score * 0.85) + (loc_score * 0.05) + (col_score * 0.05) + (time_score * 0.05) + ocr_boost) * multiplier
    
    breakdown = {
        "base_score": float(base_score),
        "visual_score": float(visual_score),
        "text_logic_score": float(text_logic_score),
        "location_score": float(loc_score),
        "color_score": float(col_score),
        "time_score": float(time_score),
        "ocr_boost": float(ocr_boost),
        "multiplier": float(multiplier),
        "clash_penalty": float(clash_penalty)
    }

    return min(1.0, final_score), breakdown
