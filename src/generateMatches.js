// generateMatches.js

export function generateRounds(players, numRounds, matchType) {
    const matches = [];
    const totalPlayers = players.length;
  
    if (totalPlayers < 2) {
      alert('Det må være minst to spillere for å generere kamper.');
      return matches;
    }
  
    // Kopier spillerlisten
    let playerList = [...players];
  
    // Hvis antall spillere er oddetall, legg til en "BYE" spiller
    let hasBye = false;
    if (totalPlayers % 2 !== 0) {
      playerList.push('BYE');
      hasBye = true;
    }
  
    const numPlayers = playerList.length;
    const half = numPlayers / 2;
  
    // Generer Round Robin-matrise
    const roundsPerCycle = numPlayers - 1;
    let totalRounds = numRounds;
  
    // Beregn antall nødvendige sykluser
    const cycles = Math.ceil(totalRounds / roundsPerCycle);
  
    let roundNumber = 1;
  
    for (let cycle = 0; cycle < cycles; cycle++) {
      // Opprett en kopi av spillerlisten for denne syklusen
      let cyclePlayers = [...playerList];
  
      for (let round = 0; round < roundsPerCycle; round++) {
        if (roundNumber > totalRounds) break;
  
        const roundMatches = [];
        for (let i = 0; i < half; i++) {
          const player1 = cyclePlayers[i];
          const player2 = cyclePlayers[numPlayers - 1 - i];
  
          if (player1 !== 'BYE' && player2 !== 'BYE') {
            roundMatches.push({
              id: `${roundNumber}-${i}`,
              round: roundNumber,
              players: [player1, player2],
            });
          }
        }
  
        matches.push(...roundMatches);
  
        // Roter spillerlisten
        cyclePlayers = [
          cyclePlayers[0],
          ...cyclePlayers.slice(-1),
          ...cyclePlayers.slice(1, -1),
        ];
  
        roundNumber++;
      }
    }
  
    return matches;
  }
  