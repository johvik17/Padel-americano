// MatchList.js

import React from 'react';

function MatchList({
  matches,
  updateRoundScores,
  roundScores,
  nextRoundButtonRef,
}) {
  return (
    <div className="MatchList">
      {matches.map((match, index) => (
        <div key={match.id} className="match">
          <h3>Kamp {index + 1}</h3>
          {match.teams ? (
            // For 2v2-kamper
            <>
              <div className="team">
                <strong>Lag 1:</strong> {match.teams[0].join(' og ')}
              </div>
              <div className="team">
                <strong>Lag 2:</strong> {match.teams[1].join(' og ')}
              </div>
            </>
          ) : (
            // For 1v1-kamper
            <>
              <div>
                <strong>Spiller 1:</strong> {match.players[0]}
              </div>
              <div>
                <strong>Spiller 2:</strong> {match.players[1]}
              </div>
            </>
          )}

          {/* Input for poeng */}
          <div className="score-input">
            <input
              type="number"
              min="0"
              placeholder={
                match.teams ? 'Lag 1 poeng' : 'Spiller 1 poeng'
              }
              value={roundScores[match.id]?.team1Points || ''}
              onChange={(e) =>
                updateRoundScores(
                  match.id,
                  parseInt(e.target.value) || 0,
                  roundScores[match.id]?.team2Points || 0
                )
              }
            />
            <input
              type="number"
              min="0"
              placeholder={
                match.teams ? 'Lag 2 poeng' : 'Spiller 2 poeng'
              }
              value={roundScores[match.id]?.team2Points || ''}
              onChange={(e) =>
                updateRoundScores(
                  match.id,
                  roundScores[match.id]?.team1Points || 0,
                  parseInt(e.target.value) || 0
                )
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default MatchList;
