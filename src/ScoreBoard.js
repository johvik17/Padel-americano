import React from 'react';

function ScoreBoard({ scores, sorted = false }) {
  const scoreEntries = Object.entries(scores).map(([player, score]) => ({
    player,
    score,
  }));

  if (sorted) {
    scoreEntries.sort((a, b) => b.score - a.score);
  }

  return (
    <div>
      <h2>Poengtavle</h2>
      <ul>
        {scoreEntries.map((item) => (
          <li key={item.player}>
            {item.player}: {item.score} poeng
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ScoreBoard;
