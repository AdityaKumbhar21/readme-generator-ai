from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReadmeJobOut(BaseModel):
    job_id: str
    prompt: Optional[str]
    status: str
    error: Optional[str] = None
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
