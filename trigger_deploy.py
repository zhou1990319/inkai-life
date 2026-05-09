import urllib.request, json, time

API_KEY = "rnd_tyiW7WIySgyfHaDrMgHwkO85gABq"
SERVICE_ID = "srv-d7vc9obeo5us73eit02g"
BASE = "https://api.render.com/v1"

headers = {"Authorization": "Bearer " + API_KEY, "Content-Type": "application/json"}

# Trigger new deploy
print("Triggering new deploy...")
req = urllib.request.Request(
    BASE + "/services/" + SERVICE_ID + "/deploys",
    data=b'',
    headers=headers,
    method="POST"
)
try:
    with urllib.request.urlopen(req) as r:
        result = json.loads(r.read())
        dep_id = result.get('deploy', {}).get('id', result.get('id', 'unknown'))
        print("Deploy triggered! ID: " + str(dep_id))
except Exception as e:
    print("Error triggering deploy: " + str(e))
    # Try to read error response
    import io
    if hasattr(e, 'read'):
        print(e.read())

# Poll for status
print("\nPolling deploy status (60s timeout)...")
for i in range(12):
    time.sleep(5)
    try:
        req2 = urllib.request.Request(
            BASE + "/services/" + SERVICE_ID + "/deploys?limit=1",
            headers=headers
        )
        with urllib.request.urlopen(req2) as r:
            data = json.loads(r.read())
            if isinstance(data, list) and len(data) > 0:
                item = data[0]
                d = item.get('deploy', item)
                status = d.get('status', 'unknown')
                dep_id = d.get('id', 'unknown')
                print("  [" + str(i*5) + "s] Deploy " + dep_id + " status: " + status)
                if status in ('live', 'build_failed', 'update_failed', 'deactivated'):
                    # Get build log
                    log_req = urllib.request.Request(
                        BASE + "/deploys/" + dep_id,
                        headers=headers
                    )
                    with urllib.request.urlopen(log_req) as r2:
                        dep_detail = json.loads(r2.read())
                        log = dep_detail.get('deploy', {}).get('buildLog', '') or dep_detail.get('buildLog', '')
                        if log:
                            print("\n=== BUILD LOG (last 5000 chars) ===")
                            print(log[-5000:])
                        else:
                            print("No build log available")
                    break
    except Exception as e:
        print("  Poll error: " + str(e))

print("\nDone polling. Check https://inkai-life-web.onrender.com")
