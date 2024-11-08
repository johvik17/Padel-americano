import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import TrophyRain from './TrophyRain';

function FinalResults({ scores }) {
  const { width, height } = useWindowSize();

  // Sorter spillerne basert på poengsum
  const sortedScores = Object.entries(scores)
    .map(([player, score]) => ({ player, score }))
    .sort((a, b) => b.score - a.score);

  // Del opp i topp 3 og resten
  const topThree = sortedScores.slice(0, 3);
  const restOfPlayers = sortedScores.slice(3);

  // Opprett en lyd-instans
  const [audio] = useState(new Audio(process.env.PUBLIC_URL + '/kjæh.mp3'));

  return (
    <div className="final-results-container">
      <div className="confetti-wrapper">
        <Confetti width={width} height={height} />
      </div>
      <TrophyRain />
      <h2>Resultater fra Turneringen</h2>

      {/* Legg til en knapp for å spille av lyden */}
      <button className="play-audio-button" onClick={() => audio.play()}>
        Kjæh!
      </button>

      {/* Pall for topp 3 spillere */}
      <div className="podium">
        <div className="podium-spot second">
          <div className="podium-rank">2</div>
          <div className="podium-player">{topThree[1]?.player || 'Ingen'}</div>
          <div className="podium-score">{topThree[1]?.score || ''}</div>
        </div>
        <div className="podium-spot first">
          <div className="podium-rank">1</div>
          <div className="podium-player">{topThree[0]?.player || 'Ingen'}</div>
          <div className="podium-score">{topThree[0]?.score || ''}</div>
        </div>
        <div className="podium-spot third">
          <div className="podium-rank">3</div>
          <div className="podium-player">{topThree[2]?.player || 'Ingen'}</div>
          <div className="podium-score">{topThree[2]?.score || ''}</div>
        </div>
      </div>

      {/* Resten av spillerne i en tabell */}
      {restOfPlayers.length > 0 && (
        <>
          <h3>Øvrige resultater</h3>
          <table className="results-table">
            <thead>
              <tr>
                <th>Plass</th>
                <th>Spiller</th>
                <th>Poeng</th>
              </tr>
            </thead>
            <tbody>
              {restOfPlayers.map((item, index) => (
                <tr key={item.player}>
                  <td data-label="Plass">{index + 4}</td>
                  <td data-label="Spiller">{item.player}</td>
                  <td data-label="Poeng">{item.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default FinalResults;
