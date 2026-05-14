#!/usr/bin/env python3
"""
Gitee API 上传工具 - 修复版
Gitee用POST创建新文件，PUT更新已有文件
"""
import base64
import requests
import os

GITEE_TOKEN = "6b9b912b56bb3ad8db37aad7a79e9f4d"
OWNER = "zozo1990"
REPO = "inkai-life"

def get_file_sha(path):
    """获取文件当前的sha"""
    url = f"https://gitee.com/api/v5/repos/{OWNER}/{REPO}/contents/{path}"
    params = {"access_token": GITEE_TOKEN}
    try:
        resp = requests.get(url, params=params, timeout=10)
        if resp.status_code == 200:
            return resp.json().get("sha")
    except:
        pass
    return None

def upload_file(path, content):
    """上传单个文件"""
    url = f"https://gitee.com/api/v5/repos/{OWNER}/{REPO}/contents/{path}"
    sha = get_file_sha(path)

    data = {
        "access_token": GITEE_TOKEN,
        "message": f"Update {path}",
        "content": base64.b64encode(content).decode('utf-8'),
    }

    # Gitee: 新文件用POST，已存在用PUT
    method = 'put' if sha else 'post'
    if sha:
        data["sha"] = sha

    try:
        resp = requests.request(method, url, json=data, timeout=30)
        if resp.status_code in [200, 201]:
            print(f"✅ {path}")
            return True
        else:
            print(f"❌ {path}: {resp.status_code}")
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
                if upload_file(remote_path, content):
                    success += 1
                else:
                    fail += 1
            except Exception as e:
                print(f"❌ {rel_path}: {e}")
                fail += 1

    print(f"\n完成: ✅{success} ❌{fail}")

if __name__ == "__main__":
    print("=== 同步 src/ ===")
    sync_directory("src")
    print("\n=== 同步配置文件 ===")
    for f in ["package.json", "tsconfig.json", "vite.config.ts", "index.html"]:
        if os.path.exists(f):
            with open(f, 'rb') as fp:
                upload_file(f, fp.read())
    print("\n=== 同步 server/ ===")
    if os.path.exists("server"):
        sync_directory("server")
    print("\n=== 同步 public/ ===")
    if os.path.exists("public"):
        sync_directory("public")
