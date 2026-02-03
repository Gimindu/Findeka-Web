# Findeka AI Service

This service powers the AI matching capabilities of Findeka. It uses FastAPI and several ML models (CLIP, BERT, MobileNet, SpaCy) to match lost and found items.

## Setup

## Setup & Run (Windows)

**Option A: The Easy Way**
Simply double-click `run_service.bat`. It will automatically:
1. Create a virtual environment (`venv`)
2. Install all dependencies
3. Download necessary models
4. Start the server

**Option B: Manual Setup**
1. **Create & Activate Venv**
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Download SpaCy Model**
   ```bash
   python -m spacy download en_core_web_lg
   ```

4. **Run Server**
   ```bash
   uvicorn main:app --reload
   ```

## API Endpoints

- **GET /**: Health check.
- **POST /search**: Upload an image and details to find matches.
- **POST /submit**: Register a new item (if no match found).

## Structure

- `main.py`: Entry point and API routes.
- `models_loader.py`: Handles loading of heavy ML models.
- `logic.py`: Core logic for feature extraction and matching.
- `utils.py`: Helper functions.
- `config.py`: Configuration settings.
