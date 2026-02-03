import os
import sys

# Lazy / Safe Imports for heavy ML libraries
try:
    import spacy
except ImportError:
    spacy = None

try:
    import torch
    import clip
except ImportError:
    torch = None
    clip = None

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None

try:
    from tensorflow.keras.applications import MobileNetV2
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
except ImportError:
    MobileNetV2 = None
    preprocess_input = None

try:
    import easyocr
except ImportError:
    easyocr = None

from config import MODELS_FOLDER

class AIModelManager:
    def __init__(self):
        self.device = "cuda" if (torch and torch.cuda.is_available()) else "cpu"
        self.nlp = None
        self.bert_model = None
        self.clip_model = None
        self.clip_preprocess = None
        self.mobilenet_model = None
        self.ocr_reader = None

    def load_models(self):
        print("🚀 Initializing AI Models...")
        
        # 1. Load SpaCy (NLP)
        if spacy:
            print("⬇️ Loading SpaCy...")
            try:
                # Try loading from cache first if it was saved there
                model_path = MODELS_FOLDER / "en_core_web_lg"
                if model_path.exists():
                    self.nlp = spacy.load(str(model_path))
                    print("✅ SpaCy loaded from cache")
                else:
                    try:
                        spacy.cli.download("en_core_web_lg")
                        self.nlp = spacy.load("en_core_web_lg")
                    except Exception as e:
                        print(f"⚠️ Could not download SpaCy: {e}")
            except Exception as e:
                print(f"❌ Failed to load SpaCy: {e}")
        else:
            print("⚠️ SpaCy not installed. Skipping.")

        # 2. Load BERT
        if SentenceTransformer:
            print("⬇️ Loading BERT...")
            self.bert_model = SentenceTransformer('all-MiniLM-L6-v2')
            print("✅ BERT loaded")
        else:
            print("⚠️ SentenceTransformer not installed. Skipping.")

        # 3. Load CLIP
        if clip and torch:
            print("⬇️ Loading CLIP...")
            try:
                self.clip_model, self.clip_preprocess = clip.load("ViT-B/32", device=self.device)
                print("✅ CLIP loaded")
            except Exception as e:
                 print(f"❌ Failed to load CLIP: {e}")
        else:
             print("⚠️ CLIP/Torch not installed. Skipping.")

        # 4. Load MobileNetV2
        if MobileNetV2:
            print("⬇️ Loading MobileNetV2...")
            self.mobilenet_model = MobileNetV2(weights='imagenet', include_top=False, pooling='avg', input_shape=(224,224,3))
            self.mobilenet_model.trainable = False
            print("✅ MobileNetV2 loaded")
        else:
            print("⚠️ TensorFlow/MobileNet not installed. Skipping.")

        # 5. Load OCR
        if easyocr:
            print("⬇️ Loading EasyOCR...")
            # gpu=True only if cuda
            use_gpu = (self.device == 'cuda')
            self.ocr_reader = easyocr.Reader(['en'], gpu=use_gpu)
            print("✅ EasyOCR loaded")
        else:
             print("⚠️ EasyOCR not installed. Skipping.")

        print("🎉 AI System Status Check Complete")

# Singleton instance
model_manager = AIModelManager()
