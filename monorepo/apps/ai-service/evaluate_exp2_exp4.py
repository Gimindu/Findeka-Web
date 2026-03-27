import time
import json
import os
import sys
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
    print("Loading Full Multimodal AI Models (including EasyOCR)...")
    model_manager.load_models()
    
    # ---------------------------------------------------------
    # MULTIMODAL GROUND TRUTH DATASET v2
    # 9 base pairs x 2 = 18 total pairs.
    # 4 easy matches + 2 hard matches + 6 negatives (3 easy + 3 hard)
    # ---------------------------------------------------------
    base_pairs = [
        # TRUE MATCHES
        {
            # EASY: Strong text match + matching image
            "q": {"name": "Black Leather Wallet", "description": "Lost near park", "category": "personal items", "subcategory": "wallet", "color": "black", "location": "central park", "date_lost": "2026-03-01"},
            "t": {"name": "Found black wallet", "description": "Found a gents wallet.", "category": "personal items", "subcategory": "wallet", "color": "black", "location": "central park", "date_found": "2026-03-01"},
            "q_img": WALLET_Q, "t_img": WALLET_T, "label": 1
        },
        {
            # EASY: Bag match with compatible location
            "q": {"name": "Blue Nike Backpack", "description": "sports bag", "category": "personal items", "subcategory": "bag", "color": "blue", "location": "train station", "date_lost": "2026-03-15"},
            "t": {"name": "Blue bag", "description": "rucksack", "category": "personal items", "subcategory": "bag", "color": "blue", "location": "train station", "date_found": "2026-03-16"},
            "q_img": BACKPACK_Q, "t_img": BACKPACK_T, "label": 1
        },
        {
            # OCR MATCH: Student ID
            "q": {"name": "JOHN DOE", "description": "student ID card", "category": "documents", "subcategory": "id", "color": "white", "location": "campus", "date_lost": "2026-03-19"},
            "t": {"name": "JOHN DOE", "description": "found student ID", "category": "documents", "subcategory": "id", "color": "white", "location": "campus", "date_found": "2026-03-19"},
            "q_img": ID_Q, "t_img": ID_T, "label": 1
        },
        {
            # HARD POSITIVE: Garbled OCR name - tests OCR recovery
            "q": {"name": "JN DOE student card", "description": "uni ID card dropped on campus", "category": "documents", "subcategory": "id", "color": "white", "location": "library", "date_lost": "2026-03-19"},
            "t": {"name": "JOHN DOE", "description": "found student ID", "category": "documents", "subcategory": "id", "color": "white", "location": "campus", "date_found": "2026-03-19"},
            "q_img": ID_Q, "t_img": ID_T, "label": 1
        },
        # TRUE NEGATIVES
        {
            # EASY: Cross-class (wallet vs bag)
            "q": {"name": "Black Leather Wallet", "description": "Lost near park", "category": "personal items", "subcategory": "wallet", "color": "black", "location": "central park", "date_lost": "2026-03-01"},
            "t": {"name": "Blue bag", "description": "rucksack", "category": "personal items", "subcategory": "bag", "color": "blue", "location": "train station", "date_found": "2026-03-16"},
            "q_img": WALLET_Q, "t_img": BACKPACK_T, "label": 0
        },
        {
            # EASY: Cross-class (bag vs wallet)
            "q": {"name": "Blue Nike Backpack", "description": "sports bag", "category": "personal items", "subcategory": "bag", "color": "blue", "location": "train station", "date_lost": "2026-03-15"},
            "t": {"name": "Found black wallet", "description": "Found a gents wallet.", "category": "personal items", "subcategory": "wallet", "color": "black", "location": "central park", "date_found": "2026-03-01"},
            "q_img": BACKPACK_Q, "t_img": WALLET_T, "label": 0
        },
        {
            # EASY: Cross-class (ID vs wallet)
            "q": {"name": "JOHN DOE", "description": "student ID card", "category": "documents", "subcategory": "id", "color": "white", "location": "campus", "date_lost": "2026-03-19"},
            "t": {"name": "Found black wallet", "description": "Found a gents wallet.", "category": "personal items", "subcategory": "wallet", "color": "black", "location": "central park", "date_found": "2026-03-01"},
            "q_img": ID_Q, "t_img": WALLET_T, "label": 0
        },
        {
            # HARD NEGATIVE: Intra-class wallet vs wallet (1.5x subcategory boost)
            # Different color (brown vs black) reported — wrong person's wallet.
            "q": {"name": "brown leather wallet", "description": "slim tan wallet with cards", "category": "personal items", "subcategory": "wallet", "color": "brown", "location": "central park", "date_lost": "2026-03-01"},
            "t": {"name": "Found black wallet", "description": "Found a gents wallet.", "category": "personal items", "subcategory": "wallet", "color": "black", "location": "central park", "date_found": "2026-03-01"},
            "q_img": WALLET_Q, "t_img": WALLET_T, "label": 0  # Wrong person — color mismatch
        },
        {
            # HARD NEGATIVE: Intra-class bag vs bag - same type, same color
            # but item was found 6 weeks BEFORE loss was reported (impossible window).
            "q": {"name": "Blue Nike Backpack", "description": "dark blue sports bag", "category": "personal items", "subcategory": "bag", "color": "blue", "location": "train station", "date_lost": "2026-03-15"},
            "t": {"name": "Blue bag", "description": "rucksack found on platform", "category": "personal items", "subcategory": "bag", "color": "blue", "location": "train station", "date_found": "2026-01-30"},
            "q_img": BACKPACK_Q, "t_img": BACKPACK_T, "label": 0  # Different item: impossible date window
        },
    ]
    
    # Expand to 18 pairs (9 base x 2)
    test_pairs = []
    for _ in range(2):
        test_pairs.extend(base_pairs)
        
    # Fields to preserve even in vision-only mode (needed for date/time scoring)
    DATE_FIELDS = {"date_lost", "date_found", "location", "category"}

    def evaluate_set(dataset, vision_only=False, label=None):
        y_true = []
        y_pred = []
        scores = []

        for i, pair in enumerate(dataset):
            q = dict(pair["q"])
            t = dict(pair["t"])

            if vision_only:
                # Zero out text signals but PRESERVE date/location/category fields
                # so time_decay and location scoring still function correctly.
                for k in q:
                    if k not in DATE_FIELDS:
                        q[k] = ""
                for k in t:
                    if k not in DATE_FIELDS:
                        t[k] = ""

            q_img = pair["q_img"]
            t_img = pair["t_img"]

            y_true.append(pair["label"])

            q_feats = extract_features(q, img_path=q_img)
            t_feats = extract_features(t, img_path=t_img)

            score = calculate_match_score(q, q_img, q_feats, t, t_img, t_feats)
            pred = 1 if score > 0.4 else 0
            y_pred.append(pred)
            scores.append(score)

            # Per-pair logging
            status = "✅ OK" if pred == pair["label"] else "❌ WRONG"
            print(f"  [{label}] Pair {i+1:02d} | score={score:.3f} pred={pred} true={pair['label']} {status}")

        acc  = accuracy_score(y_true, y_pred) * 100
        prec = precision_score(y_true, y_pred, zero_division=0) * 100
        rec  = recall_score(y_true, y_pred, zero_division=0) * 100
        f1   = f1_score(y_true, y_pred, zero_division=0) * 100
        return acc, prec, rec, f1

    # RUN EXP 2 (Vision Only)
    print("\nRunning Experiment 2 (Vision Only)...")
    t0 = time.time()
    acc_v, prec_v, rec_v, f1_v = evaluate_set(test_pairs, vision_only=True, label="Exp2")
    print(f"  Exp2 done in {time.time()-t0:.1f}s | Acc={acc_v:.1f}% P={prec_v:.1f}% R={rec_v:.1f}% F1={f1_v:.1f}%")

    # RUN EXP 4 (Hybrid + OCR)
    print("\nRunning Experiment 4 (Hybrid + OCR)...")
    t0 = time.time()
    acc_o, prec_o, rec_o, f1_o = evaluate_set(test_pairs, vision_only=False, label="Exp4")
    print(f"  Exp4 done in {time.time()-t0:.1f}s | Acc={acc_o:.1f}% P={prec_o:.1f}% R={rec_o:.1f}% F1={f1_o:.1f}%")

    results = {
        "Exp2": {"Acc": round(acc_v, 2), "Prec": round(prec_v, 2), "Rec": round(rec_v, 2), "F1": round(f1_v, 2)},
        "Exp4": {"Acc": round(acc_o, 2), "Prec": round(prec_o, 2), "Rec": round(rec_o, 2), "F1": round(f1_o, 2)}
    }
    
    # Save next to this script regardless of working directory
    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "results_exp2_exp4.json")
    with open(out_path, "w") as f:
        json.dump(results, f, indent=4)

    print(f"\nInference Complete. Results saved to: {out_path}")
        
if __name__ == "__main__":
    run_evaluation()
