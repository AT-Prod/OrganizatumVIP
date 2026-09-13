import React from 'react';
import { useTraining } from '../../context/TrainingContext';
import { OposicionType } from '../../types';
import { Shield, Flame, CalendarCheck, Award, Zap, ChevronRight, Clock, Timer, Database } from 'lucide-react';

interface HeaderProps {
  onOpenCheckin: () => void;
  onOpenTrialBoss: () => void;
  onOpenTimer: () => void;
  onOpenDataManagement: () => void;
}

const DAYS_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const EXAM_LABELS: Record<OposicionType, { title: string; badge: string }> = {
  policia_nacional: {
    title: 'Policía Nacional (CNP)',
    badge: 'Suspensión Barra • Agilidad • 1000m',
  },
  guardia_civil: {
    title: 'Guardia Civil (GC)',
    badge: 'Flexiones • 60m • 2000m',
  },
  bomberos_madrid: {
    title: 'Bomberos Madrid',
    badge: 'Dominadas • Fondos Paralelas • Resistencia',
  },
};

function getRankTitle(level: number): string {
  if (level <= 1) return 'Aspirante en Acondicionamiento Suave';
  if (level === 2) return 'Recluta en Adaptación Articular';
  if (level === 3) return 'Cadete de Resistencia Progresiva';
  if (level === 4) return 'Opositora en Fase de Fuerza Base';
  if (level === 5) return 'Apta Oficial en Baremo Mínimo';
  if (level <= 8) return 'Agente de Élite en Optimización';
  return 'Comisaria / Oficial Superior (Nota Máxima)';
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCheckin,
  onOpenTrialBoss,
  onOpenTimer,
  onOpenDataManagement,
}) => {
  const { profile, setTargetExam, setCurrentDayOfWeek } = useTraining();
  const xpPercent = Math.min(100, Math.round((profile.xp / profile.xpToNextLevel) * 100));

  return (
    <header className="bg-slate-900 border-b border-amber-900/40 text-slate-100 shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Oposición selector */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 p-0.5 shadow-inner flex items-center justify-center text-amber-100 border border-amber-500/40 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-amber-400">
                  Oposiciones Quest Fitness
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/50">
                  Semana {profile.currentWeek} / {profile.totalWeeks}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <select
                  id="target-exam-select"
                  aria-label="Seleccionar cuerpo de oposición"
                  value={profile.targetExam}
                  onChange={(e) => setTargetExam(e.target.value as OposicionType)}
                  className="bg-slate-800 border border-slate-700 text-sm font-bold text-slate-100 rounded px-2.5 py-1 focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
                >
                  <option value="policia_nacional">Policía Nacional (CNP)</option>
                  <option value="guardia_civil">Guardia Civil (GC)</option>
                  <option value="bomberos_madrid">Bomberos Madrid (Parcela)</option>
                </select>
                <span className="hidden sm:inline text-xs text-slate-400">
                  {EXAM_LABELS[profile.targetExam].badge}
                </span>
              </div>
            </div>
          </div>

          {/* Character RPG Progression Bar, Current Day Selector & Quick Actions */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {/* Control de Día Actual */}
            <div
              className="flex items-center gap-1.5 bg-slate-800/90 border border-amber-700/50 rounded-lg px-2.5 py-1.5 text-xs shadow-inner"
              title="Día de la semana actual. Las misiones futuras no se pueden adelantar; las pasadas no completadas aparecen como posible fallo."
            >
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-slate-400 font-medium hidden xs:inline">Hoy:</span>
              <select
                id="current-day-select"
                aria-label="Seleccionar día actual de la semana"
                value={profile.currentDayOfWeek}
                onChange={(e) => setCurrentDayOfWeek(Number(e.target.value))}
                className="bg-transparent font-bold text-amber-300 focus:outline-none cursor-pointer text-xs"
              >
                {DAYS_NAMES.map((d, i) => (
                  <option key={d} value={i} className="bg-slate-900 text-slate-100">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Level & XP Gauge */}
            <div className="flex-1 sm:w-52 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-inner">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Nivel {profile.level}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {profile.xp} / {profile.xpToNextLevel} XP
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5" title={getRankTitle(profile.level)}>
                {getRankTitle(profile.level)}
              </div>
            </div>

            {/* Streak Counter */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300 shrink-0"
              title="Días de racha activa entrenando de forma segura"
            >
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
              <span className="text-xs font-bold">{profile.streakDays} Días</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                id="btn-timer"
                onClick={onOpenTimer}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-300 transition-colors shadow-sm cursor-pointer"
                title="Temporizador de descanso entre series y cronómetro de marcas"
              >
                <Timer className="w-4 h-4 text-amber-400" />
                <span className="hidden xl:inline">Descanso/Reloj</span>
              </button>

              <button
                id="btn-weekly-checkin"
                onClick={onOpenCheckin}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 transition-colors shadow-sm cursor-pointer"
                title="Ajustar disponibilidad semanal y verificar dilución matemática"
              >
                <CalendarCheck className="w-4 h-4 text-blue-400" />
                <span className="hidden lg:inline">Check-in</span>
                {profile.accumulatedDeficitUCE > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>

              <button
                id="btn-trial-boss"
                onClick={onOpenTrialBoss}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow transition-all border border-amber-400/40 cursor-pointer"
                title="Registrar marca oficial del baremo femenino y desbloquear Quests Heroicas"
              >
                <Award className="w-4 h-4 text-yellow-200" />
                <span className="hidden sm:inline">Test Oficial</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              </button>

              <button
                id="btn-data-management"
                onClick={onOpenDataManagement}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white transition-colors shadow-sm cursor-pointer"
                title="Copia de seguridad, exportar / importar progreso y gestión de datos"
              >
                <Database className="w-4 h-4 text-slate-300" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
