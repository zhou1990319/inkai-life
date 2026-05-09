import urllib.request, json

API_KEY = "rnd_tyiW7WIySgyfHaDrMgHwkO85gABq"
SERVICE_ID = "srv-d7vc9obeo5us73eit02g"
BASE = "https://api.render.com/v1"

headers = {
    "Authorization": "Bearer " + API_KEY,
    "Accept": "application/json"
}

# Get custom domain details including cnameTarget
for domain_name in ["inkai.life", "www.inkai.life"]:
    print("=== " + domain_name + " ===")
    # List all and find the right one
    req = urllib.request.Request(BASE + "/services/" + SERVICE_ID + "/custom-domains", headers=headers)
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read())
    for item in data:
        cd = item.get('customDomain', {})
        if cd.get('name') == domain_name:
            print("  ID: " + cd.get('id', 'N/A'))
            print("  Type: " + cd.get('domainType', 'N/A'))
            print("  Verification: " + cd.get('verificationStatus', 'N/A'))
            print("  CNAME Target: " + str(cd.get('cnameTarget', 'N/A')))
            print("  All keys: " + str(list(cd.keys())))
            print("  Full data: " + json.dumps(cd, indent=2))
    print()
