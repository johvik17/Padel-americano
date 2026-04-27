import React, { useMemo, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import TrophyRain from './TrophyRain';

function FinalResults({ scores, stats }) {
  const { width, height } = useWindowSize();
  const [audio] = useState(new Audio(process.env.PUBLIC_URL + '/kjæh.mp3'));

  const sortedScores = useMemo(
    () =>
      Object.entries(scores)
        .map(([player, score]) => ({
          player,
          score: score || 0,
          ...(stats[player] || { played: 0, wins: 0, draws: 0, losses: 0, resting: 0 }),
        }))
        .sort((a, b) => b.score - a.score || b.wins - a.wins || a.player.localeCompare(b.player)),
    [scores, stats]
  );

  const topThree = sortedScores.slice(0, 3);
  const restOfPlayers = sortedScores.slice(3);
  const winner = topThree[0];

  return (
    <div className="final-results-container">
      <div className="confetti-wrapper">
        <Confetti height={height} recycle={false} width={width} />
      </div>
      <TrophyRain />

      <div className="winner-hero">
        <p className="eyebrow">Ferdigspilt</p>
        <div className="winner-crown" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <h2>{winner ? `${winner.player} vinner!` : 'Resultater'}</h2>
        <p>
          {winner
            ? `${winner.score} poeng, ${winner.wins} seire og full kontroll på pallen.`
            : 'Turneringen er ferdig.'}
        </p>
        <button className="kjah-button" onClick={() => audio.play()} type="button">
          Kjæh!
        </button>
      </div>

      <div className="podium">
        <div className="podium-spot second">
          <div className="medal silver">2</div>
          <div className="podium-player">{topThree[1]?.player || '-'}</div>
          <div className="podium-score">{topThree[1]?.score || 0} poeng</div>
        </div>
        <div className="podium-spot first">
          <div className="medal gold">1</div>
          <div className="podium-player">{topThree[0]?.player || '-'}</div>
          <div className="podium-score">{topThree[0]?.score || 0} poeng</div>
        </div>
        <div className="podium-spot third">
          <div className="medal bronze">3</div>
          <div className="podium-player">{topThree[2]?.player || '-'}</div>
          <div className="podium-score">{topThree[2]?.score || 0} poeng</div>
        </div>
      </div>

      {restOfPlayers.length > 0 && (
        <table className="results-table">
          <thead>
            <tr>
              <th>Plass</th>
              <th>Spiller</th>
              <th>Poeng</th>
              <th>V-U-T</th>
            </tr>
          </thead>
          <tbody>
            {restOfPlayers.map((item, index) => (
              <tr key={item.player}>
                <td>{index + 4}</td>
                <td>{item.player}</td>
                <td>{item.score}</td>
                <td>
                  {item.wins}-{item.draws}-{item.losses}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default FinalResults;
