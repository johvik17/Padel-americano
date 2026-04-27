import React from 'react';

function ScoreBoard({ standings = [] }) {
  return (
    <aside className="scoreboard">
      <div className="section-heading">
        <h2>Stilling</h2>
        <span>{standings.length} spillere</span>
      </div>

      <ol className="standings-list">
        {standings.map((item, index) => (
          <li key={item.player}>
            <span className="rank">{index + 1}</span>
            <span className="player-name">{item.player}</span>
            <strong>{item.score}</strong>
            <small>
              {item.wins}-{item.draws}-{item.losses}
            </small>
          </li>
        ))}
      </ol>
    </aside>
  );
}

export default ScoreBoard;
