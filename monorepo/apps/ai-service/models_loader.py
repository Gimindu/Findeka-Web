"""Model manager for loading and storing ML models used by the service."""

import os
import sys
import importlib

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
    keras_apps = importlib.import_module("tensorflow.keras.applications")
    mobilenet_v2_module = importlib.import_module("tensorflow.keras.applications.mobilenet_v2")
    MobileNetV2 = keras_apps.MobileNetV2
    preprocess_input = mobilenet_v2_module.preprocess_input
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
        print("[*] Initializing AI Models...")
        
        # 1. Load SpaCy (NLP)
        if spacy:
            print("[->] Loading SpaCy...")
            try:
                # We assume the batch file or pip install handled the download
                self.nlp = spacy.load("en_core_web_lg")
                print("[OK] SpaCy loaded")
            except Exception as e:
                print(f"[!] Failed to load SpaCy: {e}")
                print("Try running: python -m spacy download en_core_web_lg")
        else:
            print("[?] SpaCy not installed. Skipping.")

        # 2. Load BERT
        if SentenceTransformer:
            print("[->] Loading BERT...")
            try:
                # cache_folder ensures it saves to our local storage
                self.bert_model = SentenceTransformer('all-MiniLM-L6-v2', cache_folder=str(MODELS_FOLDER))
                print("[OK] BERT loaded")
            except Exception as e:
                 print(f"[!] Failed to load BERT: {e}")
        else:
            print("[?] SentenceTransformer not installed. Skipping.")

        # 3. Load CLIP
        if clip and torch:
            print("[->] Loading CLIP...")
            try:
                # download_root ensures it saves to our local storage
                self.clip_model, self.clip_preprocess = clip.load("ViT-B/32", device=self.device, download_root=str(MODELS_FOLDER))
                print("[OK] CLIP loaded")
            except Exception as e:
                 print(f"[!] Failed to load CLIP: {e}")
        else:
             print("[?] CLIP/Torch not installed. Skipping.")

        # 4. Load MobileNetV2
        if MobileNetV2:
            print("[->] Loading MobileNetV2...")
            try:
                self.mobilenet_model = MobileNetV2(weights='imagenet', include_top=False, pooling='avg', input_shape=(224,224,3))
                self.mobilenet_model.trainable = False
                print("[OK] MobileNetV2 loaded")
            except Exception as e:
                print(f"[!] Failed to load MobileNetV2: {e}")
        else:
            print("[?] TensorFlow/MobileNet not installed. Skipping.")

        # 5. Load OCR
        if easyocr:
            print("[->] Loading EasyOCR...")
            try:
                # gpu=True only if cuda
                use_gpu = (self.device == 'cuda')
                # model_storage_directory ensures it saves to our local storage
                self.ocr_reader = easyocr.Reader(['en'], gpu=use_gpu, model_storage_directory=str(MODELS_FOLDER))
                print("[OK] EasyOCR loaded")
            except Exception as e:
                print(f"[!] Failed to load EasyOCR: {e}")
        else:
             print("[?] EasyOCR not installed. Skipping.")

        print("[DONE] AI System Status Check Complete")

# Singleton instance
model_manager = AIModelManager()
