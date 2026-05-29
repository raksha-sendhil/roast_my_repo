import fetch from 'node-fetch';

const BASE = 'https://api.github.com';

function headers() {
  const h = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'roast-my-repo' };
  if (process.env.GITHUB_TOKEN) {
    h['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

async function ghFetch(path) {
  const res = await fetch(`${BASE}${path}`, { headers: headers() });
  if (!res.ok) {
    const err = new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function fetchFileContent(owner, repo, filename) {
  try {
    const data = await ghFetch(`/repos/${owner}/${repo}/contents/${filename}`);
    if (data.encoding === 'base64' && data.content) {
      return Buffer.from(data.content, 'base64').toString('utf8').slice(0, 3000);
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchTree(owner, repo, sha) {
  try {
    const data = await ghFetch(`/repos/${owner}/${repo}/git/trees/${sha}?recursive=0`);
    return data.tree
      .filter(item => item.type === 'blob' || item.type === 'tree')
      .map(item => ({ path: item.path, type: item.type }))
      .slice(0, 100);
  } catch {
    return [];
  }
}

async function fetchContributors(owner, repo) {
  try {
    const data = await ghFetch(`/repos/${owner}/${repo}/contributors?per_page=5`);
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

export async function fetchRepoData(owner, repo) {
  const meta = await ghFetch(`/repos/${owner}/${repo}`);

  if (meta.private) {
    const err = new Error('Private repository');
    err.status = 404;
    throw err;
  }

  const [tree, readme, packageJson, requirements, contributors] = await Promise.all([
    fetchTree(owner, repo, meta.default_branch),
    fetchFileContent(owner, repo, 'README.md').then(c => c || fetchFileContent(owner, repo, 'readme.md')),
    fetchFileContent(owner, repo, 'package.json'),
    fetchFileContent(owner, repo, 'requirements.txt'),
    fetchContributors(owner, repo),
  ]);

  return {
    owner,
    repo,
    fullName: meta.full_name,
    description: meta.description || '(no description)',
    language: meta.language || 'unknown',
    stars: meta.stargazers_count,
    forks: meta.forks_count,
    openIssues: meta.open_issues_count,
    topics: meta.topics || [],
    lastPush: meta.pushed_at,
    createdAt: meta.created_at,
    defaultBranch: meta.default_branch,
    hasWiki: meta.has_wiki,
    license: meta.license?.name || 'none',
    size: meta.size,
    tree,
    readme: readme ? readme.slice(0, 3000) : null,
    packageJson: packageJson ? packageJson.slice(0, 3000) : null,
    requirements: requirements ? requirements.slice(0, 3000) : null,
    contributors,
  };
}
