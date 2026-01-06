from fastapi import APIRouter, Request, HTTPException, Header
from github import Github
import os
import hmac
import hashlib
import json

router = APIRouter()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET")

g = Github(GITHUB_TOKEN)

def verify_signature(payload_body, signature_header):
    # verify the request actually came from github
    if not signature_header:
        raise HTTPException(status_code=403, detail="No Signature header")

    sha_name, signature = signature_header.split('=')
    if sha_name != 'sha256':
        raise HTTPException(status_code=501, detail="ou use sha256")
    
    # create local HMAC
    mac = hmac.new(WEBHOOK_SECRET.encode(), payload_body, hashlib.sha256)

    if not hmac.compare_digest(mac.hexdigest(), signature):
        raise HTTPException(status_code=403, detail="Invalid signature")
    

@router.post("/webhook")
async def handle_github_webhook(request: Request, x_hub, x_hub_signature_256: str = Header(None)):
    payload_body = await request.body()

    verify_signature(payload_body, x_hub_signature_256)

    payload = json.loads(payload_body)

    # check for 'push events
    if "commits" not in payload:
        return {"message": "Not a push event, skipping"}
    
    # extract repo infooo
    repo_name = payload['repository']['full_name']
    commits = payload['commits']

    print(f"received push for {repo_name} with {len(commits)} commits")

    return {"status": "received", "commits_processed": len(commits)}