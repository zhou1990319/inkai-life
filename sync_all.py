#!/usr/bin/env python3
"""
Gitee + GitHub 双仓库同步脚本
每次运行：同步到 Gitee，同时尝试同步到 GitHub
GitHub 不通时不影响 Gitee 同步
"""
import base64
import requests
import os
import time
import json

# Gitee 配置
GITEE_TOKEN = "6b9b912b56bb3ad8db37aad7a79e9f4d"
GITEE_OWNER = "zozo1990"
GITEE_REPO = "inkai-life"

# Render Deploy Hook
RENDER_DEPLOY_HOOK = "https://api.render.com/deploy/srv-d7vc9obeo5us73eit02g?key=60ZWYdzkO3c"

# 忽略文件
IGNORE = {'.git', 'node_modules', '.next', '.cache', '__pycache__', 'dist',
          '.DS_Store', 'supabase-proxy', '.assets_mapping', 'NVIDIA Corporation'}

def gitee_get_sha(path):
    url = f"https://gitee.com/api/v5/repos/{GITEE_OWNER}/{GITEE_REPO}/contents/{path}"
    try:
        resp = requests.get(url, params={"access_token": GITEE_TOKEN}, timeout=15)
        if resp.status_code == 200:
            return resp.json().get("sha")
    except Exception as e:
        print(f"  ⚠️ 获取sha失败: {e}")
    return None

def gitee_upload(path, content):
    """上传到 Gitee"""
    url = f"https://gitee.com/api/v5/repos/{GITEE_OWNER}/{GITEE_REPO}/contents/{path}"
    sha = gitee_get_sha(path)

    data = {
        "access_token": GITEE_TOKEN,
        "message": f"Update {path}",
        "content": base64.b64encode(content).decode('utf-8'),
    }
    if sha:
        data["sha"] = sha

    method = 'put' if sha else 'post'
    try:
        resp = requests.request(method, url, json=data, timeout=30)
        if resp.status_code in [200, 201]:
            return True, None
        else:
            return False, resp.text
    except Exception as e:
        return False, str(e)

def github_sync(local_dir, remote_dir=""):
    """尝试同步到 GitHub（如果能访问）"""
    # GitHub API 端点
    GITHUB_OWNER = "zhou1990319"
    GITHUB_REPO = "inkai-life"
    GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")

    if not GITHUB_TOKEN:
        return None  # 没有 token，跳过

    success = 0
    fail = 0

    for root, dirs, files in os.walk(local_dir):
        dirs[:] = [d for d in dirs if d not in IGNORE]
        for file in files:
            if file in IGNORE:
                continue
            local_path = os.path.join(root, file)
            rel_path = os.path.relpath(local_path, local_dir)
            remote_path = os.path.join(remote_dir, rel_path).replace(os.sep, '/')

            try:
                with open(local_path, 'rb') as f:
                    content = f.read()

                if len(content) > 2 * 1024 * 1024:
                    continue

                # GitHub API: 先获取 sha
                url = f"https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}/contents/{remote_path}"
                headers = {"Authorization": f"token {GITHUB_TOKEN}"}

                try:
                    resp = requests.get(url, headers=headers, timeout=10)
                    sha = resp.json().get("sha") if resp.status_code == 200 else None
                except:
                    sha = None

                # 上传到 GitHub
                data = {
                    "message": f"Update {remote_path}",
                    "content": base64.b64encode(content).decode('utf-8'),
                }
                if sha:
                    data["sha"] = sha

                try:
                    resp = requests.put(url, headers=headers, json=data, timeout=15)
                    if resp.status_code in [200, 201]:
                        success += 1
                        print(f"  ✅ GitHub: {remote_path}")
                    else:
                        fail += 1
                        print(f"  ❌ GitHub: {remote_path} ({resp.status_code})")
                except Exception as e:
                    fail += 1
                    print(f"  ❌ GitHub: {remote_path} ({e})")

            except Exception as e:
                fail += 1
                print(f"  ❌ {rel_path}: {e}")

    return {"success": success, "fail": fail}

def sync_directory(local_dir, remote_dir=""):
    """同步整个目录到 Gitee"""
    success = 0
    fail = 0

    for root, dirs, files in os.walk(local_dir):
        dirs[:] = [d for d in dirs if d not in IGNORE]
        for file in files:
            if file in IGNORE:
                continue
            local_path = os.path.join(root, file)
            rel_path = os.path.relpath(local_path, local_dir)
            remote_path = os.path.join(remote_dir, rel_path).replace(os.sep, '/')

            try:
                with open(local_path, 'rb') as f:
                    content = f.read()
                if len(content) > 2 * 1024 * 1024:
                    print(f"  ⏭️  跳过(太大): {rel_path}")
                    continue

                ok, err = gitee_upload(remote_path, content)
                if ok:
                    success += 1
                    print(f"  ✅ {rel_path}")
                else:
                    fail += 1
                    print(f"  ❌ {rel_path}: {err[:50] if err else 'unknown'}")
            except Exception as e:
                fail += 1
                print(f"  ❌ {rel_path}: {e}")

    return {"success": success, "fail": fail}

def trigger_render():
    """触发 Render 部署"""
    try:
        resp = requests.get(RENDER_DEPLOY_HOOK, timeout=30)
        if resp.status_code == 200:
            print(f"\n🚀 Render 部署已触发!")
            return True
        else:
            print(f"\n⚠️ Render 部署触发失败: {resp.status_code}")
            return False
    except Exception as e:
        print(f"\n⚠️ Render 部署触发失败: {e}")
        return False

def main():
    print("=" * 50)
    print("🚀 InkAI 代码同步工具")
    print("=" * 50)

    # 获取项目根目录
    project_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_dir)

    total_gitee = {"success": 0, "fail": 0}

    # 1. 同步 src/
    print("\n📦 同步 src/ ...")
    result = sync_directory("src")
    total_gitee["success"] += result["success"]
    total_gitee["fail"] += result["fail"]

    # 2. 同步配置文件
    print("\n📦 同步配置文件 ...")
    for f in ["package.json", "tsconfig.json", "vite.config.ts", "index.html", ".env.production"]:
        if os.path.exists(f):
            with open(f, 'rb') as fp:
                ok, err = gitee_upload(f, fp.read())
                status = "✅" if ok else "❌"
                print(f"  {status} {f}")
                if ok:
                    total_gitee["success"] += 1
                else:
                    total_gitee["fail"] += 1

    # 3. 同步 server/
    if os.path.exists("server"):
        print("\n📦 同步 server/ ...")
        result = sync_directory("server")
        total_gitee["success"] += result["success"]
        total_gitee["fail"] += result["fail"]

    # 4. 同步 public/
    if os.path.exists("public"):
        print("\n📦 同步 public/ ...")
        result = sync_directory("public")
        total_gitee["success"] += result["success"]
        total_gitee["fail"] += result["fail"]

    print(f"\n📊 Gitee 同步结果: ✅{total_gitee['success']} ❌{total_gitee['fail']}")

    # 5. 尝试同步到 GitHub（如果有 token）
    print("\n" + "=" * 50)
    print("🔄 尝试同步到 GitHub ...")
    github_result = github_sync("src")
    if github_result:
        print(f"📊 GitHub 同步结果: ✅{github_result['success']} ❌{github_result['fail']}")
    else:
        print("📊 GitHub 跳过 (未配置 GITHUB_TOKEN)")

    # 6. 触发 Render 部署
    print("\n" + "=" * 50)
    trigger_render()

    print("\n" + "=" * 50)
    print("✅ 全部完成!")
    print("=" * 50)

if __name__ == "__main__":
    main()
