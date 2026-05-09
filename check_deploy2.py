import urllib.request, json

API_KEY = "rnd_tyiW7WIySgyfHaDrMgHwkO85gABq"
SERVICE_ID = "srv-d7vc9obeo5us73eit02g"
BASE = "https://api.render.com/v1"

headers = {"Authorization": f"Bearer {API_KEY}"}

# Check latest deploys
req = urllib.request.Request(f"{BASE}/services/{SERVICE_ID}/deploys?limit=3")
req.add_header("Authorization", headers["Authorization"])
with urllib.request.urlopen(req) as r:
    raw = r.read()
    print("Raw response (first 500 chars):")
    print(raw[:500].decode('utf-8', errors='replace'))

    deps = json.loads(raw)
    if isinstance(deps, dict):
        print("\nResponse is a dict, keys:", list(deps.keys()))
        if 'data' in deps:
            deps = deps['data']
    if isinstance(deps, list) and len(deps) > 0:
        print("\nFirst deploy keys:", list(deps[0].keys()) if isinstance(deps[0], dict) else type(deps[0]))
    else:
        print("\nNo deploys or unexpected format")
