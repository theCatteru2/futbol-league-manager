import React, { useState, useMemo, useRef } from 'react';
import {
  generateId,
  generateRegionalName,
  createProceduralRoster,
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
  generateGroupPlayoffs,
  getGroupDetailedStandings,
  calculateTacticalModifier,
  detectIncomingSlots,
  resolveSlotTeamId
} from '../logic';
import { Button, Card, Shield, PosBadge, MatchDetailModal, StandingsTable, ScorersTable } from './ui';

export const TeamManager = ({ teams, countries, updateTeams, updateCountries, setView }) => {
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('ALL');
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamCountry, setNewTeamCountry] = useState(countries[0]?.id || 'ARG');
  const [error, setError] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPos, setNewPlayerPos] = useState('MED');
  const [showAddCountryModal, setShowAddCountryModal] = useState(false);
  const [newCountryCode, setNewCountryCode] = useState('');
  const [newCountryName, setNewCountryName] = useState('');
  const [newCountryFlag, setNewCountryFlag] = useState('🌐');
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

  const confirmDeleteTeam = () => {
    if (!teamToDelete) return;
    if (teams.length <= 2) {
      setError("Debes conservar al menos 2 equipos en la base de datos.");
      setTeamToDelete(null);
      return;
    }
    updateTeams(teams.filter(t => t.id !== teamToDelete.id));
    setTeamToDelete(null);
  };

  const handleCreateCountry = (e) => {
    e.preventDefault();
    const code = newCountryCode.trim().toUpperCase();
    const name = newCountryName.trim();
    if (!code || !name) return;
    if (countries.some(c => c.id === code)) {
      alert("Ya existe un país con ese código ISO.");
      return;
    }
    const created = { id: code, name, flag: newCountryFlag || '⚽' };
    updateCountries([...countries, created]);
    setNewCountryCode('');
    setNewCountryName('');
    setShowAddCountryModal(false);
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
    if (editingTeam.players.length <= 11) return setError("El plantel debe tener al menos 11 jugadores.");
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
            <span className="text-2xl">{countries.find(c => c.id === editingTeam.country)?.flag || '⚽'}</span>
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
              {countries.map(c => (
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
              <p className="text-[11px] text-gray-500">Nombres regionales según {countries.find(c => c.id === editingTeam.country)?.name}</p>
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
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-4 animate-fade-in pb-24 mt-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4 border-b pb-4">
        <div className="flex items-center">
          <button onClick={() => setView('main-menu')} className="mr-3 p-2 bg-gray-50 rounded-full hover:bg-gray-200 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-900">Base de Datos de Clubes</h2>
            <p className="text-xs text-gray-500 font-bold">Gestión de clubes, planteles y países</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddCountryModal(true)}
            className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 flex items-center space-x-1 cursor-pointer"
          >
            <span>🌍</span> <span>Crear País</span>
          </button>
          <button
            onClick={() => singleTeamInputRef.current?.click()}
            className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100 flex items-center space-x-1 cursor-pointer"
          >
            <span>📥</span> <span>Importar</span>
          </button>
          <input type="file" ref={singleTeamInputRef} onChange={importSingleTeam} accept=".json" className="hidden" />
        </div>
      </div>

      <form onSubmit={handleAddTeam} className="flex flex-wrap gap-2 mb-4 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
        <input
          type="text"
          value={newTeamName}
          onChange={e => setNewTeamName(e.target.value)}
          placeholder="Nombre del nuevo club..."
          className="flex-1 min-w-[180px] p-2 border border-blue-200 rounded-lg outline-none font-bold text-sm bg-white"
        />
        <select
          value={newTeamCountry}
          onChange={e => setNewTeamCountry(e.target.value)}
          className="p-2 border border-blue-200 rounded-lg font-bold text-xs bg-white"
        >
          {countries.map(c => (
            <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
          ))}
        </select>
        <Button type="submit" className="text-xs">Añadir Club</Button>
      </form>

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
        {countries.map(c => {
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

      <div className="space-y-2 max-h-[56vh] overflow-y-auto no-scrollbar pr-1">
        {filteredTeams.map(team => {
          const cFlag = countries.find(c => c.id === (team.country || 'ARG'))?.flag || '⚽';
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
                  title="Exportar archivo (.json)"
                  className="text-gray-400 hover:text-blue-600 p-2 text-sm"
                >
                  💾
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setTeamToDelete(team); }}
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

      {teamToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-red-100 text-center animate-slide-up">
            <Shield team={teamToDelete} size="lg" className="mx-auto mb-3" />
            <h3 className="text-lg font-black text-gray-900 mb-1">¿Eliminar {teamToDelete.name}?</h3>
            <p className="text-xs text-gray-500 mb-6 font-bold">Esta acción quitará el equipo y su plantel de la base.</p>
            <div className="flex justify-center space-x-3">
              <Button variant="secondary" onClick={() => setTeamToDelete(null)}>Cancelar</Button>
              <Button variant="danger" onClick={confirmDeleteTeam}>Sí, Eliminar</Button>
            </div>
          </div>
        </div>
      )}

      {showAddCountryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-slide-up">
            <h3 className="text-lg font-black text-gray-900 mb-4">Agregar Nuevo País</h3>
            <form onSubmit={handleCreateCountry} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Código (ISO 3 letras)</label>
                <input
                  required
                  type="text"
                  maxLength={3}
                  placeholder="Ej: ESP, ENG, MEX"
                  value={newCountryCode}
                  onChange={e => setNewCountryCode(e.target.value.toUpperCase())}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm font-bold bg-gray-50 outline-none uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre</label>
                <input
                  required
                  type="text"
                  placeholder="Ej: España, Inglaterra"
                  value={newCountryName}
                  onChange={e => setNewCountryName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm font-bold bg-gray-50 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Bandera (Emoji)</label>
                <input
                  type="text"
                  placeholder="Ej: 🇪🇸, 🏴󠁧󠁢󠁥󠁮󠁧󠁿, 🇲🇽"
                  value={newCountryFlag}
                  onChange={e => setNewCountryFlag(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-lg text-center bg-gray-50 outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t">
                <Button variant="secondary" onClick={() => setShowAddCountryModal(false)}>Cancelar</Button>
                <Button type="submit">Guardar País</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const FederationView = ({ federations, tournaments, updateFederations, setView, setActiveTournamentId }) => {
  const [newFedName, setNewFedName] = useState('');
  const [editingFed, setEditingFed] = useState(null);

  const handleCreateFed = (e) => {
    e.preventDefault();
    if (!newFedName.trim()) return;
    const newFed = {
      id: generateId(),
      name: newFedName.trim(),
      tournamentIds: []
    };
    updateFederations([...federations, newFed]);
    setNewFedName('');
  };

  const toggleTournamentInFed = (fedId, tId) => {
    updateFederations(federations.map(f => {
      if (f.id === fedId) {
        const has = f.tournamentIds.includes(tId);
        return {
          ...f,
          tournamentIds: has ? f.tournamentIds.filter(id => id !== tId) : [...f.tournamentIds, tId]
        };
      }
      return f;
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 animate-fade-in space-y-6">
      <header className="flex items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={() => setView('main-menu')} className="mr-4 p-2 bg-gray-50 rounded-full hover:bg-gray-200 transition-colors">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <div>
          <h1 className="text-2xl font-black text-emerald-900">Federaciones y Sistemas de Ligas</h1>
          <p className="text-gray-500 text-xs font-bold">Agrupa competencias en divisiones y pirámides</p>
        </div>
      </header>

      <form onSubmit={handleCreateFed} className="flex gap-2 bg-white p-3 rounded-2xl shadow-sm border border-gray-200">
        <input
          type="text"
          value={newFedName}
          onChange={e => setNewFedName(e.target.value)}
          placeholder="Nombre de la Federación o Sistema (Ej: AFA, Premier League Pyramid)..."
          className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none"
        />
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Crear Federación</Button>
      </form>

      <div className="grid grid-cols-1 gap-4">
        {federations.map(fed => {
          const fedTournaments = tournaments.filter(t => fed.tournamentIds.includes(t.id));
          return (
            <div key={fed.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="text-lg font-black text-gray-900">{fed.name}</h3>
                  <span className="text-xs text-gray-500 font-bold">{fedTournaments.length} torneos vinculados</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" className="text-xs py-1 px-3" onClick={() => setEditingFed(editingFed === fed.id ? null : fed.id)}>
                    {editingFed === fed.id ? "Listo" : "⚙️ Asignar Ligas"}
                  </Button>
                  <Button
                    variant="danger"
                    className="text-xs py-1 px-3"
                    onClick={() => updateFederations(federations.filter(f => f.id !== fed.id))}
                  >
                    Borrar
                  </Button>
                </div>
              </div>

              {editingFed === fed.id && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                  <span className="text-xs font-black uppercase text-gray-600 block">Marca las ligas pertenecientes a esta federación:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {tournaments.map(t => {
                      const isChecked = fed.tournamentIds.includes(t.id);
                      return (
                        <label key={t.id} className={`flex items-center space-x-2 p-2 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${isChecked ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-white border-gray-200 text-gray-700'}`}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleTournamentInFed(fed.id, t.id)}
                            className="rounded text-emerald-600"
                          />
                          <span className="truncate">{t.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {fedTournaments.map(t => (
                  <div key={t.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-black text-sm text-gray-800 block truncate max-w-[150px]">{t.name}</span>
                      <span className="text-[10px] text-gray-500 uppercase font-bold">{t.format}</span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => { setActiveTournamentId(t.id); setView('edit-tournament'); }}
                        className="p-1.5 bg-white border border-gray-300 rounded-lg text-xs hover:bg-gray-100"
                        title="Configurar liga"
                      >
                        ⚙️
                      </button>
                      <button
                        onClick={() => { setActiveTournamentId(t.id); setView('play-tournament'); }}
                        className="p-1.5 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700"
                        title="Jugar liga"
                      >
                        ⚽
                      </button>
                    </div>
                  </div>
                ))}
                {fedTournaments.length === 0 && (
                  <p className="col-span-full text-xs text-gray-400 italic">No hay competencias asignadas a esta federación aún.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Dashboard = ({ tournaments, teams, updateTournaments, setView, setActiveTournamentId, onResetTournament }) => {
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
                      if (tId && tId.startsWith('SLOT:')) {
                        return <div key={idx} className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] flex items-center justify-center border border-white" title={tId}>?</div>;
                      }
                      const tm = teams.find(x => x.id === tId);
                      return tm ? <Shield key={idx} team={tm} size="sm" /> : null;
                    })}
                  </div>
                  <div className="space-x-1.5 flex">
                    <button
  type="button"
  onClick={() => {
    let effIds = resolveEffectiveParticipants(t.id, tournaments, teams);
    if (!effIds || effIds.length === 0) {
      const detected = detectIncomingSlots(t.id, tournaments);
      effIds = detected.map(s => s.slotId);
    }
    const freshFixtures = generateFixtures(t, effIds);
    updateTournaments(tournaments.map(curr => curr.id === t.id ? {
      ...curr,
      fixtures: freshFixtures
    } : curr));
  }}
  className="text-xs p-1.5 border border-amber-300 bg-amber-50 text-amber-800 rounded-lg font-bold hover:bg-amber-100 cursor-pointer"
  title="Regenera los grupos y el calendario desde cero"
>
  🔄 Reiniciar
</button>
                    <Button variant="outline" className="text-xs py-1 px-2.5" onClick={() => { setActiveTournamentId(t.id); setView('edit-tournament'); }}>⚙️ Ajustes</Button>
                    <Button variant="danger" className="text-xs py-1 px-2.5" onClick={() => setTournamentToDelete(t.id)}>Borrar</Button>
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

export const TournamentForm = ({ view, tournaments, teams, countries, updateTournaments, activeTournamentId, setView }) => {
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
    hasPlayoffs: false,
    playoffLegs: 1,
    numPaths: 1,
    qualifications: [],
    slotPlacements: {},
    legs: 1,
    finalLegs: 1,
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

  const incomingDetectedSlots = useMemo(() => {
    return detectIncomingSlots(tForm.id, tournaments);
  }, [tForm.id, tournaments]);

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
      participants: pool.slice(0, prev.numTeams || pool.length).map(t => t.id)
    }));
  };

  const toggleStartEmpty = (checked) => {
    if (checked) {
      setTForm(prev => ({ ...prev, startEmpty: true, participants: [] }));
    } else {
      setTForm(prev => ({
        ...prev,
        startEmpty: false,
        participants: teams.slice(0, prev.numTeams || 10).map(t => t.id)
      }));
    }
  };

  const handleNumTeamsChange = (val) => {
    const count = val === '' ? '' : parseInt(val);
    setTForm(prev => {
      if (count === '' || isNaN(count)) return { ...prev, numTeams: '' };
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
    setTForm(p => ({
      ...p,
      qualifications: [
        ...(p.qualifications || []),
        {
          targetTournamentId: tournaments.find(tr => tr.id !== p.id)?.id || '',
          startPos: 1,
          endPos: 1,
          type: (p.format === 'knockout' && (p.numPaths || 1) > 1) ? 'path_winner' : 'range',
          pathIndex: 0,
          groupSpecific: 0,
          groupPos: 1,
          count: 2,
          color: '#10b981'
        }
      ]
    }));
  };

  const updateQualification = (index, field, value) => {
    const updated = [...(tForm.qualifications || [])];
    updated[index] = { ...updated[index], [field]: value };
    setTForm({ ...tForm, qualifications: updated });
  };

  const removeQualification = (index) => {
    setTForm({ ...tForm, qualifications: tForm.qualifications.filter((_, i) => i !== index) });
  };

  const setSlotTargetPlacement = (slotId, placement) => {
    setTForm(prev => ({
      ...prev,
      slotPlacements: {
        ...(prev.slotPlacements || {}),
        [slotId]: Number(placement)
      }
    }));
  };

  const autoSortSlots = () => {
    const numGroups = Math.max(1, parseInt(tForm.numGroups) || 2);
    const capacityPerGroup = Math.max(1, Math.floor((parseInt(tForm.numTeams) || 32) / numGroups));
    const newPlacements = {};
    const groupCounts = Array(numGroups).fill(0);

    if (tForm.format === 'groups') {
      const bySource = {};
      incomingDetectedSlots.forEach(s => {
        const key = s.sourceTournamentId || 'DEFAULT';
        if (!bySource[key]) bySource[key] = [];
        bySource[key].push(s.slotId);
      });

      const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

      Object.values(bySource).forEach(slotsArray => {
        slotsArray.forEach(slotId => {
          let chosenGroup = -1;
          const candidateGroups = shuffle(Array.from({ length: numGroups }, (_, i) => i));

          for (let g of candidateGroups) {
            if (groupCounts[g] < capacityPerGroup) {
              chosenGroup = g;
              break;
            }
          }

          if (chosenGroup === -1) {
            for (let g = 0; g < numGroups; g++) {
              if (groupCounts[g] < capacityPerGroup) {
                chosenGroup = g;
                break;
              }
            }
          }

          if (chosenGroup !== -1) {
            newPlacements[slotId] = chosenGroup;
            groupCounts[chosenGroup]++;
          }
        });
      });
    } else {
      const capacity = Math.max(2, parseInt(tForm.numTeams) || incomingDetectedSlots.length || 8);
      const shuffledLines = Array.from({ length: capacity }, (_, i) => i).sort(() => Math.random() - 0.5);
      incomingDetectedSlots.forEach((s, idx) => {
        newPlacements[s.slotId] = shuffledLines[idx % shuffledLines.length];
      });
    }

    setTForm(prev => ({
      ...prev,
      slotPlacements: { ...newPlacements },
      fixtures: null
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const finalNumTeams = tForm.numTeams === '' ? 2 : Math.max(1, parseInt(tForm.numTeams) || 2);
    const fixedParticipants = tForm.startEmpty ? [] : (tForm.participants || []);

    let manualKnockoutOrder = null;
    if (tForm.format === 'knockout' && tForm.slotPlacements) {
      manualKnockoutOrder = Array.from({ length: finalNumTeams }, () => 'TBD');
      Object.entries(tForm.slotPlacements).forEach(([sId, lineIdx]) => {
        const idx = parseInt(lineIdx);
        if (idx >= 0 && idx < finalNumTeams) manualKnockoutOrder[idx] = sId;
      });
      let fIndex = 0;
      for (let i = 0; i < finalNumTeams; i++) {
        if (manualKnockoutOrder[i] === 'TBD' && fixedParticipants[fIndex]) {
          manualKnockoutOrder[i] = fixedParticipants[fIndex];
          fIndex++;
        }
      }
    }

    const finalForm = {
      ...tForm,
      numTeams: finalNumTeams,
      numPaths: tForm.format === 'knockout' ? (parseInt(tForm.numPaths) || 1) : 1,
      winPoints: tForm.winPoints ?? 3,
      drawPoints: tForm.drawPoints ?? 1,
      losePoints: tForm.losePoints ?? 0,
      legs: tForm.legs || 1,
      finalLegs: tForm.finalLegs ?? (tForm.legs || 1),
      manualKnockout: manualKnockoutOrder,
      participants: fixedParticipants
    };

    // Si está iniciado, SIEMPRE forzar la regeneración del fixture para aplicar los grupos actuales de slotPlacements
    if (finalForm.status === 'started') {
      let effIds = resolveEffectiveParticipants(finalForm.id, tournaments, teams);
      if (!effIds || effIds.length === 0) {
        effIds = incomingDetectedSlots.map(s => s.slotId);
      }
      finalForm.fixtures = generateFixtures(finalForm, effIds);
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
          <input required type="text" value={tForm.name} onChange={e => setTForm({ ...tForm, name: e.target.value })} placeholder="Ej: Copa Libertadores, Repechaje Clasificatorio" className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-blue-500 text-lg" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Estado</label>
            <select value={tForm.status} onChange={e => setTForm({ ...tForm, status: e.target.value })} className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 font-bold text-sm outline-none">
              <option value="started">▶ Iniciado (Genera Fixture)</option>
              <option value="draft">Borrador</option>
              <option value="finished">🏁 Finalizado (Habilita cupos)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Cupos Totales</label>
            <input
              disabled={isLocked}
              type="number"
              min="2"
              value={tForm.numTeams}
              onChange={e => handleNumTeamsChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 font-black text-center text-lg outline-none"
            />
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

          <div className="mt-3 pt-3 border-t border-blue-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-blue-900">
                {tForm.format === 'knockout' ? 'Rondas previas' : 'Modalidad de partidos'}
              </span>
              <select
                disabled={isLocked}
                value={tForm.legs || 1}
                onChange={e => setTForm({ ...tForm, legs: Number(e.target.value) })}
                className="p-2 border border-blue-200 rounded-lg bg-white text-xs font-bold outline-none text-blue-800 shadow-sm"
              >
                <option value={1}>{tForm.format === 'knockout' ? 'Partido Único' : 'Una sola rueda'}</option>
                <option value={2}>Ida y Vuelta</option>
              </select>
            </div>

            {tForm.format === 'knockout' && (
              <div className="flex items-center justify-between pt-2 border-t border-blue-100/70">
                <span className="text-sm font-black text-amber-700 flex items-center space-x-1">
                  <span>🏆</span> <span>Final</span>
                </span>
                <select
                  disabled={isLocked}
                  value={tForm.finalLegs ?? (tForm.legs || 1)}
                  onChange={e => setTForm({ ...tForm, finalLegs: Number(e.target.value) })}
                  className="p-2 border border-amber-300 rounded-lg bg-amber-50 text-xs font-black outline-none text-amber-900 shadow-sm"
                >
                  <option value={1}>Partido Único (Cancha neutral/90 min)</option>
                  <option value={2}>Ida y Vuelta (2 partidos)</option>
                </select>
              </div>
            )}
          </div>

          {tForm.format === 'knockout' && (
            <div className="bg-white p-3 rounded-xl border border-blue-200 mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Estructura de Llaves / Rutas</label>
                  <select
                    disabled={isLocked}
                    value={tForm.numPaths || 1}
                    onChange={e => setTForm({ ...tForm, numPaths: parseInt(e.target.value) || 1, fixtures: null })}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-xs font-bold outline-none"
                  >
                    <option value={1}>1 Llave única tradicional</option>
                    <option value={2}>2 Llaves independientes (Rutas A y B)</option>
                    <option value={3}>3 Llaves (Estilo Repechaje UEFA: A, B y C)</option>
                    <option value={4}>4 Llaves independientes</option>
                    <option value={8}>8 Llaves independientes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Sorteo Llaves</label>
                  <select
                    disabled={isLocked}
                    value={tForm.drawType || 'auto'}
                    onChange={e => setTForm({ ...tForm, drawType: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-xs font-bold outline-none"
                  >
                    <option value="auto">Automático</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>

              {(tForm.numPaths || 1) > 1 && (
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[11px] text-amber-900 font-bold">
                  ℹ️ Los {tForm.numTeams || 12} equipos se dividirán en {tForm.numPaths} rutas separadas de {Math.floor((tForm.numTeams || 12) / tForm.numPaths)} equipos cada una. Cada ruta consagrará a su propio campeón.
                </div>
              )}
            </div>
          )}

          {tForm.format === 'groups' && (
            <div className="space-y-3 mt-4 pt-3 border-t border-blue-200/60">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1 leading-tight">Cant. Grupos</label>
                  <input disabled={isLocked} type="number" min="1" value={tForm.numGroups} onChange={e => setTForm({ ...tForm, numGroups: Number(e.target.value) })} className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-center font-bold" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1 leading-tight">Pasan x Grupo</label>
                  <input disabled={isLocked} type="number" min="1" value={tForm.advancingPerGroup} onChange={e => setTForm({ ...tForm, advancingPerGroup: Number(e.target.value) })} className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-center font-bold" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1 leading-tight">Sorteo</label>
                  <select disabled={isLocked} value={tForm.drawType || 'auto'} onChange={e => setTForm({ ...tForm, drawType: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-xs font-bold outline-none">
                    <option value="auto">Auto</option><option value="manual">Manual</option>
                  </select>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-blue-200 space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tForm.hasPlayoffs}
                    onChange={e => setTForm({ ...tForm, hasPlayoffs: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-xs font-black text-blue-900">Activar Fase Eliminatoria (Playoffs) tras grupos</span>
                </label>

                {tForm.hasPlayoffs && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                    <div>
                      <span className="text-[10px] font-bold text-gray-600 block">Rondas Playoffs:</span>
                      <select
                        value={tForm.playoffLegs || 1}
                        onChange={e => setTForm({ ...tForm, playoffLegs: Number(e.target.value) })}
                        className="w-full p-1.5 border rounded text-xs font-bold bg-gray-50"
                      >
                        <option value={1}>Partido Único</option>
                        <option value={2}>Ida y Vuelta</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-600 block">Final Playoff:</span>
                      <select
                        value={tForm.finalLegs || 1}
                        onChange={e => setTForm({ ...tForm, finalLegs: Number(e.target.value) })}
                        className="w-full p-1.5 border rounded text-xs font-bold bg-gray-50"
                      >
                        <option value={1}>Partido Único</option>
                        <option value={2}>Ida y Vuelta</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-bold text-gray-900 block">Equipos Fijos Iniciales</span>
              <span className={`text-xs font-bold ${tForm.startEmpty || (tForm.participants || []).length === 0 ? 'text-amber-600' : 'text-blue-600'}`}>
                {tForm.startEmpty || (tForm.participants || []).length === 0 
                  ? "Torneo vacío (clasificarán desde otros torneos)" 
                  : `${(tForm.participants || []).length} / ${tForm.numTeams || 10} seleccionados`}
              </span>
            </div>
            <div className="flex space-x-1.5">
              {(tForm.participants || []).length > 0 && (
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={clearAllParticipants}
                  className="text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Vaciar
                </button>
              )}
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
              className="w-4 h-4 rounded text-blue-600 border-gray-300"
            />
            <span className="text-xs font-bold text-gray-600">
              Iniciar torneo 100% vacío (los cupos se llenarán exclusivamente con clasificaciones)
            </span>
          </label>
        </div>

        {/* MÓDULO REACTIVO DE CUPOS ENTRANTES DETECTADOS */}
        <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-300/80 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-black text-amber-950 flex items-center space-x-1">
                <span>📥</span> <span>Cupos Detectados desde Otros Torneos</span>
              </span>
              <span className="text-[11px] text-amber-800 font-bold block">
                {incomingDetectedSlots.length} cupo(s) apuntan a este torneo
              </span>
            </div>

            {incomingDetectedSlots.length > 0 && (
              <button
                type="button"
                onClick={autoSortSlots}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-sm cursor-pointer"
                title="Sortea la posición de los cupos evitando cruces tempranos entre torneos iguales"
              >
                🎲 Sorteo Inteligente
              </button>
            )}
          </div>

          {incomingDetectedSlots.length === 0 ? (
            <p className="text-xs text-amber-700/80 italic bg-white/60 p-3 rounded-xl border border-amber-200">
              Ningún torneo tiene configurado un cupo hacia este torneo aún. Ve al torneo de origen y agrega un <b>"+ Cupo Saliente"</b> con destino a este.
            </p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-1">
              {incomingDetectedSlots.map((slot, sIdx) => {
                const numGroups = Math.max(1, parseInt(tForm.numGroups) || 2);
                const rawVal = tForm.slotPlacements?.[slot.slotId];
                const currentPlacement = (rawVal !== undefined && rawVal !== null)
                  ? parseInt(rawVal, 10)
                  : (sIdx % numGroups);

                return (
                  <div 
                    key={`${slot.slotId}-${currentPlacement}`} 
                    className="bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between shadow-sm text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                        {slot.sourceName}
                      </span>
                      <span className="font-bold text-gray-800">{slot.label}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] text-gray-500 font-black uppercase">
                        {tForm.format === 'knockout' ? "Línea:" : "Grupo:"}
                      </span>
                      {tForm.format === 'knockout' ? (
                        <select
                          value={String(currentPlacement)}
                          onChange={e => setSlotTargetPlacement(slot.slotId, parseInt(e.target.value, 10))}
                          className="p-1 border border-gray-300 rounded font-black bg-gray-50 text-xs"
                        >
                          {Array.from({ length: parseInt(tForm.numTeams) || 8 }).map((_, lIdx) => (
                            <option key={lIdx} value={String(lIdx)}>Línea #{lIdx + 1}</option>
                          ))}
                        </select>
                      ) : (
                        <select
                          value={String(currentPlacement)}
                          onChange={e => setSlotTargetPlacement(slot.slotId, parseInt(e.target.value, 10))}
                          className="p-1 border border-gray-300 rounded font-black bg-gray-50 text-xs"
                        >
                          {Array.from({ length: numGroups }).map((_, gIdx) => (
                            <option key={gIdx} value={String(gIdx)}>Grupo {String.fromCharCode(65 + gIdx)}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MÓDULO DE CUPOS SALIENTES (Hacia otros torneos) */}
        <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-sm font-black text-indigo-950 block">📤 Otorgar Cupos hacia Otros Torneos</span>
              <span className="text-[11px] text-indigo-700">Define qué puestos de este torneo viajan a otros</span>
            </div>
            <Button type="button" className="text-xs py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700" onClick={addQualification}>+ Cupo Saliente</Button>
          </div>

          <div className="space-y-2.5">
            {(!tForm.qualifications || tForm.qualifications.length === 0) ? (
              <p className="text-xs text-indigo-400 italic py-2">No hay cupos salientes configurados.</p>
            ) : (
              tForm.qualifications.map((q, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-indigo-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-bold">
                  {tForm.format === 'knockout' && (tForm.numPaths || 1) > 1 ? (
                    <div className="flex items-center space-x-1.5">
                      <span className="text-gray-500 font-bold">Otorgar a:</span>
                      <select
                        value={q.pathIndex ?? 0}
                        onChange={e => updateQualification(idx, 'pathIndex', parseInt(e.target.value))}
                        className="p-1 border rounded bg-gray-50 text-xs font-black"
                      >
                        {Array.from({ length: tForm.numPaths || 1 }).map((_, pIdx) => (
                          <option key={pIdx} value={pIdx}>Ganador de la Ruta {String.fromCharCode(65 + pIdx)}</option>
                        ))}
                      </select>
                    </div>
                  ) : tForm.format === 'groups' ? (
                    <div className="flex items-center space-x-1.5">
                      <select
                        value={q.type || 'range'}
                        onChange={e => updateQualification(idx, 'type', e.target.value)}
                        className="p-1 border rounded bg-gray-50 text-xs"
                      >
                        <option value="range">Rango general</option>
                        <option value="group_pos">Puesto de grupo</option>
                        <option value="best_thirds">Mejores 3º de grupos</option>
                      </select>

                      {q.type === 'best_thirds' ? (
                        <>
                          <span className="text-gray-400">Pasan</span>
                          <input
                            type="number"
                            min="1"
                            value={q.count || 2}
                            onChange={e => updateQualification(idx, 'count', e.target.value)}
                            className="w-10 text-center border p-1 rounded font-black"
                          />
                        </>
                      ) : q.type === 'group_pos' ? (
                        <>
                          <span className="text-gray-400">Pos</span>
                          <input
                            type="number"
                            min="1"
                            value={q.groupPos || 1}
                            onChange={e => updateQualification(idx, 'groupPos', e.target.value)}
                            className="w-10 text-center border p-1 rounded font-black"
                          />
                          <span className="text-gray-400">Grp</span>
                          <select
                            value={q.groupSpecific || 0}
                            onChange={e => updateQualification(idx, 'groupSpecific', e.target.value)}
                            className="p-1 border rounded bg-gray-50"
                          >
                            {Array.from({ length: tForm.numGroups || 2 }).map((_, g) => (
                              <option key={g} value={g}>{String.fromCharCode(65 + g)}</option>
                            ))}
                          </select>
                        </>
                      ) : (
                        <>
                          <input
                            type="number"
                            min="1"
                            value={q.startPos}
                            onChange={e => updateQualification(idx, 'startPos', e.target.value)}
                            className="w-10 text-center border p-1 rounded font-black"
                          />
                          <span className="text-gray-400">al</span>
                          <input
                            type="number"
                            min="1"
                            value={q.endPos}
                            onChange={e => updateQualification(idx, 'endPos', e.target.value)}
                            className="w-10 text-center border p-1 rounded font-black"
                          />
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5">
                      <span className="text-gray-500 font-bold">Puesto</span>
                      <input
                        type="number"
                        min="1"
                        value={q.startPos}
                        onChange={e => updateQualification(idx, 'startPos', e.target.value)}
                        className="w-11 text-center bg-gray-50 border border-gray-300 rounded p-1 font-black text-xs"
                      />
                      <span className="text-gray-400">al</span>
                      <input
                        type="number"
                        min="1"
                        value={q.endPos}
                        onChange={e => updateQualification(idx, 'endPos', e.target.value)}
                        className="w-11 text-center bg-gray-50 border border-gray-300 rounded p-1 font-black text-xs"
                      />
                    </div>
                  )}

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
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700">{(tForm.participants || []).length} / {tForm.numTeams || 10}</span>
            </div>

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
              {countries.map(c => (
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
                {modalCountryFilter === 'ALL' ? "Mostrando todos los clubes" : `Mostrando clubes de ${countries.find(c => c.id === modalCountryFilter)?.name}`}
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
                const cFlag = countries.find(c => c.id === (team.country || 'ARG'))?.flag || '⚽';
                return (
                  <div key={team.id} onClick={() => {
                    const current = tForm.participants || [];
                    if (isSelected) setTForm({ ...tForm, participants: current.filter(id => id !== team.id) });
                    else if (current.length < (tForm.numTeams || 10)) setTForm({ ...tForm, participants: [...current, team.id] });
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

export const ManualDrawModal = ({ tournament, teams, tournaments, onClose, onSave }) => {
  const effectiveIds = resolveEffectiveParticipants(tournament.id, tournaments, teams);
  const [manualMap, setManualMap] = useState(tournament.manualPlacements || {});

  const capacity = parseInt(tournament.numTeams) || effectiveIds.length;
  const defaultKnockout = Array.from({ length: capacity }, (_, i) => effectiveIds[i] || 'TBD');
  const [manualKnockout, setManualKnockout] = useState(tournament.manualKnockout || defaultKnockout);

  const handleSave = () => {
    onSave({ ...tournament, manualPlacements: manualMap, manualKnockout: manualKnockout, fixtures: null });
    onClose();
  };

  const getParticipantLabel = (id) => {
    if (!id || id === 'TBD') return '-- Por Definir / Libre --';
    if (id.startsWith('SLOT:')) {
      const parts = id.split(':');
      const srcT = tournaments.find(t => t.id === parts[1]);
      return `📥 [${srcT?.name || 'Origen'}] ${parts[2]} (${parts[3] || '1'})`;
    }
    const tm = teams.find(t => t.id === id);
    return tm ? tm.name : id;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[85vh] flex flex-col border border-gray-100 animate-slide-up">
        <h3 className="text-xl font-bold mb-1 text-gray-900">Sorteo Manual</h3>
        <p className="text-gray-500 text-xs mb-4 font-bold uppercase tracking-wide">{tournament.name}</p>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 no-scrollbar bg-gray-50 p-3 rounded-xl border border-gray-200">
          {tournament.format === 'groups' ? (
            effectiveIds.filter(id => id !== 'TBD').map(id => {
              const currentGroup = manualMap[id] ?? 0;
              const isSlot = id.startsWith('SLOT:');
              const team = teams.find(t => t.id === id);

              return (
                <div key={id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-3">
                    {isSlot ? (
                      <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">📥</div>
                    ) : (
                      <Shield team={team} size="sm" />
                    )}
                    <span className="text-sm font-bold text-gray-800">{getParticipantLabel(id)}</span>
                  </div>
                  <select
                    value={currentGroup}
                    onChange={e => setManualMap({ ...manualMap, [id]: parseInt(e.target.value) })}
                    className="p-2 border border-gray-300 rounded-lg text-sm font-bold bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {Array.from({ length: parseInt(tournament.numGroups) || 2 }).map((_, gIdx) => (
                      <option key={gIdx} value={gIdx}>Grupo {String.fromCharCode(65 + gIdx)}</option>
                    ))}
                  </select>
                </div>
              );
            })
          ) : (
            manualKnockout.map((id, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2 py-1 rounded-md uppercase tracking-wider">Línea #{index + 1}</span>
                <select
                  value={id || 'TBD'}
                  onChange={e => {
                    const updated = [...manualKnockout];
                    updated[index] = e.target.value;
                    setManualKnockout(updated);
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 ml-3 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TBD">-- Por Definir / Libre --</option>
                  {effectiveIds.filter(tid => tid !== 'TBD').map(tid => (
                    <option key={tid} value={tid}>{getParticipantLabel(tid)}</option>
                  ))}
                </select>
              </div>
            ))
          )}
        </div>
        <p className="text-red-500 text-[10px] font-bold mb-3 italic">⚠️ Guardar reiniciará el fixture actual para rearmar las llaves.</p>
        <div className="flex justify-end space-x-3 border-t border-gray-100 pt-3">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} className="shadow-md">Confirmar Sorteo</Button>
        </div>
      </div>
    </div>
  );
};

export const PlayView = ({ tournaments, teams, updateTournaments, activeTournamentId, setView, onResetTournament }) => {
  const tournament = tournaments.find(t => t.id === activeTournamentId);
  const [tab, setTab] = useState('matches');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [selectedPathFilter, setSelectedPathFilter] = useState(0);

  if (!tournament) return null;

  if (tournament.status === 'draft') {
    return (
      <div className="max-w-xl mx-auto p-4 mt-8 animate-fade-in">
        <header className="flex items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <button onClick={() => setView('play-list')} className="mr-4 p-2 bg-gray-50 rounded-full hover:bg-gray-200 transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <h2 className="text-xl font-bold text-gray-900">{tournament.name}</h2>
        </header>
        <div className="p-8 text-center text-gray-600 bg-white rounded-2xl shadow-sm border-2 border-dashed border-amber-300 font-medium">
          <span className="text-4xl mb-4 block">🚧</span>
          El torneo está en fase de Borrador. <br /><br />
          Ve a "Configurar Torneos", edita este torneo y cámbialo a estado <b>"▶ Iniciado"</b> para generar el Fixture.
        </div>
      </div>
    );
  }

  const effectiveIds = resolveEffectiveParticipants(tournament.id, tournaments, teams);
  const isKnockout = tournament.format === 'knockout';
  const numPaths = parseInt(tournament.numPaths) || 1;

  const handleHardResetTournament = () => {
    const numGroups = parseInt(tournament.numGroups) || 8;
    const capacityPerGroup = Math.max(2, Math.floor((parseInt(tournament.numTeams) || 32) / numGroups));
    const totalRequired = numGroups * capacityPerGroup;

    // 1. Obtener cupos reales actuales directamente desde las reglas
    const detected = detectIncomingSlots(tournament.id, tournaments);
    let pool = detected.map(s => s.slotId);

    // Si tiene participantes fijos seleccionados, incluirlos
    if (tournament.participants && tournament.participants.length > 0) {
      pool = [...tournament.participants, ...pool];
    }

    pool = [...new Set(pool.filter(Boolean))];

    // Completar solo en caso de que falten plazas
    let fillCounter = 1;
    while (pool.length < totalRequired) {
      const placeholder = `SLOT:PENDING:${fillCounter++}`;
      if (!pool.includes(placeholder)) pool.push(placeholder);
    }
    pool = pool.slice(0, totalRequired);

    // 2. Barajar aleatoriamente
    pool.sort(() => Math.random() - 0.5);

    // 3. Distribuir estrictamente en 8 grupos de 4 integrantes
    const groups = Array.from({ length: numGroups }, (_, i) => pool.slice(i * capacityPerGroup, (i + 1) * capacityPerGroup));
    const newPlacements = {};
    groups.forEach((gTeams, gIdx) => {
      gTeams.forEach(id => {
        newPlacements[id] = gIdx;
      });
    });

    // 4. Generar partidos limpios desde cero
    const legs = parseInt(tournament.legs) || 1;
    const freshFixtures = [];

    groups.forEach((gTeams, gIdx) => {
      const n = gTeams.length;
      const rounds = n - 1;
      const matchesPerRound = n / 2;

      const gMatches = [];
      for (let round = 0; round < rounds; round++) {
        for (let m = 0; m < matchesPerRound; m++) {
          const homeIdx = (round + m) % (n - 1);
          let awayIdx = (n - 1 - m + round) % (n - 1);
          if (m === 0) awayIdx = n - 1;

          const isAlt = (round % 2 === 1 && m === 0);
          gMatches.push({
            id: 'fix_' + Math.random().toString(36).substr(2, 9),
            group: gIdx,
            round: round + 1,
            home: isAlt ? gTeams[awayIdx] : gTeams[homeIdx],
            away: isAlt ? gTeams[homeIdx] : gTeams[awayIdx],
            homeScore: '',
            awayScore: '',
            homeGoals: [],
            awayGoals: [],
            played: false,
            isPlayoff: false
          });
        }
      }

      if (legs === 2) {
        const secondLeg = gMatches.map(m => ({
          id: 'fix_' + Math.random().toString(36).substr(2, 9),
          group: gIdx,
          round: m.round + rounds,
          home: m.away,
          away: m.home,
          homeScore: '',
          awayScore: '',
          homeGoals: [],
          awayGoals: [],
          played: false,
          isPlayoff: false
        }));
        freshFixtures.push(...gMatches, ...secondLeg);
      } else {
        freshFixtures.push(...gMatches);
      }
    });

    freshFixtures.sort((a, b) => a.round !== b.round ? a.round - b.round : a.group - b.group);

    const updatedTournament = {
      ...tournament,
      slotPlacements: newPlacements,
      manualPlacements: newPlacements,
      fixtures: freshFixtures
    };

    // Actualizar estado y persistencia
    try {
      const KEY = 'futbol-league-manager-tournaments';
      const stored = JSON.parse(localStorage.getItem(KEY) || '[]');
      const idx = stored.findIndex(t => t.id === tournament.id);
      if (idx !== -1) {
        stored[idx] = updatedTournament;
        localStorage.setItem(KEY, JSON.stringify(stored));
      }
    } catch (e) {
      console.error(e);
    }

    updateTournaments(tournaments.map(t => t.id === tournament.id ? updatedTournament : t));
  };

  const getTeamDisplay = (id) => {
    if (!id || id === 'TBD') return { name: 'Por definir', isSlot: false, team: null };
    if (id.startsWith('SLOT:')) {
      const resolved = resolveSlotTeamId(id, tournaments, teams);
      if (resolved && !resolved.startsWith('SLOT:')) {
        const tm = teams.find(t => t.id === resolved);
        return { name: tm?.name || resolved, isSlot: false, team: tm };
      }
      const parts = id.split(':');
      const src = tournaments.find(t => t.id === parts[1]);
      let detail = `Puesto ${parts[3] || '1'}`;
      if (parts[2] === 'best_thirds') detail = `${parts[3]}º Mejor 3º`;
      if (parts[2] === 'group_pos') detail = `${parts[4]}º Grp ${String.fromCharCode(65 + parseInt(parts[3] || 0))}`;
      if (parts[2] === 'path_winner') detail = `Ganador Ruta ${String.fromCharCode(65 + parseInt(parts[3] || 0))}`;
      return { name: `📥 [${src?.name || 'Origen'}] ${detail}`, isSlot: true, team: null };
    }
    const tm = teams.find(t => t.id === id);
    return { name: tm?.name || id, isSlot: false, team: tm };
  };

  const currentGroupsData = useMemo(() => {
    if (tournament.format !== 'groups') return [];
    return getGroupDetailedStandings(tournament, teams, tournaments);
  }, [tournament, teams, tournaments]);

  const updateMatchValue = (matchId, field, val) => {
    let newFixtures = (tournament.fixtures || []).map(m => {
      if (m.id === matchId) {
        const updated = { ...m, [field]: val };
        const hResolved = (updated.home && updated.home.startsWith('SLOT:')) ? resolveSlotTeamId(updated.home, tournaments, teams) : updated.home;
        const aResolved = (updated.away && updated.away.startsWith('SLOT:')) ? resolveSlotTeamId(updated.away, tournaments, teams) : updated.away;

        const hTeam = teams.find(t => t.id === hResolved);
        const aTeam = teams.find(t => t.id === aResolved);

        const hFmt = updated.homeFormation || hTeam?.formation || '4-4-2';
        const aFmt = updated.awayFormation || aTeam?.formation || '4-4-2';
        const hLineup = updated.homeLineup || (hTeam ? getAutomaticLineup(hTeam.players, hFmt) : []);
        const aLineup = updated.awayLineup || (aTeam ? getAutomaticLineup(aTeam.players, aFmt) : []);

        updated.homeFormation = hFmt;
        updated.awayFormation = aFmt;
        updated.homeLineup = hLineup;
        updated.awayLineup = aLineup;

        if (field === 'homeScore' && hTeam) {
          const numGoals = val === '' ? 0 : Math.max(0, parseInt(val) || 0);
          updated.homeGoals = assignProceduralGoalScorers(hTeam.players, hLineup, numGoals);
        }
        if (field === 'awayScore' && aTeam) {
          const numGoals = val === '' ? 0 : Math.max(0, parseInt(val) || 0);
          updated.awayGoals = assignProceduralGoalScorers(aTeam.players, aLineup, numGoals);
        }

        const h1 = updated.homeScore; const a1 = updated.awayScore;
        const h2 = updated.homeScore2; const a2 = updated.awayScore2;

        if (m.legs === 2) {
          updated.played = h1 !== '' && a1 !== '' && h2 !== '' && a2 !== '' && h2 !== undefined && a2 !== undefined;
        } else {
          updated.played = h1 !== '' && a1 !== '';
        }

        return updated;
      }
      return m;
    });

    if (isKnockout || tournament.hasPlayoffs) newFixtures = advanceKnockout(newFixtures);
    updateTournaments(tournaments.map(t => t.id === tournament.id ? { ...t, fixtures: newFixtures } : t));
  };

  const updateMatchInState = (updatedMatch) => {
    let newFixtures = (tournament.fixtures || []).map(m => m.id === updatedMatch.id ? updatedMatch : m);
    if (isKnockout || tournament.hasPlayoffs) newFixtures = advanceKnockout(newFixtures) || [];
    updateTournaments(tournaments.map(t => t.id === tournament.id ? { ...t, fixtures: newFixtures } : t));
  };

  const simulateSingleMatch = (match) => {
    const hResolved = (match.home && match.home.startsWith('SLOT:')) ? resolveSlotTeamId(match.home, tournaments, teams) : match.home;
    const aResolved = (match.away && match.away.startsWith('SLOT:')) ? resolveSlotTeamId(match.away, tournaments, teams) : match.away;

    const hTeam = teams.find(t => t.id === hResolved);
    const aTeam = teams.find(t => t.id === aResolved);
    if (!hTeam || !aTeam) return;

    const hFmt = match.homeFormation || hTeam.formation || '4-4-2';
    const aFmt = match.awayFormation || aTeam.formation || '4-4-2';
    const hLineup = match.homeLineup || getAutomaticLineup(hTeam.players, hFmt);
    const aLineup = match.awayLineup || getAutomaticLineup(aTeam.players, aFmt);
    const { homeAdvantage, awayAdvantage } = calculateTacticalModifier(hFmt, aFmt);

    const hScore = rollDiceScore(homeAdvantage);
    const aScore = rollDiceScore(awayAdvantage);
    let hScore2 = '', aScore2 = '', hp = '', ap = '';

    if (match.legs === 2) {
      hScore2 = rollDiceScore(awayAdvantage);
      aScore2 = rollDiceScore(homeAdvantage);
    }

    if (isKnockout || match.isKnockout) {
      const th = hScore + (hScore2 !== '' ? hScore2 : 0);
      const ta = aScore + (aScore2 !== '' ? aScore2 : 0);
      if (th === ta) {
        let pHome = Math.floor(Math.random() * 3) + 3;
        let pAway = pHome;
        while (pHome === pAway) {
          if (Math.random() > 0.5) pHome++; else pAway++;
        }
        hp = pHome; ap = pAway;
      }
    }

    const hGoals = assignProceduralGoalScorers(hTeam.players, hLineup, hScore);
    const aGoals = assignProceduralGoalScorers(aTeam.players, aLineup, aScore);

    updateMatchInState({
      ...match,
      homeScore: hScore,
      awayScore: aScore,
      homeScore2: hScore2,
      awayScore2: aScore2,
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

  const handleDiceBlock = (matches) => {
    let updatedFixtures = JSON.parse(JSON.stringify(tournament.fixtures || []));
    matches.forEach(m => {
      const hResolved = (m.home && m.home.startsWith('SLOT:')) ? resolveSlotTeamId(m.home, tournaments, teams) : m.home;
      const aResolved = (m.away && m.away.startsWith('SLOT:')) ? resolveSlotTeamId(m.away, tournaments, teams) : m.away;

      if (!hResolved || !aResolved || hResolved === 'TBD' || aResolved === 'TBD' || hResolved.startsWith('SLOT:') || aResolved.startsWith('SLOT:')) return;
      const mIndex = updatedFixtures.findIndex(f => f.id === m.id);
      if (mIndex !== -1) {
        const tm = updatedFixtures[mIndex];
        const hTeam = teams.find(t => t.id === hResolved);
        const aTeam = teams.find(t => t.id === aResolved);
        if (!hTeam || !aTeam) return;

        const { homeAdvantage, awayAdvantage } = calculateTacticalModifier(hTeam.formation, aTeam.formation);
        const h1 = rollDiceScore(homeAdvantage);
        const a1 = rollDiceScore(awayAdvantage);
        let h2 = '', a2 = '', hp = '', ap = '';

        if (tm.legs === 2) {
          h2 = rollDiceScore(awayAdvantage);
          a2 = rollDiceScore(homeAdvantage);
        }

        if (isKnockout || tm.isKnockout) {
          const th = h1 + (h2 !== '' ? h2 : 0);
          const ta = a1 + (a2 !== '' ? a2 : 0);
          if (th === ta) {
            let pHome = Math.floor(Math.random() * 3) + 3;
            let pAway = pHome;
            while (pHome === pAway) {
              if (Math.random() > 0.5) pHome++; else pAway++;
            }
            hp = pHome; ap = pAway;
          }
        }

        const hGoals1 = assignProceduralGoalScorers(hTeam.players, hTeam.players.map(p => p.id), h1);
        const aGoals1 = assignProceduralGoalScorers(aTeam.players, aTeam.players.map(p => p.id), a1);

        updatedFixtures[mIndex] = {
          ...tm,
          homeScore: h1,
          awayScore: a1,
          homeScore2: h2,
          awayScore2: a2,
          homePen: hp,
          awayPen: ap,
          homeGoals: hGoals1,
          awayGoals: aGoals1,
          played: true
        };
      }
    });
    if (isKnockout || tournament.hasPlayoffs) updatedFixtures = advanceKnockout(updatedFixtures);
    updateTournaments(tournaments.map(t => t.id === tournament.id ? { ...t, fixtures: updatedFixtures } : t));
  };

  const handleStartPlayoffs = () => {
    const groups = getGroupDetailedStandings(tournament, teams, tournaments);
    const playoffFixtures = generateGroupPlayoffs(tournament, groups);
    const regularMatches = (tournament.fixtures || []).filter(m => !m.isPlayoff);
    updateTournaments(tournaments.map(t => t.id === tournament.id ? {
      ...t,
      fixtures: [...regularMatches, ...playoffFixtures]
    } : t));
  };

  const handleResetPlayoffs = () => {
    const regularMatches = (tournament.fixtures || []).filter(m => !m.isPlayoff);
    updateTournaments(tournaments.map(t => t.id === tournament.id ? {
      ...t,
      fixtures: regularMatches
    } : t));
  };

  const realStandings = useMemo(() => calculateTournamentStandings(tournament, tournaments, teams), [tournament, effectiveIds, teams]);

  const matchesByBlock = useMemo(() => {
    if (!tournament.fixtures) return {};
    const blocks = {};

    const sorted = [...tournament.fixtures]
      .filter(m => !m.isPlayoff)
      .sort((a, b) => {
        if (a.round !== b.round) return a.round - b.round;
        return (a.group ?? 0) - (b.group ?? 0);
      });

    sorted.forEach(m => {
      const key = `Fecha ${m.round}`;
      if (!blocks[key]) blocks[key] = [];
      blocks[key].push(m);
    });

    return blocks;
  }, [tournament.fixtures]);

  const playoffMatches = useMemo(() => {
    return (tournament.fixtures || []).filter(m => m.isPlayoff);
  }, [tournament.fixtures]);

  const currentPathMatches = useMemo(() => {
    const allMatches = isKnockout ? (tournament.fixtures || []) : playoffMatches;
    if (numPaths <= 1) return allMatches;
    return allMatches.filter(m => (m.pathIndex ?? 0) === selectedPathFilter);
  }, [tournament.fixtures, playoffMatches, isKnockout, numPaths, selectedPathFilter]);

  return (
    <div className="bg-gray-100 min-h-screen pb-24 font-sans select-none">
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

        <div className="flex items-center space-x-2">
          <button
            onClick={handleHardResetTournament}
            className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 px-3 py-1.5 rounded-lg font-bold cursor-pointer"
            title="Regenera el fixture con los clasificados actuales y limpia marcadores"
          >
            🔄 Reiniciar
          </button>
          {tournament.drawType === 'manual' && (
            <Button variant="outline" className="text-xs bg-white/10 text-white border-white/30 hover:bg-white/20 py-1.5 px-3" onClick={() => setShowDrawModal(true)}>
              Sorteo Manual
            </Button>
          )}
        </div>
      </header>

      {!isKnockout && (
        <div className="flex border-b border-gray-200 bg-white sticky top-[68px] z-10 shadow-sm text-xs font-black">
          <button onClick={() => setTab('matches')} className={`flex-1 py-3 text-center border-b-2 cursor-pointer ${tab === 'matches' ? 'border-green-600 text-green-700 bg-green-50/40' : 'border-transparent text-gray-500'}`}>FIXTURE</button>
          <button onClick={() => setTab('standings')} className={`flex-1 py-3 text-center border-b-2 cursor-pointer ${tab === 'standings' ? 'border-green-600 text-green-700 bg-green-50/40' : 'border-transparent text-gray-500'}`}>POSICIONES</button>
          {tournament.hasPlayoffs && (
            <button onClick={() => setTab('playoffs')} className={`flex-1 py-3 text-center border-b-2 cursor-pointer ${tab === 'playoffs' ? 'border-green-600 text-green-700 bg-green-50/40' : 'border-transparent text-gray-500'}`}>PLAYOFFS</button>
          )}
          <button onClick={() => setTab('scorers')} className={`flex-1 py-3 text-center border-b-2 cursor-pointer ${tab === 'scorers' ? 'border-green-600 text-green-700 bg-green-50/40' : 'border-transparent text-gray-500'}`}>GOLEADORES</button>
        </div>
      )}

      <div className="p-4 max-w-[100vw] mx-auto animate-fade-in mt-2 overflow-hidden">
        {(isKnockout || tab === 'playoffs') ? (
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200 max-w-[95vw] mx-auto overflow-x-auto custom-scrollbar">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
              <div>
                <h3 className="font-black text-xl text-gray-900 tracking-tight">
                  {isKnockout ? "Cuadros Eliminatorios" : "Fase Eliminatoria (Playoffs)"}
                </h3>
                {numPaths > 1 && (
                  <span className="text-xs text-blue-600 font-black block mt-0.5">
                    Repechaje Multillave: {numPaths} Rutas Independientes
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {numPaths > 1 && (
                  <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
                    {Array.from({ length: numPaths }).map((_, pIdx) => {
                      const pLetter = String.fromCharCode(65 + pIdx);
                      const isActive = selectedPathFilter === pIdx;
                      return (
                        <button
                          key={pIdx}
                          onClick={() => setSelectedPathFilter(pIdx)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Ruta {pLetter}
                        </button>
                      );
                    })}
                  </div>
                )}

                {tournament.hasPlayoffs && playoffMatches.length === 0 && (
                  <Button onClick={handleStartPlayoffs} className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                    Generar Llaves con Clasificados
                  </Button>
                )}

                {tournament.hasPlayoffs && playoffMatches.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetPlayoffs}
                    className="text-xs bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                    title="Elimina el cuadro eliminatorio actual para regenerarlo sin perder la fase de grupos"
                  >
                    🔄 Reiniciar Playoffs
                  </button>
                )}
              </div>
            </div>

            {currentPathMatches.length === 0 ? (
              <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300 font-medium">
                {tournament.hasPlayoffs ? "Juega las fechas de grupos y presiona 'Generar Llaves con Clasificados'." : "No se generó el fixture eliminatorio."}
              </div>
            ) : (
              <div className="min-w-max pb-6 px-4">
                <div className="flex flex-row space-x-12">
                  {Array.from(new Set(currentPathMatches.map(m => m.round))).sort((a, b) => a - b).map((r, rIndex, arr) => {
                    const roundMatches = currentPathMatches.filter(m => m.round === r).sort((a, b) => a.matchIndex - b.matchIndex);
                    const isFinal = rIndex === arr.length - 1;
                    const pathLetter = String.fromCharCode(65 + selectedPathFilter);
                    const title = isFinal
                      ? (numPaths > 1 ? `Final Ruta ${pathLetter}` : (parseInt(tournament.winnersCount || 1) === 1 ? 'Gran Final' : 'Fase Clasificatoria'))
                      : (numPaths > 1 ? `Ruta ${pathLetter} • Ronda ${r}` : `Ronda ${r}`);

                    return (
                      <div key={r} className="flex-none w-[340px] space-y-8 relative flex flex-col justify-around">
                        <div className="text-center absolute -top-8 left-0 right-0">
                          <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${isFinal ? 'bg-amber-100 text-amber-800 border border-amber-200 shadow-sm' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                            {title}
                          </span>
                        </div>
                        {roundMatches.map((m) => {
                          const homeDisplay = getTeamDisplay(m.home);
                          const awayDisplay = getTeamDisplay(m.away);

                          const isHomeBye = m.home === null;
                          const isAwayBye = m.away === null;
                          const isBye = isHomeBye || isAwayBye;
                          const isUndecided = !m.home || !m.away || m.home === 'TBD' || m.away === 'TBD' || homeDisplay.isSlot || awayDisplay.isSlot;

                          const totalHome = (parseInt(m.homeScore) || 0) + (m.legs === 2 ? (parseInt(m.homeScore2) || 0) : 0);
                          const totalAway = (parseInt(m.awayScore) || 0) + (m.legs === 2 ? (parseInt(m.awayScore2) || 0) : 0);
                          const isLegsFinished = m.legs === 2
                            ? (m.homeScore !== '' && m.awayScore !== '' && m.homeScore2 !== '' && m.awayScore2 !== '')
                            : (m.homeScore !== '' && m.awayScore !== '');
                          const isTie = isLegsFinished && (totalHome === totalAway);

                          return (
                            <div key={m.id} className={`bg-white rounded-xl border-2 p-3 shadow-sm relative z-10 ${m.played || isBye ? 'border-green-500 bg-green-50/20' : 'border-gray-200'}`}>
                              {!isFinal && <div className="absolute -right-6 top-1/2 w-6 h-0.5 bg-gray-300 -z-10"></div>}
                              {rIndex > 0 && <div className="absolute -left-6 top-1/2 w-6 h-0.5 bg-gray-300 -z-10"></div>}

                              <div className="flex flex-col space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 flex-1 w-0">
                                    {homeDisplay.team ? (
                                      <Shield team={homeDisplay.team} size="sm" />
                                    ) : homeDisplay.isSlot ? (
                                      <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">📥</div>
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0"></div>
                                    )}
                                    <span className={`text-xs font-bold truncate ${homeDisplay.isSlot ? 'text-amber-800 bg-amber-50 px-1 py-0.5 rounded' : (m.home === 'TBD' || isHomeBye ? 'text-gray-400' : 'text-gray-800')}`}>
                                      {homeDisplay.name}
                                    </span>
                                  </div>
                                  <div className="flex space-x-1 items-center">
                                    <input type="number" min="0" value={m.homeScore} disabled={isBye || isUndecided} onChange={e => updateMatchValue(m.id, 'homeScore', e.target.value)} placeholder="I" className="w-8 h-9 text-center border border-gray-300 rounded font-black text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none" title="Partido de Ida" />
                                    {m.legs === 2 && <input type="number" min="0" value={m.homeScore2} disabled={isBye || isUndecided} onChange={e => updateMatchValue(m.id, 'homeScore2', e.target.value)} placeholder="V" className="w-8 h-9 text-center border border-gray-300 rounded font-black text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none" title="Partido de Vuelta" />}
                                    {isTie && (
                                      <input type="number" min="0" value={m.homePen} disabled={isBye || isUndecided} onChange={e => updateMatchValue(m.id, 'homePen', e.target.value)} placeholder="P" className="w-8 h-9 text-center border-2 border-amber-400 rounded font-black text-sm bg-amber-50 focus:ring-2 focus:ring-amber-500 outline-none text-amber-900" title="Penales" />
                                    )}
                                  </div>
                                </div>

                                <div className="flex justify-center h-4 items-center space-x-2">
                                  {!isBye && !isUndecided && (
                                    <>
                                      <button onClick={() => simulateSingleMatch(m)} className="text-sm bg-gray-100 hover:bg-gray-200 p-1 rounded-full cursor-pointer" title="Simular con dados">🎲</button>
                                      <button onClick={() => setSelectedMatch(m)} className="text-xs text-blue-600 hover:underline font-bold cursor-pointer" title="Acta táctica">Pizarra</button>
                                    </>
                                  )}
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 flex-1 w-0">
                                    {awayDisplay.team ? (
                                      <Shield team={awayDisplay.team} size="sm" />
                                    ) : awayDisplay.isSlot ? (
                                      <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">📥</div>
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0"></div>
                                    )}
                                    <span className={`text-xs font-bold truncate ${awayDisplay.isSlot ? 'text-amber-800 bg-amber-50 px-1 py-0.5 rounded' : (m.away === 'TBD' || isAwayBye ? 'text-gray-400' : 'text-gray-800')}`}>
                                      {awayDisplay.name}
                                    </span>
                                  </div>
                                  <div className="flex space-x-1 items-center">
                                    <input type="number" min="0" value={m.awayScore} disabled={isBye || isUndecided} onChange={e => updateMatchValue(m.id, 'awayScore', e.target.value)} placeholder="I" className="w-8 h-9 text-center border border-gray-300 rounded font-black text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none" title="Partido de Ida" />
                                    {m.legs === 2 && <input type="number" min="0" value={m.awayScore2} disabled={isBye || isUndecided} onChange={e => updateMatchValue(m.id, 'awayScore2', e.target.value)} placeholder="V" className="w-8 h-9 text-center border border-gray-300 rounded font-black text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none" title="Partido de Vuelta" />}
                                    {isTie && (
                                      <input type="number" min="0" value={m.awayPen} disabled={isBye || isUndecided} onChange={e => updateMatchValue(m.id, 'awayPen', e.target.value)} placeholder="P" className="w-8 h-9 text-center border-2 border-amber-400 rounded font-black text-sm bg-amber-50 focus:ring-2 focus:ring-amber-500 outline-none text-amber-900" title="Penales" />
                                    )}
                                  </div>
                                </div>

                                {m.played && isTie && m.homePen !== '' && m.awayPen !== '' && (
                                  <div className="text-center my-0.5">
                                    <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full text-[10px] font-black">
                                      Penales: ({m.homePen} - {m.awayPen})
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : tab === 'matches' ? (
          !tournament.fixtures || tournament.fixtures.length === 0 ? (
            <div className="text-center text-gray-500 py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm font-medium">No hay fixture disponible.</div>
          ) : (
            Object.entries(matchesByBlock).map(([blockName, matches]) => {
              const matchesByRealGroup = {};
              matches.forEach(m => {
                const gIdx = tournament.format === 'groups' ? (m.group ?? 0) : 0;
                if (!matchesByRealGroup[gIdx]) matchesByRealGroup[gIdx] = [];
                matchesByRealGroup[gIdx].push(m);
              });

              return (
                <div key={blockName} className="mb-6 bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 animate-slide-up max-w-4xl mx-auto">
                  <div className="bg-gray-50 p-3 font-black text-sm text-gray-800 border-b border-gray-200 flex justify-between items-center px-4 uppercase tracking-wide">
                    <span>{blockName}</span>
                    <button onClick={() => handleDiceBlock(matches)} className="text-xs font-bold hover:scale-105 transition-transform cursor-pointer bg-white border border-gray-200 py-1.5 px-3 rounded-lg shadow-sm flex items-center space-x-1 text-gray-600 hover:text-green-700">
                      <span>🎲</span> <span>Simular Fecha Completa</span>
                    </button>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {Object.entries(matchesByRealGroup).map(([gIdxStr, groupMatches]) => {
                      const gIdx = parseInt(gIdxStr);
                      return (
                        <div key={gIdx} className="p-3 bg-white space-y-2">
                          {tournament.format === 'groups' && (
                            <div className="flex items-center space-x-2 pb-1 border-b border-gray-100">
                              <span className="text-[11px] font-black uppercase tracking-wider bg-gray-800 text-white px-2.5 py-0.5 rounded-md">
                                Grupo {String.fromCharCode(65 + gIdx)}
                              </span>
                            </div>
                          )}

                          <div className="divide-y divide-gray-100">
                            {groupMatches.map(m => {
                              const hDisplay = getTeamDisplay(m.home);
                              const aDisplay = getTeamDisplay(m.away);

                              return (
                                <div key={m.id} className={`flex items-center justify-between p-2.5 transition-colors rounded-xl ${m.played ? 'bg-green-50/30' : 'hover:bg-gray-50'}`}>
                                  <div className="flex items-center space-x-3 flex-1 justify-end text-right w-0">
                                    <span className={`text-sm font-bold truncate ${hDisplay.isSlot ? 'text-amber-800 bg-amber-50 px-2 py-0.5 rounded' : 'text-gray-800'}`}>
                                      {hDisplay.name}
                                    </span>
                                    {hDisplay.team ? <Shield team={hDisplay.team} size="md" /> : <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shrink-0">📥</div>}
                                  </div>

                                  <div className="mx-3 flex items-center space-x-1.5 bg-gray-100 p-1.5 rounded-xl border border-gray-200 shadow-inner">
                                    <input
                                      type="number"
                                      min="0"
                                      disabled={hDisplay.isSlot || aDisplay.isSlot}
                                      value={m.homeScore}
                                      onChange={e => updateMatchValue(m.id, 'homeScore', e.target.value)}
                                      className="w-10 h-10 sm:w-12 sm:h-12 text-center border-none rounded-lg font-black text-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50"
                                    />
                                    <div className="flex flex-col items-center">
                                      <button disabled={hDisplay.isSlot || aDisplay.isSlot} onClick={() => simulateSingleMatch(m)} className="text-lg cursor-pointer hover:scale-125 transition-transform p-1 disabled:opacity-30" title="Simular partido">🎲</button>
                                      <button disabled={hDisplay.isSlot || aDisplay.isSlot} onClick={() => setSelectedMatch(m)} className="text-[9px] font-bold text-blue-600 hover:underline disabled:opacity-30 cursor-pointer" title="Pizarra táctica y alineación">Táctica</button>
                                    </div>
                                    <input
                                      type="number"
                                      min="0"
                                      disabled={hDisplay.isSlot || aDisplay.isSlot}
                                      value={m.awayScore}
                                      onChange={e => updateMatchValue(m.id, 'awayScore', e.target.value)}
                                      className="w-10 h-10 sm:w-12 sm:h-12 text-center border-none rounded-lg font-black text-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50"
                                    />
                                  </div>

                                  <div className="flex items-center space-x-3 flex-1 w-0">
                                    {aDisplay.team ? <Shield team={aDisplay.team} size="md" /> : <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shrink-0">📥</div>}
                                    <span className={`text-sm font-bold truncate ${aDisplay.isSlot ? 'text-amber-800 bg-amber-50 px-2 py-0.5 rounded' : 'text-gray-800'}`}>
                                      {aDisplay.name}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )
        ) : tab === 'standings' ? (
          tournament.format === 'league' ? (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 animate-slide-up max-w-4xl mx-auto">
              <StandingsTable tournament={tournament} tournaments={tournaments} teams={teams} groupTeamIds={realStandings} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up max-w-5xl mx-auto">
              {(() => {
                const groupsData = currentGroupsData;
                return Array.from({ length: parseInt(tournament.numGroups) || 2 }).map((_, gIdx) => {
                  const groupStats = groupsData[gIdx] || [];

                  return (
                    <div key={gIdx} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                      <div className="bg-gray-800 p-3 font-black text-white border-b flex justify-between px-4 items-center uppercase tracking-wide text-sm">
                        <span>Grupo {String.fromCharCode(65 + gIdx)}</span>
                        <span className="text-xs font-bold text-gray-300">{groupStats.length} equipos</span>
                      </div>
                      <StandingsTable
                        tournament={tournament}
                        tournaments={tournaments}
                        teams={teams}
                        groupData={groupStats}
                        isGroups={true}
                        gIdx={gIdx}
                      />
                    </div>
                  );
                });
              })()}
            </div>
          )
        ) : (
          <ScorersTable tournament={tournament} />
        )}
      </div>

      {showDrawModal && (
        <ManualDrawModal
          tournament={tournament}
          teams={teams}
          tournaments={tournaments}
          onClose={() => setShowDrawModal(false)}
          onSave={(updated) => updateTournaments(tournaments.map(t => t.id === updated.id ? updated : t))}
        />
      )}

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