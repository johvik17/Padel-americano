// generateMatches.js
function shuffleArray(array) {
  return array
    .map((v) => ({ value: v, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((obj) => obj.value);
}

/**
 * Bytter ut spillere i leftover med spillere i kamper for å unngå dobbel pause.
 * @param {string[]} leftover - Listen av spillere som ikke fikk plass
 * @param {Set<string>} prevLeftover - Spillerne som var leftover forrige runde
 * @param {Array} matches - Kampene i denne runden
 * @param {number} playersPerMatch - Antall spillere per kamp (2 for 1v1, 4 for 2v2)
 */
function noDoublePauseFix(leftover, prevLeftover, matches, playersPerMatch) {
  // Hvis ingen overlap, ingen problem
  const overlap = leftover.filter((p) => prevLeftover.has(p));
  if (overlap.length === 0) {
    return leftover;
  }

  // Prøv å finne en spiller i kampene som IKKE er i overlap, og bytte med en som ER i overlap
  // for å unngå dobbel pause
  let newLeftover = [...leftover];

  for (const overlappedPlayer of overlap) {
    // Finn en match og en spiller der inne som IKKE er i leftover
    // og bytt plass med overlappedPlayer
    for (const match of matches) {
      // Søk etter en spiller i match.players som ikke er i leftover
      const candidateIndex = match.players.findIndex(
        (mp) => !prevLeftover.has(mp) && !leftover.includes(mp)
      );
      if (candidateIndex !== -1) {
        // Bytt dem
        const candidatePlayer = match.players[candidateIndex];
        // Fjern overlappedPlayer fra leftover
        newLeftover = newLeftover.filter((x) => x !== overlappedPlayer);
        // Legg overlappedPlayer inn i match
        match.players[candidateIndex] = overlappedPlayer;

        // Legg candidatePlayer inn i leftover
        newLeftover.push(candidatePlayer);

        break; // Gå til neste overlappedPlayer
      }
    }
  }

  return newLeftover;
}

/**
 * Prøv å gi alle minst én pause dersom total leftover over alle runder >= antall spillere.
 * Velger bevisst spillere som IKKE har hatt pause før, hvis mulig.
 * @param {string[]} shuffled - alle spillerne (shufflet)
 * @param {Map<string, number>} pauseCount - hvor mange ganger hver spiller har hatt pause
 * @param {number} neededLeftover - hvor mange spillere skal i leftover
 * @param {Set<string>} forcedNoPause - spillere som IKKE får pause (pga dobbel pause sist runde)
 */
function tryGiveEveryonePause(shuffled, pauseCount, neededLeftover, forcedNoPause = new Set()) {
  // Prioriter de som IKKE har pauseCount > 0
  const haventPaused = shuffled.filter(
    (p) => (pauseCount.get(p) || 0) === 0 && !forcedNoPause.has(p)
  );

  // Hvis vi har nok "haventPaused" til å fylle leftover, bruk dem
  let leftover = [];
  if (haventPaused.length >= neededLeftover) {
    leftover = haventPaused.slice(0, neededLeftover);
  } else {
    // Ta først alle som ikke har hatt pause
    leftover = [...haventPaused];
    // Fyll på med andre, men ikke de i forcedNoPause
    const rest = shuffled.filter(
      (p) => !haventPaused.includes(p) && !forcedNoPause.has(p)
    );
    leftover = leftover.concat(rest.slice(0, neededLeftover - leftover.length));
  }

  return leftover;
}

/**
 * Generer runder med:
 *  - Ingen dobbel pause
 *  - Forsøk på å gi alle minst én pause hvis mulig
 */
export function generateRoundsWithConstraints(players, numRounds, matchType, numCourts) {
  if (players.length < 2) {
    throw new Error('Minst to spillere kreves.');
  }
  if (!numCourts || numCourts < 1) {
    throw new Error('Antall baner må være >= 1');
  }

  const teamSize = matchType === 'singel' ? 1 : 2;
  const playersPerMatch = teamSize * 2;

  // Hvor mange spillere får pause hver runde? = totalSpillere - (baner * playersPerMatch) (men ikke < 0)
  // Over alle runder => totalPauser = runder * leftoverPerRunde
  // Hvis totalPauser >= players.length, er det TEORIEN mulig at alle får pause minst én gang.
  const leftoverPerRunde = Math.max(0, players.length - numCourts * playersPerMatch);
  const totalPauser = leftoverPerRunde * numRounds;
  const canAllPause = totalPauser >= players.length;

  let allRounds = [];
  let prevLeftover = new Set();
  let pauseCount = new Map(); // teller hvor mange ganger en spiller har hatt pause

  for (let roundNumber = 1; roundNumber <= numRounds; roundNumber++) {
    // Shufflet liste
    let shuffled = shuffleArray([...players]);

    // Hvor mange kan spille max
    const maxPlayable = Math.min(shuffled.length, playersPerMatch * numCourts);

    // Finn leftover
    let leftover = shuffled.slice(maxPlayable); // default leftover
    let matches = [];

    // Forsøk: Hvis canAllPause => velg leftover bevisst for å gi nye spillere pause
    if (canAllPause && leftoverPerRunde > 0) {
      // Tving bort spillere som hadde pause forrige runde (de skal IKKE i leftover hvis mulig)
      // for å unngå dobbel pause
      // => forcedNoPause
      const forcedNoPause = new Set([...prevLeftover]);

      // Velg leftover bevisst
      const chosenLeftover = tryGiveEveryonePause(shuffled, pauseCount, leftoverPerRunde, forcedNoPause);

      leftover = chosenLeftover;
      // maxPlayable = totalPlayers - leftover.length
      const newMaxPlayable = shuffled.length - leftover.length;
      // spillere som får spille:
      const playablePlayers = shuffled.slice(0); // en kopi
      // Fjern leftover
      leftover.forEach((p) => {
        const idx = playablePlayers.indexOf(p);
        if (idx !== -1) playablePlayers.splice(idx, 1);
      });

      // Opprett kamper fra playablePlayers
      for (let i = 0; i < newMaxPlayable; i += playersPerMatch) {
        const slice = playablePlayers.slice(i, i + playersPerMatch);
        if (slice.length < playersPerMatch) break;

        if (matchType === 'singel') {
          matches.push({
            id: `${roundNumber}-${Math.floor(i / playersPerMatch) + 1}`,
            round: roundNumber,
            players: slice
          });
        } else {
          const team1 = [slice[0], slice[1]];
          const team2 = [slice[2], slice[3]];
          matches.push({
            id: `${roundNumber}-${Math.floor(i / playersPerMatch) + 1}`,
            round: roundNumber,
            players: slice,
            teams: [team1, team2]
          });
        }
      }
    } else {
      // normal fallback
      matches = [];
      for (let i = 0; i < maxPlayable; i += playersPerMatch) {
        const slice = shuffled.slice(i, i + playersPerMatch);
        if (slice.length < playersPerMatch) break;

        if (matchType === 'singel') {
          matches.push({
            id: `${roundNumber}-${Math.floor(i / playersPerMatch) + 1}`,
            round: roundNumber,
            players: slice
          });
        } else {
          const team1 = [slice[0], slice[1]];
          const team2 = [slice[2], slice[3]];
          matches.push({
            id: `${roundNumber}-${Math.floor(i / playersPerMatch) + 1}`,
            round: roundNumber,
            players: slice,
            teams: [team1, team2]
          });
        }
      }
      leftover = shuffled.slice(maxPlayable);
    }

    // 1) Unngå dobbel pause: forsøk å bytte
    let newLeftover = noDoublePauseFix(leftover, prevLeftover, matches, playersPerMatch);

    // Oppdater leftover-liste
    leftover = newLeftover;

    // Oppdater pauseCount
    leftover.forEach((p) => {
      pauseCount.set(p, (pauseCount.get(p) || 0) + 1);
    });

    // Lagre i allRounds
    allRounds.push({
      roundNumber,
      matches,
      leftoverPlayers: leftover
    });

    // Oppdater prevLeftover
    prevLeftover = new Set(leftover);
  }

  return allRounds;
}
