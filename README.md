# Findeka - AI Lost & Found System

Findeka is an intelligent Lost & Found application that uses a hybrid AI approach to match lost items with found items. It combines **text analysis** (BERT) and **computer vision** (CLIP, MobileNetV2, EasyOCR) to rank potential matches based on visual similarity, semantic description matching, and location/time proximity.

---

## ⚡ Quick Start (Supervisor Guide)

> [!WARNING]
> **First Run Notice - Large Download (~5GB)**
> On the very first run, the AI Service will download several large machine learning models (CLIP, Sentence-BERT, MobileNet, SpaCy).
> **Please ensure you have a stable internet connection and at least 5GB of free disk space.**
> This is a one-time process. Subsequent runs will be instant.

### How to Run
1.  Navigate to the `monorepo` folder.
2.  Double-click **`start_app.bat`**.
3.  Wait for the automated setup to complete:
    -   It will install Node.js dependencies (`npm install`) automatically.
    -   It will set up the Python virtual environment and install dependencies.
    -   It will download the necessary AI models.
4.  Once running, two windows will open:
    -   **Web App**: [http://localhost:5173](http://localhost:5173)
    -   **AI Service**: [http://localhost:8000](http://localhost:8000) (running in background)

---

## 🏗️ Architecture

-   **Frontend**: Vite + React + TailwindCSS
-   **Backend / AI**: Python (FastAPI)
-   **Database**: MongoDB Atlas
-   **AI Models**:
    -   **CLIP (OpenAI)**: Image-Text matching
    -   **Sentence-BERT**: Semantic text similarity
    -   **MobileNetV2**: Visual feature extraction
    -   **EasyOCR**: Text extraction from images (ID cards, documents)

## 🔧 Manual Run (Developer Mode)

If you prefer running components individually:

### 1. Web Frontend
```bash
cd monorepo/apps/web
npm install  # (Only needed first time)
npm run dev
```

### 2. AI Service
```bash
cd monorepo/apps/ai-service
./run_service.bat
```
