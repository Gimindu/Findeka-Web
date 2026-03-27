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
    print("Loading Full Multimodal AI Models...")
    model_manager.load_models()
    
    # ---------------------------------------------------------
    # MULTIMODAL HYBRID DATASET v2
    # 7 base pairs x 3 = 21 total test pairs.
    # Includes hard intra-class negatives to test real-world accuracy.
    # ---------------------------------------------------------
    base_pairs = [
        # TRUE MATCHES
        {
            # Strong match - same wallet, same location, same date
            "q": {"name": "Black Leather Wallet", "description": "Lost near central park.", "category": "documents", "subcategory": "wallet", "color": "black", "location": "central park", "date_lost": "2026-03-01"},
            "t": {"name": "Found black wallet", "description": "Found a black gents wallet.", "category": "documents", "subcategory": "wallet", "color": "black", "location": "central park", "date_found": "2026-03-01"},
            "q_img": WALLET_Q, "t_img": WALLET_T, "label": 1
        },
        {
            # Bag match with compatible location + one-day window
            "q": {"name": "Blue Nike Backpack", "description": "Dark blue sports bag", "category": "personal items", "subcategory": "bag", "color": "blue", "location": "train station", "date_lost": "2026-03-15"},
            "t": {"name": "Blue bag", "description": "Blue rucksack", "category": "personal items", "subcategory": "bag", "color": "blue", "location": "train station", "date_found": "2026-03-16"},
            "q_img": BACKPACK_Q, "t_img": BACKPACK_T, "label": 1
        },
        {
            # Hard positive: color synonym (navy vs dark blue)
            "q": {"name": "navy rucksack", "description": "dark sports bag", "category": "personal items", "subcategory": "bag", "color": "navy", "location": "gym", "date_lost": "2026-03-15"},
            "t": {"name": "Dark blue bag", "description": "Blue rucksack found at station", "category": "personal items", "subcategory": "bag", "color": "dark blue", "location": "train station", "date_found": "2026-03-16"},
            "q_img": BACKPACK_Q, "t_img": BACKPACK_T, "label": 1
        },
        # TRUE NEGATIVES (EASY)
        {
            # Cross-class: wallet image vs bag image
            "q": {"name": "Black Leather Wallet", "description": "Lost near central park.", "category": "documents", "subcategory": "wallet", "color": "black", "location": "central park", "date_lost": "2026-03-01"},
            "t": {"name": "Blue bag", "description": "Blue rucksack", "category": "personal items", "subcategory": "bag", "color": "blue", "location": "train station", "date_found": "2026-03-16"},
            "q_img": WALLET_Q, "t_img": BACKPACK_T, "label": 0
        },
        {
            # Cross-class: bag image vs wallet image
            "q": {"name": "Blue Nike Backpack", "description": "Dark blue sports bag", "category": "personal items", "subcategory": "bag", "color": "blue", "location": "train station", "date_lost": "2026-03-15"},
            "t": {"name": "Found black wallet", "description": "Found a black gents wallet.", "category": "documents", "subcategory": "wallet", "color": "black", "location": "central park", "date_found": "2026-03-01"},
            "q_img": BACKPACK_Q, "t_img": WALLET_T, "label": 0
        },
        {
            # HARD NEGATIVE: Intra-class wallet vs wallet (1.5x subcategory boost)
            # Same type, same location — but color is entirely different (brown vs black).
            "q": {"name": "brown leather wallet", "description": "tan wallet with cash and cards", "category": "documents", "subcategory": "wallet", "color": "brown", "location": "central park", "date_lost": "2026-03-01"},
            "t": {"name": "Found black wallet", "description": "Found a black gents wallet.", "category": "documents", "subcategory": "wallet", "color": "black", "location": "central park", "date_found": "2026-03-01"},
            "q_img": WALLET_Q, "t_img": WALLET_T, "label": 0  # Wrong person — color mismatch
        },
        {
            # HARD NEGATIVE: Intra-class bag vs bag - same color + category
            # but date found is 7 weeks too early — temporally impossible.
            "q": {"name": "Blue Nike Backpack", "description": "dark blue sports rucksack", "category": "personal items", "subcategory": "bag", "color": "blue", "location": "train station", "date_lost": "2026-03-15"},
            "t": {"name": "Blue bag", "description": "Blue rucksack left behind", "category": "personal items", "subcategory": "bag", "color": "blue", "location": "train station", "date_found": "2026-01-25"},
            "q_img": BACKPACK_Q, "t_img": BACKPACK_T, "label": 0  # Impossible date: found before lost
        },
    ]
    
    # Expand to 21 pairs (7 base x 3)
    expanded_dataset = []
    for _ in range(3):
        expanded_dataset.extend(base_pairs)
    
    y_true = []
    y_pred = []
    inference_times = []

    print(f"Starting Multimodal Inference on {len(expanded_dataset)} item pairs...")

    for pair in expanded_dataset:
        query_item = pair["q"]
        target_item = pair["t"]
        q_img = pair["q_img"]
        t_img = pair["t_img"]
        y_true.append(pair["label"])
        
        start_time = time.time()
        
        # EXTRACT MULTIMODAL FEATURES
        q_feats = extract_features(query_item, img_path=q_img)
        t_feats = extract_features(target_item, img_path=t_img)
        
        # SCORE (Threshold = 0.4)
        score = calculate_match_score(query_item, q_img, q_feats, target_item, t_img, t_feats)
        
        inference_times.append(time.time() - start_time)
        prediction = 1 if score > 0.4 else 0
        y_pred.append(prediction)
        
    acc = accuracy_score(y_true, y_pred) * 100
    prec = precision_score(y_true, y_pred, zero_division=0) * 100
    rec = recall_score(y_true, y_pred, zero_division=0) * 100
    f1 = f1_score(y_true, y_pred, zero_division=0) * 100
    avg_inference = sum(inference_times) / len(inference_times)
    
    results = {
        "Accuracy_Hybrid": acc,
        "Precision_Hybrid": prec,
        "Recall_Hybrid": rec,
        "F1_Hybrid": f1,
        "Avg_Inference_Sec": avg_inference
    }
    
    with open("results_hybrid.json", "w") as f:
        json.dump(results, f, indent=4)
        
    print("Inference Complete. Results saved.")
        
if __name__ == "__main__":
    run_evaluation()
