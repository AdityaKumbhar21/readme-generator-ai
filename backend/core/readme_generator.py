# core/readme_generator.py

import os
from sqlalchemy.orm import Session
from datetime import datetime
from dotenv import load_dotenv
import google.generativeai as genai

from core.prompts import README_PROMPT_TEMPLATE
from models.job import ReadmeJob

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")

class ReadmeGenerator:

    @classmethod
    def generate(cls, db: Session, job_id: str, project_name: str, tech_stack: str, languages: str, description: str) -> ReadmeJob:
        job = db.query(ReadmeJob).filter(ReadmeJob.job_id == job_id).first()
        if not job:
            raise ValueError("Job not found")

        try:
            job.status = "processing"
            db.commit()

            prompt = README_PROMPT_TEMPLATE.format(
                project_name=project_name,
                tech_stack=tech_stack,
                languages=languages,
                description=description
            )

            response = model.generate_content(contents=[prompt])

            readme_text = response.text.strip()

            job.status = "completed"
            job.prompt = readme_text
            job.completed_at = datetime.utcnow()
            db.commit()
        except Exception as e:
            job.status = "failed"
            job.error = str(e)
            job.completed_at = datetime.utcnow()
            db.commit()

        return job




