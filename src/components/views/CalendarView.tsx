import React, { useState } from 'react';
import { useTraining } from '../../context/TrainingContext';
import {
  Calendar as CalendarIcon,
  Check,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Dumbbell,
  Moon,
  Lock,
  RotateCcw,
  XCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const CalendarView: React.FC = () => {
  const {
    profile,
    quests,
    completeQuest,
    undoCompleteQuest,
    markQuestMissed,
    undoMissedQuest,
  } = useTraining();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(profile.currentDayOfWeek);

  // Mapear días de la semana actual según la disponibilidad
  const scheduleDays = DAYS_OF_WEEK.map((dayName, idx) => {
    // Buscar si existe una misión programada para este día de la semana
    const quest = quests.find((q) => !q.isHeroicExtra && q.scheduledDayOfWeek === idx);
    const isTrainingDay = Boolean(quest);

    const isToday = idx === profile.currentDayOfWeek;
    const isFuture = idx > profile.currentDayOfWeek;
    const isPast = idx < profile.currentDayOfWeek;

    const isCompleted = Boolean(quest?.completed || quest?.status === 'completed');
    const isMissed = Boolean(quest?.status === 'missed' || quest?.missed);
    const isPastUncompleted = Boolean(isPast && quest && !isCompleted && !isMissed);

    return {
      index: idx,
      name: dayName,
      isTrainingDay,
      quest,
      isRestDay: !isTrainingDay,
      isToday,
      isFuture,
      isPast,
      isCompleted,
      isMissed,
      isPastUncompleted,
    };
  });

  const activeDay = scheduleDays[selectedDayIndex] || scheduleDays[0];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      
      {/* Cabecera del Calendario */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 font-serif flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-500" />
            Planificación de Microciclos - Semana {profile.currentWeek}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Distribución estratégica con al menos 48 horas de recuperación entre tracción y empuje.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-300">
            <ShieldCheck className="w-4 h-4" />
            <span>Regla de 48h Cumplida</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-700/50 text-amber-300 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Hoy: {DAYS_OF_WEEK[profile.currentDayOfWeek]}</span>
          </div>
        </div>
      </div>

      {/* Cuadrícula de los 7 días de la semana */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {scheduleDays.map((day) => {
          const isSelected = selectedDayIndex === day.index;
          return (
            <div
              key={day.name}
              onClick={() => setSelectedDayIndex(day.index)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[145px] relative ${
                isSelected
                  ? 'ring-2 ring-amber-400 bg-slate-800 border-amber-500/70 shadow-lg'
                  : day.isPastUncompleted
                  ? 'bg-slate-900 border-amber-500/80 shadow ring-1 ring-amber-500/30'
                  : day.isCompleted
                  ? 'bg-slate-900/90 border-emerald-800/60 hover:bg-slate-850'
                  : day.isMissed
                  ? 'bg-red-950/20 border-red-900/60 hover:bg-slate-850'
                  : day.isTrainingDay
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/60 border-slate-900 text-slate-500 hover:bg-slate-900/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${day.isToday ? 'text-amber-400' : 'text-slate-300'}`}>
                    {day.name}
                  </span>
                  
                  {day.isToday && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500 text-slate-950 font-black uppercase">
                      Hoy
                    </span>
                  )}
                  {day.isCompleted && (
                    <span className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px]">
                      ✓
                    </span>
                  )}
                  {day.isMissed && (
                    <span className="w-4 h-4 rounded-full bg-red-800 flex items-center justify-center text-white text-[10px]">
                      ✕
                    </span>
                  )}
                  {day.isPastUncompleted && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 text-[10px] font-bold animate-pulse">
                      !
                    </span>
                  )}
                  {day.isFuture && day.isTrainingDay && !day.isCompleted && !day.isMissed && (
                    <Lock className="w-3 h-3 text-slate-600" />
                  )}
                </div>

                {day.isTrainingDay && day.quest ? (
                  <div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold block mb-1 truncate ${
                      day.isPastUncompleted
                        ? 'bg-amber-950 text-amber-300 border border-amber-600/50'
                        : day.isMissed
                        ? 'bg-red-950 text-red-300 border border-red-800/50'
                        : 'bg-slate-950 text-amber-300 border border-slate-800'
                    }`}>
                      {day.quest.vector === 'trac'
                        ? 'Tracción'
                        : day.quest.vector === 'emp'
                        ? 'Empuje'
                        : day.quest.vector === 'res'
                        ? 'Resistencia'
                        : 'Agilidad'}
                    </span>
                    <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-snug">
                      {day.quest.title.replace('Misión ', 'M.')}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3">
                    <Moon className="w-4 h-4 text-indigo-400/60" />
                    <span>Descanso Activo</span>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <span>{day.isTrainingDay ? `${profile.weeklyAvailability.minutesPerSession} min` : 'Recuperación'}</span>
                {day.isPastUncompleted && (
                  <span className="text-amber-400 font-bold text-[10px]">Confirmar</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detalle del Día Seleccionado */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Detalle de {activeDay.name}</span>
            {activeDay.isToday && (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black uppercase">
                Día de Hoy
              </span>
            )}
            {activeDay.isTrainingDay ? (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 font-normal">
                Día de Entrenamiento Programado
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-normal">
                Día de Descanso y Supercompensación
              </span>
            )}
          </h3>
        </div>

        {activeDay.isPastUncompleted && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-950/80 border border-amber-500/80 text-amber-200 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-amber-300 block mb-0.5">
                ⚠️ Posible fallo: Misión de {activeDay.name} pendiente de confirmación
              </span>
              La fecha de esta misión ya pasó. Como en este sistema <strong>la opción no expira</strong>, puedes confirmar
              que sí la hiciste en su día, o pulsar <strong>"Misión no completada"</strong> para que el déficit se amortice
              de forma segura a lo largo de todos los meses restantes sin sobrecargar esta semana.
            </div>
          </div>
        )}

        {activeDay.isFuture && activeDay.isTrainingDay && (
          <div className="mb-4 p-3.5 rounded-xl bg-slate-950/90 border border-slate-700 text-slate-300 text-xs flex items-start gap-3">
            <Lock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-slate-200 block mb-0.5">
                🔒 Misión bloqueada: Programada para el {activeDay.name}
              </span>
              No es posible adelantar ni marcar como completadas sesiones de días futuros para respetar los tiempos
              de descanso biológico y la regeneración tendinosa.
            </div>
          </div>
        )}

        {activeDay.isTrainingDay && activeDay.quest ? (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-bold text-amber-200 font-serif">{activeDay.quest.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{activeDay.quest.subtitle}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                  <span>Duración: <strong className="text-slate-200">{activeDay.quest.durationMinutes} min</strong></span>
                  <span>•</span>
                  <span>Carga: <strong className="text-amber-400">{activeDay.quest.targetUCE} UCE</strong></span>
                  <span>•</span>
                  <span>Recompensa: <strong className="text-amber-300">+{activeDay.quest.rewardXP} XP</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Botón Misión no completada */}
                {activeDay.isMissed ? (
                  <button
                    onClick={() => undoMissedQuest(activeDay.quest!.id)}
                    className="text-xs px-3 py-2 rounded-lg bg-amber-950/60 hover:bg-amber-950 border border-amber-700 text-amber-300 flex items-center gap-1.5 cursor-pointer font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Deshacer no completada</span>
                  </button>
                ) : (
                  <button
                    onClick={() => markQuestMissed(activeDay.quest!.id)}
                    className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-slate-700 hover:border-rose-800 cursor-pointer flex items-center gap-1.5"
                    title="Marca la sesión como no completada y diluye el déficit sin sobrecargar la semana"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Misión no completada</span>
                  </button>
                )}

                {/* Botón Completar / Deshacer Completar */}
                {activeDay.isCompleted ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-950/60 border border-emerald-700/50">
                      <Check className="w-4 h-4" /> Misión Finalizada
                    </span>
                    <button
                      onClick={() => undoCompleteQuest(activeDay.quest!.id)}
                      className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 cursor-pointer"
                      title="Deshacer por si se marcó por error"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Deshacer</span>
                    </button>
                  </div>
                ) : activeDay.isFuture ? (
                  <div className="text-xs px-3 py-2 rounded-lg bg-slate-800 text-slate-500 border border-slate-700 flex items-center gap-1.5 cursor-not-allowed">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Bloqueada hasta el {activeDay.name}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => completeQuest(activeDay.quest!.id)}
                    className={`text-xs px-4 py-2 rounded-lg font-bold shadow cursor-pointer flex items-center gap-1.5 ${
                      activeDay.isPastUncompleted
                        ? 'bg-amber-600 hover:bg-amber-500 text-white ring-2 ring-amber-400'
                        : 'bg-amber-600 hover:bg-amber-500 text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{activeDay.isPastUncompleted ? 'Confirmar que sí se completó' : 'Marcar Completada'}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Ejercicios Planificados:
              </h5>
              {activeDay.quest.exercises.map((ex) => (
                <div
                  key={ex.id}
                  className="p-3 bg-slate-950/60 rounded-lg border border-slate-850 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-200 block">{ex.name}</span>
                    <span className="text-slate-400 text-[11px]">{ex.regressionTip}</span>
                  </div>
                  <span className="font-mono text-amber-300 shrink-0 ml-4 font-bold">
                    {ex.sets} × {ex.repsOrDuration} {ex.isDuration ? 'seg' : 'reps'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 bg-slate-950 rounded-xl border border-slate-850 text-center space-y-2">
            <Moon className="w-8 h-8 text-indigo-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-200">Día de Recuperación Muscular y Fascial</h4>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              El descanso es el momento donde se produce la síntesis de colágeno y la supercompensación fisiológica.
              Aprovecha para pasear tranquilamente por la parcela o hidratarte adecuadamente.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
