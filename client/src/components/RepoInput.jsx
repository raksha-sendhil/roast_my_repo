import { useState } from 'react';

export default function RepoInput({ onSubmit, disabled }) {
  const [url, setUrl] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed) onSubmit(trimmed);
  }

  return (
    <form className="repo-input" onSubmit={handleSubmit}>
      <label className="input-label" htmlFor="repo-url">
        GitHub Repository URL
      </label>
      <div className="input-row">
        <input
          id="repo-url"
          type="url"
          className="url-input"
          placeholder="https://github.com/owner/repo"
          value={url}
          onChange={e => setUrl(e.target.value)}
          disabled={disabled}
          autoFocus
          spellCheck={false}
        />
        <button type="submit" className="btn-primary" disabled={disabled || !url.trim()}>
          🔥 Roast it
        </button>
      </div>
    </form>
  );
}
