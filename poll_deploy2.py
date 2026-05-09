import urllib.request, json, time

API_KEY = "rnd_tyiW7WIySgyfHaDrMgHwkO85gABq"
SERVICE_ID = "srv-d7vc9obeo5us73eit02g"
BASE = "https://api.render.com/v1"

headers = {"Authorization": "Bearer " + API_KEY}

# Check latest deploy status from the service deploys list
for attempt in range(12):
    time.sleep(5)
    try:
        req = urllib.request.Request(BASE + "/services/" + SERVICE_ID + "/deploys?limit=1", headers=headers)
        with urllib.request.urlopen(req) as r:
            data = json.loads(r.read())
            if isinstance(data, list) and len(data) > 0:
                item = data[0]
                d = item.get('deploy', item)
                dep_id = d.get('id', 'unknown')
                status = d.get('status', 'unknown')
                created = d.get('createdAt', 'unknown')
                elapsed = attempt * 5
                print("[" + str(elapsed) + "s] " + dep_id + " = " + status)
                if status in ('live', 'build_failed', 'update_failed', 'deactivated', 'canceled'):
                    log = d.get('buildLog', '')
                    live_log = d.get('liveLog', '')
                    if log:
                        print("\n=== BUILD LOG (last 8000 chars) ===")
                        print(log[-8000:])
                    if live_log:
                        print("\n=== LIVE LOG (last 3000 chars) ===")
                        print(live_log[-3000:])
                    if not log and not live_log:
                        print("No logs available in list response")
                    print("\nFinal status: " + status)
                    break
    except Exception as e:
        print("[" + str(attempt*5) + "s] Error: " + str(e))

print("\nDone.")
