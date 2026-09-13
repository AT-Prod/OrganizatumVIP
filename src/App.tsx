import React, { useState } from 'react';
import { TrainingProvider, useTraining } from './context/TrainingContext';
import { Header } from './components/layout/Header';
import { ViewSelector, AppView } from './components/layout/ViewSelector';
import { ListView } from './components/views/ListView';
import { CalendarView } from './components/views/CalendarView';
import { DesktopWidget } from './components/hud/DesktopWidget';
import { BenchmarksView } from './components/views/BenchmarksView';
import { WeeklyCheckinModal } from './components/modals/WeeklyCheckinModal';
import { TrialBossModal } from './components/modals/TrialBossModal';
import { DilutionToast } from './components/hud/DilutionToast';
import { TimerWidget } from './components/hud/TimerWidget';
import { DataManagementModal } from './components/modals/DataManagementModal';
import { Shield } from 'lucide-react';

function AppContent() {
  const { benchmarks, profile } = useTraining();
  const [currentView, setCurrentView] = useState<AppView>('widget');
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [isTrialBossOpen, setIsTrialBossOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timerInitialSeconds, setTimerInitialSeconds] = useState(45);
  const [timerInitialMode, setTimerInitialMode] = useState<'rest' | 'stopwatch'>('rest');
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);
  const [defaultDisciplineId, setDefaultDisciplineId] = useState<string | undefined>(undefined);

  const unlockedHeroicsCount = benchmarks.filter(
    (b) => b.targetExam === profile.targetExam && b.isUnlockedHeroic
  ).length;

  const handleOpenTrialBoss = (disciplineId?: string) => {
    setDefaultDisciplineId(disciplineId);
    setIsTrialBossOpen(true);
  };

  const handleOpenTimerWithDuration = (seconds: number) => {
    setTimerInitialSeconds(seconds);
    setTimerInitialMode('rest');
    setIsTimerOpen(true);
  };

  const handleOpenTimerDefault = () => {
    setTimerInitialSeconds(60);
    setTimerInitialMode('rest');
    setIsTimerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-600 selection:text-white">
      {/* Barra de navegación superior con perfil de atleta y stats */}
      <Header
        onOpenCheckin={() => setIsCheckinOpen(true)}
        onOpenTrialBoss={() => handleOpenTrialBoss()}
        onOpenTimer={handleOpenTimerDefault}
        onOpenDataManagement={() => setIsDataManagementOpen(true)}
      />

      {/* Selector de Vistas (Lista, Calendario, Widget WoW, Baremos) */}
      <ViewSelector
        currentView={currentView}
        onSelectView={setCurrentView}
        unlockedHeroicsCount={unlockedHeroicsCount}
      />

      {/* Contenido Principal de la Vista Activa */}
      <main className="flex-1 pb-16">
        {currentView === 'widget' && (
          <DesktopWidget onOpenTimerWithDuration={handleOpenTimerWithDuration} />
        )}
        {currentView === 'list' && <ListView />}
        {currentView === 'calendar' && <CalendarView />}
        {currentView === 'benchmarks' && (
          <BenchmarksView onOpenTrialBossForDiscipline={handleOpenTrialBoss} />
        )}
      </main>

      {/* Modales de Control */}
      <WeeklyCheckinModal
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
      />

      <TrialBossModal
        isOpen={isTrialBossOpen}
        onClose={() => setIsTrialBossOpen(false)}
        defaultDisciplineId={defaultDisciplineId}
      />

      <DataManagementModal
        isOpen={isDataManagementOpen}
        onClose={() => setIsDataManagementOpen(false)}
      />

      {/* Temporizador / Cronómetro HUD Flotante */}
      <TimerWidget
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        initialSeconds={timerInitialSeconds}
        initialMode={timerInitialMode}
        onSendTimeToTest={(secs) => {
          handleOpenTrialBoss();
        }}
      />

      {/* Notificación Flotante de Reajuste con Dilución */}
      <DilutionToast />

      {/* Footer Metodológico */}
      <footer className="bg-slate-900/60 border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Shield className="w-4 h-4 text-amber-500" />
            <span>Diseñado para Opositoras (Policía Nacional • Guardia Civil • Bomberos Madrid)</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Acondicionamiento seguro para sedentarismo extremo • Dilución biomatemática de déficit • Cero sobrecarga
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <TrainingProvider>
      <AppContent />
    </TrainingProvider>
  );
}
