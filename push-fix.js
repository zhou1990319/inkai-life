const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = 'ghp_ClLFmCXiQ2KDMKZtKwKYGIpxICKly2atSyS';
const OWNER = 'zhou1990319';
const REPO = 'inkai-life';
const BRANCH = 'main';
const BASE_SHA = 'e17af751acbeea59e5a44a08bdff6a6199faa0ef';

const files = [
  'render.yaml',
  'src/App.tsx',
  'server/index.js',
];

// Also delete pnpm-lock.yaml
const deletions = ['pnpm-lock.yaml'];

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
        try { resolve(JSON.parse(resp)); }
        catch { resolve(resp); }
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
  return githubRequest('POST', `/repos/${OWNER}/${REPO}/git/blobs`, {
    encoding: 'utf-8',
    content: base64,
  });
}

async function main() {
  try {
    // Create blobs for modified files
    const treeItems = [];

    for (const file of files) {
      const fullPath = path.join(__dirname, file);
      console.log(`Creating blob for ${file}...`);
      const blob = await createBlob(fullPath);
      treeItems.push({
        path: file,
        mode: '100644',
        type: 'blob',
        sha: blob.sha,
      });
    }

    // Add deletions
    for (const file of deletions) {
      treeItems.push({
        path: file,
        mode: '100644',
        type: 'blob',
        sha: null, // null = delete
      });
    }

    // Create tree
    console.log('Creating tree...');
    const tree = await githubRequest('POST', `/repos/${OWNER}/${REPO}/git/trees`, {
      base_tree: BASE_SHA,
      tree: treeItems,
    });

    // Create commit
    console.log('Creating commit...');
    const commit = await githubRequest('POST', `/repos/${OWNER}/${REPO}/git/commits`, {
      message: 'fix: switch to npm, fix import case sensitivity, remove dotenv dep',
      tree: tree.sha,
      parents: [BASE_SHA],
    });

    // Update ref
    console.log('Updating branch ref...');
    const result = await githubRequest('PATCH', `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
      sha: commit.sha,
    });

    console.log('SUCCESS! Commit SHA:', commit.sha);
    console.log('Pushed to:', result.object.url);
  } catch (err) {
    console.error('ERROR:', err.message || err);
    process.exit(1);
  }
}

main();
