const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = 'ghp_ClLFmCXiQ2KDMKZtKwKYGIpxICKly2atSyS';
const OWNER = 'zhou1990319';
const REPO = 'inkai-life';
const BRANCH = 'main';
const BASE_SHA = 'e17af751acbeea59e5a44a08bdff6a6199faa0ef';

function githubRequest(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const url = new URL(urlPath, 'https://api.github.com');
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'node.js',
        'Accept': 'application/vnd.github.v3+json',
        ...(data ? { 'Content-Type': 'application/json' } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let resp = '';
      res.on('data', chunk => resp += chunk);
      res.on('end', () => {
        console.log(`${method} ${urlPath} => ${res.statusCode}`);
        try { resolve({ status: res.statusCode, data: JSON.parse(resp) }); }
        catch { resolve({ status: res.statusCode, data: resp }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function createBlob(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const base64 = Buffer.from(content).toString('base64');
  const result = await githubRequest('POST', `/repos/${OWNER}/${REPO}/git/blobs`, {
    encoding: 'utf-8',
    content: base64,
  });
  if (result.status !== 201) throw new Error(`Blob create failed: ${JSON.stringify(result.data)}`);
  return result.data;
}

async function main() {
  try {
    const files = ['render.yaml', 'src/App.tsx', 'server/index.js'];
    const treeItems = [];

    for (const file of files) {
      const fullPath = path.join(__dirname, file);
      console.log(`\nProcessing: ${file}`);
      const blob = await createBlob(fullPath);
      treeItems.push({ path: file, mode: '100644', type: 'blob', sha: blob.sha });
    }

    // Add pnpm-lock.yaml deletion
    treeItems.push({ path: 'pnpm-lock.yaml', mode: '100644', type: 'blob', sha: null });

    // Create tree
    console.log('\nCreating tree...');
    const tree = await githubRequest('POST', `/repos/${OWNER}/${REPO}/git/trees`, {
      base_tree: BASE_SHA,
      tree: treeItems,
    });
    if (tree.status !== 201) throw new Error(`Tree create failed: ${JSON.stringify(tree.data)}`);

    // Create commit
    console.log('\nCreating commit...');
    const commit = await githubRequest('POST', `/repos/${OWNER}/${REPO}/git/commits`, {
      message: 'fix: switch to npm, fix import case sensitivity, remove dotenv dep',
      tree: tree.data.sha,
      parents: [BASE_SHA],
    });
    if (commit.status !== 201) throw new Error(`Commit create failed: ${JSON.stringify(commit.data)}`);

    console.log(`\nCommit SHA: ${commit.data.sha}`);

    // Update ref
    console.log('\nUpdating ref...');
    const ref = await githubRequest('PATCH', `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
      sha: commit.data.sha,
    });
    console.log(`Ref update result: ${JSON.stringify(ref.data, null, 2)}`);

    if (ref.status === 200) {
      console.log('\nSUCCESS!');
    } else {
      console.log('\nRef update may have failed, trying force update...');
      // Try with force flag
      const ref2 = await githubRequest('PATCH', `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
        sha: commit.data.sha,
        force: true,
      });
      console.log(`Force update result: ${ref2.status}`);
    }
  } catch (err) {
    console.error('ERROR:', err.message || err);
    process.exit(1);
  }
}

main();
