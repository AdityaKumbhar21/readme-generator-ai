from fastapi import APIRouter, Request, HTTPException
from github import Github
import os
import hmac
import hashlib
import json
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

router = APIRouter()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")

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
    

def get_commit_changes(repo_name, commit_sha):
    """Fetches the raw code changes (diff) for a specific commit."""
    try:
        g = Github(GITHUB_TOKEN)
        repo = g.get_repo(repo_name)
        commit = repo.get_commit(commit_sha)

        changes = []
        for file in commit.files:
            if file.patch:
                changes.append(f"File: {file.filename} \nDiff:\n{file.patch}")

        return "\n\n".join(changes)
    except Exception as e:
        print(f"Error fetching diff for {commit_sha}: {e}")
        return None
    
def generate_gemini_summary(diff_text):
    """Sends the code diff to Gemini to get a human-readable summary."""
    if not diff_text:
        return "No code changes detected"
    
    prompt = f"""
    You are a senior technical writer. 
    Analyze the following git diff and write a concise, one-sentence summary 
    of what changed. This will be used for a changelog.
    
    RAW DIFF:
    {diff_text[:4000]}  # Truncate to avoid massive payloads
    
    SUMMARY:
    """

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Gemini generation failed: {str(e)}"
    

@router.post("/webhook")
async def handle_github_webhook(request: Request):
    # Security Check
    signature = request.headers.get("X-Hub-Signature-256")
    payload_body = await request.body()
    verify_signature(payload_body, signature)
    
    # Parse Payload
    payload = json.loads(payload_body)
    
    if "commits" not in payload:
        return {"message": "Not a push event, skipping"}

    repo_name = payload['repository']['full_name']
    commits = payload['commits']
    
    print(f"Received push for {repo_name} with {len(commits)} commits")
    
    # Process Each Commit
    results = []
    for commit in commits:
        commit_sha = commit['id']
        print(f"--- Processing Commit {commit_sha[:7]} ---")
        
        # Get the Raw Code Changes
        diff_text = get_commit_changes(repo_name, commit_sha)
        
        # Ask Gemini to Summarize
        if diff_text:
            ai_summary = generate_gemini_summary(diff_text)
            print(f"GEMINI SAYS:\n{ai_summary}\n")
            results.append({"commit": commit_sha, "summary": ai_summary})
        else:
            print("No text changes found (maybe binary files or empty commit).")
    
    return {"status": "processed", "summaries": results}