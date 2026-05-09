import urllib.request, json

API_KEY = "rnd_tyiW7WIySgyfHaDrMgHwkO85gABq"
SERVICE_ID = "srv-d7vc9obeo5us73eit02g"
BASE = "https://api.render.com/v1"

headers = {"Authorization": f"Bearer {API_KEY}"}

req = urllib.request.Request(f"{BASE}/services/{SERVICE_ID}/deploys?limit=5")
req.add_header("Authorization", headers["Authorization"])
with urllib.request.urlopen(req) as r:
    deps = json.loads(r.read())

for item in deps:
    d = item.get('deploy', item)
    dep_id = d.get('id', 'unknown')
    status = d.get('status', 'unknown')
    created = d.get('createdAt', 'unknown')
    print(f"=== Deploy {dep_id} ===")
    print(f"Status: {status}")
    print(f"Created: {created}")

    log = d.get('buildLog', '')
    if log:
        print(f"Build Log (last 5000 chars):")
        print(log[-5000:])
    else:
        print("No build log available")
    print()
