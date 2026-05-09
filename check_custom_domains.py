import urllib.request, json

API_KEY = "rnd_tyiW7WIySgyfHaDrMgHwkO85gABq"
SERVICE_ID = "srv-d7vc9obeo5us73eit02g"
BASE = "https://api.render.com/v1"

headers = {
    "Authorization": "Bearer " + API_KEY,
    "Accept": "application/json"
}

# List custom domains - raw dump
print("=== Custom Domains for " + SERVICE_ID + " ===")
req = urllib.request.Request(BASE + "/services/" + SERVICE_ID + "/custom-domains", headers=headers)
with urllib.request.urlopen(req) as r:
    raw = r.read()
    print(raw.decode('utf-8', errors='replace'))

# Also try the verified domain endpoints
print("\n=== Trying GET on custom-domains ===")
req2 = urllib.request.Request(BASE + "/services/" + SERVICE_ID + "/custom-domains", headers=headers)
with urllib.request.urlopen(req2) as r:
    data = json.loads(r.read())
    print("Type: " + str(type(data)))
    if isinstance(data, list):
        print("Count: " + str(len(data)))
        for item in data:
            print("Item type: " + str(type(item)))
            print("Item: " + json.dumps(item, indent=2)[:500])
            print()
    else:
        print(json.dumps(data, indent=2)[:1000])
