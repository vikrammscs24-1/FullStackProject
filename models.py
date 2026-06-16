from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    username: str
    password: str

class NoiseEvent(BaseModel):
    machine_id: str
    fault_type: str
    severity: str
    noise_level: str
    timestamp: Optional[str] = None
