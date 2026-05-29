# Roast My Repo 🔥

Paste a GitHub repo URL and receive a savage AI-generated roast plus actionable improvement suggestions.

## Setup

### 1. Get your API keys

**Gemini API key**
- Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
- Create a new API key (free tier available)

**GitHub Personal Access Token** (optional but recommended to avoid rate limits)
- Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Generate a new token with `public_repo` scope (read-only is fine)

### 2. Configure environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```
GEMINI_API_KEY=your_gemini_api_key_here
GITHUB_TOKEN=your_github_pat_here
```

### 3. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 4. Start dev servers

Open two terminals:

```bash
# Terminal 1 — backend (port 3000)
cd server && npm run dev

# Terminal 2 — frontend (port 5173)
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Tech stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **AI**: Google Gemini 2.0 Flash via `@google/genai`
- **Data**: GitHub REST API v3
