export default function Menu({ puzzles, stats, onSelectPuzzle, solvedCount, gaveUpCount }) {
  return (
    <div className="menu-container">
      <div className="menu-header">
        <h1>🎮 Greg's Word Game</h1>
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-label">Solved</span>
            <span className="stat-value">{solvedCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Gave Up</span>
            <span className="stat-value">{gaveUpCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total</span>
            <span className="stat-value">{puzzles.length}</span>
          </div>
        </div>
      </div>

      <div className="puzzles-list">
        {puzzles.map((puzzle, index) => {
          const stat = stats[index]
          return (
            <button
              key={index}
              className={`puzzle-item puzzle-${stat.status}`}
              onClick={() => onSelectPuzzle(index)}
            >
              <span className="puzzle-name">{puzzle.sixLetter}</span>
              <span className="puzzle-status">
                {stat.solved && '✓'}
                {stat.status === 'gaveup' && '⊘'}
                {stat.status === 'unsolved' && '○'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}