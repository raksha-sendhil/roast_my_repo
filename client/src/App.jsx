import { useState } from 'react';
import RepoInput from './components/RepoInput';
import LoadingState from './components/LoadingState';
import RoastCard from './components/RoastCard';
import SuggestionList from './components/SuggestionList';

export default function App() {
  const [status, setStatus] = useState('idle');
  const [roast, setRoast] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(repoUrl) {
    setStatus('loading');
    setRoast('');
    setSuggestions([]);
    setErrorMsg('');

    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong. Try again.');
        setStatus('error');
        return;
      }

      setRoast(data.roast);
      setSuggestions(data.suggestions);
      setStatus('done');
    } catch {
      setErrorMsg('Network error. Make sure the server is running on port 3000.');
      setStatus('error');
    }
  }

  function handleReset() {
    setStatus('idle');
    setRoast('');
    setSuggestions([]);
    setErrorMsg('');
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo-row">
            <span className="fire-icon">🔥</span>
            <h1>Roast My Repo</h1>
            <span className="fire-icon">🔥</span>
          </div>
          <p className="tagline">Paste a GitHub URL. Receive judgement.</p>
        </div>
      </header>

      <main className="main">
        {status !== 'done' && (
          <RepoInput onSubmit={handleSubmit} disabled={status === 'loading'} />
        )}

        {status === 'loading' && <LoadingState />}

        {status === 'error' && (
          <div className="error-box">
            <span className="error-icon">⚠️</span>
            <p>{errorMsg}</p>
            <button className="btn-secondary" onClick={handleReset}>Try again</button>
          </div>
        )}

        {status === 'done' && (
          <>
            <RoastCard roast={roast} />
            <SuggestionList suggestions={suggestions} />
            <div className="reset-wrap">
              <button className="btn-secondary" onClick={handleReset}>
                🔥 Roast another repo
              </button>
            </div>
          </>
        )}
      </main>

      <footer className="footer">
        <p>Powered by Gemini · Built for developers who can take a hit</p>
      </footer>
    </div>
  );
}
