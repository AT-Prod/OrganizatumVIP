import React, { useState } from 'react';
import { useTraining } from '../../context/TrainingContext';
import {
  Check,
  Shield,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
  Dumbbell,
  Lock,
  RotateCcw,
  XCircle,
} from 'lucide-react';

export const ListView: React.FC = () => {
  const {
    quests,
    toggleExercise,
    completeQuest,
    undoCompleteQuest,
    markQuestMissed,
    undoMissedQuest,
    profile,
  } = useTraining();
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(quests[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedQuestId(expandedQuestId === id ? null : id);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      
      {/* Resumen del Roadmap y Fases de Adaptación */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-100 font-serif flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              Roadmap de Adaptación Progresiva
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Programa de {profile.commitmentMonths} meses adaptado para mujer de 33 años desde sedentarismo extremo.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-semibold">
              Semana Actual: {profile.currentWeek} / {profile.totalWeeks}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-700/40 text-emerald-300 font-semibold">
              Carga Aguda ACWR: Segura (&le; 1.15)
            </span>
          </div>
        </div>

        {/* 4 Fases de la Campaña */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className={`p-3 rounded-xl border ${profile.currentWeek <= 8 ? 'bg-amber-950/40 border-amber-500/60 text-amber-200' : 'bg-slate-800/50 border-slate-700/50 text-slate-400'}`}>
            <span className="font-bold text-amber-400 block mb-1">Fase 1 (Sem. 1 - 8)</span>
            <strong className="block text-slate-200 mb-1">Acondicionamiento Suave</strong>
            <p className="text-[11px] leading-relaxed">Adaptación de fascias y tendones con apoyo de pies y bandas gruesas. RPE 3-4.</p>
          </div>

          <div className={`p-3 rounded-xl border ${profile.currentWeek > 8 && profile.currentWeek <= 24 ? 'bg-amber-950/40 border-amber-500/60 text-amber-200' : 'bg-slate-800/50 border-slate-700/50 text-slate-400'}`}>
            <span className="font-bold text-amber-400 block mb-1">Fase 2 (Sem. 9 - 24)</span>
            <strong className="block text-slate-200 mb-1">Fuerza Base Asistida</strong>
            <p className="text-[11px] leading-relaxed">Progresión a elásticos finos, primeras suspensiones libres cortas y CACO en parcela.</p>
          </div>

          <div className={`p-3 rounded-xl border ${profile.currentWeek > 24 && profile.currentWeek <= 40 ? 'bg-amber-950/40 border-amber-500/60 text-amber-200' : 'bg-slate-800/50 border-slate-700/50 text-slate-400'}`}>
            <span className="font-bold text-amber-400 block mb-1">Fase 3 (Sem. 25 - 40)</span>
            <strong className="block text-slate-200 mb-1">Conquista del Baremo Apto</strong>
            <p className="text-[11px] leading-relaxed">Alcanzar los 5 puntos oficiales (44s barra CNP / 11 flexiones GC). Trabajo específico.</p>
          </div>

          <div className={`p-3 rounded-xl border ${profile.currentWeek > 40 ? 'bg-amber-950/40 border-amber-500/60 text-amber-200' : 'bg-slate-800/50 border-slate-700/50 text-slate-400'}`}>
            <span className="font-bold text-purple-400 block mb-1">Fase 4 (Sem. 41+)</span>
            <strong className="block text-slate-200 mb-1">Misiones Heroicas Extra</strong>
            <p className="text-[11px] leading-relaxed">Maximización de nota (8 a 10 puntos) y optimización de velocidad de carrera.</p>
          </div>
        </div>
      </div>

      {/* Lista de Misiones Activas de la Semana */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>Misiones de la Semana en Curso</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
              {quests.filter((q) => q.completed).length} de {quests.length} completadas
            </span>
          </h3>
          <span className="text-xs text-slate-400">
            Disponibilidad: {profile.weeklyAvailability.daysPerWeek} días/sem • {profile.weeklyAvailability.minutesPerSession} min/sesión
          </span>
        </div>

        {quests.map((quest) => {
          const isExpanded = expandedQuestId === quest.id;
          const completedSteps = quest.exercises.filter((e) => e.completed).length;

          const isFuture = !quest.isHeroicExtra && quest.scheduledDayOfWeek > profile.currentDayOfWeek;
          const isPastUncompleted =
            !quest.isHeroicExtra &&
            quest.scheduledDayOfWeek < profile.currentDayOfWeek &&
            !quest.completed &&
            !quest.missed;
          const isMissed = quest.status === 'missed' || quest.missed;
          const isCompleted = quest.completed || quest.status === 'completed';

          return (
            <div
              key={quest.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                isCompleted
                  ? 'bg-slate-900/60 border-emerald-900/60'
                  : isMissed
                  ? 'bg-red-950/20 border-red-850'
                  : isPastUncompleted
                  ? 'bg-slate-900 border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                  : isFuture
                  ? 'bg-slate-900/50 border-slate-800 opacity-80'
                  : quest.isHeroicExtra
                  ? 'bg-gradient-to-r from-purple-950/40 to-slate-900 border-purple-600/50'
                  : 'bg-slate-900 border-slate-800 shadow-md'
              }`}
            >
              {/* Header de la tarjeta */}
              <div
                onClick={() => toggleExpand(quest.id)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isMissed
                        ? 'bg-red-900 text-red-200'
                        : isPastUncompleted
                        ? 'bg-amber-600 text-slate-950'
                        : isFuture
                        ? 'bg-slate-800 text-slate-500'
                        : quest.isHeroicExtra
                        ? 'bg-purple-700 text-purple-100'
                        : 'bg-slate-800 text-amber-400 border border-slate-700'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : isMissed ? (
                      <XCircle className="w-5 h-5" />
                    ) : isPastUncompleted ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : isFuture ? (
                      <Lock className="w-4 h-4" />
                    ) : quest.isHeroicExtra ? (
                      '★'
                    ) : (
                      <Dumbbell className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-slate-100 font-serif">
                        {quest.title}
                      </span>
                      {quest.isHeroicExtra && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900 text-purple-200 font-bold uppercase border border-purple-500/40">
                          Heroica Extra
                        </span>
                      )}
                      {isPastUncompleted && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold uppercase border border-amber-500 animate-pulse">
                          ⚠️ Posible fallo (Confirmar)
                        </span>
                      )}
                      {isMissed && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-300 font-bold uppercase border border-red-700">
                          No completada (Diluida)
                        </span>
                      )}
                      {isFuture && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                          Bloqueada hasta {quest.scheduledDayName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{quest.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end text-xs">
                    <span className="text-amber-400 font-semibold font-mono">+{quest.rewardXP} XP</span>
                    <span className="text-slate-500">{quest.durationMinutes} min • {completedSteps}/{quest.exercises.length} pasos</span>
                  </div>

                  <button
                    className="p-1 rounded text-slate-400 hover:text-slate-200"
                    aria-label="Expandir o colapsar misión"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Contenido expandido con desglose de ejercicios */}
              {isExpanded && (
                <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/60 space-y-4">
                  
                  {isPastUncompleted && (
                    <div className="p-3 bg-amber-950/60 border border-amber-500/60 rounded-lg text-xs text-amber-200 leading-relaxed">
                      <strong>⚠️ Posible fallo:</strong> Esta misión correspondía al {quest.scheduledDayName}. La opción de marcarla
                      como completada <strong>no expira</strong> si la realizaste. Si no la hiciste, pulsa "Misión no completada" para
                      diluir la carga en los meses restantes.
                    </div>
                  )}

                  <div className="space-y-3">
                    {quest.exercises.map((ex) => (
                      <div
                        key={ex.id}
                        onClick={() => {
                          if (!isFuture) toggleExercise(quest.id, ex.id);
                        }}
                        className={`p-3.5 rounded-lg border transition-all flex items-start gap-3 ${
                          isFuture
                            ? 'opacity-60 cursor-not-allowed bg-slate-900 border-slate-800'
                            : 'cursor-pointer select-none ' +
                              (ex.completed
                                ? 'bg-slate-900/80 border-emerald-800/50 text-slate-400'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200')
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                            ex.completed
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'border-slate-600 bg-slate-800'
                          }`}
                        >
                          {ex.completed && <Check className="w-3.5 h-3.5" />}
                          {isFuture && <Lock className="w-3 h-3 text-slate-500" />}
                        </div>

                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between font-semibold">
                            <span className={ex.completed ? 'line-through text-slate-400' : 'text-slate-100'}>
                              {ex.name}
                            </span>
                            <span className="font-mono text-amber-300">
                              {ex.sets} × {ex.repsOrDuration} {ex.isDuration ? 'seg' : 'reps'}
                            </span>
                          </div>

                          <p className="text-slate-400 mt-1 leading-relaxed">
                            <strong className="text-amber-400/90">Regresión para sedentarismo:</strong> {ex.regressionTip}
                          </p>

                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                            <span>Material: {ex.equipment}</span>
                            <span>•</span>
                            <span>RPE Foster: {ex.targetRPE}/10</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Acciones de la misión */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                    <div>
                      {isMissed ? (
                        <button
                          onClick={() => undoMissedQuest(quest.id)}
                          className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer font-medium"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Deshacer no completada</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => markQuestMissed(quest.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 cursor-pointer font-medium"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Misión no completada (Diluir déficit)</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <Check className="w-4 h-4" /> Misión Finalizada
                          </span>
                          <button
                            onClick={() => undoCompleteQuest(quest.id)}
                            className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 cursor-pointer"
                            title="Deshacer misión finalizada por si se pulsó por error"
                          >
                            <RotateCcw className="w-3 h-3 text-amber-400" />
                            <span>Deshacer</span>
                          </button>
                        </div>
                      ) : isFuture ? (
                        <div className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5 cursor-not-allowed">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Bloqueada hasta {quest.scheduledDayName}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => completeQuest(quest.id)}
                          className={`px-4 py-2 rounded-lg font-bold text-xs shadow transition-colors flex items-center gap-1.5 cursor-pointer ${
                            isPastUncompleted
                              ? 'bg-amber-600 hover:bg-amber-500 text-white ring-2 ring-amber-400'
                              : 'bg-amber-600 hover:bg-amber-500 text-white'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isPastUncompleted ? 'Confirmar que sí se completó' : 'Marcar como Completada'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
