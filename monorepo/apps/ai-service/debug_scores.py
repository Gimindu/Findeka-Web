import json
import os
import sys
import copy
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

model_manager.load_models()

base_pairs = [
    {"label": 1, "name": "Easy wallet match",
     "q": {"name": "Black Leather Wallet", "description": "lost near central park entrance", "category": "wallet", "subcategory": "wallet", "color": "black", "location": "central park", "date_lost": "2026-03-01"},
     "t": {"name": "Found black wallet", "description": "Found a gents leather wallet", "category": "wallet", "subcategory": "wallet", "color": "black", "location": "central park", "date_found": "2026-03-01"},
     "q_img": WALLET_Q, "t_img": WALLET_T},
    {"label": 1, "name": "Easy backpack match",
     "q": {"name": "Blue Nike Backpack", "description": "dark blue sports bag", "category": "other", "subcategory": "bag", "color": "blue", "location": "train station", "date_lost": "2026-03-15"},
     "t": {"name": "Blue bag", "description": "rucksack found on platform", "category": "other", "subcategory": "bag", "color": "blue", "location": "train station", "date_found": "2026-03-16"},
     "q_img": BACKPACK_Q, "t_img": BACKPACK_T},
    {"label": 1, "name": "OCR ID match (typo: JON DOE)",
     "q": {"name": "JON DOE ID card", "description": "my university card", "category": "documents", "subcategory": "id", "color": "white", "location": "campus", "date_lost": "2026-03-19"},
     "t": {"name": "JOHN DOE", "description": "found student ID", "category": "documents", "subcategory": "id", "color": "white", "location": "library", "date_found": "2026-03-19"},
     "q_img": ID_Q, "t_img": ID_T},
    {"label": 1, "name": "Hard+ vague text 'lost something'",
     "q": {"name": "lost something", "description": "a thing I dropped", "category": "wallet", "subcategory": "wallet", "color": "black", "location": "", "date_lost": "2026-03-01"},
     "t": {"name": "Found black wallet", "description": "Found a gents leather wallet", "category": "wallet", "subcategory": "wallet", "color": "black", "location": "central park", "date_found": "2026-03-01"},
     "q_img": WALLET_Q, "t_img": WALLET_T},
    {"label": 1, "name": "Hard+ navy vs dark blue (color synonym)",
     "q": {"name": "navy rucksack", "description": "dark gym bag with shoulder straps", "category": "other", "subcategory": "bag", "color": "navy", "location": "", "date_lost": "2026-03-15"},
     "t": {"name": "Dark blue bag", "description": "dark blue rucksack left at station", "category": "other", "subcategory": "bag", "color": "dark blue", "location": "train station", "date_found": "2026-03-16"},
     "q_img": BACKPACK_Q, "t_img": BACKPACK_T},
    {"label": 0, "name": "Easy- wallet vs backpack",
     "q": {"name": "Black wallet", "description": "lost near park", "category": "wallet", "subcategory": "wallet", "color": "black", "location": "central park", "date_lost": "2026-03-01"},
     "t": {"name": "Blue bag", "description": "rucksack found at train station", "category": "other", "subcategory": "bag", "color": "blue", "location": "train station", "date_found": "2026-03-16"},
     "q_img": WALLET_Q, "t_img": BACKPACK_T},
    {"label": 0, "name": "Easy- ID vs wallet",
     "q": {"name": "student ID card", "description": "ID found on campus", "category": "documents", "subcategory": "id", "color": "white", "location": "campus", "date_lost": "2026-03-19"},
     "t": {"name": "Found black wallet", "description": "Found a gents wallet", "category": "wallet", "subcategory": "wallet", "color": "black", "location": "central park", "date_found": "2026-03-01"},
     "q_img": ID_Q, "t_img": WALLET_T},
    {"label": 0, "name": "Easy- bag vs ID",
     "q": {"name": "Blue Nike Backpack", "description": "sports bag", "category": "other", "subcategory": "bag", "color": "blue", "location": "station", "date_lost": "2026-03-15"},
     "t": {"name": "Uni ID card", "description": "student ID found", "category": "documents", "subcategory": "id", "color": "white", "location": "library", "date_found": "2026-03-19"},
     "q_img": BACKPACK_Q, "t_img": ID_T},
    {"label": 0, "name": "Hard- wallet vs wallet, brown vs black (color mismatch)",
     "q": {"name": "brown slim wallet", "description": "tan leather wallet lost near park", "category": "wallet", "subcategory": "wallet", "color": "brown", "location": "central park", "date_lost": "2026-03-01"},
     "t": {"name": "Found black wallet", "description": "Found a black gents wallet", "category": "wallet", "subcategory": "wallet", "color": "black", "location": "central park", "date_found": "2026-03-01"},
     "q_img": WALLET_Q, "t_img": WALLET_T},
    {"label": 0, "name": "Hard- bag vs bag, Manchester vs London",
     "q": {"name": "blue sports rucksack", "description": "dark blue gym bag", "category": "other", "subcategory": "bag", "color": "blue", "location": "Manchester Piccadilly", "date_lost": "2026-03-15"},
     "t": {"name": "Blue bag", "description": "rucksack", "category": "other", "subcategory": "bag", "color": "blue", "location": "London Waterloo station", "date_found": "2026-03-16"},
     "q_img": BACKPACK_Q, "t_img": BACKPACK_T},
    {"label": 0, "name": "Hard- wallet vs wallet, impossible date (7 weeks early)",
     "q": {"name": "black leather wallet", "description": "lost near park", "category": "wallet", "subcategory": "wallet", "color": "black", "location": "central park", "date_lost": "2026-03-10"},
     "t": {"name": "Found black wallet", "description": "Found a gents wallet near park", "category": "wallet", "subcategory": "wallet", "color": "black", "location": "central park", "date_found": "2026-01-20"},
     "q_img": WALLET_Q, "t_img": WALLET_T},
]

MODES = ["text", "vision", "hybrid_no_ocr", "hybrid_ocr"]

print(f"\n{'Pair':<45} {'Label'} | {'Text':>6} {'Vision':>7} {'Hybrid':>7} {'OCR':>6}")
print("-" * 90)

for pair in base_pairs:
    scores = {}
    for mode in MODES:
        q = copy.deepcopy(pair["q"])
        t = copy.deepcopy(pair["t"])
        q_img = pair["q_img"]
        t_img = pair["t_img"]
        if mode == "text":
            q_img = None; t_img = None
        elif mode == "vision":
            q["name"] = ""; q["description"] = ""; t["name"] = ""; t["description"] = ""
        elif mode == "hybrid_no_ocr":
            q["category"] = "unsupported_ocr_category"; t["category"] = "unsupported_ocr_category"
        q_feats = extract_features(q, img_path=q_img)
        t_feats = extract_features(t, img_path=t_img)
        scores[mode] = calculate_match_score(q, q_img, q_feats, t, t_img, t_feats)
    
    name = pair["name"][:44]
    label = pair["label"]
    print(f"{name:<45} {label}     | {scores['text']:>6.3f} {scores['vision']:>7.3f} {scores['hybrid_no_ocr']:>7.3f} {scores['hybrid_ocr']:>6.3f}")

print("\nDone.")
