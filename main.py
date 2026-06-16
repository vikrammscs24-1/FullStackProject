from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import db
from models import NoiseEvent, LoginRequest
from datetime import datetime

app = FastAPI(title="Industrial Noise Monitoring API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hardcoded users (can be moved to DB later)
USERS = {
    "admin": "admin123",
    "operator": "op456"
}

@app.post("/login")
async def login(data: LoginRequest):
    if USERS.get(data.username) == data.password:
        return {"success": True, "username": data.username}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/events")
async def create_event(event: NoiseEvent):
    event_dict = event.dict()
    event_dict["timestamp"] = datetime.utcnow().isoformat()
    result = await db.events.insert_one(event_dict)
    event_dict["_id"] = str(result.inserted_id)
    return event_dict

@app.get("/events")
async def get_events(limit: int = 20):
    events = []
    cursor = db.events.find().sort("timestamp", -1).limit(limit)
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        events.append(doc)
    return events

@app.delete("/events")
async def clear_events():
    result = await db.events.delete_many({})
    return {"deleted": result.deleted_count}
