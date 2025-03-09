import React, { useState, useRef } from 'react';
import PlayerList from './PlayerList';
import MatchList from './MatchList';
import ScoreBoard from './ScoreBoard';
import FinalResults from './FinalResults';
import { generateRoundsWithConstraints } from './generateMatches'; 
import './App.css';

function App() {
  const [players, setPlayers] = useState([]);

  // allRounds: liste over runder [{roundNumber, matches, leftoverPlayers}, ...]
  const [allRounds, setAllRounds] = useState([]);

  // Scores for hver spiller
  const [scores, setScores] = useState({});

  // Poeng for hver kamp i en runde
  const [roundScores, setRoundScores] = useState({});

  // Innstillinger
  const [numRounds, setNumRounds] = useState('');
  const [numCourts, setNumCourts] = useState('');
  const [matchType, setMatchType] = useState('singel');

  // Styrer hvilken runde vi er på
  const [currentRound, setCurrentRound] = useState(1);
  const [tournamentFinished, setTournamentFinished] = useState(false);
  const [showMatches, setShowMatches] = useState(false);

  // For re-rendering av MatchList
  const [roundKey, setRoundKey] = useState(0);

  // Referanser til input-felt
  const numRoundsRef = useRef(null);
  const numCourtsRef = useRef(null);

  // 🔹 Legg til en ny spiller
  const addPlayer = (name) => {
    setPlayers([...players, name]);
  };

  // 🔹 Fjern en spiller
  const removePlayer = (name) => {
    setPlayers(players.filter((p) => p !== name));
  };

  /**
   * Generer alle runder med constraints:
   *  - Unngå dobbel pause
   *  - Forsøk å gi alle minst én pause
   */
  const handleGenerateRounds = () => {
    if (!numRounds || numRounds < 1) {
      alert('Vennligst skriv inn et gyldig antall runder.');
      return;
    }
    if (!numCourts || numCourts < 1) {
      alert('Vennligst skriv inn et gyldig antall baner (minst 1).');
      return;
    }

    try {
      // Kall vår nye funksjon
      const rounds = generateRoundsWithConstraints(
        players,
        parseInt(numRounds),
        matchType,
        parseInt(numCourts)
      );

      if (!rounds || rounds.length === 0) {
        alert('Kunne ikke generere runder. Sjekk antall spillere og runder.');
        return;
      }

      // Lagre runder i state
      setAllRounds(rounds);

      // Tilbakestill state for turneringen
      setCurrentRound(1);
      setTournamentFinished(false);
      setShowMatches(true);

      // Bygg initialRoundScores for alle kamper i alle runder
      const initialRoundScores = {};
      rounds.forEach((r) => {
        r.matches.forEach((match) => {
          initialRoundScores[match.id] = { team1Points: 0, team2Points: 0 };
        });
      });
      setRoundScores(initialRoundScores);
      setScores({}); // Tilbakestill totalpoeng
      setRoundKey((prevKey) => prevKey + 1);

    } catch (error) {
      alert(error.message);
    }
  };

  /**
   * Gå til neste runde (eller avslutt turneringen) og oppdater scoreboard
   */
  const nextRound = () => {
    // Hent data for nåværende runde
    const currentRoundData = allRounds[currentRound - 1];
    if (!currentRoundData) return;

    // Oppdater scores basert på roundScores for hver kamp i denne runden
    currentRoundData.matches.forEach((match) => {
      const score = roundScores[match.id];
      if (!score) return;

      if (matchType === 'singel') {
        // 1v1
        const [player1, player2] = match.players;
        setScores((prev) => ({
          ...prev,
          [player1]: (prev[player1] || 0) + score.team1Points,
          [player2]: (prev[player2] || 0) + score.team2Points,
        }));
      } else {
        // 2v2
        const [team1, team2] = match.teams;
        team1.forEach((player) => {
          setScores((prev) => ({
            ...prev,
            [player]: (prev[player] || 0) + score.team1Points,
          }));
        });
        team2.forEach((player) => {
          setScores((prev) => ({
            ...prev,
            [player]: (prev[player] || 0) + score.team2Points,
          }));
        });
      }
    });

    // Hvis dette var siste runde, vis resultater
    if (currentRound >= allRounds.length) {
      setTournamentFinished(true);
    } else {
      setCurrentRound(currentRound + 1);
      setRoundKey((prevKey) => prevKey + 1);
    }
  };

  /**
   * Nullstill alt for en ny turnering
   */
  const resetTournament = () => {
    setPlayers([]);
    setAllRounds([]);
    setScores({});
    setRoundScores({});
    setNumRounds('');
    setNumCourts('');
    setCurrentRound(1);
    setTournamentFinished(false);
    setShowMatches(false);
    setRoundKey(0);
  };

  return (
    <div className="App">
      <h1>Padel Americano</h1>

      {showMatches ? (
        // 🔹 Viser runder/kamper
        <div>
          {tournamentFinished ? (
            // 🔹 Turneringen er ferdig
            <>
              <FinalResults scores={scores} />
              <ScoreBoard scores={scores} />
              <button onClick={resetTournament}>Start ny turnering</button>
            </>
          ) : (
            // 🔹 Viser nåværende runde
            <>
              <h2>Runde {currentRound}</h2>

              {/* Hent data for nåværende runde */}
              {allRounds[currentRound - 1] && (
                <>
                  {/* Kampene i denne runden */}
                  <MatchList
                    key={roundKey}
                    matches={allRounds[currentRound - 1].matches}
                    updateRoundScores={(matchId, team1Points, team2Points) => {
                      setRoundScores((prev) => ({
                        ...prev,
                        [matchId]: { team1Points, team2Points },
                      }));
                    }}
                    roundScores={roundScores}
                  />

                  {/* Restespillere for denne runden */}
                  {allRounds[currentRound - 1].leftoverPlayers.length > 0 && (
                    <div className="remaining-players">
                      <h3>Restespillere</h3>
                      <ul>
                        {allRounds[currentRound - 1].leftoverPlayers.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              <button onClick={nextRound}>
                {currentRound < allRounds.length ? 'Neste runde' : 'Trykk for å se resultater'}
              </button>
            </>
          )}
        </div>
      ) : (
        // 🔹 Påmeldingsskjerm
        <>
          <PlayerList addPlayer={addPlayer} removePlayer={removePlayer} players={players} />

          <div>
            <label>Antall runder:</label>
            <input
              type="number"
              min="1"
              value={numRounds}
              onChange={(e) => setNumRounds(e.target.value)}
              ref={numRoundsRef}
            />
          </div>

          <div>
            <label>Antall baner:</label>
            <input
              type="number"
              min="1"
              value={numCourts}
              onChange={(e) => setNumCourts(e.target.value)}
              ref={numCourtsRef}
            />
          </div>

          <div>
            <label>Kampformat:</label>
            <select value={matchType} onChange={(e) => setMatchType(e.target.value)}>
              <option value="singel">1v1</option>
              <option value="dobbel">2v2</option>
            </select>
          </div>

          <button onClick={handleGenerateRounds}>Generer runder</button>
        </>
      )}
    </div>
  );
}

export default App;
