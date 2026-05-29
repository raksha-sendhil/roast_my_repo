# Roast My Repo — Project Spec

## What this app does
A web app where users paste a GitHub repo URL and receive:
1. A savage but funny AI-generated roast of their repo
2. Actionable improvement suggestions (README, folder structure,
   code quality, missing tooling, CI/CD, etc.)

## Tech Stack
- Frontend: React + Vite (in /client)
- Backend: Node.js + Express (in /server)
- AI: Google Gemini API (gemini-2.0-flash) via @google/genai SDK
- Repo data: GitHub REST API v3

## Environment Variables needed
### /server/.env
GEMINI_API_KEY=your_key
GITHUB_TOKEN=your_pat

## Architecture
1. User enters GitHub URL in frontend
2. Frontend POST /api/roast { repoUrl }
3. Backend parses owner/repo from URL
4. Backend fetches from GitHub API:
   - Repo metadata (stars, forks, language, description, topics)
   - File tree (root level, max depth 2)
   - README content (if exists) — truncated to 3000 chars
   - package.json or requirements.txt (if exists) — truncated to 3000 chars
   - Number of open issues, last commit date, contributors
5. Backend sends all collected data to Gemini with a roast prompt
6. Gemini returns { roast: string, suggestions: string[] }
7. Frontend displays roast in a fun "burn" UI, then suggestions

## Gemini Service Instructions (services/gemini.js)
Use the NEW @google/genai SDK — NOT the old @google/generative-ai package.

Correct import:
  import { GoogleGenAI, Type } from '@google/genai';

Initialize:
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

Use responseMimeType and responseJsonSchema in the config to enforce
structured JSON output — do NOT rely on prompt-based JSON instructions,
as that is unreliable and will cause parsing failures.

Call pattern:
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: userPrompt,
    config: {
      systemInstruction: "You are a brutally funny but ultimately helpful code roast comedian.",
      responseMimeType: "application/json",
      responseJsonSchema: {
        type: Type.OBJECT,
        properties: {
          roast: { type: Type.STRING },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["roast", "suggestions"]
      }
    }
  });
  const result = JSON.parse(response.text);

The roast should be 3-4 paragraphs, savage but not mean-spirited.
Suggestions should be 5-8 specific, actionable items with brief explanations.
Each suggestion should name a concrete tool, file, or practice (e.g.
"Add a .github/workflows/ci.yml using GitHub Actions to run tests on
every push" — not just "add CI/CD").

## UI Requirements
- Dark theme, terminal/hacker aesthetic
- Animated "roasting" loading state (fire emoji, progress bar)
- Roast displayed in a "burn notice" card with dramatic styling
- Suggestions in a clean checklist below
- Responsive, works on mobile
- Error states for: invalid URL, private repo, GitHub rate limit hit,
  Gemini API error or quota exceeded (429) — all should show
  user-friendly messages, never raw stack traces

## File Structure to create
roast-my-repo/
  client/          (Vite React app)
    src/
      App.jsx
      components/
        RepoInput.jsx
        RoastCard.jsx
        SuggestionList.jsx
        LoadingState.jsx
      index.css
    index.html
    vite.config.js
    package.json
  server/
    index.js        (Express app)
    routes/
      roast.js      (POST /api/roast handler)
    services/
      github.js     (GitHub API calls)
      gemini.js     (Google Gemini API calls)
    .env
    package.json
  README.md

## Code quality requirements
- Use async/await throughout, proper error handling everywhere
- In gemini.js, wrap JSON.parse(response.text) in try/catch and return
  a 500 with a user-friendly message if parsing fails
- GitHub service must fetch each file (README, package.json, etc.)
  in its own try/catch — one missing file must never abort the whole request
- Truncate README and any fetched file contents to 3000 chars each before
  sending to Gemini to avoid context limit issues on large repos
- Rate limit errors from GitHub (403/429) must return a user-friendly message
- Gemini 429 errors must return a user-friendly "quota exceeded" message
- CORS configured for local dev (localhost:5173 -> localhost:3000)
- All env vars loaded via dotenv, never hardcoded
- No raw error objects or stack traces ever sent to the frontend