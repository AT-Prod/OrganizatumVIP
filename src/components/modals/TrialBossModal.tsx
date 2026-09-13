import React, { useState } from 'react';
import { useTraining } from '../../context/TrainingContext';
import { X, Award, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface TrialBossModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDisciplineId?: string;
}

export const TrialBossModal: React.FC<TrialBossModalProps> = ({
  isOpen,
  onClose,
  defaultDisciplineId,
}) => {
  const { benchmarks, profile, registerBenchmarkMark } = useTraining();
  const currentExamBenchmarks = benchmarks.filter((b) => b.targetExam === profile.targetExam);

  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>(
    defaultDisciplineId || currentExamBenchmarks[0]?.id || ''
  );
  const [inputValue, setInputValue] = useState<string>('');

  if (!isOpen) return null;

  const currentDiscipline =
    currentExamBenchmarks.find((b) => b.id === selectedDisciplineId) || currentExamBenchmarks[0];

  const numericVal = parseFloat(inputValue);
  let calculatedPoints = 0;

  if (!isNaN(numericVal) && currentDiscipline) {
    if (currentDiscipline.higherIsBetter) {
      for (let i = currentDiscipline.officialTableFemale.length - 1; i >= 0; i--) {
        if (numericVal >= currentDiscipline.officialTableFemale[i].value) {
          calculatedPoints = currentDiscipline.officialTableFemale[i].points;
          break;
        }
      }
    } else {
      for (let i = currentDiscipline.officialTableFemale.length - 1; i >= 0; i--) {
        if (numericVal <= currentDiscipline.officialTableFemale[i].value) {
          calculatedPoints = currentDiscipline.officialTableFemale[i].points;
          break;
        }
      }
    }
  }

  const isPassing = calculatedPoints >= (currentDiscipline?.passScoreCutoff || 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNaN(numericVal) && currentDiscipline) {
      registerBenchmarkMark(currentDiscipline.id, numericVal);
      setInputValue('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-600/70 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/50 flex items-center justify-center text-yellow-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-serif text-amber-200">
              Validación Oficial (Trial Boss)
            </h3>
            <p className="text-xs text-slate-400">
              Registra tu marca oficial obtenida según los baremos del BOE / BOCM.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          {/* Selector de prueba */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Prueba a Validar:
            </label>
            <select
              value={selectedDisciplineId}
              onChange={(e) => setSelectedDisciplineId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
            >
              {currentExamBenchmarks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Campo de Marca Obtenida */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Marca Real Registrada ({currentDiscipline?.unit}):
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder={currentDiscipline?.higherIsBetter ? 'Ej: 44' : 'Ej: 11.2'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-base font-mono font-bold text-amber-300 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500">
                {currentDiscipline?.unit}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {currentDiscipline?.description}
            </p>
          </div>

          {/* Cálculo de Puntos en Vivo */}
          {!isNaN(numericVal) && numericVal > 0 && (
            <div
              className={`p-4 rounded-xl border transition-all ${
                isPassing
                  ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Puntuación Obtenida:
                </span>
                <span className="text-lg font-black font-mono">
                  {calculatedPoints} / 10 Puntos
                </span>
              </div>

              {isPassing ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>¡Apto Oficial Superado! Se activarán las Misiones Heroicas Extra.</span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-2">
                  Continúa con las misiones de acondicionamiento suave. El aprobado oficial son 5 puntos.
                </p>
              )}
            </div>
          )}

          {/* Botón guardar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isNaN(numericVal) || numericVal <= 0}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Guardar Test & Ganar +250 XP</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
