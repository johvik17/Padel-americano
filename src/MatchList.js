// MatchList.js

import React, { useRef } from 'react';

function MatchList({ matches, updateRoundScores, roundScores, nextRoundButtonRef }) {
  const inputRefs = useRef([]);

  const handleScoreChange = (e, matchId, team, otherTeamPoints) => {
    const points = parseInt(e.target.value) || 0;
    const updatedScores =
      team === 1
        ? { team1Points: points, team2Points: otherTeamPoints }
        : { team1Points: otherTeamPoints, team2Points: points };

    updateRoundScores(matchId, updatedScores.team1Points, updatedScores.team2Points);
  };

  const handleScoreKeyDown = (e, currentIndex) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextIndex = currentIndex + 1;
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      } else {
        // Ingen flere inntastingsfelt, fokusér på "Neste runde"-knappen
        if (nextRoundButtonRef && nextRoundButtonRef.current) {
          nextRoundButtonRef.current.focus();
        }
      }
    }
  };

  return (
    <div>
      <ul>
        {matches.map((match, matchIndex) => (
          <li key={match.id}>
            {match.players.length === 2 ? (
              <>
                {match.players[0]} vs {match.players[1]}
              </>
            ) : (
              <>
                {match.players[0]} &amp; {match.players[1]} vs {match.players[2]} &amp; {match.players[3]}
              </>
            )}
            <div>
              <input
                type="number"
                placeholder="Poeng lag 1"
                ref={(el) => (inputRefs.current[matchIndex * 2] = el)}
                onChange={(e) =>
                  handleScoreChange(
                    e,
                    match.id,
                    1,
                    roundScores[match.id]?.team2Points || 0
                  )
                }
                onKeyDown={(e) => handleScoreKeyDown(e, matchIndex * 2)}
              />
              <input
                type="number"
                placeholder="Poeng lag 2"
                ref={(el) => (inputRefs.current[matchIndex * 2 + 1] = el)}
                onChange={(e) =>
                  handleScoreChange(
                    e,
                    match.id,
                    2,
                    roundScores[match.id]?.team1Points || 0
                  )
                }
                onKeyDown={(e) => handleScoreKeyDown(e, matchIndex * 2 + 1)}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MatchList;
