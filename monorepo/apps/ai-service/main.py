from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    description: str
    image_url: str | None = None

@app.get("/")
def read_root():
    return {"status": "online", "service": "Findeka AI"}

@app.post("/match")
def match_items(item: Item):
    # Placeholder for matching logic
    return {"matches": [], "message": "Logic to be implemented"}
