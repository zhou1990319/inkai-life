import urllib.request, json

API_KEY = "rnd_tyiW7WIySgyfHaDrMgHwkO85gABq"
SERVICE_ID = "srv-d7vc9obeo5us73eit02g"
BASE = "https://api.render.com/v1"

headers = {
    "Authorization": "Bearer " + API_KEY,
    "Content-Type": "application/json",
    "Accept": "application/json"
}

# Step 1: Get current custom domains
print("=== Current Custom Domains ===")
try:
    req = urllib.request.Request(BASE + "/services/" + SERVICE_ID + "/custom-domains", headers=headers)
    with urllib.request.urlopen(req) as r:
        domains = json.loads(r.read())
        if isinstance(domains, list):
            for d in domains:
                dd = d.get('customDomain', d)
                print("  Domain: " + dd.get('name', 'unknown'))
                print("  Status: " + dd.get('status', 'unknown'))
                print("  CNAME Target: " + str(dd.get('cnameTarget', 'N/A')))
                print()
        else:
            print("  Response: " + str(domains)[:500])
except Exception as e:
    print("  Error getting domains: " + str(e))

# Step 2: Add custom domain inkai.life
print("\n=== Adding inkai.life ===")
body = json.dumps({"name": "inkai.life"}).encode('utf-8')
req2 = urllib.request.Request(
    BASE + "/services/" + SERVICE_ID + "/custom-domains",
    data=body,
    headers=headers,
    method="POST"
)
try:
    with urllib.request.urlopen(req2) as r:
        result = json.loads(r.read())
        rd = result.get('customDomain', result)
        print("  Domain: " + rd.get('name', 'unknown'))
        print("  Status: " + rd.get('status', 'unknown'))
        print("  CNAME Target: " + str(rd.get('cnameTarget', 'N/A')))
        print("  Created: " + str(rd.get('createdAt', 'unknown')))
except urllib.error.HTTPError as e:
    err_body = e.read().decode('utf-8', errors='replace')
    print("  HTTP Error " + str(e.code) + ": " + err_body[:500])
except Exception as e:
    print("  Error: " + str(e))

# Step 3: Also add www.inkai.life
print("\n=== Adding www.inkai.life ===")
body2 = json.dumps({"name": "www.inkai.life"}).encode('utf-8')
req3 = urllib.request.Request(
    BASE + "/services/" + SERVICE_ID + "/custom-domains",
    data=body2,
    headers=headers,
    method="POST"
)
try:
    with urllib.request.urlopen(req3) as r:
        result2 = json.loads(r.read())
        rd2 = result2.get('customDomain', result2)
        print("  Domain: " + rd2.get('name', 'unknown'))
        print("  Status: " + rd2.get('status', 'unknown'))
        print("  CNAME Target: " + str(rd2.get('cnameTarget', 'N/A')))
        print("  Created: " + str(rd2.get('createdAt', 'unknown')))
except urllib.error.HTTPError as e:
    err_body = e.read().decode('utf-8', errors='replace')
    print("  HTTP Error " + str(e.code) + ": " + err_body[:500])
except Exception as e:
    print("  Error: " + str(e))
