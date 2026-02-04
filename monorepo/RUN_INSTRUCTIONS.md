# How to Run Findeka

## Quick Start (Easiest)

1.  Double-click **`start_app.bat`** in the `monorepo` folder.
2.  This will open two terminal windows (one for AI, one for Web) and start everything automatically.

## Manual Start

If you prefer running them manually, verify the following:

### 1. AI Service
Open a terminal in `monorepo/apps/ai-service` and run:
```powershell
.\run_service.bat
```
-   **URL**: `http://localhost:8000`
-   **Note**: First run might take a few seconds to verify models (no download needed).

### 2. Web Application
Open a terminal in `monorepo/apps/web` and run:
```powershell
npm run dev
```
-   **URL**: `http://localhost:5173`

## Troubleshooting
-   **Port in use**: If it says port 8000 or 5173 is busy, close any existing terminal windows running the app.
-   **Models**: AI models are cached in `apps/ai-service/storage/saved_models`. Do not delete this folder to avoid re-downloading.
