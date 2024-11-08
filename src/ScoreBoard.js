// ScoreBoard.js

import React from 'react';

function ScoreBoard({ scores }) {
  const sortedScores = Object.entries(scores)
    .map(([player, score]) => ({ player, score }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="scoreboard">
      <h2>Poengtavle</h2>
      <ul>
        {sortedScores.map(({ player, score }) => (
          <li key={player}>
            {player}: {score} poeng
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ScoreBoard;
