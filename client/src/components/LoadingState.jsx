const STEPS = [
  'Cloning repo into shame...',
  'Reading your README (if it exists)...',
  'Counting commit messages that say "fix"...',
  'Consulting the AI overlords...',
  'Preparing the roast...',
];

export default function LoadingState() {
  return (
    <div className="loading-state">
      <div className="loading-fires">🔥🔥🔥</div>
      <p className="loading-text">ROASTING IN PROGRESS</p>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" />
      </div>
      <p className="loading-sub">This may take 10–20 seconds</p>
    </div>
  );
}
