import { generateId, TACTICAL_FORMATIONS } from './data';

// Selecciona 11 titulares basados estrictamente en el esquema táctico solicitado
export const getAutomaticLineup = (players = [], formationKey = '4-4-2') => {
  if (!players || players.length === 0) return [];
  const formation = (TACTICAL_FORMATIONS && TACTICAL_FORMATIONS[formationKey]) 
    ? TACTICAL_FORMATIONS[formationKey] 
    : { def: 4, med: 4, del: 2 };

  const arqs = players.filter(p => p.pos === 'ARQ');
  const defs = players.filter(p => p.pos === 'DEF');
  const meds = players.filter(p => p.pos === 'MED');
  const dels = players.filter(p => p.pos === 'DEL');

  const chosen = [];
  if (arqs[0]) chosen.push(arqs[0].id);
  chosen.push(...defs.slice(0, formation.def).map(p => p.id));
  chosen.push(...meds.slice(0, formation.med).map(p => p.id));
  chosen.push(...dels.slice(0, formation.del).map(p => p.id));

  // Relleno de emergencia si el plantel no alcanza para la formación exacta
  if (chosen.length < 11) {
    const remaining = players.filter(p => !chosen.includes(p.id));
    chosen.push(...remaining.slice(0, 11 - chosen.length).map(p => p.id));
  }
  return chosen.slice(0, 11);
};

// Duelo táctico: Evalúa ventajas entre esquemas (bonificación por planteo)
export const calculateTacticalModifier = (homeFormationKey = '4-4-2', awayFormationKey = '4-4-2') => {
  const homeF = (TACTICAL_FORMATIONS && TACTICAL_FORMATIONS[homeFormationKey]) || { style: 'balanced', bonusVs: '4-3-3' };
  const awayF = (TACTICAL_FORMATIONS && TACTICAL_FORMATIONS[awayFormationKey]) || { style: 'balanced', bonusVs: '4-3-3' };

  let homeAdvantage = 0;
  let awayAdvantage = 0;

  if (homeF.bonusVs === awayFormationKey) homeAdvantage += 0.12;
  if (awayF.bonusVs === homeFormationKey) awayAdvantage += 0.12;

  if (homeF.style === 'offensive') homeAdvantage += 0.08;
  if (awayF.style === 'counter' && homeF.style === 'offensive') awayAdvantage += 0.15;

  return { homeAdvantage, awayAdvantage };
};

// Tirada de dado con sesgo táctico
export const rollDiceScore = (advantageModifier = 0) => {
  const rand = Math.random() - advantageModifier;
  if (rand < 0.25) return 0;
  if (rand < 0.55) return 1;
  if (rand < 0.80) return 2;
  if (rand < 0.93) return 3;
  if (rand < 0.98) return 4;
  return 5;
};

export const assignProceduralGoalScorers = (teamPlayers, lineupIds, count) => {
  if (!count || count <= 0) return [];
  const activeSquad = teamPlayers.filter(p => lineupIds.includes(p.id));
  if (activeSquad.length === 0) return [];

  const dels = activeSquad.filter(p => p.pos === 'DEL');
  const meds = activeSquad.filter(p => p.pos === 'MED');
  const defs = activeSquad.filter(p => p.pos === 'DEF');

  const pool = [];
  dels.forEach(p => { for (let i = 0; i < 5; i++) pool.push(p); });
  meds.forEach(p => { for (let i = 0; i < 3; i++) pool.push(p); });
  defs.forEach(p => { pool.push(p); });

  const goals = [];
  for (let g = 0; g < count; g++) {
    const scorer = pool[Math.floor(Math.random() * pool.length)] || activeSquad[0];
    const minute = Math.floor(Math.random() * 90) + 1;
    goals.push({
      id: generateId(),
      playerId: scorer.id,
      playerName: scorer.name,
      minute
    });
  }
  return goals.sort((a, b) => a.minute - b.minute);
};

export const resolveEffectiveParticipants = (tournamentId, tournaments, teams, depth = 0) => {
  if (depth > 5) return [];
  const t = tournaments.find(x => x.id === tournamentId);
  if (!t) return [];

  let result = [];
  if (t.participants && t.participants.length > 0) {
    result = [...t.participants];
  }

  tournaments.forEach(sourceT => {
    if (sourceT.id === tournamentId) return;
    const targetsUs = (sourceT.qualifications || []).some(q => q.targetTournamentId === tournamentId);
    if (targetsUs && sourceT.status === 'finished') {
      const sourceSortedIds = calculateTournamentStandings(sourceT, tournaments, teams);
      sourceT.qualifications.forEach(qual => {
        if (qual.targetTournamentId === tournamentId) {
          const start = qual.startPos || 1;
          const end = qual.endPos || 1;
          for (let p = start; p <= end; p++) {
            const teamId = sourceSortedIds[p - 1];
            if (teamId && teamId !== 'TBD' && !result.includes(teamId)) {
              result.push(teamId);
            }
          }
        }
      });
    }
  });

  return result.slice(0, t.numTeams || result.length);
};

export const advanceKnockout = (fixtures) => {
  if (!fixtures) return fixtures;
  const maxRound = Math.max(...fixtures.map(f => f.round));
  const newFixtures = JSON.parse(JSON.stringify(fixtures));

  for (let r = 1; r < maxRound; r++) {
    const roundMatches = newFixtures.filter(f => f.round === r);
    roundMatches.forEach(m => {
      if (m.matchIndex === undefined) return;
      const nextMatchIndex = Math.floor(m.matchIndex / 2);
      const isHome = m.matchIndex % 2 === 0;

      const nextMatch = newFixtures.find(f => f.round === r + 1 && f.matchIndex === nextMatchIndex);
      if (nextMatch) {
        let winner = 'TBD';
        const isBye = (m.home === null && m.away !== null) || (m.away === null && m.home !== null);

        if (isBye) {
          winner = m.home || m.away;
        } else if (m.played) {
          const hs = (Number(m.homeScore) || 0) + (m.legs === 2 ? Number(m.homeScore2) || 0 : 0);
          const as = (Number(m.awayScore) || 0) + (m.legs === 2 ? Number(m.awayScore2) || 0 : 0);
          const hp = Number(m.homePen) || 0;
          const ap = Number(m.awayPen) || 0;

          if (hs + hp > as + ap) winner = m.home;
          else if (as + ap > hs + hp) winner = m.away;
        }

        if (isHome) {
          if (nextMatch.home !== winner) {
            nextMatch.home = winner;
            nextMatch.homeScore = '';
            nextMatch.awayScore = '';
            nextMatch.played = false;
            nextMatch.homeGoals = [];
            nextMatch.awayGoals = [];
          }
        } else {
          if (nextMatch.away !== winner) {
            nextMatch.away = winner;
            nextMatch.homeScore = '';
            nextMatch.awayScore = '';
            nextMatch.played = false;
            nextMatch.homeGoals = [];
            nextMatch.awayGoals = [];
          }
        }
      }
    });
  }
  return newFixtures;
};

export const generateRoundRobinFixtures = (teamIds, legs = 1) => {
  const teams = [...teamIds];
  if (teams.length % 2 !== 0) teams.push('TBD');
  const numDays = teams.length - 1;
  const halfSize = teams.length / 2;
  const matches = [];
  const currentTeams = [...teams];

  for (let day = 0; day < numDays; day++) {
    for (let i = 0; i < halfSize; i++) {
      const t1 = currentTeams[i];
      const t2 = currentTeams[teams.length - 1 - i];
      if (t1 !== 'TBD' && t2 !== 'TBD') {
        matches.push({
          id: generateId(),
          round: day + 1,
          home: t1,
          away: t2,
          homeScore: '',
          awayScore: '',
          homeGoals: [],
          awayGoals: [],
          played: false
        });
      }
    }
    currentTeams.splice(1, 0, currentTeams.pop());
  }

  if (legs === 2) {
    const secondLegMatches = matches.map(m => ({
      id: generateId(),
      round: m.round + numDays,
      home: m.away,
      away: m.home,
      homeScore: '',
      awayScore: '',
      homeGoals: [],
      awayGoals: [],
      played: false
    }));
    return [...matches, ...secondLegMatches];
  }
  return matches;
};

export const generateFixtures = (tournament, effectiveIds) => {
  const legs = tournament.legs || 1;

  if (tournament.format === 'league') {
    return generateRoundRobinFixtures(effectiveIds, legs);
  }

  if (tournament.format === 'groups') {
    const numGroups = tournament.numGroups || 2;
    const groups = Array.from({ length: numGroups }, () => []);
    effectiveIds.forEach((id, idx) => {
      const groupIdx = tournament.drawType === 'manual'
        ? (tournament.manualPlacements?.[id] ?? -1)
        : (idx % numGroups);
      if (groupIdx >= 0 && groupIdx < numGroups) groups[groupIdx].push(id);
    });

    let allMatches = [];
    groups.forEach((gTeams, gIdx) => {
      const gMatches = generateRoundRobinFixtures(gTeams, legs).map(m => ({ ...m, group: gIdx }));
      allMatches = [...allMatches, ...gMatches];
    });
    return allMatches;
  }

  if (tournament.format === 'knockout') {
    const teams = [...effectiveIds];
    const capacity = tournament.numTeams || Math.max(2, teams.length);
    let numRounds = 0;
    while (Math.pow(2, numRounds) < Math.max(2, capacity)) numRounds++;
    const totalSlots = Math.pow(2, numRounds);
    const actualByes = totalSlots - capacity;

    const participantList = [...teams];
    while (participantList.length < capacity) participantList.push('TBD');

    const paddedTeams = [];
    let byesToAdd = actualByes;
    let tIndex = 0;

    for (let i = 0; i < totalSlots; i += 2) {
      if (byesToAdd > 0) {
        paddedTeams.push(participantList[tIndex] || 'TBD');
        tIndex++;
        paddedTeams.push(null);
        byesToAdd--;
      } else {
        paddedTeams.push(participantList[tIndex] || 'TBD');
        tIndex++;
        paddedTeams.push(participantList[tIndex] || 'TBD');
        tIndex++;
      }
    }

    const matches = [];
    let roundTeams = paddedTeams;

    for (let r = 1; r <= numRounds; r++) {
      const nextRoundTeams = [];
      for (let i = 0; i < roundTeams.length; i += 2) {
        matches.push({
          id: generateId(),
          round: r,
          matchIndex: i / 2,
          home: roundTeams[i],
          away: roundTeams[i + 1],
          homeScore: '',
          awayScore: '',
          homeGoals: [],
          awayGoals: [],
          played: false,
          isKnockout: true,
          legs
        });
        nextRoundTeams.push('TBD');
      }
      roundTeams = nextRoundTeams;
    }
    return advanceKnockout(matches) || [];
  }

  return [];
};

export const calculateTournamentStandings = (tournament, tournaments, teams) => {
  const effectiveIds = resolveEffectiveParticipants(tournament.id, tournaments, teams);

  if (tournament.format === 'knockout') {
    if (!tournament.fixtures) return effectiveIds;
    const maxRound = Math.max(...tournament.fixtures.map(f => f.round), 1);
    const ranked = [];

    for (let r = maxRound; r >= 1; r--) {
      const roundMatches = tournament.fixtures.filter(f => f.round === r);
      const roundWinners = [];
      const roundLosers = [];

      roundMatches.forEach(m => {
        if (!m.home || !m.away) return;
        const hs = (Number(m.homeScore) || 0) + (m.legs === 2 ? Number(m.homeScore2) || 0 : 0);
        const as = (Number(m.awayScore) || 0) + (m.legs === 2 ? Number(m.awayScore2) || 0 : 0);
        const hp = Number(m.homePen) || 0;
        const ap = Number(m.awayPen) || 0;

        if (hs + hp > as + ap) { roundWinners.push(m.home); roundLosers.push(m.away); }
        else if (as + ap > hs + hp) { roundWinners.push(m.away); roundLosers.push(m.home); }
        else if (m.played) { roundWinners.push(m.home); roundLosers.push(m.away); }
      });

      if (r === maxRound) roundWinners.forEach(id => { if (!ranked.includes(id)) ranked.push(id); });
      roundLosers.forEach(id => { if (!ranked.includes(id)) ranked.push(id); });
    }

    const missing = effectiveIds.filter(id => !ranked.includes(id) && id !== 'TBD');
    return [...ranked, ...missing];
  }

  const stats = {};
  effectiveIds.forEach(id => {
    if (id !== 'TBD') {
      const t = teams.find(x => x.id === id);
      if (t) stats[id] = { id, pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, group: -1 };
    }
  });

  if (tournament.format === 'groups') {
    const numGroups = tournament.numGroups || 2;
    effectiveIds.filter(id => id !== 'TBD').forEach((id, idx) => {
      const groupIdx = tournament.drawType === 'manual'
        ? (tournament.manualPlacements?.[id] ?? -1)
        : (idx % numGroups);
      if (stats[id]) stats[id].group = groupIdx;
    });
  }

  if (tournament.fixtures) {
    tournament.fixtures.forEach(m => {
      if (m.played && m.home && m.away && stats[m.home] && stats[m.away]) {
        const hScore = Number(m.homeScore) || 0;
        const aScore = Number(m.awayScore) || 0;

        stats[m.home].pj++;
        stats[m.away].pj++;
        stats[m.home].gf += hScore;
        stats[m.away].gf += aScore;
        stats[m.home].gc += aScore;
        stats[m.home].gc += hScore;

        if (hScore > aScore) {
          stats[m.home].pg++;
          stats[m.away].pp++;
          stats[m.home].pts += tournament.winPoints ?? 3;
          stats[m.away].pts += tournament.losePoints ?? 0;
        } else if (hScore < aScore) {
          stats[m.away].pg++;
          stats[m.home].pp++;
          stats[m.away].pts += tournament.winPoints ?? 3;
          stats[m.home].pts += tournament.losePoints ?? 0;
        } else {
          stats[m.home].pe++;
          stats[m.away].pe++;
          stats[m.home].pts += tournament.drawPoints ?? 1;
          stats[m.away].pts += tournament.drawPoints ?? 1;
        }
      }
    });
  }

  const sorter = (a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const diffA = a.gf - a.gc;
    const diffB = b.gf - b.gc;
    if (diffB !== diffA) return diffB - diffA;
    return b.gf - a.gf;
  };

  if (tournament.format === 'groups') {
    const numGroups = tournament.numGroups || 2;
    const groups = Array.from({ length: numGroups }, () => []);
    Object.values(stats).forEach(team => {
      if (team.group >= 0 && team.group < numGroups) groups[team.group].push(team);
    });
    groups.forEach(g => g.sort(sorter));

    const interleaved = [];
    const maxSize = Math.max(...groups.map(g => g.length), 0);
    for (let i = 0; i < maxSize; i++) {
      for (let j = 0; j < numGroups; j++) {
        if (groups[j] && groups[j][i]) interleaved.push(groups[j][i].id);
      }
    }
    return interleaved;
  }

  return Object.values(stats).sort(sorter).map(t => t.id);
};