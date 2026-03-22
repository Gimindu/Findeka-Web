import time
import json
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from logic import calculate_match_score, extract_features
from models_loader import model_manager

def run_evaluation():
    model_manager.load_models()
    
    test_pairs = [
        {
            "q": {"name": "Black Leather Wallet", "description": "Lost near central park, has my ID.", "category": "documents", "subcategory": "wallet", "color": "black", "location": "central park", "date_lost": "2026-03-01"},
            "t": {"name": "Found black wallet", "description": "Found a black leather gents wallet at the park entrance.", "category": "documents", "subcategory": "wallet", "color": "black", "location": "central park", "date_found": "2026-03-01"},
            "label": 1
        },
        {
            "q": {"name": "Red Honda Keys", "description": "Car keys with a red Honda logo keychain", "category": "keys", "subcategory": "car keys", "color": "red", "location": "library", "date_lost": "2026-03-10"},
            "t": {"name": "Honda Car Keys", "description": "Set of keys with a red tag", "category": "keys", "subcategory": "car keys", "color": "red", "location": "library", "date_found": "2026-03-10"},
            "label": 1
        },
        {
            "q": {"name": "Blue Nike Backpack", "description": "Contains my laptop and some books", "category": "personal items", "subcategory": "bag", "color": "blue", "location": "train station", "date_lost": "2026-03-15"},
            "t": {"name": "Blue bag", "description": "Nike rucksack left on train", "category": "personal items", "subcategory": "bag", "color": "blue", "location": "train station", "date_found": "2026-03-16"},
            "label": 1
        },
        {
            "q": {"name": "iPhone 13 Pro", "description": "Blue iphone, clear case", "category": "electronics", "subcategory": "phone", "color": "blue", "location": "downtown", "date_lost": "2026-03-05"},
            "t": {"name": "Samsung Galaxy", "description": "Black phone found", "category": "electronics", "subcategory": "phone", "color": "black", "location": "uptown", "date_found": "2026-03-05"},
            "label": 0
        },
        {
            "q": {"name": "White Cat", "description": "Fluffy white Persian cat, wearing a pink collar", "category": "pets", "subcategory": "cat", "color": "white", "location": "suburbs", "date_lost": "2026-03-18"},
            "t": {"name": "White Dog", "description": "Small white poodle", "category": "pets", "subcategory": "dog", "color": "white", "location": "suburbs", "date_found": "2026-03-18"},
            "label": 0
        },
        {
            "q": {"name": "Black Umbrella", "description": "Standard black folding umbrella", "category": "personal items", "subcategory": "umbrella", "color": "black", "location": "coffee shop", "date_lost": "2026-03-10"},
            "t": {"name": "Black Leather Wallet", "description": "Found a black wallet", "category": "documents", "subcategory": "wallet", "color": "black", "location": "coffee shop", "date_found": "2026-03-10"},
            "label": 0
        }
    ]
    
    expanded_dataset = []
    for _ in range(4):
        expanded_dataset.extend(test_pairs)
    
    y_true = []
    y_pred = []
    inference_times = []

    for pair in expanded_dataset:
        query_item = pair["q"]
        target_item = pair["t"]
        y_true.append(pair["label"])
        
        start_time = time.time()
        q_feats = extract_features(query_item, img_path=None)
        t_feats = extract_features(target_item, img_path=None)
        score = calculate_match_score(query_item, None, q_feats, target_item, None, t_feats)
        inference_times.append(time.time() - start_time)
        
        prediction = 1 if score > 0.4 else 0
        y_pred.append(prediction)
        
    acc = accuracy_score(y_true, y_pred) * 100
    prec = precision_score(y_true, y_pred, zero_division=0) * 100
    rec = recall_score(y_true, y_pred, zero_division=0) * 100
    f1 = f1_score(y_true, y_pred, zero_division=0) * 100
    avg_inference = sum(inference_times) / len(inference_times)
    
    results = {
        "Accuracy": acc,
        "Precision": prec,
        "Recall": rec,
        "F1": f1,
        "Avg_Inference_Sec": avg_inference
    }
    
    with open("results.json", "w") as f:
        json.dump(results, f, indent=4)
        
if __name__ == "__main__":
    run_evaluation()
