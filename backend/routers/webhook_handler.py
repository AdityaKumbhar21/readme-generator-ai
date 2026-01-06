from fastapi import APIRouter, Request, HTTPException
from github import Github
import os
import hmac
import hashlib
import json
from dotenv import load_dotenv
load_dotenv()

router = APIRouter()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET")

def verify_signature(payload_body, signature_header):
    if not signature_header:
        print("Error: Missing signature header")
        raise HTTPException(status_code=403, detail="x-hub-signature-256 header is missing!")
    
    if not WEBHOOK_SECRET:
        print("Error: WEBHOOK_SECRET is not set in environment")
        raise HTTPException(status_code=500, detail="WEBHOOK_SECRET is not set")

    hash_object = hmac.new(WEBHOOK_SECRET.encode('utf-8'), msg=payload_body, digestmod=hashlib.sha256)
    expected_signature = "sha256=" + hash_object.hexdigest()
    
    # DEBUGGING: Print both signatures to compare them
    print(f"DEBUG: Expected: {expected_signature}")
    print(f"DEBUG: Received: {signature_header}")
    
    if not hmac.compare_digest(expected_signature, signature_header):
        print("Error: Signatures do not match")
        raise HTTPException(status_code=403, detail="Request signatures didn't match!")

@router.post("/webhook")
async def handle_github_webhook(request: Request):
    signature = request.headers.get("X-Hub-Signature-256")
    
    payload_body = await request.body()
    
    verify_signature(payload_body, signature)
    
    payload = json.loads(payload_body)
    
    if "commits" not in payload:
        return {"message": "Not a push event, skipping"}

    repo_name = payload['repository']['full_name']
    commits = payload['commits']
    
    print(f"Received push for {repo_name} with {len(commits)} commits")
    
    return {"status": "received", "commits_processed": len(commits)}