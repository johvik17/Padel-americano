import React from 'react';

function MatchList({ matches, updateRoundScores, roundScores, matchPointLimit = 21 }) {
  return (
    <div className="match-list">
      {matches.map((match) => {
        const score = roundScores[match.id] || { team1Points: '', team2Points: '' };
        const team1Points = Number(score.team1Points) || 0;
        const team2Points = Number(score.team2Points) || 0;
        const team1Max = matchPointLimit - team2Points;
        const team2Max = matchPointLimit - team1Points;
        const pointsRemaining = matchPointLimit - team1Points - team2Points;

        return (
          <article className="match-card" key={match.id}>
            <div className="match-card-header">
              <span>Bane {match.court}</span>
              <strong>{pointsRemaining} poeng igjen</strong>
            </div>

            <div className="court-preview" aria-label={`Baneoppsett for kamp ${match.court}`}>
              <div className="court-half team-one-side">
                {match.teams[0].map((player) => (
                  <span className="player-marker" key={player}>
                    {player}
                  </span>
                ))}
              </div>
              <div className="court-net" />
              <div className="court-half team-two-side">
                {match.teams[1].map((player) => (
                  <span className="player-marker" key={player}>
                    {player}
                  </span>
                ))}
              </div>
            </div>

            <div className="teams-grid">
              <label className="team-box">
                <span>Lag 1</span>
                <strong>{match.teams[0].join(' + ')}</strong>
                <input
                  max={team1Max}
                  min="0"
                  onChange={(event) =>
                    updateRoundScores(match.id, event.target.value, score.team2Points)
                  }
                  placeholder="0"
                  type="number"
                  value={score.team1Points}
                />
              </label>

              <label className="team-box">
                <span>Lag 2</span>
                <strong>{match.teams[1].join(' + ')}</strong>
                <input
                  max={team2Max}
                  min="0"
                  onChange={(event) =>
                    updateRoundScores(match.id, score.team1Points, event.target.value)
                  }
                  placeholder="0"
                  type="number"
                  value={score.team2Points}
                />
              </label>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default MatchList;
