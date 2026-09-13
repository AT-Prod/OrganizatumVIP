import React from 'react';
import { useTraining } from '../../context/TrainingContext';
import {
  Check,
  ShieldAlert,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Info,
  Lock,
  RotateCcw,
  XCircle,
  Clock,
  Timer,
} from 'lucide-react';

interface DesktopWidgetProps {
  onOpenTimerWithDuration?: (seconds: number) => void;
}

export const DesktopWidget: React.FC<DesktopWidgetProps> = ({ onOpenTimerWithDuration }) => {
  const {
    quests,
    activeQuestId,
    setActiveQuestId,
    toggleExercise,
    completeQuest,
    undoCompleteQuest,
    markQuestMissed,
    undoMissedQuest,
    profile,
  } = useTraining();

  const activeQuest = quests.find((q) => q.id === activeQuestId) || quests[0];

  if (!activeQuest) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-slate-900 border border-amber-600/40 rounded-xl text-center shadow-2xl">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-amber-200">¡Todas las misiones semanales completadas!</h3>
        <p className="text-sm text-slate-400 mt-2">
          Excelente descanso activo. Realiza el Check-in semanal o realiza un Test Oficial en la pestaña de Baremos.
        </p>
      </div>
    );
  }

  const completedStepsCount = activeQuest.exercises.filter((ex) => ex.completed).length;
  const totalStepsCount = activeQuest.exercises.length;
  const isReadyToTurnIn = completedStepsCount === totalStepsCount && !activeQuest.completed;

  // Estados temporales y de confirmación
  const isFuture = !activeQuest.isHeroicExtra && activeQuest.scheduledDayOfWeek > profile.currentDayOfWeek;
  const isPastUncompleted =
    !activeQuest.isHeroicExtra &&
    activeQuest.scheduledDayOfWeek < profile.currentDayOfWeek &&
    !activeQuest.completed &&
    !activeQuest.missed;
  const isMissed = activeQuest.status === 'missed' || Boolean(activeQuest.missed);
  const isCompleted = activeQuest.completed || activeQuest.status === 'completed';

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Selector de misión activa estilo WoW Quest Tracker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 shrink-0">
            Registro WoW:
          </span>
          <div className="flex gap-1.5">
            {quests.map((q, idx) => {
              const isSelected = q.id === activeQuest.id;
              const qIsFuture = !q.isHeroicExtra && q.scheduledDayOfWeek > profile.currentDayOfWeek;
              const qIsPastUncompleted =
                !q.isHeroicExtra &&
                q.scheduledDayOfWeek < profile.currentDayOfWeek &&
                !q.completed &&
                !q.missed;
              const qIsMissed = q.status === 'missed' || q.missed;

              return (
                <button
                  key={q.id}
                  id={`btn-select-quest-${q.id}`}
                  onClick={() => setActiveQuestId(q.id)}
                  className={`text-xs px-2.5 py-1.5 rounded font-medium transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                    isSelected
                      ? 'bg-amber-600 text-white font-bold ring-2 ring-amber-400 shadow-md'
                      : q.completed
                      ? 'bg-slate-900 text-emerald-400 border border-emerald-700/60'
                      : qIsMissed
                      ? 'bg-red-950/70 text-red-300 border border-red-800/60'
                      : qIsPastUncompleted
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-500 animate-pulse'
                      : qIsFuture
                      ? 'bg-slate-900/60 text-slate-500 border border-slate-800'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title={`${q.title} (${q.scheduledDayName})`}
                >
                  {qIsFuture && <Lock className="w-3 h-3 text-slate-500" />}
                  {qIsPastUncompleted && <AlertCircle className="w-3 h-3 text-amber-400" />}
                  {qIsMissed && <XCircle className="w-3 h-3 text-red-400" />}
                  <span>{q.isHeroicExtra ? `★ Heroica` : `${q.scheduledDayName || `Misión ${idx + 1}`}`}</span>
                  {q.completed && <span className="text-emerald-400 font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Marco principal RPG estilo WoW Quest Tracker */}
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-600/70 shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Remaches y esquinas ornamentales doradas */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400" />

        {/* Notificación de Estado Especial: Posible fallo o Futura */}
        {isPastUncompleted && (
          <div className="mb-5 p-4 rounded-xl bg-amber-950/80 border-2 border-amber-500/80 text-amber-200 flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <h4 className="font-bold text-amber-300 text-sm">
                ⚠️ Posible fallo: Misión de {activeQuest.scheduledDayName} pendiente de confirmar
              </h4>
              <p className="mt-1 text-amber-200/90">
                Esta misión correspondía a un día anterior. En este sistema <strong>la opción no expira</strong>:
                si la realizaste puedes confirmarla ahora. Si no pudiste hacerla, pulsa <strong>"Misión no completada"</strong> y el
                algoritmo diluirá el déficit de carga a lo largo de todos los meses restantes sin sobrecargar la semana.
              </p>
            </div>
          </div>
        )}

        {isFuture && (
          <div className="mb-5 p-4 rounded-xl bg-slate-950/90 border border-slate-700 text-slate-300 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <h4 className="font-bold text-slate-200 text-sm">
                🔒 Misión bloqueada: Programada para el {activeQuest.scheduledDayName}
              </h4>
              <p className="mt-1 text-slate-400">
                Por seguridad fisiológica y prevención de lesiones, no se permite adelantar misiones con fecha posterior
                al día en que te encuentras.
              </p>
            </div>
          </div>
        )}

        {isMissed && (
          <div className="mb-5 p-4 rounded-xl bg-red-950/60 border border-red-700/60 text-red-200 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <h4 className="font-bold text-red-300 text-sm">
                Misión marcada como no completada
              </h4>
              <p className="mt-1 text-red-200/90">
                El déficit de {activeQuest.targetUCE} UCE ha sido reasignado y diluido de forma asintótica en las semanas
                restantes de tu compromiso. Puedes revertir esta acción si fue un error.
              </p>
            </div>
          </div>
        )}

        {/* Cabecera de la Quest */}
        <div className="border-b border-amber-800/40 pb-4 mb-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                  activeQuest.isHeroicExtra
                    ? 'bg-purple-950/80 text-purple-300 border-purple-500/50 animate-pulse'
                    : isPastUncompleted
                    ? 'bg-amber-950 text-amber-300 border-amber-500'
                    : isMissed
                    ? 'bg-red-950 text-red-300 border-red-700'
                    : 'bg-amber-950 text-amber-300 border-amber-600/50'
                }`}
              >
                {activeQuest.isHeroicExtra
                  ? '★ Quest Heroica Extra'
                  : isPastUncompleted
                  ? '⚠️ Posible Fallo (Pendiente)'
                  : isMissed
                  ? 'Fallida (Déficit Diluido)'
                  : `Misión de ${activeQuest.scheduledDayName}`}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {activeQuest.durationMinutes} min • {activeQuest.targetUCE} UCE
              </span>
            </div>

            {/* Recompensa de XP */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-700/40">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>+{activeQuest.rewardXP} XP</span>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-amber-100 font-serif tracking-wide">
            {activeQuest.title}
          </h2>
          <p className="text-xs sm:text-sm text-amber-200/70 mt-1 font-medium">
            {activeQuest.subtitle}
          </p>
        </div>

        {/* Advertencia / Guía técnica del Entrenador de Élite */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-blue-300 block mb-0.5">
              Instrucción del Entrenador (Acondicionamiento Suave):
            </span>
            Estás adaptando tendones y articulaciones tras un periodo sedentario. Respeta la regresión
            indicada en cada ejercicio. No busques el fallo muscular, mantén un esfuerzo percibido (RPE) moderado (3 a 4).
          </div>
        </div>

        {/* Lista de Objetivos de la Quest (Checklist interactiva estilo WoW) */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between text-xs text-amber-400/90 font-bold uppercase tracking-wider">
            <span>Objetivos a Cumplir ({completedStepsCount}/{totalStepsCount})</span>
            <span>RPE / Carga</span>
          </div>

          {activeQuest.exercises.map((step) => {
            return (
              <div
                key={step.id}
                id={`exercise-card-${step.id}`}
                onClick={() => {
                  if (!isFuture) toggleExercise(activeQuest.id, step.id);
                }}
                className={`p-3.5 rounded-xl border transition-all ${
                  isFuture ? 'cursor-not-allowed opacity-60' : 'cursor-pointer select-none'
                } ${
                  step.completed
                    ? 'bg-slate-900/90 border-emerald-500/60 text-slate-400'
                    : 'bg-slate-800/90 border-amber-900/50 hover:border-amber-600/70 text-slate-100 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox táctil dorado */}
                  <div
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      step.completed
                        ? 'bg-emerald-600 border-emerald-400 text-white'
                        : isFuture
                        ? 'border-slate-600 bg-slate-900 text-slate-600'
                        : 'border-amber-500/70 bg-slate-900/80 hover:border-amber-400'
                    }`}
                  >
                    {step.completed && <Check className="w-4 h-4 stroke-[3]" />}
                    {isFuture && <Lock className="w-3 h-3 text-slate-500" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-sm font-bold ${
                          step.completed ? 'line-through text-slate-400' : 'text-amber-100'
                        }`}
                      >
                        {step.name}
                      </h4>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-950 font-mono font-bold text-amber-300 border border-slate-700">
                          {step.sets} series × {step.repsOrDuration} {step.isDuration ? 'seg' : 'reps'}
                        </span>
                        {onOpenTimerWithDuration && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenTimerWithDuration(step.isDuration ? step.repsOrDuration : 45);
                            }}
                            className="px-2 py-0.5 rounded bg-amber-950/70 hover:bg-amber-900 border border-amber-600/50 text-amber-300 hover:text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title={step.isDuration ? `Abrir temporizador para ${step.repsOrDuration}s` : 'Abrir temporizador de descanso'}
                          >
                            <Timer className="w-3 h-3 text-amber-400" />
                            <span>{step.isDuration ? `${step.repsOrDuration}s` : 'Descanso 45s'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Regresión adaptativa */}
                    <p className="text-xs text-amber-300/80 mt-1 leading-relaxed bg-amber-950/20 p-2 rounded border border-amber-900/30">
                      <strong className="text-amber-400">Regresión segura:</strong> {step.regressionTip}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span className="capitalize">Material: <strong className="text-slate-200">{step.equipment}</strong></span>
                      <span>•</span>
                      <span>RPE objetivo: <strong className="text-amber-300">{step.targetRPE}/10</strong> (Moderado)</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botones de Acción de la Quest */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-amber-900/40">
          
          {/* Botón Misión no completada / Deshacer no completada */}
          <div>
            {isMissed ? (
              <button
                id="btn-undo-missed"
                onClick={() => undoMissedQuest(activeQuest.id)}
                className="w-full sm:w-auto text-xs font-semibold text-amber-400 hover:text-amber-300 px-3 py-2 rounded-lg bg-amber-950/40 hover:bg-amber-950/80 border border-amber-700/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Revertir el estado de no completada y devolver la carga al plan original"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Deshacer no completada</span>
              </button>
            ) : (
              <button
                id="btn-mark-missed"
                onClick={() => markQuestMissed(activeQuest.id)}
                className="w-full sm:w-auto text-xs font-semibold text-rose-400 hover:text-rose-300 px-3 py-2 rounded-lg hover:bg-rose-950/40 border border-rose-900/50 hover:border-rose-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Si no se pudo o no se podrá realizar, el algoritmo diluye el déficit a los meses restantes sin sobrecargar la semana."
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Misión no completada</span>
              </button>
            )}
          </div>

          {/* Botón de Completar / Deshacer Misión Finalizada */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isCompleted ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-600/50 font-bold text-xs sm:text-sm">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>¡Misión Cumplida!</span>
                </div>
                <button
                  id="btn-undo-complete"
                  onClick={() => undoCompleteQuest(activeQuest.id)}
                  className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Deshacer misión finalizada por si se pulsó por error"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Deshacer</span>
                  <span className="sm:hidden">Deshacer</span>
                </button>
              </div>
            ) : isFuture ? (
              <div
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 text-xs sm:text-sm font-medium cursor-not-allowed"
                title="No se pueden completar misiones con fecha posterior al día de hoy"
              >
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Bloqueada hasta el {activeQuest.scheduledDayName}</span>
              </div>
            ) : (
              <button
                id="btn-complete-quest"
                onClick={() => completeQuest(activeQuest.id)}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all cursor-pointer ${
                  isPastUncompleted
                    ? 'bg-amber-600 hover:bg-amber-500 text-white ring-2 ring-amber-400'
                    : isReadyToTurnIn
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 animate-pulse ring-2 ring-amber-300'
                    : 'bg-amber-700 hover:bg-amber-600 text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isPastUncompleted
                    ? 'Confirmar que sí se completó'
                    : isReadyToTurnIn
                    ? 'Entregar Misión & Reclamar XP'
                    : 'Marcar Misión Completa'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Pie: Compromiso total y estado del déficit */}
        <div className="mt-5 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>Compromiso: <strong className="text-slate-200">{profile.commitmentMonths} Meses</strong></span>
          <span>Déficit acumulado: <strong className="text-amber-400">{profile.accumulatedDeficitUCE} UCE</strong> (diluido a largo plazo)</span>
        </div>
      </div>
    </div>
  );
};
