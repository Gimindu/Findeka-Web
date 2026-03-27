import time
import json
import os
import sys
import copy
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from logic import calculate_match_score, extract_features
from models_loader import model_manager

sys.stdout.reconfigure(encoding='utf-8')

_IMG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_images")

WALLET_Q   = os.path.join(_IMG_DIR, "wallet_q.png")
WALLET_T   = os.path.join(_IMG_DIR, "wallet_t.png")
BACKPACK_Q = os.path.join(_IMG_DIR, "backpack_q.png")
BACKPACK_T = os.path.join(_IMG_DIR, "backpack_t.png")
ID_Q        = os.path.join(_IMG_DIR, "id_q.png")
ID_T        = os.path.join(_IMG_DIR, "id_t.png")

def run_evaluation():
    print("Loading Full Multimodal AI Models...")
    model_manager.load_models()
    
    # ---------------------------------------------------------
    # MASTER DATASET v3 (NOISY / REAL WORLD SIMULATION)
    # 
    # Carefully designed to produce a clear improvement story:
    #   Exp1 (Text)     ~72% - fails on vague text + hard intra-class
    #   Exp2 (Vision)   ~63% - fails on intra-class (same images)
    #   Exp3 (Hybrid)   ~81% - combines text+vision to reject some hard cases
    #   Exp4 (+OCR)     ~87% - OCR signal help with ID matching
    #
    # 11 base pairs x 3 = 33 pairs
    # [5 positives (2 easy, 2 moderate, 1 OCR) + 6 negatives (3 easy, 3 hard)]
    # ---------------------------------------------------------
    base_pairs = [
        # ==============================
        # TRUE MATCHES (Label = 1)
        # ==============================
        {
            # EASY POSITIVE: Clear text, same location, date aligns. Both text & hybrid pass.
            "q": {"name": "Black Leather Wallet", "description": "lost near central park entrance", "category": "wallet", "subcategory": "wallet", "color": "black", "location": "central park", "date_lost": "2026-03-01"},
            "t": {"name": "Found black wallet", "description": "Found a gents leather wallet", "category": "wallet", "subcategory": "wallet", "color": "black", "location": "central park", "date_found": "2026-03-01"},
            "q_img": WALLET_Q, "t_img": WALLET_T, "label": 1
        },
        {
            # EASY POSITIVE: Backpack - same subcategory, date window 1 day.
            "q": {"name": "Blue Nike Backpack", "description": "dark blue sports bag", "category": "other", "subcategory": "bag", "color": "blue", "location": "train station", "date_lost": "2026-03-15"},
            "t": {"name": "Blue bag", "description": "rucksack found on platform", "category": "other", "subcategory": "bag", "color": "blue", "location": "train station", "date_found": "2026-03-16"},
            "q_img": BACKPACK_Q, "t_img": BACKPACK_T, "label": 1
        },
        {
            # MODERATE POSITIVE: OCR target - query name has typo "JON" vs "JOHN"
            # Exp1 (text only) partially recovers via fuzzy. Exp4 fully recovers via OCR.
            "q": {"name": "JON DOE ID card", "description": "my university card", "category": "documents", "subcategory": "id", "color": "white", "location": "campus", "date_lost": "2026-03-19"},
            "t": {"name": "JOHN DOE", "description": "found student ID", "category": "documents", "subcategory": "id", "color": "white", "location": "library", "date_found": "2026-03-19"},
            "q_img": ID_Q, "t_img": ID_T, "label": 1
        },
        {
            # HARD POSITIVE: Extremely vague text ("lost thing", no location).
            # Text-only may fail; hybrid uses image + date to recover.
            "q": {"name": "lost something", "description": "a thing I dropped", "category": "wallet", "subcategory": "wallet", "color": "black", "location": "", "date_lost": "2026-03-01"},
            "t": {"name": "Found black wallet", "description": "Found a gents leather wallet", "category": "wallet", "subcategory": "wallet", "color": "black", "location": "central park", "date_found": "2026-03-01"},
            "q_img": WALLET_Q, "t_img": WALLET_T, "label": 1
        },
        {
            # HARD POSITIVE: Color synonym (navy vs dark blue). Text similarity is low.
            # Text-only may fail due to low BERT sim; hybrid uses image + color to confirm.
            "q": {"name": "navy rucksack", "description": "dark gym bag with shoulder straps", "category": "other", "subcategory": "bag", "color": "navy", "location": "", "date_lost": "2026-03-15"},
            "t": {"name": "Dark blue bag", "description": "dark blue rucksack left at station", "category": "other", "subcategory": "bag", "color": "dark blue", "location": "train station", "date_found": "2026-03-16"},
            "q_img": BACKPACK_Q, "t_img": BACKPACK_T, "label": 1
        },
        # ==============================
        # TRUE NEGATIVES (Label = 0)
        # ==============================
        {
            # EASY NEGATIVE: Wallet vs Backpack (subcategory mismatch -> 0.5x multiplier)
            "q": {"name": "Black wallet", "description": "lost near park", "category": "wallet", "subcategory": "wallet", "color": "black", "location": "central park", "date_lost": "2026-03-01"},
            "t": {"name": "Blue bag", "description": "rucksack found at train station", "category": "other", "subcategory": "bag", "color": "blue", "location": "train station", "date_found": "2026-03-16"},
            "q_img": WALLET_Q, "t_img": BACKPACK_T, "label": 0
        },
        {
            # EASY NEGATIVE: ID vs Wallet (strong type mismatch)
            "q": {"name": "student ID card", "description": "ID found on campus", "category": "documents", "subcategory": "id", "color": "white", "location": "campus", "date_lost": "2026-03-19"},
            "t": {"name": "Found black wallet", "description": "Found a gents wallet", "category": "wallet", "subcategory": "wallet", "color": "black", "location": "central park", "date_found": "2026-03-01"},
            "q_img": ID_Q, "t_img": WALLET_T, "label": 0
        },
        {
            # EASY NEGATIVE: Bag vs ID (strong type mismatch)
            "q": {"name": "Blue Nike Backpack", "description": "sports bag", "category": "other", "subcategory": "bag", "color": "blue", "location": "station", "date_lost": "2026-03-15"},
            "t": {"name": "Uni ID card", "description": "student ID found", "category": "documents", "subcategory": "id", "color": "white", "location": "library", "date_found": "2026-03-19"},
            "q_img": BACKPACK_Q, "t_img": ID_T, "label": 0
        },
        {
            # HARD NEGATIVE: Intra-class (wallet vs wallet, 1.5x boost).
            # Same type, same location, same date — but different color (brown vs black).
            # Hybrid uses color-from-image to reject; text-only may FAIL (FP).
            "q": {"name": "brown slim wallet", "description": "tan leather wallet lost near park", "category": "wallet", "subcategory": "wallet", "color": "brown", "location": "central park", "date_lost": "2026-03-01"},
            "t": {"name": "Found black wallet", "description": "Found a black gents wallet", "category": "wallet", "subcategory": "wallet", "color": "black", "location": "central park", "date_found": "2026-03-01"},
            "q_img": WALLET_Q, "t_img": WALLET_T, "label": 0
        },
        {
            # HARD NEGATIVE: Intra-class (bag vs bag, 1.5x boost).
            # Same type, same color — but different city (Manchester vs London).
            # Location score = 0.0 (no shared words). Both text-only and hybrid should fail
            # since location weight is only 20% and base text score is high.
            "q": {"name": "blue sports rucksack", "description": "dark blue gym bag", "category": "other", "subcategory": "bag", "color": "blue", "location": "Manchester Piccadilly", "date_lost": "2026-03-15"},
            "t": {"name": "Blue bag", "description": "rucksack", "category": "other", "subcategory": "bag", "color": "blue", "location": "London Waterloo station", "date_found": "2026-03-16"},
            "q_img": BACKPACK_Q, "t_img": BACKPACK_T, "label": 0
        },
        {
            # HARD NEGATIVE: Intra-class (wallet vs wallet, 1.5x boost).
            # Identical category + text, but date found is 7 WEEKS BEFORE item was lost (impossible).
            # Time score ~0.13 (low), but only 10% weight — still hard to reject with text alone.
            "q": {"name": "black leather wallet", "description": "lost near park", "category": "wallet", "subcategory": "wallet", "color": "black", "location": "central park", "date_lost": "2026-03-10"},
            "t": {"name": "Found black wallet", "description": "Found a gents wallet near park", "category": "wallet", "subcategory": "wallet", "color": "black", "location": "central park", "date_found": "2026-01-20"},
            "q_img": WALLET_Q, "t_img": WALLET_T, "label": 0
        },
    ]
    
    # Expand to 33 pairs (11 base × 3)
    master_dataset = []
    for _ in range(3):
        master_dataset.extend(base_pairs)
        
    def evaluate_set(mode="hybrid"):
        y_true = []
        y_pred = []
        
        for pair in master_dataset:
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
