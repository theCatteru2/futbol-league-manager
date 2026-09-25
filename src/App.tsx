// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { PREDEFINED_TEAMS } from './data';
import { resolveEffectiveParticipants } from './logic';
import { Card, Button } from './components/ui';
import { TeamManager, Dashboard, TournamentForm, PlayView } from './components/views';

// Incrementa este número cuando realices cambios estructurales en data.js
const DATA_VERSION = 1;
const STORAGE_PREFIX = 'futbol-league-manager';

export default function App() {
  const [teams, setTeams] = useState<any[]>(() => {
    try {
      const currentVersion = Number(localStorage.getItem(`${STORAGE_PREFIX}-version`));
      const savedTeams = localStorage.getItem(`${STORAGE_PREFIX}-teams`);

      // Si no hay datos guardados o la versión en el navegador es anterior a DATA_VERSION
      if (!savedTeams || currentVersion < DATA_VERSION) {
        const parsedOld = savedTeams ? JSON.parse(savedTeams) : [];

        // Preservar clubes personalizados creados por el usuario
        const customTeams = parsedOld.filter(
          (oldT: any) => !PREDEFINED_TEAMS.some(pt => pt.name.toLowerCase() === oldT.name.toLowerCase())
        );

        // Fusionar base oficial actualizada con equipos del usuario
        const merged = [...PREDEFINED_TEAMS, ...customTeams];

        localStorage.setItem(`${STORAGE_PREFIX}-teams`, JSON.stringify(merged));
        localStorage.setItem(`${STORAGE_PREFIX}-version`, String(DATA_VERSION));
        return merged;
      }

      return JSON.parse(savedTeams);
    } catch {
      return PREDEFINED_TEAMS;
    }
  });

  const [tournaments, setTournaments] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}-tournaments`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [view, setView] = useState<string>('main-menu');
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}-teams`, JSON.stringify(teams));
      localStorage.setItem(`${STORAGE_PREFIX}-version`, String(DATA_VERSION));
    } catch {}
  }, [teams]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}-tournaments`, JSON.stringify(tournaments));
    } catch {}
  }, [tournaments]);

  const exportData = () => {
    const data = JSON.stringify({ teams, tournaments, version: DATA_VERSION }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fulbo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result;
        if (typeof content !== 'string') return;
        const parsed = JSON.parse(content);
        if (parsed.teams) setTeams(parsed.teams);
        if (parsed.tournaments) setTournaments(parsed.tournaments);
        alert("Datos importados con éxito.");
      } catch {
        alert("Error al procesar el archivo JSON.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans select-none">
      {view === 'main-menu' && (
        <div className="flex flex-col items-center justify-center min-h-[90vh] space-y-6 animate-fade-in p-5">
          <div className="text-center mb-4">
            <h1 className="text-4xl font-black text-green-800 mb-2 tracking-tight">Creador de Ligas Fulbo Pro</h1>
            <p className="text-gray-600 font-bold text-xs bg-white/70 px-4 py-1 rounded-full border border-gray-200 inline-block shadow-sm">
              Gestor y Simulador de Ligas
            </p>
          </div>
          <div className="w-full max-w-sm space-y-3">
            <button
              onClick={() => setView('dashboard')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer border border-blue-500"
            >
              <span className="text-lg font-black">⚙️ Configurar Torneos</span>
            </button>

            <button
              onClick={() => setView('team-manager')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer border border-indigo-500"
            >
              <span className="text-lg font-black">👥 Planteles y Equipos</span>
            </button>

            <button
              onClick={() => setView('play-list')}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer border border-green-500"
            >
              <span className="text-lg font-black">⚽ Jugar Torneos</span>
            </button>

            <div className="pt-4 flex space-x-2">
              <button
                onClick={exportData}
                className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold p-2.5 rounded-xl text-xs hover:bg-gray-50 flex items-center justify-center space-x-1 shadow-sm cursor-pointer"
              >
                <span>💾</span> <span>Exportar Todo</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold p-2.5 rounded-xl text-xs hover:bg-gray-50 flex items-center justify-center space-x-1 shadow-sm cursor-pointer"
              >
                <span>📂</span> <span>Importar Todo</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={importData} accept=".json" className="hidden" />
            </div>
          </div>
        </div>
      )}

      {view === 'team-manager' && (
        <TeamManager
          teams={teams}
          updateTeams={setTeams}
          setView={setView}
        />
      )}

      {view === 'dashboard' && (
        <Dashboard
          tournaments={tournaments}
          teams={teams}
          updateTournaments={setTournaments}
          setView={setView}
          setActiveTournamentId={setActiveTournamentId}
        />
      )}

      {(view === 'create-tournament' || view === 'edit-tournament') && (
        <TournamentForm
          view={view}
          tournaments={tournaments}
          teams={teams}
          updateTournaments={setTournaments}
          activeTournamentId={activeTournamentId}
          setView={setView}
        />
      )}

      {view === 'play-list' && (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto p-4 pb-24">
          <header className="flex items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <button
              onClick={() => setView('main-menu')}
              className="mr-4 p-2 bg-gray-50 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-green-700">Torneos en Juego</h1>
              <p className="text-gray-500 text-sm font-medium">Selecciona una competencia activa</p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournaments.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 mb-6 font-medium">Crea un torneo primero en Configuración.</p>
                <Button onClick={() => setView('create-tournament')} className="mx-auto">Crear Torneo</Button>
              </div>
            ) : (
              tournaments.map((t: any) => {
                const effParticipants = resolveEffectiveParticipants(t.id, tournaments, teams);
                return (
                  <Card
                    key={t.id}
                    onClick={() => { setActiveTournamentId(t.id); setView('play-tournament'); }}
                    className="hover:shadow-md cursor-pointer border-green-200 bg-gradient-to-br from-green-50 to-white flex justify-between items-center p-5"
                  >
                    <div>
                      <h3 className="font-black text-lg text-green-900">{t.name}</h3>
                      <span className="text-xs text-gray-500 font-bold">{effParticipants.length} / {t.numTeams} equipos</span>
                    </div>
                    <span className="bg-green-600 text-white p-3 rounded-full shadow-md text-sm">⚽</span>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {view === 'play-tournament' && (
        <PlayView
          tournaments={tournaments}
          teams={teams}
          updateTournaments={setTournaments}
          activeTournamentId={activeTournamentId}
          setView={setView}
        />
      )}
    </div>
  );
}
