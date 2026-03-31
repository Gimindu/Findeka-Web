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
    # and less harsh penalty (0.5 instead of 0.1)
    if q_sub == t_sub:
        multiplier = 1.5
    elif fuzz.ratio(q_sub, t_sub) > 80:
        multiplier = 1.2
    else:
        multiplier = 0.5

    # Similarity Calculations
    s_tt = 0.0
    if query_feats['bert'] is not None and target_feats['bert'] is not None:
        s_tt = float(cosine_similarity([query_feats['bert']], [target_feats['bert']])[0][0])
    
    s_ii = 0.0
    if query_feats['clip_img'] is not None and target_feats['clip_img'] is not None:
        clip_sim = float(cosine_similarity([query_feats['clip_img']], [target_feats['clip_img']])[0][0])
        mob_sim = 0.0
        if query_feats['mob'] is not None and target_feats['mob'] is not None:
             mob_sim = float(cosine_similarity([query_feats['mob']], [target_feats['mob']])[0][0])
        
        s_ii = (clip_sim * 0.7) + (mob_sim * 0.3)

    s_ti = 0.0
    # CLIP Text->Image
    if query_feats['clip_txt'] is not None and target_feats['clip_img'] is not None:
         s_ti = float(cosine_similarity([query_feats['clip_txt']], [target_feats['clip_img']])[0][0])

    # Fuzzy Text
    name_fuzzy = fuzz.ratio(query_item.get('name','').lower(), target_item.get('name', '').lower()) / 100.0
    desc_fuzzy = fuzz.partial_ratio(query_item.get('description','').lower(), target_item.get('description', '').lower()) / 100.0
    
    # Check if BERT loaded
    if query_feats['bert'] is not None:
         # Reduced name weight from 0.2 to 0.1, increased desc to 0.2
         text_logic_score = (s_tt * 0.7) + (name_fuzzy * 0.1) + (desc_fuzzy * 0.2)
    else:
         # Fallback: Rely 100% on Fuzzy Match if BERT missing
         print("⚠️ BERT missing, using fuzzy fallback")
         # Reduced name weight from 0.6 to 0.2, increased desc to 0.8
         text_logic_score = (name_fuzzy * 0.2) + (desc_fuzzy * 0.8)

    # Base Score
    base_score = (max(s_ii, s_ti) * w_img + text_logic_score * w_txt) * multiplier

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

    final_score = (base_score * 0.5) + (loc_score * 0.2) + (col_score * 0.2) + (time_score * 0.1) + ocr_boost
    
    return min(1.0, final_score)
