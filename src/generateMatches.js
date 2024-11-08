// generateMatches.js

// Hjelpefunksjon for å shuffle en array
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
  
  export function generateRounds(players, numRounds, matchType) {
    const matches = [];
  
    if (players.length < 2) {
      alert('Det må være minst to spillere for å generere kamper.');
      return matches;
    }
  
    // Kopier spillerlisten
    let playerList = [...players];
  
    // Bestem lagstørrelse basert på matchType
    const teamSize = matchType === 'singel' ? 1 : 2;
  
    // Valider at antall spillere passer for valgt matchType
    const requiredPlayers = teamSize * 2; // Antall spillere per kamp
    if (playerList.length % requiredPlayers !== 0) {
      alert(
        `Antall spillere må være delelig med ${requiredPlayers} for å spille ${teamSize}v${teamSize}-kamper.`
      );
      return matches;
    }
  
    const totalPlayers = playerList.length;
    let roundNumber = 1;
  
    // Generer runder
    for (let round = 0; round < numRounds; round++) {
      let roundMatches = [];
  
      // Shuffle spillerlisten for hver runde for variasjon
      playerList = shuffleArray(playerList);
  
      if (matchType === 'singel') {
        // For 1v1-kamper
        for (let i = 0; i < totalPlayers; i += 2) {
          const player1 = playerList[i];
          const player2 = playerList[i + 1];
  
          roundMatches.push({
            id: `${roundNumber}-${i / 2}`,
            round: roundNumber,
            players: [player1, player2],
          });
        }
      } else {
        // For 2v2-kamper
        for (let i = 0; i < totalPlayers; i += 4) {
          const team1 = [playerList[i], playerList[i + 1]];
          const team2 = [playerList[i + 2], playerList[i + 3]];
  
          roundMatches.push({
            id: `${roundNumber}-${i / 4}`,
            round: roundNumber,
            players: [...team1, ...team2],
            teams: [team1, team2], // Legger til lagene for enklere referanse
          });
        }
      }
  
      matches.push(...roundMatches);
      roundNumber++;
    }
  
    return matches;
  }
  