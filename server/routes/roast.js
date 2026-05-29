import { Router } from 'express';
import { fetchRepoData } from '../services/github.js';
import { generateRoast } from '../services/gemini.js';

const router = Router();

const GITHUB_URL_PATTERN = /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(\.git)?\/?$/;

router.post('/roast', async (req, res) => {
  const { repoUrl } = req.body;

  if (!repoUrl || typeof repoUrl !== 'string') {
    return res.status(400).json({ error: 'A GitHub repo URL is required.' });
  }

  const match = repoUrl.trim().match(GITHUB_URL_PATTERN);
  if (!match) {
    return res.status(400).json({ error: 'Invalid GitHub URL. Expected format: https://github.com/owner/repo' });
  }

  const [, owner, repo] = match;

  let repoData;
  try {
    repoData = await fetchRepoData(owner, repo);
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ error: 'Repository not found. It may be private or the URL is wrong.' });
    }
    if (err.status === 403 || err.status === 429) {
      return res.status(429).json({ error: 'GitHub API rate limit hit. Try again in a few minutes or add a GitHub token.' });
    }
    console.error('GitHub fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch repository data from GitHub.' });
  }

  let result;
  try {
    result = await generateRoast(repoData);
  } catch (err) {
    if (err.status === 429) {
      return res.status(429).json({ error: 'Gemini API quota exceeded. Please try again later.' });
    }
    console.error('Gemini error:', err.message);
    return res.status(500).json({ error: 'Failed to generate roast. The AI might be having a moment.' });
  }

  res.json(result);
});

export default router;
