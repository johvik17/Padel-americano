// generateMatches.js

export const generateRounds = (players, numRounds, matchType) => {
    if (!players || players.length === 0 || !numRounds || numRounds < 1) {
      return null;
    }
  
    const totalPlayers = players.length;
  
    if (matchType === 'singel' && totalPlayers < 2) {
      alert('Du må ha minst to spillere for å generere singelkamper.');
      return null;
    } else if (matchType === 'dobbel' && totalPlayers < 4) {
      alert('Du må ha minst fire spillere for å generere dobbeltkamper.');
      return null;
    }
  
    let newMatches = [];
    let matchId = 0;
  
    const getAllTeams = (players) => {
      const teams = [];
      for (let i = 0; i < players.length - 1; i++) {
        for (let j = i + 1; j < players.length; j++) {
          teams.push([players[i], players[j]]);
        }
      }
      return teams;
    };
  
    if (matchType === 'dobbel') {
      // Generer alle mulige lagkombinasjoner
      const teams = getAllTeams(players);
  
      // Generer alle mulige kamper mellom lag som ikke deler spillere
      const possibleMatches = [];
      for (let i = 0; i < teams.length - 1; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          const team1 = teams[i];
          const team2 = teams[j];
          const allPlayers = [...team1, ...team2];
          const uniquePlayers = new Set(allPlayers);
          if (uniquePlayers.size === 4) {
            possibleMatches.push({
              team1,
              team2,
            });
          }
        }
      }
  
      // Bland kampene for å randomisere
      const shuffledMatches = possibleMatches.sort(() => Math.random() - 0.5);
  
      // Initialiser runder
      const rounds = Array.from({ length: numRounds }, () => []);
  
      // Spor tilgjengelighet av spillere per runde
      const playerAvailability = {};
      players.forEach((player) => {
        playerAvailability[player] = Array(numRounds).fill(true);
      });
  
      // Planlegg kamper uten at spillere spiller mer enn én gang per runde
      for (let match of shuffledMatches) {
        for (let roundIndex = 0; roundIndex < numRounds; roundIndex++) {
          const team1Available = match.team1.every((player) => playerAvailability[player][roundIndex]);
          const team2Available = match.team2.every((player) => playerAvailability[player][roundIndex]);
  
          if (team1Available && team2Available) {
            // Legg til kampen i denne runden
            rounds[roundIndex].push({
              id: matchId++,
              players: [...match.team1, ...match.team2],
              round: roundIndex + 1,
            });
  
            // Oppdater tilgjengeligheten til spillerne
            match.team1.forEach((player) => (playerAvailability[player][roundIndex] = false));
            match.team2.forEach((player) => (playerAvailability[player][roundIndex] = false));
            break; // Gå videre til neste kamp
          }
        }
      }
  
      // Samle alle kampene
      newMatches = rounds.flat();
    } else if (matchType === 'singel') {
      // Generer alle mulige spillerpar
      const playerPairs = [];
      for (let i = 0; i < totalPlayers - 1; i++) {
        for (let j = i + 1; j < totalPlayers; j++) {
          playerPairs.push([players[i], players[j]]);
        }
      }
  
      // Bland parene for å randomisere
      const shuffledPairs = playerPairs.sort(() => Math.random() - 0.5);
  
      // Initialiser runder
      const rounds = Array.from({ length: numRounds }, () => []);
  
      // Spor tilgjengelighet av spillere per runde
      const playerAvailability = {};
      players.forEach((player) => {
        playerAvailability[player] = Array(numRounds).fill(true);
      });
  
      // Planlegg kamper uten at spillere spiller mer enn én gang per runde
      for (let pair of shuffledPairs) {
        for (let roundIndex = 0; roundIndex < numRounds; roundIndex++) {
          if (playerAvailability[pair[0]][roundIndex] && playerAvailability[pair[1]][roundIndex]) {
            // Legg til kampen i denne runden
            rounds[roundIndex].push({
              id: matchId++,
              players: pair,
              round: roundIndex + 1,
            });
  
            // Oppdater tilgjengeligheten til spillerne
            playerAvailability[pair[0]][roundIndex] = false;
            playerAvailability[pair[1]][roundIndex] = false;
            break; // Gå videre til neste par
          }
        }
      }
  
      // Samle alle kampene
      newMatches = rounds.flat();
    }
  
    return newMatches;
  };
  