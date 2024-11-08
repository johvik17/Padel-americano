// App.js

import React, { useState, useRef } from 'react';
import PlayerList from './PlayerList';
import MatchList from './MatchList';
import ScoreBoard from './ScoreBoard';
import FinalResults from './FinalResults';
import { generateRounds } from './generateMatches';
import './App.css';

function App() {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [scores, setScores] = useState({});
  const [roundScores, setRoundScores] = useState({});
  const [numRounds, setNumRounds] = useState('');
  const [matchType, setMatchType] = useState('singel');
  const [currentRound, setCurrentRound] = useState(1);
  const [roundKey, setRoundKey] = useState(0);
  const [tournamentFinished, setTournamentFinished] = useState(false);

  const numRoundsRef = useRef(null);
  const nextRoundButtonRef = useRef(null);

  const addPlayer = (name) => {
    setPlayers([...players, name]);
  };

  const removePlayer = (name) => {
    setPlayers(players.filter((player) => player !== name));
  };

  const handleGenerateRounds = () => {
    if (!numRounds || numRounds < 1) {
      alert('Vennligst skriv inn et gyldig antall runder.');
      return;
    }

    const newMatches = generateRounds(players, numRounds, matchType);

    if (!newMatches || newMatches.length === 0) {
      alert('Kunne ikke generere kamper. Vennligst sjekk antall spillere og runder.');
      return;
    }

    setMatches(newMatches);
    setCurrentRound(1);
    setTournamentFinished(false);

    const initialRoundScores = {};
    newMatches.forEach((match) => {
      initialRoundScores[match.id] = { team1Points: 0, team2Points: 0 };
    });
    setRoundScores(initialRoundScores);
    setRoundKey((prevKey) => prevKey + 1);
  };

  const updateRoundScores = (matchId, team1Points, team2Points) => {
    setRoundScores((prevScores) => ({
      ...prevScores,
      [matchId]: { team1Points, team2Points },
    }));
  };

  const nextRound = () => {
    matches
      .filter((match) => match.round === currentRound)
      .forEach((match) => {
        const score = roundScores[match.id];
        if (score) {
          if (matchType === 'singel') {
            // For 1v1-kamper
            const player1 = match.players[0];
            const player2 = match.players[1];

            setScores((prevScores) => ({
              ...prevScores,
              [player1]: (prevScores[player1] || 0) + score.team1Points,
              [player2]: (prevScores[player2] || 0) + score.team2Points,
            }));
          } else {
            // For 2v2-kamper
            const team1 = match.teams[0];
            const team2 = match.teams[1];

            team1.forEach((player) => {
              setScores((prevScores) => ({
                ...prevScores,
                [player]: (prevScores[player] || 0) + score.team1Points,
              }));
            });

            team2.forEach((player) => {
              setScores((prevScores) => ({
                ...prevScores,
                [player]: (prevScores[player] || 0) + score.team2Points,
              }));
            });
          }
        }
      });

    if (currentRound < numRounds) {
      setCurrentRound(currentRound + 1);
      setRoundKey((prevKey) => prevKey + 1);
    } else {
      setTournamentFinished(true);
    }
  };

  const resetTournament = () => {
    setPlayers([]);
    setMatches([]);
    setScores({});
    setRoundScores({});
    setNumRounds('');
    setCurrentRound(1);
    setTournamentFinished(false);
    setRoundKey(0);
  };

  return (
    <div className="App">
      <h1>Padel Americano</h1>
      {tournamentFinished ? (
        <div>
          <FinalResults scores={scores} />
          <button onClick={resetTournament}>Start ny turnering</button>
        </div>
      ) : (
        <>
          <PlayerList
            addPlayer={addPlayer}
            removePlayer={removePlayer}
            players={players}
          />

          <div>
            <label>Antall runder:</label>
            <input
              type="number"
              min="1"
              value={numRounds}
              onChange={(e) => setNumRounds(parseInt(e.target.value) || '')}
              ref={numRoundsRef}
            />
          </div>

          <div>
            <label>Kampformat:</label>
            <select
              value={matchType}
              onChange={(e) => setMatchType(e.target.value)}
            >
              <option value="singel">1v1</option>
              <option value="dobbel">2v2</option>
            </select>
          </div>

          <button onClick={handleGenerateRounds}>Generer runder</button>

          {matches.length > 0 && (
            <>
              <h2>Runde {currentRound}</h2>
              <MatchList
                key={roundKey}
                matches={matches.filter((match) => match.round === currentRound)}
                updateRoundScores={updateRoundScores}
                roundScores={roundScores}
                nextRoundButtonRef={nextRoundButtonRef}
              />
              <button ref={nextRoundButtonRef} onClick={nextRound}>
                {currentRound < numRounds ? 'Neste runde' : 'Vis resultater'}
              </button>

              <ScoreBoard scores={scores} />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
