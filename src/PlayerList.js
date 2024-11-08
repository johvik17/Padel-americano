import React, { useState } from 'react';

function PlayerList({ addPlayer, players }) {
  const [playerName, setPlayerName] = useState('');

  const handleAddPlayer = () => {
    if (playerName.trim()) {
      addPlayer(playerName);
      setPlayerName(''); // Tøm input-feltet etter at spilleren er lagt til
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddPlayer();
    }
  };

  return (
    <div>
      <h2>Legg til spillere</h2>
      <input
        type="text"
        placeholder="Spillernavn"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        onKeyUp={handleKeyPress} // Lytter etter Enter-tasten
      />
      <button onClick={handleAddPlayer}>Legg til spiller</button>
      <ul>
        {players.map((player, index) => (
          <li key={index}>{player}</li>
        ))}
      </ul>
    </div>
  );
}

export default PlayerList;
