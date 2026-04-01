"""FastAPI entrypoint: startup lifecycle, middleware, static mount, and route wiring."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app_state import close_db, init_db
from config import STORAGE_DIR
from models_loader import model_manager
from routers.admin import router as admin_router
from routers.items import router as items_router
from routers.matches import router as matches_router
from routers.user import router as user_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # App startup/shutdown hook.
    # Keep infra initialization here so route files stay focused on business logic.
    print("Connecting to MongoDB...")
    try:
        init_db()
        print("Connected to MongoDB")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")

    model_manager.load_models()
    yield
    close_db()
    print("Shutting down AI Service")


app = FastAPI(lifespan=lifespan, title="Findeka AI Service")

# Keep CORS wide-open for local dev and cross-app calls.
# Lock this down with explicit origins before production deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Local file storage (lost/found images) is exposed under /static.
app.mount("/static", StaticFiles(directory=STORAGE_DIR), name="static")

# Route registration by domain keeps main.py tiny and readable.
app.include_router(matches_router)
app.include_router(items_router)
app.include_router(user_router)
app.include_router(admin_router)


@app.get("/")
def read_root():
    # Quick health + model readiness endpoint used by smoke tests.
    return {
        "status": "online",
        "message": "Findeka AI Service is running",
        "models": {
            "bert": model_manager.bert_model is not None,
            "clip": model_manager.clip_model is not None,
            "mobilenet": model_manager.mobilenet_model is not None,
            "ocr": model_manager.ocr_reader is not None,
        },
    }
