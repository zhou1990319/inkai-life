#!/usr/bin/env python3
"""
Render Deploy Hook 触发器
绕过GitHub，直接用Render的Deploy Hook部署
"""
import urllib.request
import urllib.error
import sys

# Render Deploy Hook URL（需要你在Render Dashboard里获取）
# 获取方式：
# 1. 登录 https://dashboard.render.com
# 2. 进入 inkai-life 服务
# 3. Settings → Deploy Hook
# 4. 复制 URL（格式：https://api.render.com/v1/services/srv-xxx/deploys）

RENDER_DEPLOY_HOOK = "https://api.render.com/v1/services/srv-d7vc9obeo5us73eit02g/deploys"

def trigger_deploy():
    """触发Render重新部署"""
    try:
        req = urllib.request.Request(
            RENDER_DEPLOY_HOOK,
            method='POST',
            headers={
                'Content-Type': 'application/json',
            }
        )
        
        with urllib.request.urlopen(req, timeout=30) as response:
            print(f"✅ Deploy triggered successfully!")
            print(f"Status: {response.status}")
            print(f"Response: {response.read().decode('utf-8')}")
            return True
            
    except urllib.error.HTTPError as e:
        print(f"❌ HTTP Error: {e.code}")
        print(f"Response: {e.read().decode('utf-8')}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Triggering Render deploy...")
    trigger_deploy()
