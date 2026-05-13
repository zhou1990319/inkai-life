import urllib.request, json

API_KEY = "rnd_tyiW7WIySgyfHaDrMgHwkO85gABq"
BASE = "https://api.render.com/v1"
SERVICE_ID = "srv-d7vc9obeo5us73eit02g"

headers = {
    "Authorization": "Bearer " + API_KEY,
    "Accept": "application/json",
    "Content-Type": "application/json"
}

# 触发部署 - 空body
req = urllib.request.Request(
    BASE + "/services/" + SERVICE_ID + "/deploys",
    data=b'{}',
    headers=headers,
    method="POST"
)

try:
    with urllib.request.urlopen(req, timeout=30) as r:
        result = json.loads(r.read())
        print("✅ 部署已触发!")
        print(json.dumps(result, indent=2))
except urllib.error.HTTPError as e:
    print(f"❌ HTTP错误: {e.code}")
    print(e.read().decode())
except Exception as e:
    print(f"❌ 错误: {e}")
