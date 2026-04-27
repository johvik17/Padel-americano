const PLAYERS_PER_MATCH = 4;

function shuffleArray(items) {
  return [...items]
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((item) => item.value);
}

function pairKey(a, b) {
  return [a, b].sort((x, y) => x.localeCompare(y)).join('::');
}

function readPairCount(map, players) {
  return map.get(pairKey(players[0], players[1])) || 0;
}

function addPair(map, players) {
  const key = pairKey(players[0], players[1]);
  map.set(key, (map.get(key) || 0) + 1);
}

function createMatch(roundNumber, court, team1, team2) {
  return {
    id: `r${roundNumber}-c${court}`,
    court,
    round: roundNumber,
    teams: [team1, team2],
    players: [...team1, ...team2],
  };
}

function getMaxActivePlayers(players, numCourts) {
  return Math.min(players.length - (players.length % PLAYERS_PER_MATCH), numCourts * PLAYERS_PER_MATCH);
}

function chooseActivePlayers(players, maxActivePlayers, restCounts, previousResting = []) {
  const previousRestingSet = new Set(previousResting);

  return [...players]
    .sort((a, b) => {
      const restDiff = (restCounts[a] || 0) - (restCounts[b] || 0);
      if (restDiff !== 0) return restDiff;

      const previousRestDiff = Number(previousRestingSet.has(a)) - Number(previousRestingSet.has(b));
      if (previousRestDiff !== 0) return previousRestDiff;

      return Math.random() - 0.5;
    })
    .slice(0, maxActivePlayers);
}

function splitAmericanoGroup(group, partnerCounts) {
  const pairings = [
    [[group[0], group[1]], [group[2], group[3]]],
    [[group[0], group[2]], [group[1], group[3]]],
    [[group[0], group[3]], [group[1], group[2]]],
  ];

  return pairings.sort((a, b) => {
    const aScore = readPairCount(partnerCounts, a[0]) + readPairCount(partnerCounts, a[1]);
    const bScore = readPairCount(partnerCounts, b[0]) + readPairCount(partnerCounts, b[1]);
    return aScore - bScore;
  })[0];
}

function splitMexicanoGroup(group) {
  return [
    [group[0], group[3]],
    [group[1], group[2]],
  ];
}

function makeAmericanoRound(players, roundNumber, numCourts, history) {
  const maxActivePlayers = getMaxActivePlayers(players, numCourts);
  if (maxActivePlayers < PLAYERS_PER_MATCH) {
    throw new Error('Du trenger minst fire spillere for padel doubles.');
  }

  const activePlayers = shuffleArray(
    chooseActivePlayers(players, maxActivePlayers, history.restCounts, history.previousResting)
  );
  const restingPlayers = players.filter((player) => !activePlayers.includes(player));

  const matches = [];
  for (let i = 0; i < activePlayers.length; i += PLAYERS_PER_MATCH) {
    const group = activePlayers.slice(i, i + PLAYERS_PER_MATCH);
    const [team1, team2] = splitAmericanoGroup(group, history.partnerCounts);
    matches.push(createMatch(roundNumber, matches.length + 1, team1, team2));

    addPair(history.partnerCounts, team1);
    addPair(history.partnerCounts, team2);
  }

  restingPlayers.forEach((player) => {
    history.restCounts[player] = (history.restCounts[player] || 0) + 1;
  });
  history.previousResting = restingPlayers;

  return {
    roundNumber,
    matches,
    restingPlayers,
  };
}

export function createInitialScores(players) {
  return players.reduce((scores, player) => {
    scores[player] = 0;
    return scores;
  }, {});
}

export function createInitialStats(players) {
  return players.reduce((stats, player) => {
    stats[player] = { played: 0, wins: 0, draws: 0, losses: 0, resting: 0 };
    return stats;
  }, {});
}

export function createScheduleHistory(players) {
  return {
    partnerCounts: new Map(),
    restCounts: players.reduce((counts, player) => {
      counts[player] = 0;
      return counts;
    }, {}),
    previousResting: [],
  };
}

export function generateAmericanoRounds(players, numRounds, numCourts) {
  const history = createScheduleHistory(players);

  return Array.from({ length: numRounds }, (_, index) =>
    makeAmericanoRound(players, index + 1, numCourts, history)
  );
}

export function generateMexicanoRound(players, roundNumber, numCourts, scores, stats) {
  const maxActivePlayers = getMaxActivePlayers(players, numCourts);
  if (maxActivePlayers < PLAYERS_PER_MATCH) {
    throw new Error('Du trenger minst fire spillere for padel doubles.');
  }

  const sortedPlayers = [...players].sort((a, b) => {
    const restDiff = (stats[a]?.resting || 0) - (stats[b]?.resting || 0);
    if (restDiff !== 0 && players.length > maxActivePlayers) return restDiff;

    const scoreDiff = (scores[b] || 0) - (scores[a] || 0);
    if (scoreDiff !== 0) return scoreDiff;

    return a.localeCompare(b);
  });

  const activePlayers = sortedPlayers.slice(0, maxActivePlayers);
  const restingPlayers = sortedPlayers.slice(maxActivePlayers);
  const matches = [];

  for (let i = 0; i < activePlayers.length; i += PLAYERS_PER_MATCH) {
    const group = activePlayers.slice(i, i + PLAYERS_PER_MATCH);
    const [team1, team2] = splitMexicanoGroup(group);
    matches.push(createMatch(roundNumber, matches.length + 1, team1, team2));
  }

  return {
    roundNumber,
    matches,
    restingPlayers,
  };
}

export function calculateRoundResult(round, roundScores, previousScores, previousStats) {
  const scores = { ...previousScores };
  const stats = Object.fromEntries(
    Object.entries(previousStats).map(([player, playerStats]) => [player, { ...playerStats }])
  );

  round.restingPlayers.forEach((player) => {
    stats[player] = stats[player] || { played: 0, wins: 0, draws: 0, losses: 0, resting: 0 };
    stats[player].resting += 1;
  });

  round.matches.forEach((match) => {
    const score = roundScores[match.id] || { team1Points: 0, team2Points: 0 };
    const team1Points = Number(score.team1Points) || 0;
    const team2Points = Number(score.team2Points) || 0;
    const [team1, team2] = match.teams;

    team1.forEach((player) => {
      scores[player] = (scores[player] || 0) + team1Points;
      stats[player] = stats[player] || { played: 0, wins: 0, draws: 0, losses: 0, resting: 0 };
      stats[player].played += 1;
      if (team1Points > team2Points) stats[player].wins += 1;
      else if (team1Points === team2Points) stats[player].draws += 1;
      else stats[player].losses += 1;
    });

    team2.forEach((player) => {
      scores[player] = (scores[player] || 0) + team2Points;
      stats[player] = stats[player] || { played: 0, wins: 0, draws: 0, losses: 0, resting: 0 };
      stats[player].played += 1;
      if (team2Points > team1Points) stats[player].wins += 1;
      else if (team1Points === team2Points) stats[player].draws += 1;
      else stats[player].losses += 1;
    });
  });

  return { scores, stats };
}
