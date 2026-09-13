import React from 'react';
import { useTraining } from '../../context/TrainingContext';
import { Award, CheckCircle2, Lock, Unlock, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { BenchmarkProgressChart } from './BenchmarkProgressChart';

interface BenchmarksViewProps {
  onOpenTrialBossForDiscipline?: (disciplineId: string) => void;
}

export const BenchmarksView: React.FC<BenchmarksViewProps> = ({ onOpenTrialBossForDiscipline }) => {
  const { benchmarks, profile } = useTraining();
  const currentExamBenchmarks = benchmarks.filter((b) => b.targetExam === profile.targetExam);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      
      {/* Cabecera Informativa */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 font-serif flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Baremos Oficiales Femeninos y Validación de Marcas
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tablas oficiales adaptadas al cuerpo de {profile.targetExam === 'policia_nacional' ? 'Policía Nacional' : profile.targetExam === 'guardia_civil' ? 'Guardia Civil' : 'Bomberos Madrid'}.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-600/40 text-amber-300 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Superar 5 Puntos desbloquea Misiones Heroicas Extra
          </span>
        </div>
      </div>

      {/* Histórico Gráfico Interactivo de Evolución de Marcas */}
      <BenchmarkProgressChart onOpenTrialBossForDiscipline={onOpenTrialBossForDiscipline} />

      {/* Tarjetas de cada disciplina con baremo oficial */}
      <div className="space-y-6">
        {currentExamBenchmarks.map((discipline) => {
          // Determinar puntuación actual si existe marca
          let currentPoints = 0;
          if (discipline.currentMark !== null) {
            if (discipline.higherIsBetter) {
              for (let i = discipline.officialTableFemale.length - 1; i >= 0; i--) {
                if (discipline.currentMark >= discipline.officialTableFemale[i].value) {
                  currentPoints = discipline.officialTableFemale[i].points;
                  break;
                }
              }
            } else {
              for (let i = discipline.officialTableFemale.length - 1; i >= 0; i--) {
                if (discipline.currentMark <= discipline.officialTableFemale[i].value) {
                  currentPoints = discipline.officialTableFemale[i].points;
                  break;
                }
              }
            }
          }

          const isPassed = currentPoints >= discipline.passScoreCutoff;

          return (
            <div
              key={discipline.id}
              className={`rounded-2xl border p-6 transition-all shadow-lg ${
                isPassed
                  ? 'bg-slate-900 border-amber-500/60 ring-1 ring-amber-500/20'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-100 font-serif">
                      {discipline.name}
                    </h3>
                    {isPassed ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/50 text-[10px] font-bold uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> APTO OFICIAL ({currentPoints}/10)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-medium uppercase">
                        {discipline.currentMark === null ? 'Pendiente de Test' : `En Progreso (${currentPoints}/10)`}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                    {discipline.description}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Tu Marca Actual:</span>
                    <strong className="text-base text-amber-300 font-mono">
                      {discipline.currentMark !== null ? `${discipline.currentMark} ${discipline.unit}` : 'Sin registrar'}
                    </strong>
                  </div>

                  <button
                    onClick={() => onOpenTrialBossForDiscipline?.(discipline.id)}
                    className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow transition-colors cursor-pointer"
                  >
                    Registrar Marca
                  </button>
                </div>
              </div>

              {/* Escala Oficial de Puntuación (1 a 10 puntos) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">
                    Baremo Oficial Femenino (Escala 1 a 10)
                  </span>
                  <span className="text-amber-400 text-[11px]">
                    Corte de Aprobado: 5 Puntos ({discipline.officialTableFemale[4]?.markText})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5 text-center">
                  {discipline.officialTableFemale.map((item) => {
                    const isPassMark = item.points === 5;
                    const isUserScore = currentPoints === item.points;

                    return (
                      <div
                        key={item.points}
                        className={`p-2 rounded-lg border text-xs transition-all ${
                          isUserScore
                            ? 'bg-amber-500 text-slate-950 font-black border-yellow-300 ring-2 ring-amber-300 shadow-md'
                            : isPassMark
                            ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
                            : item.points >= 5
                            ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                            : 'bg-slate-950/60 border-slate-850 text-slate-500'
                        }`}
                      >
                        <div className="font-bold text-[10px] text-slate-400 mb-0.5">
                          {item.points} Ptos
                        </div>
                        <div className="font-mono font-bold text-[11px] truncate">
                          {item.markText.split(' ')[0]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Estado de Desbloqueo de Quests Heroicas */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {isPassed ? (
                    <span className="text-amber-300 flex items-center gap-1.5 font-semibold">
                      <Unlock className="w-4 h-4 text-amber-400" />
                      Misión Heroica Extra activa: "Maestría en {discipline.name}" disponible en tu registro de misiones.
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Lock className="w-4 h-4" />
                      Alcanza {discipline.officialTableFemale[4]?.markText} para desbloquear la Misión Heroica de subir nota.
                    </span>
                  )}
                </div>

                {discipline.history.length > 0 && (
                  <span className="text-slate-400 text-[11px]">
                    {discipline.history.length} {discipline.history.length === 1 ? 'test registrado' : 'tests registrados'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
