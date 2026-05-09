import urllib.request, json

API_KEY = "rnd_tyiW7WIySgyfHaDrMgHwkO85gABq"
SERVICE_ID = "srv-d7vc9obeo5us73eit02g"
BASE = "https://api.render.com/v1"

headers = {"Authorization": f"Bearer {API_KEY}"}

# 1. Check service status
req = urllib.request.Request(f"{BASE}/services/{SERVICE_ID}")
req.add_header("Authorization", headers["Authorization"])
with urllib.request.urlopen(req) as r:
    svc = json.loads(r.read())

print("=== Service Info ===")
print(f"Status: {svc.get('status')}")
details = svc.get('serviceDetails', {})
print(f"URL: {details.get('url', 'N/A')}")
env = details.get('envSpecificDetails', {})
print(f"Build Command: {env.get('buildCommand', 'N/A')}")
print(f"Start Command: {env.get('startCommand', 'N/A')}")

# 2. Check latest deploys
req2 = urllib.request.Request(f"{BASE}/services/{SERVICE_ID}/deploys?limit=3")
req2.add_header("Authorization", headers["Authorization"])
with urllib.request.urlopen(req2) as r:
    deps = json.loads(r.read())

print("\n=== Recent Deploys ===")
for d in deps:
    print(f"\nDeploy: {d['id']}")
    print(f"  Status: {d['status']}")
    print(f"  Created: {d['createdAt']}")
    log = d.get('buildLog', '')
    if log:
        tail = log[-3000:]
        print(f"  Build Log (tail):")
        print(tail)
    else:
        print("  No build log")
