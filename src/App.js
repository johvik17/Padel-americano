import React, { useMemo, useState } from 'react';
import PlayerList from './PlayerList';
import MatchList from './MatchList';
import ScoreBoard from './ScoreBoard';
import FinalResults from './FinalResults';
import {
  calculateRoundResult,
  createInitialScores,
  createInitialStats,
  generateAmericanoRounds,
  generateMexicanoRound,
} from './generateMatches';
import './App.css';

const TOURNAMENTS = {
  americano: {
    label: 'Americano',
    description: 'Tilfeldige lag og jevn rullering. Alle samler individuelle poeng.',
  },
  mexicano: {
    label: 'Mexicano',
    description: 'Rundene styres av stillingen. Spillere med likt nivå møter hverandre.',
  },
};

const MATCH_POINT_LIMIT = 21;

const PADEL_QUOTES = [
  'Padel vinnes ikke bare med harde slag, men med smarte valg.',
  'Hold ballen i spill, hold hodet kaldt, og la poengene komme.',
  'Den beste veggen på banen er den som gir deg tid til å tenke.',
  'Du bommer 100% av smashene du ikke tar.',
  'En god padelspiller vinner poeng. Et godt lag vinner momentum.',
  'Små steg, lave skuldre, store poeng.',
  'Angrep er det beste forsvaret, et solid forsvar kan vinne kamper.',
  'VAMOOS! Det er ikke bare et slag, det er en holdning.',
  'Padel handler om å vinne, ikke om å ha det gøy.',
  'Padel er som livet - det handler om hvor hardt du slår.',
  'I padel, som i livet, er det viktigere å komme tilbake etter et tap enn å unngå det.',
  'En god padelspiller vet at det ikke handler om å være best, men om å være bedre enn i går.',
];

function clampScore(value, maxValue) {
  if (value === '') return '';

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '';

  return String(Math.min(Math.max(0, numericValue), maxValue));
}

function getRandomQuoteIndex(currentIndex) {
  if (PADEL_QUOTES.length <= 1) return currentIndex;

  let nextIndex = currentIndex;
  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * PADEL_QUOTES.length);
  }
  return nextIndex;
}

function App() {
  const [players, setPlayers] = useState([]);
  const [tournamentType, setTournamentType] = useState('americano');
  const [numRounds, setNumRounds] = useState('6');
  const [numCourts, setNumCourts] = useState('1');
  const [rounds, setRounds] = useState([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [roundScores, setRoundScores] = useState({});
  const [scores, setScores] = useState({});
  const [stats, setStats] = useState({});
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [setupError, setSetupError] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);

  const currentRound = rounds[currentRoundIndex];
  const standings = useMemo(
    () =>
      players
        .map((player) => ({
          player,
          score: scores[player] || 0,
          ...(stats[player] || { played: 0, wins: 0, draws: 0, losses: 0, resting: 0 }),
        }))
        .sort((a, b) => b.score - a.score || b.wins - a.wins || a.player.localeCompare(b.player)),
    [players, scores, stats]
  );

  const addPlayer = (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    if (players.some((player) => player.toLowerCase() === trimmedName.toLowerCase())) return;
    setSetupError('');
    setPlayers((currentPlayers) => [...currentPlayers, trimmedName]);
  };

  const removePlayer = (name) => {
    setPlayers((currentPlayers) => currentPlayers.filter((player) => player !== name));
  };

  const buildEmptyScores = (generatedRounds) => {
    return generatedRounds.reduce((allScores, round) => {
      round.matches.forEach((match) => {
        allScores[match.id] = { team1Points: '', team2Points: '' };
      });
      return allScores;
    }, {});
  };

  const validateSetup = () => {
    const parsedRounds = Number(numRounds);
    const parsedCourts = Number(numCourts);

    if (players.length < 4) {
      throw new Error('Må være minst 4 spillere');
    }
    if (!Number.isInteger(parsedRounds) || parsedRounds < 1) {
      throw new Error('Velg minst en runde.');
    }
    if (!Number.isInteger(parsedCourts) || parsedCourts < 1) {
      throw new Error('Velg minst en bane.');
    }

    return { parsedRounds, parsedCourts };
  };

  const startTournament = () => {
    try {
      setSetupError('');
      const { parsedRounds, parsedCourts } = validateSetup();
      const initialScores = createInitialScores(players);
      const initialStats = createInitialStats(players);
      const generatedRounds =
        tournamentType === 'americano'
          ? generateAmericanoRounds(players, parsedRounds, parsedCourts)
          : [generateMexicanoRound(players, 1, parsedCourts, initialScores, initialStats)];

      setScores(initialScores);
      setStats(initialStats);
      setRounds(generatedRounds);
      setRoundScores(buildEmptyScores(generatedRounds));
      setCurrentRoundIndex(0);
      setIsStarted(true);
      setIsFinished(false);
    } catch (error) {
      setSetupError(error.message);
    }
  };

  const updateRoundScores = (matchId, team1Points, team2Points) => {
    const normalizedTeam1Points = clampScore(team1Points, MATCH_POINT_LIMIT);
    const maxTeam2Points =
      MATCH_POINT_LIMIT - (Number(normalizedTeam1Points) || 0);
    const normalizedTeam2Points = clampScore(team2Points, maxTeam2Points);

    setRoundScores((currentScores) => ({
      ...currentScores,
      [matchId]: {
        team1Points: normalizedTeam1Points,
        team2Points: normalizedTeam2Points,
      },
    }));
  };

  const completeCurrentRound = () => {
    if (!currentRound) return;

    const result = calculateRoundResult(currentRound, roundScores, scores, stats);
    const nextRoundNumber = currentRound.roundNumber + 1;
    const tournamentIsFinished = nextRoundNumber > Number(numRounds);

    setScores(result.scores);
    setStats(result.stats);

    if (tournamentIsFinished) {
      setIsFinished(true);
      return;
    }

    if (tournamentType === 'mexicano') {
      const nextRound = generateMexicanoRound(
        players,
        nextRoundNumber,
        Number(numCourts),
        result.scores,
        result.stats
      );

      setRounds((currentRounds) => [...currentRounds, nextRound]);
      setRoundScores((currentScores) => ({
        ...currentScores,
        ...buildEmptyScores([nextRound]),
      }));
    }

    showNextQuote();
    setCurrentRoundIndex((index) => index + 1);
  };

  const resetTournament = () => {
    setRounds([]);
    setCurrentRoundIndex(0);
    setRoundScores({});
    setScores({});
    setStats({});
    setIsStarted(false);
    setIsFinished(false);
  };

  const clearEverything = () => {
    resetTournament();
    setPlayers([]);
  };

  const showNextQuote = () => {
    setQuoteIndex((currentIndex) => getRandomQuoteIndex(currentIndex));
  };

  const renderQuoteCard = () => (
    <div className="quote-card">
      <p className="eyebrow">Dagens padel-boost</p>
      <blockquote>{PADEL_QUOTES[quoteIndex]}</blockquote>
      <button className="ghost-button" onClick={showNextQuote} type="button">
        Ny quote
      </button>
    </div>
  );

  return (
    <main className="app-shell">
      <section className="app-header">
        <p className="eyebrow">Padel turnering</p>
        <h1>Padel Americano og Mexicano</h1>
        <p>Sett opp spillere, baner og runder. Appen lager kampene og holder poengene underveis.</p>
      </section>

      {!isStarted ? (
        <section className="setup-grid">
          <div className="panel">
            <h2>Velg format</h2>
            <div className="mode-switch" role="group" aria-label="Turneringsformat">
              {Object.entries(TOURNAMENTS).map(([key, tournament]) => (
                <button
                  className={tournamentType === key ? 'mode-card active' : 'mode-card'}
                  key={key}
                  onClick={() => setTournamentType(key)}
                  type="button"
                >
                  <span>{tournament.label}</span>
                  <small>{tournament.description}</small>
                </button>
              ))}
            </div>

            <div className="settings-grid">
              <label>
                Runder
                <input
                  min="1"
                  onChange={(event) => setNumRounds(event.target.value)}
                  type="number"
                  value={numRounds}
                />
              </label>
              <label>
                Baner
                <input
                  min="1"
                  onChange={(event) => setNumCourts(event.target.value)}
                  type="number"
                  value={numCourts}
                />
              </label>
            </div>
          </div>

          <div className="panel">
            <PlayerList addPlayer={addPlayer} removePlayer={removePlayer} players={players} />
          </div>

          {renderQuoteCard()}

          <div className="action-bar">
            <button className="primary-button" onClick={startTournament} type="button">
              Start turnering
            </button>
            {players.length > 0 && (
              <button className="ghost-button" onClick={clearEverything} type="button">
                Tøm liste
              </button>
            )}
          </div>

          {setupError && (
            <div className="setup-error" role="alert">
              {setupError}
            </div>
          )}
        </section>
      ) : (
        <section className="tournament-layout">
          <div className="round-panel">
            {isFinished ? (
              <>
                <FinalResults scores={scores} stats={stats} />
                <div className="action-bar">
                  <button className="primary-button" onClick={resetTournament} type="button">
                    Start ny turnering
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="round-header">
                  <div>
                    <p className="eyebrow">{TOURNAMENTS[tournamentType].label}</p>
                    <h2>
                      Runde {currentRound?.roundNumber} av {numRounds}
                    </h2>
                  </div>
                  <button className="primary-button" onClick={resetTournament} type="button">
                    Avslutt
                  </button>
                </div>

                {currentRound && (
                  <>
                    {renderQuoteCard()}

                    <MatchList
                      matchPointLimit={MATCH_POINT_LIMIT}
                      matches={currentRound.matches}
                      roundScores={roundScores}
                      updateRoundScores={updateRoundScores}
                    />

                    {currentRound.restingPlayers.length > 0 && (
                      <div className="resting-box">
                        <h3>Pause denne runden</h3>
                        <p>{currentRound.restingPlayers.join(', ')}</p>
                      </div>
                    )}
                  </>
                )}

                <button className="primary-button wide" onClick={completeCurrentRound} type="button">
                  {currentRoundIndex + 1 >= Number(numRounds) ? 'Se resultater' : 'Lagre og gå videre'}
                </button>
              </>
            )}
          </div>

          <ScoreBoard standings={standings} />
        </section>
      )}
    </main>
  );
}

export default App;
