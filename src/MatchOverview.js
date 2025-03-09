// MatchOverview.js
import React from 'react';

function MatchOverview({ matches, remainingPlayers }) {
  if (!matches || matches.length === 0) {
    return null; // Ingen kamper å vise
  }

  return (
    <div className="match-overview">
      <h2>Alle kamper</h2>

      {matches.map((match) => (
        <div key={match.id} className="match-item">
          <h3>
            {/* Du kan kalle det "Bane" eller "Kamp" som du vil */}
            Bane {match.id} - Runde {match.round}
          </h3>

          <ul>
            {match.players.map((player) => (
              <li key={player}>{player}</li>
            ))}
          </ul>
        </div>
      ))}

      {/* Vis restespillere nederst */}
      {remainingPlayers && remainingPlayers.length > 0 && (
        <div className="remaining-players">
          <h3>Spillere uten bane</h3>
          <ul>
            {remainingPlayers.map((player) => (
              <li key={player}>{player}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MatchOverview;
