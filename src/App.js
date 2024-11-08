// App.js

import React, { useState, useRef } from 'react';
import PlayerList from './PlayerList';
import MatchList from './MatchList';
import ScoreBoard from './ScoreBoard';
import FinalResults from './FinalResults';
import { generateRounds } from './generateMatches'; // Importer generateRounds-funksjonen
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
  const nextRoundButtonRef = useRef(null); // Referanse til "Neste runde"-knappen

  const addPlayer = (name) => {
    setPlayers([...players, name]);
  };

  // Funksjon for å fjerne en spiller
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
          const half = match.players.length / 2;
          match.players.slice(0, half).forEach((player) => {
            setScores((prevScores) => ({
              ...prevScores,
              [player]: (prevScores[player] || 0) + score.team1Points,
            }));
          });
          match.players.slice(half).forEach((player) => {
            setScores((prevScores) => ({
              ...prevScores,
              [player]: (prevScores[player] || 0) + score.team2Points,
            }));
          });
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
            removePlayer={removePlayer} // Sender removePlayer-funksjonen som prop
            players={players}
          />

          {/* Resten av koden din, for eksempel input for antall runder og kampformat */}

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
                Neste runde
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
