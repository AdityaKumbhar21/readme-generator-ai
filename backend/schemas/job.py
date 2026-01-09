from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Used in the POST request body for creating a README job
class ReadmeCreate(BaseModel):
    project_name: str
    tech_stack: str
    languages: str
    description: str

# Used in the response after job is created or fetched
class ReadmeJobStatus(BaseModel):
    job_id: str
    status: str
    prompt: Optional[str] = None
    error: Optional[str] = None
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
