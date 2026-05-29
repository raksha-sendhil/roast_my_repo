export default function RoastCard({ roast }) {
  return (
    <div className="roast-card">
      <div className="roast-card-header">
        <div className="roast-card-header-dots">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
        <span className="roast-card-title">🔥 BURN NOTICE</span>
      </div>
      <div className="roast-card-body">
        <p className="roast-text">{roast}</p>
      </div>
    </div>
  );
}
