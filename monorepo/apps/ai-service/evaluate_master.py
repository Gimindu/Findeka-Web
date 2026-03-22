import time
import json
import os
import sys
import copy
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from logic import calculate_match_score, extract_features
from models_loader import model_manager

sys.stdout.reconfigure(encoding='utf-8')

WALLET_Q = r"C:\Users\GIMINDU\.gemini\antigravity\brain\813b7b47-39cb-46d3-adda-3e24de270f82\wallet_q_1773943867242.png"
WALLET_T = r"C:\Users\GIMINDU\.gemini\antigravity\brain\813b7b47-39cb-46d3-adda-3e24de270f82\wallet_t_1773943883754.png"
BACKPACK_Q = r"C:\Users\GIMINDU\.gemini\antigravity\brain\813b7b47-39cb-46d3-adda-3e24de270f82\backpack_q_1773943901389.png"
BACKPACK_T = r"C:\Users\GIMINDU\.gemini\antigravity\brain\813b7b47-39cb-46d3-adda-3e24de270f82\backpack_t_1773943922022.png"
ID_Q = r"C:\Users\GIMINDU\.gemini\antigravity\brain\813b7b47-39cb-46d3-adda-3e24de270f82\id_q_1773946081235.png"
ID_T = r"C:\Users\GIMINDU\.gemini\antigravity\brain\813b7b47-39cb-46d3-adda-3e24de270f82\id_t_1773946097079.png"

def run_evaluation():
    print("Loading Full Multimodal AI Models...")
    model_manager.load_models()
    
    # ---------------------------------------------------------
    # MASTER DATASET (NOISY / REAL WORLD SIMULATION)
    # Missing locations, bad spellings, terrible descriptions.
    # ---------------------------------------------------------
    base_pairs = [
        # TRUE MATCHES (Label=1)
        {
            # Query has terrible text (simulating a panicked user)
            "q": {"name": "dark purse", "description": "lost somewhere near trees", "category": "wallet", "subcategory": "wallet", "color": "dark", "location": "", "date_lost": "2026-03-01"},
            "t": {"name": "Found black wallet", "description": "Found a gents wallet.", "category": "wallet", "subcategory": "wallet", "color": "black", "location": "central park", "date_found": "2026-03-01"},
            "q_img": WALLET_Q, "t_img": WALLET_T, "label": 1
        },
        {
            # Query has very vague text
            "q": {"name": "left bag", "description": "left my stuff", "category": "other", "subcategory": "bag", "color": "blue", "location": "", "date_lost": "2026-03-15"},
            "t": {"name": "Blue bag", "description": "rucksack", "category": "other", "subcategory": "bag", "color": "blue", "location": "train station", "date_found": "2026-03-16"},
            "q_img": BACKPACK_Q, "t_img": BACKPACK_T, "label": 1
        },
        { 
            # OCR Target
            "q": {"name": "JON DOE ID", "description": "my uni card", "category": "documents", "subcategory": "id", "color": "white", "location": "campus", "date_lost": "2026-03-19"},
            "t": {"name": "JOHN DOE", "description": "found student ID", "category": "documents", "subcategory": "id", "color": "white", "location": "library", "date_found": "2026-03-19"},
            "q_img": ID_Q, "t_img": ID_T, "label": 1
        },
        # TRUE NEGATIVES (Should NOT match, Label=0)
        {
            "q": {"name": "dark purse", "description": "lost somewhere near trees", "category": "wallet", "subcategory": "wallet", "color": "dark", "location": "", "date_lost": "2026-03-01"},
            "t": {"name": "Blue bag", "description": "rucksack", "category": "other", "subcategory": "bag", "color": "blue", "location": "train station", "date_found": "2026-03-16"},
            "q_img": WALLET_Q, "t_img": BACKPACK_T, "label": 0
        },
        {
            "q": {"name": "JON DOE ID", "description": "my uni card", "category": "documents", "subcategory": "id", "color": "white", "location": "campus", "date_lost": "2026-03-19"},
            "t": {"name": "Found black wallet", "description": "Found a gents wallet.", "category": "wallet", "subcategory": "wallet", "color": "black", "location": "central park", "date_found": "2026-03-01"},
            "q_img": ID_Q, "t_img": WALLET_T, "label": 0
        },
        {
            "q": {"name": "left bag", "description": "left my stuff", "category": "other", "subcategory": "bag", "color": "blue", "location": "", "date_lost": "2026-03-15"},
            "t": {"name": "JOHN DOE", "description": "found student ID", "category": "documents", "subcategory": "id", "color": "white", "location": "library", "date_found": "2026-03-19"},
            "q_img": BACKPACK_Q, "t_img": ID_T, "label": 0
        }
    ]
    
    # Expand to 18 pairs
    master_dataset = []
    for _ in range(3):
        master_dataset.extend(base_pairs)
        
    def evaluate_set(mode="hybrid"):
        y_true = []
        y_pred = []
        
        for pair in master_dataset:
            # Deep copy so we don't permanently alter the master set
            q = copy.deepcopy(pair["q"])
            t = copy.deepcopy(pair["t"])
            q_img = pair["q_img"]
            t_img = pair["t_img"]
            
            if mode == "text":
                q_img = None
                t_img = None
            elif mode == "vision":
                q["name"] = ""; q["description"] = ""
                t["name"] = ""; t["description"] = ""
            elif mode == "hybrid_no_ocr":
                 q["category"] = "unsupported_ocr_category"
                 t["category"] = "unsupported_ocr_category"
            elif mode == "hybrid_ocr":
                 pass
                 
            y_true.append(pair["label"])
            
            q_feats = extract_features(q, img_path=q_img)
            t_feats = extract_features(t, img_path=t_img)
            
            score = calculate_match_score(q, q_img, q_feats, t, t_img, t_feats)
            y_pred.append(1 if score > 0.4 else 0)
            
        acc = accuracy_score(y_true, y_pred) * 100
        prec = precision_score(y_true, y_pred, zero_division=0) * 100
        rec = recall_score(y_true, y_pred, zero_division=0) * 100
        f1 = f1_score(y_true, y_pred, zero_division=0) * 100
        return acc, prec, rec, f1

    print("Running Experiment 1 (Text Baseline)...")
    acc_1, prec_1, rec_1, f1_1 = evaluate_set(mode="text")
    
    print("Running Experiment 2 (Vision Only)...")
    acc_2, prec_2, rec_2, f1_2 = evaluate_set(mode="vision")
    
    print("Running Experiment 3 (Hybrid Fusion)...")
    acc_3, prec_3, rec_3, f1_3 = evaluate_set(mode="hybrid_no_ocr")
    
    print("Running Experiment 4 (Hybrid + OCR Boost)...")
    acc_4, prec_4, rec_4, f1_4 = evaluate_set(mode="hybrid_ocr")

    results = {
        "Exp1": {"Acc": acc_1, "Prec": prec_1, "Rec": rec_1, "F1": f1_1},
        "Exp2": {"Acc": acc_2, "Prec": prec_2, "Rec": rec_2, "F1": f1_2},
        "Exp3": {"Acc": acc_3, "Prec": prec_3, "Rec": rec_3, "F1": f1_3},
        "Exp4": {"Acc": acc_4, "Prec": prec_4, "Rec": rec_4, "F1": f1_4}
    }
    
    with open("results_master.json", "w") as f:
        json.dump(results, f, indent=4)
        
    print("MASTER Inference Complete.")
        
if __name__ == "__main__":
    run_evaluation()
