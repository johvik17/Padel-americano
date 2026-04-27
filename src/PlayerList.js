import React, { useState } from 'react';

function PlayerList({ addPlayer, removePlayer, players }) {
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    addPlayer(playerName);
    setPlayerName('');
  };

  return (
    <div className="player-list">
      <div className="section-heading">
        <h2>Spillere</h2>
        <span>{players.length} påmeldt</span>
      </div>

      <form className="player-form" onSubmit={handleSubmit}>
        <input
          aria-label="Spillernavn"
          onChange={(event) => setPlayerName(event.target.value)}
          placeholder="Skriv inn navn"
          type="text"
          value={playerName}
        />
        <button type="submit">Legg til</button>
      </form>

      {players.length > 0 ? (
        <ul className="player-chips">
          {players.map((player) => (
            <li key={player}>
              <span>{player}</span>
              <button aria-label={`Fjern ${player}`} onClick={() => removePlayer(player)} type="button">
                Fjern
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">Legg til minst fire spillere for å starte.</p>
      )}
    </div>
  );
}

export default PlayerList;
