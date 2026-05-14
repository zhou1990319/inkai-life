#!/usr/bin/env python3
"""
Gitee → GitHub 同步工具
把Gitee上的代码同步到GitHub
"""
import requests
import base64

GITEE_TOKEN = "6b9b912c56bb3ad8db37aad7a79e9f4d"
GITHUB_TOKEN = ""  # 需要用户填写GitHub PAT
OWNER = "zozo1990"
GITEE_REPO = "inkai-life"
GITHUB_REPO = "zhou1990319/inkai-life"

def get_gitee_file(path, ref="master"):
    """从Gitee获取文件内容"""
    url = f"https://gitee.com/api/v5/repos/{OWNER}/{GITEE_REPO}/contents/{path}"
    params = {"access_token": GITEE_TOKEN, "ref": ref}
    try:
        resp = requests.get(url, params=params, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("type") == "file":
                content = base64.b64decode(data["content"]).decode('utf-8')
                return content, data.get("sha")
    except:
        pass
    return None, None

def list_gitee_files(path="", ref="master"):
    """列出Gitee目录下的所有文件"""
    url = f"https://gitee.com/api/v5/repos/{OWNER}/{GITEE_REPO}/contents/{path}"
    params = {"access_token": GITEE_TOKEN, "ref": ref}
    try:
        resp = requests.get(url, params=params, timeout=10)
        if resp.status_code == 200:
            return resp.json()
    except:
        pass
    return []

def sync_to_github():
    """同步到GitHub"""
    if not GITHUB_TOKEN:
        print("❌ 请先设置 GITHUB_TOKEN")
        print("去 https://github.com/settings/tokens 生成一个PAT（勾选repo权限）")
        return

    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }

    files = list_gitee_files()
    success = 0
    fail = 0

    for f in files:
        if f["type"] == "file":
            content, _ = get_gitee_file(f["path"])
            if content:
                # GitHub API上传
                url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{f['path']}"
                # 先获取当前sha
                resp = requests.get(url, headers=headers)
                sha = resp.json().get("sha") if resp.status_code == 200 else None

                data = {
                    "message": f"Sync from Gitee: {f['path']}",
                    "content": base64.b64encode(content.encode()).decode(),
                }
                if sha:
                    data["sha"] = sha

                resp = requests.put(url, headers=headers, json=data)
                if resp.status_code in [200, 201]:
                    print(f"✅ {f['path']}")
                    success += 1
                else:
                    print(f"❌ {f['path']}: {resp.status_code}")
                    fail += 1

    print(f"\n完成: ✅{success} ❌{fail}")

if __name__ == "__main__":
    print("需要GitHub Personal Access Token")
    print("去 https://github.com/settings/tokens/new 生成")
