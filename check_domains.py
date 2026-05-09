import urllib.request, json

API_KEY = "rnd_tyiW7WIySgyfHaDrMgHwkO85gABq"
SERVICE_ID = "srv-d7vc9obeo5us73eit02g"
BASE = "https://api.render.com/v1"

headers = {
    "Authorization": "Bearer " + API_KEY,
    "Content-Type": "application/json",
    "Accept": "application/json"
}

# Step 1: List all services to find where www.inkai.life is bound
print("=== Listing all services to find existing domain bindings ===")
req = urllib.request.Request(BASE + "/services", headers=headers)
with urllib.request.urlopen(req) as r:
    services = json.loads(r.read())
for svc in services:
    svc_id = svc.get('id', 'unknown')
    svc_name = svc.get('serviceDetails', {}).get('serviceName', 'unknown')
    svc_type = svc.get('serviceDetails', {}).get('serviceType', 'unknown')
    print("  " + svc_id + " | " + svc_name + " | type=" + svc_type)
    # Check custom domains for each service
    try:
        req2 = urllib.request.Request(BASE + "/services/" + svc_id + "/custom-domains", headers=headers)
        with urllib.request.urlopen(req2) as r2:
            domains = json.loads(r2.read())
            if isinstance(domains, list) and len(domains) > 0:
                for item in domains:
                    if isinstance(item, dict):
                        dd = item.get('customDomain', item)
                        cname = dd.get('cnameTarget', 'N/A')
                        print("    -> Domain: " + str(dd.get('name', dd)) + " | CNAME: " + str(cname))
                    elif isinstance(item, str):
                        print("    -> Domain string: " + item)
    except Exception as e:
        pass  # Not all services support custom domains

# Step 2: Add inkai.life to current service
print("\n=== Adding inkai.life to current service ===")
body = json.dumps({"name": "inkai.life"}).encode('utf-8')
req3 = urllib.request.Request(
    BASE + "/services/" + SERVICE_ID + "/custom-domains",
    data=body,
    headers=headers,
    method="POST"
)
try:
    with urllib.request.urlopen(req3) as r:
        result = json.loads(r.read())
        print("  Raw response type: " + str(type(result)))
        print("  Raw response: " + json.dumps(result, indent=2)[:1000])
except urllib.error.HTTPError as e:
    err_body = e.read().decode('utf-8', errors='replace')
    print("  HTTP Error " + str(e.code) + ": " + err_body[:500])
except Exception as e:
    print("  Error: " + str(e))
