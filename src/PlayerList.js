// PlayerList.js

import React, { useState } from 'react';

function PlayerList({ addPlayer, removePlayer, players }) {
  const [name, setName] = useState('');

  const handleAddPlayer = () => {
    if (name.trim() !== '') {
      addPlayer(name.trim());
      setName('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddPlayer();
    }
  };

  return (
    <div className="player-list">
      <h2>Legg til spillere</h2>
      <input
        type="text"
        placeholder="Spillernavn"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleAddPlayer}>Legg til</button>

      {players.length > 0 && (
        <ul>
          {players.map((player, index) => (
            <li key={index}>
              {player}
              <button
                className="remove-player-button"
                onClick={() => removePlayer(player)}
              >
                X
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PlayerList;
