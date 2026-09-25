import React, { useState, useMemo, useRef } from 'react';
import {
  generateId,
  generateRegionalName,
  createProceduralRoster,
  CONMEBOL_COUNTRIES,
  TACTICAL_FORMATIONS
} from '../data';
import {
  calculateTournamentStandings,
  resolveEffectiveParticipants,
  advanceKnockout,
  rollDiceScore,
  assignProceduralGoalScorers,
  getAutomaticLineup,
  generateFixtures,
  calculateTacticalModifier
} from '../logic';
import { Button, Card, Shield, PosBadge, MatchDetailModal, StandingsTable, ScorersTable } from './ui';

export const TeamManager = ({ teams, updateTeams, setView }) => {
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('ALL');
  const [editingTeam, setEditingTeam] = useState(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamCountry, setNewTeamCountry] = useState('ARG');
  const [error, setError] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPos, setNewPlayerPos] = useState('MED');
  const singleTeamInputRef = useRef(null);

  const filteredTeams = useMemo(() => {
    if (selectedCountryFilter === 'ALL') return teams;
    return teams.filter(t => (t.country || 'ARG') === selectedCountryFilter);
  }, [teams, selectedCountryFilter]);

  const handleAddTeam = (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    const newTeam = {
      id: generateId(),
      name: newTeamName.trim(),
      country: newTeamCountry,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      shortName: newTeamName.trim().substring(0, 3).toUpperCase(),
      logoUrl: null,
      formation: '4-4-2',
      tacticalVariants: ['4-4-2', '4-3-3', '4-2-3-1', '3-5-2', '5-3-2'],
      players: createProceduralRoster(newTeamCountry)
    };
    updateTeams([...teams, newTeam]);
    setNewTeamName('');
  };

  const deleteTeam = (id, e) => {
    e.stopPropagation();
    if (teams.length <= 2) return setError("Debes mantener al menos 2 equipos.");
    updateTeams(teams.filter(t => t.id !== id));
  };

  const exportSingleTeam = (team, e) => {
    e.stopPropagation();
    const data = JSON.stringify(team, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equipo-${team.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
  };

  const importSingleTeam = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        if (!imported.name || !Array.isArray(imported.players)) {
          return alert("Formato de equipo inválido.");
        }
        imported.id = generateId();
        imported.country = imported.country || 'ARG';
        updateTeams([...teams, imported]);
        alert(`Equipo "${imported.name}" importado con éxito.`);
      } catch {
        alert("Error al leer el archivo de equipo.");
      }
    };
    reader.readAsText(file);
  };

  const randomizeRoster = () => {
    if (!editingTeam) return;
    setEditingTeam({
      ...editingTeam,
      players: editingTeam.players.map(p => ({
        ...p,
        name: generateRegionalName(editingTeam.country || 'ARG')
      }))
    });
  };

  const addPlayer = (e) => {
    e.preventDefault();
    if (!newPlayerName.trim() || !editingTeam) return;
    setEditingTeam({
      ...editingTeam,
      players: [...editingTeam.players, { id: generateId(), name: newPlayerName.trim(), pos: newPlayerPos }]
    });
    setNewPlayerName('');
  };

  const removePlayer = (pId) => {
    if (!editingTeam) return;
    if (editingTeam.players.length <= 11) return setError("El equipo debe conservar al menos 11 jugadores.");
    setEditingTeam({ ...editingTeam, players: editingTeam.players.filter(p => p.id !== pId) });
  };

  const saveEdit = () => {
    if (!editingTeam || !editingTeam.name.trim()) return;
    updateTeams(teams.map(t => t.id === editingTeam.id ? {
      ...editingTeam,
      shortName: editingTeam.name.substring(0, 3).toUpperCase()
    } : t));
    setEditingTeam(null);
  };

  if (editingTeam) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-6 animate-fade-in mt-6 border border-gray-200 pb-20">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{CONMEBOL_COUNTRIES.find(c => c.id === editingTeam.country)?.flag || '⚽'}</span>
            <h2 className="text-xl font-black text-gray-900">Editar Equipo</h2>
          </div>
          <Button variant="secondary" onClick={() => setEditingTeam(null)}>Volver</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase mb-1">Nombre</label>
            <input type="text" value={editingTeam.name} onChange={e => setEditingTeam({ ...editingTeam, name: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-xl font-bold bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-700 uppercase mb-1">País</label>
            <select
              value={editingTeam.country || 'ARG'}
              onChange={e => setEditingTeam({ ...editingTeam, country: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-xl font-bold bg-gray-50 outline-none"
            >
              {CONMEBOL_COUNTRIES.map(c => (
                <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase mb-1">Esquema Predilecto</label>
            <select
              value={editingTeam.formation || '4-4-2'}
              onChange={e => setEditingTeam({ ...editingTeam, formation: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-xl font-bold bg-gray-50 outline-none"
            >
              {Object.keys(TACTICAL_FORMATIONS).map(f => (
                <option key={f} value={f}>{f} ({TACTICAL_FORMATIONS[f].name})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <Shield team={editingTeam} size="lg" />
            <div>
              <label className="cursor-pointer text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg inline-block hover:bg-blue-100">
                📷 Subir Escudo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    const img = new Image();
                    img.onload = () => {
                      const canvas = document.createElement('canvas');
                      const ctx = canvas.getContext('2d');
                      canvas.width = 128; canvas.height = 128;
                      const minDim = Math.min(img.width, img.height);
                      ctx?.drawImage(img, (img.width - minDim) / 2, (img.height - minDim) / 2, minDim, minDim, 0, 0, 128, 128);
                      setEditingTeam({ ...editingTeam, logoUrl: canvas.toDataURL('image/webp', 0.8) });
                    };
                    img.src = evt.target?.result;
                  };
                  reader.readAsDataURL(file);
                }} />
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="font-black text-sm text-gray-800 uppercase">Plantel ({editingTeam.players?.length || 0} jugadores)</h3>
              <p className="text-[11px] text-gray-500">Nombres regionales según {CONMEBOL_COUNTRIES.find(c => c.id === editingTeam.country)?.name}</p>
            </div>
            <button onClick={randomizeRoster} className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm cursor-pointer">
              🎲 Aleatorizar Nombres
            </button>
          </div>

          <form onSubmit={addPlayer} className="flex space-x-2 mb-3">
            <input type="text" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} placeholder="Nuevo jugador..." className="flex-1 p-2 bg-white border border-gray-300 rounded-lg text-xs font-bold outline-none" />
            <select value={newPlayerPos} onChange={e => setNewPlayerPos(e.target.value)} className="p-2 bg-white border border-gray-300 rounded-lg text-xs font-black">
              <option value="ARQ">ARQ</option><option value="DEF">DEF</option><option value="MED">MED</option><option value="DEL">DEL</option>
            </select>
            <Button type="submit" variant="primary" className="text-xs px-3 py-1">Añadir</Button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto no-scrollbar pr-1">
            {editingTeam.players?.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200 text-xs font-bold">
                <div className="flex items-center space-x-2 truncate">
                  <PosBadge pos={p.pos} />
                  <span className="truncate text-gray-800">{p.name}</span>
                </div>
                <button onClick={() => removePlayer(p.id)} className="text-red-400 hover:text-red-600 font-bold px-1.5">✕</button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={() => setEditingTeam(null)}>Cancelar</Button>
          <Button onClick={saveEdit} variant="primary">Guardar Cambios</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-4 animate-fade-in pb-24 mt-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4 border-b pb-4">
        <div className="flex items-center">
          <button onClick={() => setView('main-menu')} className="mr-3 p-2 bg-gray-50 rounded-full hover:bg-gray-200 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-900">Clubes y Planteles</h2>
            <p className="text-xs text-gray-500 font-bold">Base de datos de clubes sudamericanos</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => singleTeamInputRef.current?.click()}
            className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100 flex items-center space-x-1 cursor-pointer"
          >
            <span>📥</span> <span>Importar Club</span>
          </button>
          <input type="file" ref={singleTeamInputRef} onChange={importSingleTeam} accept=".json" className="hidden" />
        </div>
      </div>

      <form onSubmit={handleAddTeam} className="flex flex-wrap gap-2 mb-4 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
        <input
          type="text"
          value={newTeamName}
          onChange={e => setNewTeamName(e.target.value)}
          placeholder="Nombre del club..."
          className="flex-1 min-w-[180px] p-2 border border-blue-200 rounded-lg outline-none font-bold text-sm bg-white"
        />
        <select
          value={newTeamCountry}
          onChange={e => setNewTeamCountry(e.target.value)}
          className="p-2 border border-blue-200 rounded-lg font-bold text-xs bg-white"
        >
          {CONMEBOL_COUNTRIES.map(c => (
            <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
          ))}
        </select>
        <Button type="submit" className="text-xs">Añadir</Button>
      </form>

      {/* Pestañas de filtrado con flex-wrap para que se vean todos los países */}
      <div className="flex flex-wrap gap-1.5 py-1 mb-4 border-b border-gray-100">
        <button
          onClick={() => setSelectedCountryFilter('ALL')}
          className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
            selectedCountryFilter === 'ALL'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todos ({teams.length})
        </button>
        {CONMEBOL_COUNTRIES.map(c => {
          const count = teams.filter(t => (t.country || 'ARG') === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCountryFilter(c.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                selectedCountryFilter === c.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
              <span className="text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {error && <div className="text-red-600 text-xs mb-3 bg-red-50 p-2 rounded border border-red-200 font-bold">{error}</div>}

      <div className="space-y-2 max-h-[58vh] overflow-y-auto no-scrollbar pr-1">
        {filteredTeams.map(team => {
          const cFlag = CONMEBOL_COUNTRIES.find(c => c.id === (team.country || 'ARG'))?.flag || '⚽';
          return (
            <div key={team.id} onClick={() => setEditingTeam(team)} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl border border-gray-200 cursor-pointer transition-colors bg-white">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{cFlag}</span>
                <Shield team={team} />
                <div>
                  <span className="font-bold text-gray-800 text-sm block">{team.name}</span>
                  <span className="text-[10px] text-gray-400 font-bold">{team.players?.length || 0} jugadores • {team.formation || '4-4-2'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={(e) => exportSingleTeam(team, e)}
                  title="Exportar archivo de este club (.json)"
                  className="text-gray-400 hover:text-blue-600 p-2 text-sm"
                >
                  💾
                </button>
                <button
                  type="button"
                  onClick={(e) => deleteTeam(team.id, e)}
                  title="Eliminar club"
                  className="text-gray-400 hover:text-red-500 p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Dashboard = ({ tournaments, teams, updateTournaments, setView, setActiveTournamentId }) => {
  const [tournamentToDelete, setTournamentToDelete] = useState(null);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto p-4 pb-24">
      <header className="flex items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={() => setView('main-menu')} className="mr-4 p-2 bg-gray-50 rounded-full hover:bg-gray-200 transition-colors">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Configuración de Torneos</h1>
          <p className="text-gray-500 text-sm font-medium">Gestión de reglas y formatos</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tournaments.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm">
            <p className="text-gray-500 mb-6 font-medium">Aún no has creado ningún torneo.</p>
            <Button onClick={() => setView('create-tournament')} className="mx-auto">Crear Torneo</Button>
          </div>
        ) : (
          tournaments.map(t => {
            const effParticipants = resolveEffectiveParticipants(t.id, tournaments, teams);
            return (
              <Card key={t.id} className="hover:shadow-lg transition-all flex flex-col justify-between border-l-4 border-l-blue-500">
                <div onClick={() => { setActiveTournamentId(t.id); setView('edit-tournament'); }} className="cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 truncate pr-2">{t.name}</h3>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${t.status === 'finished' ? 'bg-purple-100 text-purple-700' : t.status === 'started' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {t.status === 'finished' ? 'Finalizado' : t.status === 'started' ? 'Iniciado' : 'Borrador'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-4 font-medium">
                    <span className="bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">{t.format === 'league' ? 'Liga' : t.format === 'groups' ? 'Grupos' : 'Eliminatoria'}</span>
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100">{effParticipants.length} / {t.numTeams} cupos</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-100">
                  <div className="flex -space-x-2 overflow-hidden px-2">
                    {effParticipants.slice(0, 5).map((tId, idx) => {
                      const tm = teams.find(x => x.id === tId);
                      return tm ? <Shield key={idx} team={tm} size="sm" /> : null;
                    })}
                  </div>
                  <div className="space-x-2 flex">
                    <Button variant="outline" className="text-xs py-1.5 px-3" onClick={() => { setActiveTournamentId(t.id); setView('edit-tournament'); }}>⚙️ Ajustes</Button>
                    <Button variant="danger" className="text-xs py-1.5 px-3" onClick={() => setTournamentToDelete(t.id)}>Borrar</Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {tournamentToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up border border-red-100">
            <h3 className="text-xl font-bold mb-2 text-gray-900">¿Eliminar Torneo?</h3>
            <p className="text-gray-500 mb-6 text-sm">Esta acción borrará el fixture y resultados.</p>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setTournamentToDelete(null)}>Cancelar</Button>
              <Button variant="danger" onClick={() => { updateTournaments(tournaments.filter(x => x.id !== tournamentToDelete)); setTournamentToDelete(null); }}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6">
        <Button onClick={() => setView('create-tournament')} className="rounded-full shadow-lg h-14 px-6 text-base bg-blue-600 hover:bg-blue-700 flex items-center space-x-2">
          <span className="text-2xl leading-none">+</span> <span>Nuevo Torneo</span>
        </Button>
      </div>
    </div>
  );
};

export const TournamentForm = ({ view, tournaments, teams, updateTournaments, activeTournamentId, setView }) => {
  const isEditing = view === 'edit-tournament' && activeTournamentId !== null;
  const existingData = isEditing ? tournaments.find(t => t.id === activeTournamentId) : null;

  const defaultTeamCount = 10;

  const [tForm, setTForm] = useState(existingData || {
    id: generateId(),
    name: '',
    format: 'league',
    winPoints: 3,
    drawPoints: 1,
    losePoints: 0,
    numTeams: defaultTeamCount,
    promoted: 0,
    relegated: 0,
    numGroups: 2,
    advancingPerGroup: 2,
    qualifications: [],
    legs: 1,
    winnersCount: 1,
    drawType: 'auto',
    startEmpty: false,
    status: 'started',
    participants: teams.slice(0, defaultTeamCount).map(t => t.id),
    fixtures: null
  });

  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [modalCountryFilter, setModalCountryFilter] = useState('ALL');
  const isLocked = tForm.status === 'finished';

  const clearAllParticipants = () => {
    setTForm(prev => ({ ...prev, participants: [], startEmpty: true }));
  };

  const fillParticipantsByCountry = (countryFilter = 'ALL') => {
    const pool = countryFilter === 'ALL'
      ? teams
      : teams.filter(t => (t.country || 'ARG') === countryFilter);

    setTForm(prev => ({
      ...prev,
      startEmpty: false,
      participants: pool.slice(0, prev.numTeams).map(t => t.id)
    }));
  };

  const toggleStartEmpty = (checked) => {
    if (checked) {
      setTForm(prev => ({ ...prev, startEmpty: true, participants: [] }));
    } else {
      setTForm(prev => ({
        ...prev,
        startEmpty: false,
        participants: teams.slice(0, prev.numTeams).map(t => t.id)
      }));
    }
  };

  const handleNumTeamsChange = (val) => {
    const count = Math.max(2, Number(val) || 2);
    setTForm(prev => {
      if (prev.startEmpty || prev.participants.length === 0) {
        return { ...prev, numTeams: count };
      }
      let current = [...(prev.participants || [])];
      if (current.length < count) {
        const remaining = teams.filter(t => !current.includes(t.id)).slice(0, count - current.length).map(t => t.id);
        current = [...current, ...remaining];
      } else if (current.length > count) {
        current = current.slice(0, count);
      }
      return { ...prev, numTeams: count, participants: current };
    });
  };

  const addQualification = () => {
    const isFirst = tForm.qualifications.length === 0;
    const isSecond = tForm.qualifications.length === 1;

    let defaultColor = '#10b981';
    let startPos = 1;
    let endPos = 1;

    if (isSecond) {
      defaultColor = '#ef4444';
      startPos = tForm.numTeams;
      endPos = tForm.numTeams;
    } else if (!isFirst) {
      defaultColor = '#3b82f6';
      startPos = Math.min(2, tForm.numTeams);
      endPos = Math.min(3, tForm.numTeams);
    }

    setTForm(p => ({
      ...p,
      qualifications: [
        ...p.qualifications,
        {
          targetTournamentId: tournaments.find(tr => tr.id !== p.id)?.id || '',
          startPos,
          endPos,
          color: defaultColor
        }
      ]
    }));
  };

  const updateQualification = (index, field, value) => {
    const updated = [...tForm.qualifications];
    updated[index] = {
      ...updated[index],
      [field]: field === 'targetTournamentId' || field === 'color' ? value : Math.max(1, Number(value) || 1)
    };
    setTForm({ ...tForm, qualifications: updated });
  };

  const removeQualification = (index) => {
    setTForm({ ...tForm, qualifications: tForm.qualifications.filter((_, i) => i !== index) });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const finalForm = {
      ...tForm,
      numTeams: Math.max(2, tForm.numTeams || 2),
      winPoints: tForm.winPoints ?? 3,
      drawPoints: tForm.drawPoints ?? 1,
      losePoints: tForm.losePoints ?? 0,
      legs: tForm.legs || 1
    };

    if (!finalForm.startEmpty && (!finalForm.participants || finalForm.participants.length === 0)) {
      finalForm.participants = teams.slice(0, finalForm.numTeams).map(t => t.id);
    }

    if (finalForm.status === 'started' && (!finalForm.fixtures || finalForm.fixtures.length === 0)) {
      const effIds = resolveEffectiveParticipants(finalForm.id, tournaments, teams);
      const participantIds = effIds.length > 0 ? effIds : (finalForm.participants || []);
      finalForm.fixtures = generateFixtures(finalForm, participantIds);
    }

    if (finalForm.status === 'draft') finalForm.fixtures = null;

    if (isEditing) updateTournaments(tournaments.map(t => t.id === finalForm.id ? finalForm : t));
    else updateTournaments([...tournaments, finalForm]);
    setView('dashboard');
  };

  const PRESET_COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

  const modalFilteredTeams = useMemo(() => {
    if (modalCountryFilter === 'ALL') return teams;
    return teams.filter(t => (t.country || 'ARG') === modalCountryFilter);
  }, [teams, modalCountryFilter]);

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm p-6 animate-slide-up pb-24 mt-4 border border-gray-100">
      <div className="flex items-center mb-6 border-b pb-4">
        <button onClick={() => setView('dashboard')} className="mr-4 p-2 bg-gray-50 rounded-full hover:bg-gray-200 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Configurar Torneo' : 'Crear Torneo'}</h2>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
          <input required type="text" value={tForm.name} onChange={e => setTForm({ ...tForm, name: e.target.value })} placeholder="Ej: Copa Libertadores" className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-blue-500 text-lg" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Estado</label>
            <select value={tForm.status} onChange={e => setTForm({ ...tForm, status: e.target.value })} className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 font-bold text-sm outline-none">
              <option value="started">▶ Iniciado (Genera Fixture)</option>
              <option value="draft">Borrador</option>
              <option value="finished">🏁 Finalizado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Cupos Totales</label>
            <input disabled={isLocked} type="number" min="2" value={tForm.numTeams} onChange={e => handleNumTeamsChange(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 font-black text-center text-lg outline-none" />
          </div>
        </div>

        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <label className="block text-sm font-bold text-blue-900 mb-3">Formato</label>
          <div className="grid grid-cols-3 gap-2">
            {['league', 'groups', 'knockout'].map(fmt => (
              <button disabled={isLocked} type="button" key={fmt} onClick={() => setTForm({ ...tForm, format: fmt, fixtures: null })} className={`p-2.5 rounded-lg border text-sm font-bold cursor-pointer ${tForm.format === fmt ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-200'}`}>
                {fmt === 'league' ? 'Liga' : fmt === 'groups' ? 'Grupos' : 'Eliminatoria'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-bold text-gray-900 block">Equipos Iniciales</span>
              <span className={`text-xs font-bold ${tForm.participants?.length === 0 ? 'text-amber-600' : 'text-blue-600'}`}>
                {tForm.participants?.length === 0 
                  ? "Torneo vacío (clasificarán desde otros torneos)" 
                  : `${tForm.participants?.length || 0} / ${tForm.numTeams} seleccionados`}
              </span>
            </div>
            <div className="flex space-x-1.5">
              {tForm.participants?.length > 0 ? (
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={clearAllParticipants}
                  className="text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Vaciar
                </button>
              ) : null}
              <Button disabled={isLocked} type="button" variant="outline" className="text-xs py-1.5 px-3" onClick={() => setShowParticipantModal(true)}>
                Elegir / Llenar
              </Button>
            </div>
          </div>

          <label className="flex items-center space-x-2 pt-1 border-t border-gray-200 cursor-pointer select-none">
            <input
              type="checkbox"
              disabled={isLocked}
              checked={tForm.startEmpty || (tForm.participants?.length === 0)}
              onChange={e => toggleStartEmpty(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-xs font-bold text-gray-600">
              Iniciar torneo 100% vacío (los cupos se llenarán con clasificaciones)
            </span>
          </label>
        </div>

        <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-sm font-black text-indigo-950 block">Entrelazar Torneos (Cupos y Zonas)</span>
              <span className="text-[11px] text-indigo-700">Define qué puestos clasifican a otros torneos</span>
            </div>
            <Button type="button" className="text-xs py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700" onClick={addQualification}>+ Cupo</Button>
          </div>

          <div className="space-y-2.5">
            {tForm.qualifications.length === 0 ? (
              <p className="text-xs text-indigo-400 italic py-2">No hay cupos vinculados a otros torneos.</p>
            ) : (
              tForm.qualifications.map((q, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-indigo-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-bold">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-gray-500 font-bold">Puesto</span>
                    <input
                      type="number"
                      min="1"
                      max={tForm.numTeams}
                      value={q.startPos}
                      onChange={e => updateQualification(idx, 'startPos', e.target.value)}
                      className="w-11 text-center bg-gray-50 border border-gray-300 rounded p-1 font-black text-xs"
                    />
                    <span className="text-gray-400">al</span>
                    <input
                      type="number"
                      min={q.startPos}
                      max={tForm.numTeams}
                      value={q.endPos}
                      onChange={e => updateQualification(idx, 'endPos', e.target.value)}
                      className="w-11 text-center bg-gray-50 border border-gray-300 rounded p-1 font-black text-xs"
                    />
                  </div>

                  <div className="flex-1 w-full sm:w-auto">
                    <select
                      value={q.targetTournamentId}
                      onChange={e => updateQualification(idx, 'targetTournamentId', e.target.value)}
                      className="w-full p-1.5 border border-gray-300 rounded-lg bg-gray-50 font-bold text-xs outline-none"
                    >
                      <option value="">Seleccionar destino...</option>
                      {tournaments.filter(tr => tr.id !== tForm.id).map(tr => (
                        <option key={tr.id} value={tr.id}>Va a: {tr.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <div className="flex space-x-1">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateQualification(idx, 'color', c)}
                          className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${q.color === c ? 'scale-125 border-slate-900 shadow' : 'border-transparent hover:scale-110'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <button type="button" onClick={() => removeQualification(idx)} className="text-red-500 hover:text-red-700 p-1 font-black text-base cursor-pointer">
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base shadow-md">{isEditing ? 'Guardar Cambios' : 'Generar Torneo'}</Button>
      </form>

      {showParticipantModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[88vh] flex flex-col border border-gray-100 animate-slide-up">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-xl font-bold text-gray-900">Seleccionar Equipos</h3>
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700">{(tForm.participants || []).length} / {tForm.numTeams}</span>
            </div>

            {/* Pestañas de País en el Modal con flex-wrap para que entren todos */}
            <div className="flex flex-wrap gap-1 py-2 mb-2 border-b border-gray-100">
              <button
                type="button"
                onClick={() => setModalCountryFilter('ALL')}
                className={`px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer ${
                  modalCountryFilter === 'ALL' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Cualquiera
              </button>
              {CONMEBOL_COUNTRIES.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setModalCountryFilter(c.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer flex items-center space-x-1 ${
                    modalCountryFilter === c.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] text-gray-400">
                {modalCountryFilter === 'ALL' ? "Mostrando todos los clubes" : `Mostrando clubes de ${CONMEBOL_COUNTRIES.find(c => c.id === modalCountryFilter)?.name}`}
              </span>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={clearAllParticipants}
                  className="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  Vaciar
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => fillParticipantsByCountry(modalCountryFilter)}
                  className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Llenar con este filtro
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 mb-4 bg-gray-50 p-2 rounded-xl border border-gray-100 no-scrollbar">
              {modalFilteredTeams.map(team => {
                const isSelected = (tForm.participants || []).includes(team.id);
                const cFlag = CONMEBOL_COUNTRIES.find(c => c.id === (team.country || 'ARG'))?.flag || '⚽';
                return (
                  <div key={team.id} onClick={() => {
                    const current = tForm.participants || [];
                    if (isSelected) setTForm({ ...tForm, participants: current.filter(id => id !== team.id) });
                    else if (current.length < tForm.numTeams) setTForm({ ...tForm, participants: [...current, team.id] });
                  }} className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-sm transition-all ${isSelected ? 'bg-blue-50 border-blue-300 border-2 font-bold shadow-sm' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <div className="flex items-center space-x-2.5">
                      <span className="text-lg">{cFlag}</span>
                      <Shield team={team} size="sm" />
                      <span className="font-bold">{team.name}</span>
                    </div>
                    <span className={isSelected ? "text-blue-600 font-black text-lg" : "text-gray-300 font-bold"}>
                      {isSelected ? '✓' : '+'}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end pt-3 border-t">
              <Button onClick={() => setShowParticipantModal(false)}>Listo</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const PlayView = ({ tournaments, teams, updateTournaments, activeTournamentId, setView }) => {
  const tournament = tournaments.find(t => t.id === activeTournamentId);
  const [tab, setTab] = useState('matches');
  const [selectedMatch, setSelectedMatch] = useState(null);

  if (!tournament) return null;

  const effectiveIds = resolveEffectiveParticipants(tournament.id, tournaments, teams);
  const isKnockout = tournament.format === 'knockout';

  const updateMatchInState = (updatedMatch) => {
    let newFixtures = (tournament.fixtures || []).map(m => m.id === updatedMatch.id ? updatedMatch : m);
    if (isKnockout) newFixtures = advanceKnockout(newFixtures) || [];
    updateTournaments(tournaments.map(t => t.id === tournament.id ? { ...t, fixtures: newFixtures } : t));
  };

  const simulateSingleMatch = (match) => {
    const hTeam = teams.find(t => t.id === match.home);
    const aTeam = teams.find(t => t.id === match.away);
    if (!hTeam || !aTeam) return;

    const hFmt = match.homeFormation || hTeam.formation || '4-4-2';
    const aFmt = match.awayFormation || aTeam.formation || '4-4-2';

    const hLineup = match.homeLineup || getAutomaticLineup(hTeam.players, hFmt);
    const aLineup = match.awayLineup || getAutomaticLineup(aTeam.players, aFmt);

    const { homeAdvantage, awayAdvantage } = calculateTacticalModifier(hFmt, aFmt);

    const hScore = rollDiceScore(homeAdvantage);
    const aScore = rollDiceScore(awayAdvantage);

    const hGoals = assignProceduralGoalScorers(hTeam.players, hLineup, hScore);
    const aGoals = assignProceduralGoalScorers(aTeam.players, aLineup, aScore);

    let hp = '', ap = '';
    if (isKnockout && hScore === aScore) {
      let pHome = Math.floor(Math.random() * 3) + 3;
      let pAway = pHome;
      while (pHome === pAway) {
        if (Math.random() > 0.5) pHome++; else pAway++;
      }
      hp = pHome;
      ap = pAway;
    }

    updateMatchInState({
      ...match,
      homeScore: hScore,
      awayScore: aScore,
      homeFormation: hFmt,
      awayFormation: aFmt,
      homeLineup: hLineup,
      awayLineup: aLineup,
      homeGoals: hGoals,
      awayGoals: aGoals,
      homePen: hp,
      awayPen: ap,
      played: true
    });
  };

  const realStandings = useMemo(() => calculateTournamentStandings(tournament, tournaments, teams), [tournament, effectiveIds, teams]);

  return (
    <div className="bg-gray-100 min-h-screen pb-24">
      <header className="bg-gradient-to-r from-green-800 to-green-700 text-white p-4 sticky top-0 z-20 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <button onClick={() => setView('play-list')} className="p-2 hover:bg-white/20 rounded-full cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <div>
            <h2 className="text-xl font-black">{tournament.name}</h2>
            <p className="text-[10px] text-green-200 uppercase tracking-widest font-black">Planilla en vivo</p>
          </div>
        </div>
      </header>

      <div className="flex border-b border-gray-200 bg-white sticky top-[68px] z-10 shadow-sm text-xs font-black">
        <button onClick={() => setTab('matches')} className={`flex-1 py-3 text-center border-b-2 ${tab === 'matches' ? 'border-green-600 text-green-700 bg-green-50/40' : 'border-transparent text-gray-500'}`}>FIXTURE</button>
        {!isKnockout && <button onClick={() => setTab('standings')} className={`flex-1 py-3 text-center border-b-2 ${tab === 'standings' ? 'border-green-600 text-green-700 bg-green-50/40' : 'border-transparent text-gray-500'}`}>POSICIONES</button>}
        <button onClick={() => setTab('scorers')} className={`flex-1 py-3 text-center border-b-2 ${tab === 'scorers' ? 'border-green-600 text-green-700 bg-green-50/40' : 'border-transparent text-gray-500'}`}>GOLEADORES</button>
      </div>

      <div className="p-4 max-w-4xl mx-auto animate-fade-in">
        {tab === 'matches' && (
          <div className="space-y-4">
            {tournament.fixtures?.map(m => {
              const hTeam = teams.find(t => t.id === m.home);
              const aTeam = teams.find(t => t.id === m.away);
              if (!hTeam || !aTeam) return null;
              return (
                <div key={m.id} className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-3 w-1/3">
                    <Shield team={hTeam} size="sm" />
                    <div>
                      <span className="font-bold text-sm text-gray-800 truncate block">{hTeam.name}</span>
                      <span className="text-[10px] font-mono text-gray-400 font-bold">{m.homeFormation || hTeam.formation || '4-4-2'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div onClick={() => setSelectedMatch(m)} className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg border border-gray-300 cursor-pointer font-black text-sm flex space-x-1 shadow-inner" title="Editar planilla">
                      <span>{m.played ? m.homeScore : '-'}</span>
                      <span>:</span>
                      <span>{m.played ? m.awayScore : '-'}</span>
                    </div>
                    <button onClick={() => simulateSingleMatch(m)} className="text-lg bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full cursor-pointer" title="Simular con dados tácticos">🎲</button>
                  </div>

                  <div className="flex items-center space-x-3 w-1/3 justify-end text-right">
                    <div>
                      <span className="font-bold text-sm text-gray-800 truncate block">{aTeam.name}</span>
                      <span className="text-[10px] font-mono text-gray-400 font-bold">{m.awayFormation || aTeam.formation || '4-4-2'}</span>
                    </div>
                    <Shield team={aTeam} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'standings' && !isKnockout && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <StandingsTable tournament={tournament} teams={teams} groupTeamIds={realStandings} />
          </div>
        )}

        {tab === 'scorers' && <ScorersTable tournament={tournament} />}
      </div>

      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          tournament={tournament}
          teams={teams}
          onClose={() => setSelectedMatch(null)}
          onSaveMatch={updateMatchInState}
        />
      )}
    </div>
  );
};