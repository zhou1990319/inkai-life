import urllib.request, json, time

API_KEY = "rnd_tyiW7WIySgyfHaDrMgHwkO85gABq"
SERVICE_ID = "srv-d7vc9obeo5us73eit02g"
DEPLOY_ID = "dep-d7ve06ue4jis73e94m4g"
BASE = "https://api.render.com/v1"

headers = {"Authorization": "Bearer " + API_KEY}

print("Polling deploy " + DEPLOY_ID + " (max 10 min)...")
for i in range(120):
    time.sleep(5)
    try:
        req = urllib.request.Request(BASE + "/deploys/" + DEPLOY_ID, headers=headers)
        with urllib.request.urlopen(req) as r:
            data = json.loads(r.read())
            d = data.get('deploy', data)
            status = d.get('status', 'unknown')
            elapsed = i * 5
            print("  [" + str(elapsed) + "s] status: " + status)
            if status in ('live', 'build_failed', 'update_failed', 'deactivated', 'canceled'):
                log = d.get('buildLog', '')
                if log:
                    print("\n=== BUILD LOG (last 8000 chars) ===")
                    print(log[-8000:])
                else:
                    print("No build log in response, trying individual endpoint...")
                print("\nFinal status: " + status)
                break
    except Exception as e:
        print("  [" + str(i*5) + "s] Error: " + str(e))

print("Done. Visit: https://inkai-life-web.onrender.com")
