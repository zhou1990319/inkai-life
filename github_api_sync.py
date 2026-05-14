#!/usr/bin/env python3
"""
GitHub API 同步工具
把本地最新文件直接上传到GitHub，绕过git push
"""
import base64
import requests
import os
import json

# 需要用户提供GitHub PAT
# 去 https://github.com/settings/tokens/new 生成，勾选 repo 权限
GITHUB_TOKEN = ""  # 填入GitHub Token
OWNER = "zhou1990319"
REPO = "inkai-life"

def get_github_file_sha(path):
    """获取GitHub文件当前的sha"""
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{path}"
    headers = {"Authorization": f"token {GITHUB_TOKEN}"}
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code == 200:
            return resp.json().get("sha")
    except:
        pass
    return None

def upload_to_github(path, content):
    """上传文件到GitHub"""
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{path}"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }

    sha = get_github_file_sha(path)

    data = {
        "message": f"Update {path}",
        "content": base64.b64encode(content).decode('utf-8'),
    }
    if sha:
        data["sha"] = sha

    try:
        resp = requests.put(url, headers=headers, json=data, timeout=30)
        if resp.status_code in [200, 201]:
            print(f"✅ {path}")
            return True
        else:
            print(f"❌ {path}: {resp.status_code} - {resp.text[:100]}")
            return False
    except Exception as e:
        print(f"❌ {path}: {e}")
        return False

def sync_directory(local_dir, remote_dir=""):
    """同步目录"""
    success = 0
    fail = 0
    ignore = {'.git', 'node_modules', '.next', '.cache', '__pycache__', 'dist', 'supabase-proxy'}

    for root, dirs, files in os.walk(local_dir):
        dirs[:] = [d for d in dirs if d not in ignore]
        for file in files:
            if file in ignore:
                continue
            local_path = os.path.join(root, file)
            rel_path = os.path.relpath(local_path, local_dir)
            remote_path = os.path.join(remote_dir, rel_path).replace(os.sep, '/')

            try:
                with open(local_path, 'rb') as f:
                    content = f.read()
                if len(content) > 2 * 1024 * 1024:
                    print(f"⏭️  跳过(太大): {rel_path}")
                    continue
                if upload_to_github(remote_path, content):
                    success += 1
                else:
                    fail += 1
            except Exception as e:
                print(f"❌ {rel_path}: {e}")
                fail += 1

    print(f"完成: ✅{success} ❌{fail}")

if __name__ == "__main__":
    if not GITHUB_TOKEN:
        print("❌ 请先设置 GITHUB_TOKEN")
        print("去 https://github.com/settings/tokens/new 生成一个PAT（勾选repo权限）")
        exit(1)

    print("=== 同步 src/ ===")
    sync_directory("src")
    print("\n=== 同步配置文件 ===")
    for f in ["package.json", "tsconfig.json", "vite.config.ts", "index.html"]:
        if os.path.exists(f):
            with open(f, 'rb') as fp:
                upload_to_github(f, fp.read())
    print("\n=== 同步 server/ ===")
    if os.path.exists("server"):
        sync_directory("server")
    print("\n=== 同步 public/ ===")
    if os.path.exists("public"):
        sync_directory("public")
    print("\n🎉 同步完成！去Render触发部署吧！")
