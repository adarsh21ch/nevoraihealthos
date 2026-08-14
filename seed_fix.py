import os
import requests
import json

url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY")

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# Try to see if we can insert directly. If RLS fails, we know we need admin.
# But first, let's check if programs table even exists and is accessible.
r = requests.get(f"{url}/rest/v1/programs", headers=headers)
print(f"Programs check: {r.status_code} {r.text}")

