import { generateId, TACTICAL_FORMATIONS } from './data';

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

  if (chosen.length < 11) {
    const remaining = players.filter(p => !chosen.includes(p.id));
    chosen.push(...remaining.slice(0, 11 - chosen.length).map(p => p.id));
  }
  return chosen.slice(0, 11);
};

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

export const rollDiceScore = (advantageModifier = 0) => {
  const rand = Math.random() - advantageModifier;
  if (rand < 0.28) return 0;
  if (rand < 0.58) return 1;
  if (rand < 0.82) return 2;
  if (rand < 0.94) return 3;
  return Math.floor(Math.random() * 3) + 4;
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

export const getGroupDetailedStandings = (tournament, teams, allTournaments = []) => {
  const numGroups = parseInt(tournament.numGroups) || 2;
  const rawParticipants = tournament.participants || [];
  
  // 1. Resolver los slots a equipos reales si ya se conocen
  const effectiveIds = rawParticipants.map(id => {
    if (id && id.startsWith('SLOT:')) {
      return resolveSlotTeamId(id, allTournaments, teams);
    }
    return id;
  });
  
  const stats = {};
  effectiveIds.forEach(id => {
    if (id && id !== 'TBD') {
      stats[id] = { id, pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, group: -1 };
    }
  });

  effectiveIds.filter(id => id && id !== 'TBD').forEach((id, idx) => {
    // Si hubo sorteo manual, buscar por el ID resuelto o por el slot original
    const rawId = rawParticipants[idx];
    let groupIdx = tournament.drawType === 'manual' 
      ? (tournament.manualPlacements?.[id] ?? tournament.manualPlacements?.[rawId] ?? -1) 
      : (idx % numGroups);
      
    if (groupIdx === -1) groupIdx = idx % numGroups;
    if (stats[id]) stats[id].group = parseInt(groupIdx);
  });

  (tournament.fixtures || []).forEach(m => {
    if (m.played && !m.isPlayoff) {
      // Normalizar en caliente los IDs de los partidos jugados si venían de slots
      const hId = (m.home && m.home.startsWith('SLOT:')) ? resolveSlotTeamId(m.home, allTournaments, teams) : m.home;
      const aId = (m.away && m.away.startsWith('SLOT:')) ? resolveSlotTeamId(m.away, allTournaments, teams) : m.away;

      if (stats[hId] && stats[aId]) {
        const hs = parseInt(m.homeScore) || 0;
        const as = parseInt(m.awayScore) || 0;
        stats[hId].pj++; stats[aId].pj++;
        stats[hId].gf += hs; stats[aId].gf += as;
        stats[hId].gc += as; stats[aId].gc += hs;

        if (hs > as) {
          stats[hId].pg++; stats[aId].pp++;
          stats[hId].pts += parseInt(tournament.winPoints) || 3;
          stats[aId].pts += parseInt(tournament.losePoints) || 0;
        } else if (hs < as) {
          stats[aId].pg++; stats[hId].pp++;
          stats[aId].pts += parseInt(tournament.winPoints) || 3;
          stats[hId].pts += parseInt(tournament.losePoints) || 0;
        } else {
          stats[hId].pe++; stats[aId].pe++;
          stats[hId].pts += parseInt(tournament.drawPoints) || 1;
          stats[aId].pts += parseInt(tournament.drawPoints) || 1;
        }
      }
    }
  });

  const sorter = (a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const diffA = a.gf - a.gc;
    const diffB = b.gf - b.gc;
    if (diffB !== diffA) return diffB - diffA;
    return b.gf - a.gf;
  };

  const groups = Array.from({ length: numGroups }, () => []);
  Object.values(stats).forEach(t => {
    if (t.group >= 0 && t.group < numGroups) {
      groups[t.group].push(t);
    }
  });
  groups.forEach(g => g.sort(sorter));

  return groups;
};

// Obtiene los campeones de cada ruta/subllave independiente
export const getKnockoutPathWinners = (tournament) => {
  if (!tournament.fixtures || tournament.fixtures.length === 0) return {};
  const paths = {};
  tournament.fixtures.forEach(m => {
    const pIdx = m.pathIndex ?? 0;
    if (!paths[pIdx]) paths[pIdx] = [];
    paths[pIdx].push(m);
  });

  const winnersByPath = {};
  Object.entries(paths).forEach(([pIdx, fList]) => {
    const maxRound = Math.max(...fList.map(m => m.round));
    const finalMatch = fList.find(m => m.round === maxRound);
    if (finalMatch && finalMatch.played) {
      const hs = (parseInt(finalMatch.homeScore) || 0) + (finalMatch.legs === 2 ? (parseInt(finalMatch.homeScore2) || 0) : 0);
      const as = (parseInt(finalMatch.awayScore) || 0) + (finalMatch.legs === 2 ? (parseInt(finalMatch.awayScore2) || 0) : 0);
      const hp = parseInt(finalMatch.homePen) || 0;
      const ap = parseInt(finalMatch.awayPen) || 0;
      if (hs + hp > as + ap) winnersByPath[pIdx] = finalMatch.home;
      else if (as + ap > hs + hp) winnersByPath[pIdx] = finalMatch.away;
    }
  });
  return winnersByPath;
};

export const detectIncomingSlots = (targetTournamentId, allTournaments) => {
  const detected = [];
  allTournaments.forEach(src => {
    if (src.id === targetTournamentId) return;
    (src.qualifications || []).forEach((q) => {
      if (q.targetTournamentId === targetTournamentId) {
        if (src.format === 'knockout') {
          if (q.type === 'path_winner') {
            const pIdx = parseInt(q.pathIndex) || 0;
            const pLetter = String.fromCharCode(65 + pIdx);
            detected.push({
              slotId: `SLOT:${src.id}:path_winner:${pIdx}`,
              sourceTournamentId: src.id,
              sourceName: src.name,
              sourceFormat: src.format,
              type: 'path_winner',
              pathIndex: pIdx,
              label: `${src.name} - Ganador Ruta ${pLetter}`
            });
          } else {
            const start = parseInt(q.startPos) || 1;
            const end = parseInt(q.endPos) || start;
            for (let p = start; p <= end; p++) {
              detected.push({
                slotId: `SLOT:${src.id}:pos:${p}`,
                sourceTournamentId: src.id,
                sourceName: src.name,
                sourceFormat: src.format,
                type: 'pos',
                pos: p,
                label: `${src.name} - ${p}º Puesto`
              });
            }
          }
        } else if (src.format === 'groups') {
          if (q.type === 'best_thirds') {
            const count = parseInt(q.count) || 1;
            for (let c = 1; c <= count; c++) {
              detected.push({
                slotId: `SLOT:${src.id}:best_thirds:${c}`,
                sourceTournamentId: src.id,
                sourceName: src.name,
                sourceFormat: src.format,
                type: 'best_thirds',
                rankIndex: c - 1,
                label: `${src.name} - ${c}º Mejor 3º`
              });
            }
          } else if (q.type === 'group_pos') {
            const gIdx = parseInt(q.groupSpecific) || 0;
            const pos = parseInt(q.groupPos) || 1;
            const gLetter = String.fromCharCode(65 + gIdx);
            detected.push({
              slotId: `SLOT:${src.id}:group_pos:${gIdx}:${pos}`,
              sourceTournamentId: src.id,
              sourceName: src.name,
              sourceFormat: src.format,
              type: 'group_pos',
              groupIndex: gIdx,
              pos,
              label: `${src.name} - ${pos}º Grp ${gLetter}`
            });
          } else {
            const start = parseInt(q.startPos) || 1;
            const end = parseInt(q.endPos) || start;
            for (let p = start; p <= end; p++) {
              detected.push({
                slotId: `SLOT:${src.id}:range:${p}`,
                sourceTournamentId: src.id,
                sourceName: src.name,
                sourceFormat: src.format,
                type: 'range',
                pos: p,
                label: `${src.name} - ${p}º Puesto`
              });
            }
          }
        } else {
          const start = parseInt(q.startPos) || 1;
          const end = parseInt(q.endPos) || start;
          for (let p = start; p <= end; p++) {
            detected.push({
              slotId: `SLOT:${src.id}:pos:${p}`,
              sourceTournamentId: src.id,
              sourceName: src.name,
              sourceFormat: src.format,
              type: 'pos',
              pos: p,
              label: `${src.name} - ${p}º Puesto`
            });
          }
        }
      }
    });
  });
  return detected;
};

export const resolveSlotTeamId = (slotId, allTournaments, teams) => {
  if (!slotId || !slotId.startsWith('SLOT:')) return slotId;
  const parts = slotId.split(':');
  const srcId = parts[1];
  const type = parts[2];
  const srcTournament = allTournaments.find(t => t.id === srcId);
  if (!srcTournament || srcTournament.status !== 'finished') return slotId;

  if (srcTournament.format === 'knockout' && type === 'path_winner') {
    const pIdx = parseInt(parts[3]) || 0;
    const pathWinners = getKnockoutPathWinners(srcTournament);
    return pathWinners[pIdx] || slotId;
  }

  if (srcTournament.format === 'groups') {
    const groups = getGroupDetailedStandings(srcTournament, teams);
    if (type === 'best_thirds') {
      const rankIdx = parseInt(parts[3]) - 1;
      const thirds = groups.map(g => g[2]).filter(Boolean);
      thirds.sort((a,b) => b.pts !== a.pts ? b.pts - a.pts : (b.gf-b.gc) - (a.gf-a.gc));
      return thirds[rankIdx]?.id || slotId;
    }
    if (type === 'group_pos') {
      const gIdx = parseInt(parts[3]);
      const posIdx = parseInt(parts[4]) - 1;
      return groups[gIdx]?.[posIdx]?.id || slotId;
    }
  }

  const sorted = calculateTournamentStandings(srcTournament, allTournaments, teams);
  const pos = parseInt(parts[3]) || 1;
  return sorted[pos - 1] || slotId;
};

export const resolveEffectiveParticipants = (tournamentId, tournaments, teams) => {
  const t = tournaments.find(x => x.id === tournamentId);
  if (!t) return [];

  const slots = detectIncomingSlots(tournamentId, tournaments);
  const currentParticipants = t.participants || [];

  const combined = [...currentParticipants];
  slots.forEach(s => {
    if (!combined.includes(s.slotId)) {
      const resolvedReal = resolveSlotTeamId(s.slotId, tournaments, teams);
      if (!combined.includes(resolvedReal)) {
        combined.push(s.slotId);
      }
    }
  });

  const finalResolved = combined.map(id => resolveSlotTeamId(id, tournaments, teams));
  const limit = parseInt(t.numTeams) || finalResolved.length;
  return finalResolved.slice(0, limit);
};

export const advanceKnockout = (fixtures) => {
  if (!fixtures) return fixtures;
  let newFixtures = JSON.parse(JSON.stringify(fixtures));
  
  // Agrupar por subcuadro/ruta
  const pathIndexes = Array.from(new Set(newFixtures.map(f => f.pathIndex ?? 0)));

  pathIndexes.forEach(pIdx => {
    const pathMatches = newFixtures.filter(f => (f.pathIndex ?? 0) === pIdx);
    const maxRound = Math.max(...pathMatches.map(f => f.round));

    for (let r = 1; r < maxRound; r++) {
      const roundMatches = pathMatches.filter(f => f.round === r);
      roundMatches.forEach(m => {
        const nextMatchIndex = Math.floor(m.matchIndex / 2);
        const isHome = m.matchIndex % 2 === 0;

        const nextMatch = newFixtures.find(f => (f.pathIndex ?? 0) === pIdx && f.round === r + 1 && f.matchIndex === nextMatchIndex);
        if (nextMatch) {
          let winner = 'TBD';
          const isBye = (m.home === null && m.away !== null) || (m.away === null && m.home !== null);

          if (isBye) {
            winner = m.home || m.away;
          } else if (m.played) {
            const hs = (parseInt(m.homeScore) || 0) + (m.legs === 2 ? (parseInt(m.homeScore2) || 0) : 0);
            const as = (parseInt(m.awayScore) || 0) + (m.legs === 2 ? (parseInt(m.awayScore2) || 0) : 0);
            const hp = parseInt(m.homePen) || 0;
            const ap = parseInt(m.awayPen) || 0;

            if (hs + hp > as + ap) winner = m.home;
            else if (as + ap > hs + hp) winner = m.away;
          }

          if (isHome) {
            if (nextMatch.home !== winner) {
              nextMatch.home = winner;
              nextMatch.homeScore = ''; nextMatch.awayScore = ''; nextMatch.played = false;
              nextMatch.homeScore2 = ''; nextMatch.awayScore2 = '';
              nextMatch.homePen = ''; nextMatch.awayPen = '';
              nextMatch.homeGoals = []; nextMatch.awayGoals = [];
            }
          } else {
            if (nextMatch.away !== winner) {
              nextMatch.away = winner;
              nextMatch.homeScore = ''; nextMatch.awayScore = ''; nextMatch.played = false;
              nextMatch.homeScore2 = ''; nextMatch.awayScore2 = '';
              nextMatch.homePen = ''; nextMatch.awayPen = '';
              nextMatch.homeGoals = []; nextMatch.awayGoals = [];
            }
          }
        }
      });
    }
  });

  return newFixtures;
};

export const generateRoundRobinFixtures = (teamIds = [], legs = 1) => {
  let pool = [...teamIds];
  
  // Si la cantidad de equipos es impar, se añade un comodín de descanso
  if (pool.length % 2 !== 0) {
    pool.push('TBD');
  }

  const n = pool.length;
  const roundsCount = n - 1;
  const matchesPerRound = n / 2;
  const matches = [];

  // Algoritmo Round Robin canónico con pivote fijo en la posición 0
  for (let round = 0; round < roundsCount; round++) {
    for (let match = 0; match < matchesPerRound; match++) {
      const homeIdx = (round + match) % (n - 1);
      let awayIdx = (n - 1 - match + round) % (n - 1);

      // El último elemento actúa como rival del pivote
      if (match === 0) {
        awayIdx = n - 1;
      }

      const home = pool[homeIdx];
      const away = pool[awayIdx];

      // Omitir si alguno es descanso o nulo
      if (home && away && home !== 'TBD' && away !== 'TBD') {
        // Alternar localía para equilibrar local y visitante
        const isAlternate = (round % 2 === 1 && match === 0);
        matches.push({
          id: generateId(),
          round: round + 1,
          home: isAlternate ? away : home,
          away: isAlternate ? home : away,
          homeScore: '',
          awayScore: '',
          homeGoals: [],
          awayGoals: [],
          played: false
        });
      }
    }
  }

  // Generación de segunda rueda (Ida y Vuelta) si aplica
  if (legs === 2) {
    const secondLegMatches = matches.map(m => ({
      id: generateId(),
      round: m.round + roundsCount,
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

export const generateGroupPlayoffs = (tournament, groups) => {
  const advancingPerGroup = parseInt(tournament.advancingPerGroup) || 2;
  const numGroups = groups.length;
  let seededPairs = [];

  if (advancingPerGroup === 2) {
    const topHalf = [];
    const bottomHalf = [];

    // Separar los cruces alternados en dos mitades del cuadro
    for (let g = 0; g < numGroups; g += 2) {
      const g1 = groups[g] || [];
      const g2 = groups[g + 1] || groups[0] || [];

      const firstG1 = g1[0]?.id || 'TBD';
      const secondG2 = g2[1]?.id || 'TBD';
      const firstG2 = g2[0]?.id || 'TBD';
      const secondG1 = g1[1]?.id || 'TBD';

      // 1ºA vs 2ºB va a la mitad superior
      topHalf.push(firstG1, secondG2);
      // 1ºB vs 2ºA va a la mitad inferior
      bottomHalf.push(firstG2, secondG1);
    }

    // El cuadro final une primero toda la mitad superior y luego toda la mitad inferior
    seededPairs = [...topHalf, ...bottomHalf];
  } else {
    const firsts = [];
    const rest = [];
    groups.forEach(g => {
      if (g[0]) firsts.push(g[0].id);
      for (let p = 1; p < advancingPerGroup; p++) {
        if (g[p]) rest.push(g[p].id);
      }
    });

    rest.reverse();
    const half = Math.ceil(firsts.length / 2);
    const topHalf = [];
    const bottomHalf = [];

    for (let i = 0; i < half; i++) {
      if (firsts[i]) topHalf.push(firsts[i], rest[i] || 'TBD');
    }
    for (let i = half; i < firsts.length; i++) {
      if (firsts[i]) bottomHalf.push(firsts[i], rest[i] || 'TBD');
    }

    seededPairs = [...topHalf, ...bottomHalf];
  }

  const playoffCapacity = seededPairs.length;
  let numRounds = 0;
  while (Math.pow(2, numRounds) < Math.max(2, playoffCapacity)) numRounds++;
  const totalSlots = Math.pow(2, numRounds);

  while (seededPairs.length < totalSlots) seededPairs.push('TBD');

  const regularLegs = parseInt(tournament.playoffLegs) || 1;
  const finalLegs = parseInt(tournament.finalLegs) || regularLegs;

  const matches = [];
  let roundTeams = seededPairs;

  for (let r = 1; r <= numRounds; r++) {
    const isFinalRound = (r === numRounds);
    const roundLegs = isFinalRound ? finalLegs : regularLegs;
    const nextRoundTeams = [];

    for (let i = 0; i < roundTeams.length; i += 2) {
      matches.push({
        id: generateId(),
        round: r,
        pathIndex: 0,
        matchIndex: i / 2,
        home: roundTeams[i],
        away: roundTeams[i + 1],
        homeScore: '',
        awayScore: '',
        homeScore2: '',
        awayScore2: '',
        homePen: '',
        awayPen: '',
        homeGoals: [],
        awayGoals: [],
        played: false,
        isKnockout: true,
        isPlayoff: true,
        legs: roundLegs
      });
      nextRoundTeams.push('TBD');
    }
    roundTeams = nextRoundTeams;
  }

  return advanceKnockout(matches) || [];
};

export const generateFixtures = (tournament, effectiveIds) => {
  const regularLegs = parseInt(tournament.legs) || 1;
  const finalLegs = parseInt(tournament.finalLegs) || regularLegs;

  if (tournament.format === 'league') {
    return generateRoundRobinFixtures(effectiveIds, regularLegs);
  }

  if (tournament.format === 'groups') {
    const numGroups = parseInt(tournament.numGroups) || 2;
    const groups = Array.from({ length: numGroups }, () => []);

    effectiveIds.forEach((id, idx) => {
      let groupIdx = tournament.drawType === 'manual'
        ? (tournament.manualPlacements?.[id] ?? -1)
        : (idx % numGroups);
      if (groupIdx === -1) groupIdx = idx % numGroups;
      if (groupIdx >= 0 && groupIdx < numGroups) {
        groups[parseInt(groupIdx)].push(id);
      }
    });

    let allMatches = [];
    groups.forEach((gTeams, gIdx) => {
      const gMatches = generateRoundRobinFixtures(gTeams, regularLegs).map(m => ({
        ...m,
        group: gIdx,
        isPlayoff: false
      }));
      allMatches = [...allMatches, ...gMatches];
    });

    // Ordenar de modo que todos los partidos de la Fecha 1 (de todos los grupos) queden contiguos
    allMatches.sort((a, b) => {
      if (a.round !== b.round) return a.round - b.round;
      return (a.group ?? 0) - (b.group ?? 0);
    });

    return allMatches;
  }

  if (tournament.format === 'knockout') {
    let teams = [...effectiveIds];
    if (tournament.drawType === 'manual' && tournament.manualKnockout) {
      teams = tournament.manualKnockout;
    }

    const totalTeams = parseInt(tournament.numTeams) || Math.max(2, teams.length);
    const numPaths = parseInt(tournament.numPaths) || 1;
    const teamsPerPath = Math.max(2, Math.floor(totalTeams / numPaths));

    let numRounds = 0;
    while (Math.pow(2, numRounds) < teamsPerPath) {
      numRounds++;
    }
    const slotsPerPath = Math.pow(2, numRounds);

    let allMatches = [];

    // Generar cada subcuadro/ruta de forma independiente
    for (let p = 0; p < numPaths; p++) {
      const pathTeamSlice = teams.slice(p * teamsPerPath, (p + 1) * teamsPerPath);
      const participantList = [];
      for (let i = 0; i < slotsPerPath; i++) {
        participantList.push(pathTeamSlice[i] || 'TBD');
      }

      let roundTeams = participantList;
      for (let r = 1; r <= numRounds; r++) {
        const isFinalRound = (r === numRounds);
        const roundLegs = isFinalRound ? finalLegs : regularLegs;
        const nextRoundTeams = [];

        for (let i = 0; i < roundTeams.length; i += 2) {
          allMatches.push({
            id: generateId(),
            pathIndex: p,
            round: r,
            matchIndex: i / 2,
            home: roundTeams[i],
            away: roundTeams[i + 1],
            homeScore: '',
            awayScore: '',
            homeScore2: '',
            awayScore2: '',
            homePen: '',
            awayPen: '',
            homeGoals: [],
            awayGoals: [],
            played: false,
            isKnockout: true,
            legs: roundLegs
          });
          nextRoundTeams.push('TBD');
        }
        roundTeams = nextRoundTeams;
      }
    }

    return advanceKnockout(allMatches) || [];
  }
  return [];
};

export const calculateTournamentStandings = (tournament, tournaments, teams) => {
  const effectiveIds = resolveEffectiveParticipants(tournament.id, tournaments, teams);

  if (tournament.format === 'knockout') {
    if (!tournament.fixtures) return effectiveIds;
    const ranked = [];
    const numPaths = parseInt(tournament.numPaths) || 1;

    for (let p = 0; p < numPaths; p++) {
      const pMatches = tournament.fixtures.filter(m => (m.pathIndex ?? 0) === p);
      if (pMatches.length === 0) continue;
      const maxRound = Math.max(...pMatches.map(f => f.round));

      for (let r = maxRound; r >= 1; r--) {
        const roundMatches = pMatches.filter(f => f.round === r);
        const roundWinners = [];
        const roundLosers = [];

        roundMatches.forEach(m => {
          const hs = (parseInt(m.homeScore) || 0) + (m.legs === 2 ? (parseInt(m.homeScore2) || 0) : 0);
          const as = (parseInt(m.awayScore) || 0) + (m.legs === 2 ? (parseInt(m.awayScore2) || 0) : 0);
          const hp = parseInt(m.homePen) || 0;
          const ap = parseInt(m.awayPen) || 0;

          if (hs + hp > as + ap) { roundWinners.push(m.home); roundLosers.push(m.away); }
          else if (as + ap > hs + hp) { roundWinners.push(m.away); roundLosers.push(m.home); }
          else if (m.played) { roundWinners.push(m.home); roundLosers.push(m.away); }
        });

        if (r === maxRound) roundWinners.forEach(id => { if (!ranked.includes(id)) ranked.push(id); });
        roundLosers.forEach(id => { if (!ranked.includes(id)) ranked.push(id); });
      }
    }

    const missing = effectiveIds.filter(id => !ranked.includes(id) && id !== 'TBD');
    return [...ranked, ...missing];
  }

  if (tournament.format === 'groups') {
    const groups = getGroupDetailedStandings(tournament, teams);
    let interleaved = [];
    const maxSize = Math.max(...groups.map(g => g.length), 0);
    for (let i = 0; i < maxSize; i++) {
      for (let j = 0; j < groups.length; j++) {
        if (groups[j] && groups[j][i]) interleaved.push(groups[j][i].id);
      }
    }
    return interleaved;
  }

  const stats = {};
  effectiveIds.forEach(id => {
    if (id && !id.startsWith('SLOT:')) {
      const t = teams.find(x => x.id === id);
      if (t) stats[id] = { id, pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 };
    }
  });

  (tournament.fixtures || []).forEach(m => {
    if (m.played && stats[m.home] && stats[m.away]) {
      const hScore = parseInt(m.homeScore) || 0;
      const aScore = parseInt(m.awayScore) || 0;

      stats[m.home].pj++; stats[m.away].pj++;
      stats[m.home].gf += hScore; stats[m.away].gf += aScore;
      stats[m.home].gc += aScore; stats[m.home].gc += hScore;

      if (hScore > aScore) {
        stats[m.home].pg++; stats[m.away].pp++;
        stats[m.home].pts += parseInt(tournament.winPoints) || 3;
        stats[m.away].pts += parseInt(tournament.losePoints) || 0;
      } else if (hScore < aScore) {
        stats[m.away].pg++; stats[m.home].pp++;
        stats[m.away].pts += parseInt(tournament.winPoints) || 3;
        stats[m.home].pts += parseInt(tournament.losePoints) || 0;
      } else {
        stats[m.home].pe++; stats[m.away].pe++;
        stats[m.home].pts += parseInt(tournament.drawPoints) || 1;
        stats[m.away].pts += parseInt(tournament.drawPoints) || 1;
      }
    }
  });

  const sorter = (a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const diffA = a.gf - a.gc;
    const diffB = b.gf - b.gc;
    if (diffB !== diffA) return diffB - diffA;
    return b.gf - a.gf;
  };

  return Object.values(stats).sort(sorter).map(t => t.id);
};