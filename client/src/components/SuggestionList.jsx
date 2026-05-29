export default function SuggestionList({ suggestions }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="suggestion-list">
      <div className="suggestions-header">
        <span className="suggestions-title">Survival Guide</span>
        <span className="suggestions-divider" />
      </div>
      {suggestions.map((s, i) => (
        <div key={i} className="suggestion-item">
          <span className="suggestion-check">✓</span>
          <p className="suggestion-text">{s}</p>
        </div>
      ))}
    </div>
  );
}
