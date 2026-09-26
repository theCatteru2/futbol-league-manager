import React, { useState } from 'react';
import { generateId } from '../data';
import { getAutomaticLineup, calculateTacticalModifier, resolveSlotTeamId } from '../logic';


// Matriz de coordenadas relativas sobre la cancha horizontal (x: % horizontal, y: % vertical)
const FORMATION_COORDINATES = {
  '4-4-2': [
    { pos: 'ARQ', x: 8, y: 50 },
    { pos: 'DEF', x: 26, y: 18 }, { pos: 'DEF', x: 24, y: 38 }, { pos: 'DEF', x: 24, y: 62 }, { pos: 'DEF', x: 26, y: 82 },
    { pos: 'MED', x: 55, y: 18 }, { pos: 'MED', x: 52, y: 38 }, { pos: 'MED', x: 52, y: 62 }, { pos: 'MED', x: 55, y: 82 },
    { pos: 'DEL', x: 82, y: 36 }, { pos: 'DEL', x: 82, y: 64 }
  ],
  '4-3-3': [
    { pos: 'ARQ', x: 8, y: 50 },
    { pos: 'DEF', x: 26, y: 18 }, { pos: 'DEF', x: 24, y: 38 }, { pos: 'DEF', x: 24, y: 62 }, { pos: 'DEF', x: 26, y: 82 },
    { pos: 'MED', x: 48, y: 50 }, { pos: 'MED', x: 58, y: 30 }, { pos: 'MED', x: 58, y: 70 },
    { pos: 'DEL', x: 82, y: 20 }, { pos: 'DEL', x: 85, y: 50 }, { pos: 'DEL', x: 82, y: 80 }
  ],
  '4-2-3-1': [
    { pos: 'ARQ', x: 8, y: 50 },
    { pos: 'DEF', x: 26, y: 18 }, { pos: 'DEF', x: 24, y: 38 }, { pos: 'DEF', x: 24, y: 62 }, { pos: 'DEF', x: 26, y: 82 },
    { pos: 'MED', x: 45, y: 36 }, { pos: 'MED', x: 45, y: 64 },
    { pos: 'MED', x: 66, y: 20 }, { pos: 'MED', x: 66, y: 50 }, { pos: 'MED', x: 66, y: 80 },
    { pos: 'DEL', x: 86, y: 50 }
  ],
  '3-5-2': [
    { pos: 'ARQ', x: 8, y: 50 },
    { pos: 'DEF', x: 25, y: 25 }, { pos: 'DEF', x: 23, y: 50 }, { pos: 'DEF', x: 25, y: 75 },
    { pos: 'MED', x: 46, y: 15 }, { pos: 'MED', x: 52, y: 36 }, { pos: 'MED', x: 48, y: 50 }, { pos: 'MED', x: 52, y: 64 }, { pos: 'MED', x: 46, y: 85 },
    { pos: 'DEL', x: 82, y: 36 }, { pos: 'DEL', x: 82, y: 64 }
  ],
  '5-3-2': [
    { pos: 'ARQ', x: 8, y: 50 },
    { pos: 'DEF', x: 28, y: 15 }, { pos: 'DEF', x: 24, y: 32 }, { pos: 'DEF', x: 22, y: 50 }, { pos: 'DEF', x: 24, y: 68 }, { pos: 'DEF', x: 28, y: 85 },
    { pos: 'MED', x: 52, y: 30 }, { pos: 'MED', x: 50, y: 50 }, { pos: 'MED', x: 52, y: 70 },
    { pos: 'DEL', x: 82, y: 36 }, { pos: 'DEL', x: 82, y: 64 }
  ]
};

export const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false, title = '' }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-bold transition-all duration-200 focus:outline-none flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 text-sm";
  const variants = {
    primary: "bg-blue-600 text-white shadow-md hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 shadow-sm hover:bg-gray-300",
    danger: "bg-red-500 text-white shadow-md hover:bg-red-600",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    success: "bg-green-600 text-white shadow-md hover:bg-green-700"
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export const Card = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-xl shadow-sm p-4 border border-gray-200 ${className}`}>
    {children}
  </div>
);

export const Shield = ({ team, size = 'md' }) => {
  const sizes = { sm: 'w-6 h-6 text-[10px]', md: 'w-10 h-10 text-xs', lg: 'w-16 h-16 text-lg', xl: 'w-24 h-24 text-3xl' };
  if (team?.logoUrl) {
    return <img src={team.logoUrl} alt={team.name} className={`${sizes[size]} object-contain rounded-full bg-white flex-shrink-0 border border-gray-200 shadow-sm`} />;
  }
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-black shadow-inner flex-shrink-0 border border-black/10`} style={{ backgroundColor: team?.color || '#94a3b8' }} title={team?.name}>
      {team?.shortName || '---'}
    </div>
  );
};

export const PosBadge = ({ pos }) => {
  const colors = {
    ARQ: 'bg-amber-100 text-amber-800 border-amber-300',
    DEF: 'bg-blue-100 text-blue-800 border-blue-300',
    MED: 'bg-green-100 text-green-800 border-green-300',
    DEL: 'bg-red-100 text-red-800 border-red-300'
  };
  return <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border uppercase ${colors[pos] || 'bg-gray-100 text-gray-700'}`}>{pos}</span>;
};

const PlayerToken = ({ player, isSelected, onClick, onRemove, isGoalkeeper = false }) => {
  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col items-center cursor-pointer transition-transform ${isSelected ? 'scale-110 z-20' : 'hover:scale-105 z-10'}`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-[11px] shadow-lg border-2 transition-all ${
        isSelected 
          ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-400/50' 
          : isGoalkeeper 
            ? 'bg-amber-500 text-slate-950 border-amber-300' 
            : 'bg-slate-900 text-white border-white/70'
      }`}>
        {player.pos}
      </div>

      <span className="mt-0.5 px-1.5 py-0.5 bg-slate-950/90 border border-slate-800 rounded text-[9px] font-bold text-slate-100 max-w-[80px] truncate shadow">
        {player.name.split(' ').pop()}
      </span>

      <button
        onClick={onRemove}
        title="Enviar al banco"
        className="absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ×
      </button>
    </div>
  );
};

export const MatchDetailModal = ({ match, tournament, teams, onClose, onSaveMatch }) => {
  const hTeam = teams.find(t => t.id === match.home);
  const aTeam = teams.find(t => t.id === match.away);

  const [activeSide, setActiveSide] = useState('home');
  const [homeScore, setHomeScore] = useState(match.homeScore);
  const [awayScore, setAwayScore] = useState(match.awayScore);
  const [homePen, setHomePen] = useState(match.homePen || '');
  const [awayPen, setAwayPen] = useState(match.awayPen || '');

  const [homeFormation, setHomeFormation] = useState(match.homeFormation || hTeam?.formation || '4-4-2');
  const [awayFormation, setAwayFormation] = useState(match.awayFormation || aTeam?.formation || '4-4-2');

  const [homeLineup, setHomeLineup] = useState(() => match.homeLineup || (hTeam ? getAutomaticLineup(hTeam.players, homeFormation) : []));
  const [awayLineup, setAwayLineup] = useState(() => match.awayLineup || (aTeam ? getAutomaticLineup(aTeam.players, awayFormation) : []));

  const [homeGoals, setHomeGoals] = useState(match.homeGoals || []);
  const [awayGoals, setAwayGoals] = useState(match.awayGoals || []);
  
  const [selectedPitchId, setSelectedPitchId] = useState(null);

  const currentTeam = activeSide === 'home' ? hTeam : aTeam;
  const currentLineup = activeSide === 'home' ? homeLineup : awayLineup;
  const setCurrentLineup = activeSide === 'home' ? setHomeLineup : setAwayLineup;
  const currentFormation = activeSide === 'home' ? homeFormation : awayFormation;

  const handleFormationChange = (newFmt) => {
    if (activeSide === 'home') {
      setHomeFormation(newFmt);
      setHomeLineup(getAutomaticLineup(hTeam?.players, newFmt));
    } else {
      setAwayFormation(newFmt);
      setAwayLineup(getAutomaticLineup(aTeam?.players, newFmt));
    }
    setSelectedPitchId(null);
  };

  const starters = (currentTeam?.players || []).filter(p => currentLineup.includes(p.id));
  const bench = (currentTeam?.players || []).filter(p => !currentLineup.includes(p.id));

  // Ordenamos los futbolistas para colocarlos de izquierda a derecha (ARQ -> DEF -> MED -> DEL)
  const sortedStarters = [
    ...starters.filter(p => p.pos === 'ARQ'),
    ...starters.filter(p => p.pos === 'DEF'),
    ...starters.filter(p => p.pos === 'MED'),
    ...starters.filter(p => p.pos === 'DEL')
  ];

  const coords = FORMATION_COORDINATES[currentFormation] || FORMATION_COORDINATES['4-4-2'];
  const tacticalDuel = calculateTacticalModifier(homeFormation, awayFormation);

  const handlePitchClick = (playerId) => {
    setSelectedPitchId(selectedPitchId === playerId ? null : playerId);
  };

  const handleBenchClick = (benchPlayerId) => {
    if (selectedPitchId) {
      const updated = currentLineup.map(id => id === selectedPitchId ? benchPlayerId : id);
      setCurrentLineup(updated);
      setSelectedPitchId(null);
    } else if (currentLineup.length < 11) {
      setCurrentLineup([...currentLineup, benchPlayerId]);
    }
  };

  const removeStarter = (e, playerId) => {
    e.stopPropagation();
    setCurrentLineup(currentLineup.filter(id => id !== playerId));
    if (selectedPitchId === playerId) setSelectedPitchId(null);
  };

  const addGoal = (side) => {
    const team = side === 'home' ? hTeam : aTeam;
    const lineup = side === 'home' ? homeLineup : awayLineup;
    const pool = team?.players.filter(p => lineup.includes(p.id)) || [];
    const scorer = pool[0] || team?.players[0];

    const newGoal = {
      id: generateId(),
      playerId: scorer?.id || null,
      playerName: scorer?.name || 'Gol',
      minute: Math.floor(Math.random() * 85) + 5
    };

    if (side === 'home') {
      const updated = [...homeGoals, newGoal].sort((a,b) => a.minute - b.minute);
      setHomeGoals(updated);
      setHomeScore(updated.length);
    } else {
      const updated = [...awayGoals, newGoal].sort((a,b) => a.minute - b.minute);
      setAwayGoals(updated);
      setAwayScore(updated.length);
    }
  };

  const removeGoal = (side, goalId) => {
    if (side === 'home') {
      const updated = homeGoals.filter(g => g.id !== goalId);
      setHomeGoals(updated);
      setHomeScore(updated.length);
    } else {
      const updated = awayGoals.filter(g => g.id !== goalId);
      setAwayGoals(updated);
      setAwayScore(updated.length);
    }
  };

  const handleSave = () => {
    const isPlayed = homeScore !== '' && awayScore !== '';
    onSaveMatch({
      ...match,
      homeScore: homeScore === '' ? '' : Number(homeScore),
      awayScore: awayScore === '' ? '' : Number(awayScore),
      homePen: homePen === '' ? '' : Number(homePen),
      awayPen: awayPen === '' ? '' : Number(awayPen),
      homeLineup,
      awayLineup,
      homeFormation,
      awayFormation,
      homeGoals,
      awayGoals,
      played: isPlayed
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-6 animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl w-full max-w-6xl shadow-2xl flex flex-col my-auto overflow-hidden">
        
        {/* Encabezado */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-emerald-400 font-mono text-[11px] uppercase tracking-widest font-black">Planilla Táctica Oficial</span>
            <h2 className="text-base sm:text-lg font-black text-slate-100 uppercase tracking-tight">{tournament.name} • Fecha {match.round}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center font-black transition-colors cursor-pointer">
            ✕
          </button>
        </div>

        {/* Marcador */}
        <div className="bg-slate-950/60 px-6 py-3 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-5/12 justify-end text-right">
            <div>
              <span className="text-sm sm:text-lg font-black truncate text-slate-100 block">{hTeam?.name}</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">{homeFormation}</span>
            </div>
            <Shield team={hTeam} size="md" />
          </div>

          <div className="flex items-center space-x-2 bg-slate-800/90 px-3.5 py-1.5 rounded-2xl border border-slate-700 shadow-inner">
            <input
              type="number"
              min="0"
              value={homeScore}
              onChange={e => setHomeScore(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              className="w-10 h-10 text-center bg-slate-950 text-emerald-400 font-mono font-black text-xl rounded-xl border border-slate-700 outline-none focus:border-emerald-500"
            />
            <span className="text-slate-500 font-black text-xl">:</span>
            <input
              type="number"
              min="0"
              value={awayScore}
              onChange={e => setAwayScore(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              className="w-10 h-10 text-center bg-slate-950 text-emerald-400 font-mono font-black text-xl rounded-xl border border-slate-700 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-3 w-5/12">
            <Shield team={aTeam} size="md" />
            <div>
              <span className="text-sm sm:text-lg font-black truncate text-slate-100 block">{aTeam?.name}</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">{awayFormation}</span>
            </div>
          </div>
        </div>

        {/* Goles */}
        <div className="bg-slate-900 px-6 py-2 border-b border-slate-800 flex items-center justify-between text-xs min-h-[42px]">
          <div className="flex items-center space-x-2 flex-1 overflow-x-auto no-scrollbar">
            <button onClick={() => addGoal('home')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-2.5 py-1 rounded-md text-[10px] cursor-pointer">
              + Gol {hTeam?.shortName}
            </button>
            {homeGoals.map(g => (
              <span key={g.id} className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full flex items-center space-x-1 whitespace-nowrap text-[11px]">
                <span>⚽ {g.minute}' {g.playerName.split(' ').pop()}</span>
                <button onClick={() => removeGoal('home', g.id)} className="text-rose-400 hover:text-rose-300 ml-1 font-bold">×</button>
              </span>
            ))}
          </div>

          <span className="text-slate-700 font-bold px-3">|</span>

          <div className="flex items-center space-x-2 flex-1 justify-end overflow-x-auto no-scrollbar">
            {awayGoals.map(g => (
              <span key={g.id} className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full flex items-center space-x-1 whitespace-nowrap text-[11px]">
                <span>⚽ {g.minute}' {g.playerName.split(' ').pop()}</span>
                <button onClick={() => removeGoal('away', g.id)} className="text-rose-400 hover:text-rose-300 ml-1 font-bold">×</button>
              </span>
            ))}
            <button onClick={() => addGoal('away')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-2.5 py-1 rounded-md text-[10px] cursor-pointer">
              + Gol {aTeam?.shortName}
            </button>
          </div>
        </div>

        {/* Solapas de Equipo */}
        <div className="flex bg-slate-950 border-b border-slate-800">
          <button
            onClick={() => { setActiveSide('home'); setSelectedPitchId(null); }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-black flex items-center justify-center space-x-2 border-b-2 transition-all cursor-pointer ${activeSide === 'home' ? 'border-emerald-500 text-emerald-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Shield team={hTeam} size="sm" />
            <span>{hTeam?.name} ({homeLineup.length}/11)</span>
          </button>
          <button
            onClick={() => { setActiveSide('away'); setSelectedPitchId(null); }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-black flex items-center justify-center space-x-2 border-b-2 transition-all cursor-pointer ${activeSide === 'away' ? 'border-emerald-500 text-emerald-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Shield team={aTeam} size="sm" />
            <span>{aTeam?.name} ({awayLineup.length}/11)</span>
          </button>
        </div>

        {/* Selector de Esquema Táctico */}
        <div className="bg-slate-950 px-6 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Táctica de {currentTeam?.shortName}:</span>
            <div className="flex space-x-1">
              {Object.keys(FORMATION_COORDINATES).map(fmtKey => (
                <button
                  key={fmtKey}
                  onClick={() => handleFormationChange(fmtKey)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-black text-xs transition-all cursor-pointer ${
                    currentFormation === fmtKey 
                      ? 'bg-emerald-500 text-slate-950 shadow-md' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {fmtKey}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-[11px] font-mono bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-400">Duelo:</span>
            <span className={tacticalDuel.homeAdvantage > 0 ? "text-emerald-400 font-bold" : "text-slate-300"}>
              {hTeam?.shortName} ({homeFormation})
            </span>
            <span className="text-slate-600">vs</span>
            <span className={tacticalDuel.awayAdvantage > 0 ? "text-emerald-400 font-bold" : "text-slate-300"}>
              {aTeam?.shortName} ({awayFormation})
            </span>
          </div>
        </div>

        {/* Zona Táctica */}
        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-950">
          
          {/* Cancha con Coordenadas Relativas (Posicionamiento Absoluto) */}
          <div className="lg:col-span-8 bg-emerald-800 rounded-2xl relative border-4 border-emerald-700 h-[380px] p-3 shadow-inner overflow-hidden select-none"
               style={{ backgroundImage: 'repeating-linear-gradient(90deg, #065f46, #065f46 45px, #047857 45px, #047857 90px)' }}>
            
            {/* Demarcaciones reglamentarias */}
            <div className="absolute inset-y-8 left-0 w-24 border-r-2 border-y-2 border-white/20 rounded-r-2xl pointer-events-none"></div>
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-r-2 border-white/20 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-white/20 rounded-full pointer-events-none"></div>
            <div className="absolute inset-y-8 right-0 w-24 border-l-2 border-y-2 border-white/20 rounded-l-2xl pointer-events-none"></div>

            {/* Renderizado de futbolistas según el esquema táctico activo */}
            {coords.map((coord, idx) => {
              const player = sortedStarters[idx];
              if (!player) return null;
              return (
                <div
                  key={player.id}
                  style={{
                    position: 'absolute',
                    left: `${coord.x}%`,
                    top: `${coord.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className="transition-all duration-300 ease-out"
                >
                  <PlayerToken
                    player={player}
                    isSelected={selectedPitchId === player.id}
                    onClick={() => handlePitchClick(player.id)}
                    onRemove={(e) => removeStarter(e, player.id)}
                    isGoalkeeper={player.pos === 'ARQ'}
                  />
                </div>
              );
            })}
          </div>

          {/* Banco de Suplentes */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between h-[380px]">
            <div className="flex flex-col h-[300px]">
              <div className="flex justify-between items-center mb-1.5 pb-1.5 border-b border-slate-800">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">Banco de Relevos</span>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{bench.length} suplentes</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2 leading-tight">
                {selectedPitchId 
                  ? "👉 Haz clic en un suplente para reemplazar al titular seleccionado." 
                  : "💡 Toca un titular en cancha y luego a un suplente aquí para sustituirlo."}
              </p>

              <div className="space-y-1.5 overflow-y-auto no-scrollbar pr-1 flex-1">
                {bench.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleBenchClick(p.id)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <PosBadge pos={p.pos} />
                      <span className="text-xs font-bold text-slate-200 truncate">{p.name}</span>
                    </div>
                    <span className="text-[11px] font-black text-emerald-400 whitespace-nowrap">
                      {selectedPitchId ? '⇄ Reemplazar' : '+ Entrar'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex space-x-2">
              <button onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors">
                Cerrar
              </button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-all">
                Guardar Acta
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export const StandingsTable = ({ tournament, tournaments = [], teams, groupData = [], groupTeamIds = [], isGroups = false, gIdx = 0 }) => {
  const getPositionStyle = (rank) => {
    const quals = tournament.qualifications || [];

    if (isGroups) {
      const groupMatch = quals.find(q => {
        if (q.type === 'group_pos') {
          return parseInt(q.groupSpecific) === gIdx && parseInt(q.groupPos) === rank;
        }
        if (q.type === 'best_thirds' && rank === 3) {
          return true;
        }
        return false;
      });

      if (groupMatch) return groupMatch.color || '#10b981';

      const rangeMatch = quals.find(q => {
        if (q.type && q.type !== 'range') return false;
        const s = parseInt(q.startPos) || 1;
        const e = parseInt(q.endPos) || s;
        return rank >= s && rank <= e;
      });

      if (rangeMatch) return rangeMatch.color || '#10b981';
      return null;
    }

    const rangeMatch = quals.find(q => {
      const s = parseInt(q.startPos) || 1;
      const e = parseInt(q.endPos) || s;
      return rank >= s && rank <= e;
    });

    if (rangeMatch) return rangeMatch.color || '#10b981';
    return null;
  };

  const formatSlotLabel = (slotId) => {
    if (!slotId) return 'Por definir';
    if (slotId.startsWith('SLOT:PENDING')) return 'Cupo por definir';

    const parts = slotId.split(':');
    const srcId = parts[1];
    const type = parts[2];
    const srcT = (tournaments || []).find(t => t.id === srcId);
    const srcName = srcT ? srcT.name : 'Torneo';

    if (type === 'pos' || type === 'range') {
      return `[${srcName}] ${parts[3]}º Puesto`;
    }
    if (type === 'path_winner') {
      return `[${srcName}] Ganador Ruta ${String.fromCharCode(65 + (parseInt(parts[3]) || 0))}`;
    }
    if (type === 'best_thirds') {
      return `[${srcName}] ${parts[3]}º Mejor 3º`;
    }
    if (type === 'group_pos') {
      const gLetter = String.fromCharCode(65 + (parseInt(parts[3]) || 0));
      return `[${srcName}] ${parts[4]}º Grp ${gLetter}`;
    }
    return `[${srcName}] Cupo`;
  };

  // Usar los objetos con estadísticas directamente si existen, o mapear desde IDs
  const rows = groupData.length > 0 ? groupData : groupTeamIds.map(id => ({ id, pts: 0, pj: 0, gf: 0, gc: 0 }));

  return (
    <div className="flex flex-col">
      <table className="w-full text-xs text-left border-collapse">
        <thead className="bg-gray-100 text-gray-600 uppercase font-black border-b border-gray-200">
          <tr>
            <th className="px-3 py-2.5 text-center w-8">#</th>
            <th className="px-3 py-2.5">Equipo</th>
            <th className="px-3 py-2.5 text-center">PTS</th>
            <th className="px-3 py-2.5 text-center">PJ</th>
            <th className="px-3 py-2.5 text-center">DG</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 font-bold">
          {rows.map((row, idx) => {
            const rawId = row.id;
            if (!rawId) return null;

            const resolvedId = (rawId.startsWith('SLOT:') && typeof resolveSlotTeamId === 'function')
              ? resolveSlotTeamId(rawId, tournaments, teams)
              : rawId;

            const isSlot = resolvedId.startsWith('SLOT:');
            const isTbd = resolvedId === 'TBD';
            const team = teams.find(t => t.id === resolvedId);
            const rank = idx + 1;
            const customColor = getPositionStyle(rank);

            const pts = row.pts ?? 0;
            const pj = row.pj ?? 0;
            const dg = (row.gf ?? 0) - (row.gc ?? 0);

            const displayName = isSlot 
              ? formatSlotLabel(resolvedId) 
              : isTbd 
                ? 'Por definir' 
                : (team?.name || resolvedId);

            return (
              <tr
                key={`${rawId}-${idx}`}
                className="hover:bg-gray-50 bg-white transition-colors"
                style={{
                  borderLeft: customColor ? `4px solid ${customColor}` : '4px solid transparent'
                }}
              >
                <td className="px-3 py-2.5 text-center">
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black"
                    style={{
                      backgroundColor: customColor ? `${customColor}20` : '#f1f5f9',
                      color: customColor || '#64748b'
                    }}
                  >
                    {rank}
                  </span>
                </td>
                <td className="px-3 py-2.5 flex items-center space-x-2">
                  {isSlot ? (
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0 shadow-sm">
                      📥
                    </div>
                  ) : isTbd ? (
                    <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 font-black text-[10px] flex items-center justify-center shrink-0">
                      ?
                    </div>
                  ) : (
                    <Shield team={team} size="sm" />
                  )}
                  <span className={`truncate max-w-[170px] ${isSlot ? 'text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[11px]' : isTbd ? 'text-gray-400 italic' : 'text-gray-800'}`}>
                    {displayName}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-center font-black text-green-700">{pts}</td>
                <td className="px-3 py-2.5 text-center text-gray-500">{pj}</td>
                <td className="px-3 py-2.5 text-center text-gray-500">{dg}</td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-4 text-gray-400 italic font-medium">
                Sin equipos asignados a este grupo.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};


export const ScorersTable = ({ tournament }) => {
  const topScorers = React.useMemo(() => {
    const scorersMap = {};
    (tournament.fixtures || []).forEach(m => {
      if (m.played) {
        [...(m.homeGoals || []), ...(m.awayGoals || [])].forEach(g => {
          if (!g.playerId) return;
          if (!scorersMap[g.playerId]) {
            scorersMap[g.playerId] = { id: g.playerId, name: g.playerName, goals: 0 };
          }
          scorersMap[g.playerId].goals++;
        });
      }
    });
    return Object.values(scorersMap).sort((a, b) => b.goals - a.goals);
  }, [tournament.fixtures]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-3 bg-gray-50 border-b border-gray-200 font-black text-xs uppercase text-gray-700">
        Tabla de Máximos Goleadores
      </div>
      <div className="divide-y divide-gray-100">
        {topScorers.length === 0 ? (
          <p className="p-6 text-center text-xs text-gray-400 font-bold">Aún no hay goles registrados en este torneo.</p>
        ) : (
          topScorers.map((s, idx) => (
            <div key={s.id} className="p-3 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center space-x-3">
                <span className="font-black text-gray-400 w-4">{idx + 1}</span>
                <span className="text-gray-800">{s.name}</span>
              </div>
              <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-black">{s.goals} ⚽</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};