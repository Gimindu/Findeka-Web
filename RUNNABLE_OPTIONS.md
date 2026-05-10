# Findeka Project - Runnable Options

This document outlines all the available commands and scripts to run the different parts of the Findeka project.

## 🚀 1. The Quickest Way (Run All)

If you want to start the entire system (Web App + AI Service) with a single command, use the provided batch script in the `monorepo` directory.

- **Path**: `monorepo/start_app.bat`
- **Command**: Double-click `start_app.bat` in File Explorer, or run:
  ```powershell
  cd monorepo
  .\start_app.bat
  ```
- **What it does**: 
  - Opens two terminal windows.
  - Automatically installs dependencies for the web app and starts it.
  - Sets up the Python virtual environment for the AI Service, installs packages, downloads necessary ML models, and starts the FastAPI server.
> [!WARNING]
> **First Run Notice - Large Download (~5GB)**
> On the very first run, the AI Service will download several large machine learning models. Please ensure you have a stable internet connection and at least 5GB of free disk space.

---

## 🌐 2. Web Application (`apps/web`)

This is the main React/Vite frontend application.

- **Path**: `monorepo/apps/web`
- **Available Commands** (run these from the `monorepo/apps/web` directory after running `npm install`):
  
  | Command | Description |
  | :--- | :--- |
  | `npm run dev` | Starts the Vite development server (usually on `http://localhost:5173`). |
  | `npm run build` | Compiles TypeScript and builds the app for production. |
  | `npm run preview` | Boots up a local static web server to preview the production build. |
  | `npm run lint` | Runs ESLint to check for code quality and errors. |

---

## 🧠 3. AI Service (`apps/ai-service`)

This is the Python/FastAPI backend that handles image-text matching, NLP, and AI logic.

- **Path**: `monorepo/apps/ai-service`
- **Available Commands**:
  - **Using the batch script (Recommended)**:
    ```powershell
    cd monorepo\apps\ai-service
    .\run_service.bat
    ```
    This script automatically creates a `venv`, runs `pip install -r requirements.txt`, downloads the `en_core_web_lg` SpaCy model if missing, and starts the Uvicorn server on **port 8001**.
  
  - **Running Manually**:
    ```powershell
    cd monorepo\apps\ai-service
    venv\Scripts\activate
    uvicorn main:app --reload --port 8001
    ```

---

## 🔌 4. API Service (`apps/api`)

This is an Express.js backend API (Node.js/Mongoose).

- **Path**: `monorepo/apps/api`
- **Available Commands** (run these from `monorepo/apps/api` after running `npm install`):

  | Command | Description |
  | :--- | :--- |
  | `npm start` | Starts the Express server using Node (`node src/index.js`). |
  | `npm run dev` | Starts the Express server using Nodemon, which automatically restarts on file changes. |

---

## 📁 5. Root Project Scripts

There are also top-level npm scripts in the root directory and the root `monorepo` directory, primarily for tooling and web builds.

- **Root directory** (`c:\Users\GIMINDU\3D Objects\Projects\findeka`):
  - `npm run dev`
  - `npm run build`
  - `npm run preview`
  - `npm run lint`
