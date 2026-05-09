import urllib.request, json

API_KEY = "rnd_tyiW7WIySgyfHaDrMgHwkO85gABq"
BASE = "https://api.render.com/v1"

headers = {
    "Authorization": "Bearer " + API_KEY,
    "Accept": "application/json"
}

# List all services - raw dump
req = urllib.request.Request(BASE + "/services", headers=headers)
with urllib.request.urlopen(req) as r:
    raw = r.read()
    print("Raw response (first 2000 chars):")
    print(raw[:2000].decode('utf-8', errors='replace'))
