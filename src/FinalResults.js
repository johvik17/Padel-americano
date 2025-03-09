import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import TrophyRain from './TrophyRain';

function FinalResults({ scores }) {
  const { width, height } = useWindowSize();
  const [sortedScores, setSortedScores] = useState([]);

  // Sorter scores når det endres
  useEffect(() => {
    if (scores && Object.keys(scores).length > 0) {
      const sorted = Object.entries(scores)
        .map(([player, score]) => ({ player, score: score || 0 }))
        .sort((a, b) => b.score - a.score);
      setSortedScores(sorted);
    }
  }, [scores]);

  // Topp 3
  const topThree = sortedScores.slice(0, 3);
  const restOfPlayers = sortedScores.slice(3);

  // Lyd
  const [audio] = useState(new Audio(process.env.PUBLIC_URL + '/kjæh.mp3'));

  return (
    <div className="final-results-container">
      <div className="confetti-wrapper">
        <Confetti width={width} height={height} />
      </div>
      <TrophyRain />

      <h2>Resultater fra Turneringen</h2>
      <button className="play-audio-button" onClick={() => audio.play()}>
        Kjæh!
      </button>

      {/* Pall */}
      <div className="podium">
        <div className="podium-spot second">
          <div className="podium-rank">2</div>
          <div className="podium-player">{topThree[1]?.player || 'Ingen'}</div>
          <div className="podium-score">{topThree[1]?.score || 0} poeng</div>
        </div>
        <div className="podium-spot first">
          <div className="podium-rank">1</div>
          <div className="podium-player">{topThree[0]?.player || 'Ingen'}</div>
          <div className="podium-score">{topThree[0]?.score || 0} poeng</div>
        </div>
        <div className="podium-spot third">
          <div className="podium-rank">3</div>
          <div className="podium-player">{topThree[2]?.player || 'Ingen'}</div>
          <div className="podium-score">{topThree[2]?.score || 0} poeng</div>
        </div>
      </div>

      {/* Resten av spillerne */}
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
                  <td data-label="Poeng">{item.score} poeng</td>
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
