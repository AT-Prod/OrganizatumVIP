import React, { useState } from 'react';
import { useTraining } from '../../context/TrainingContext';
import { X, CalendarCheck, ShieldAlert, Check, ArrowRight, Info } from 'lucide-react';
import { calculateDilution } from '../../engine/mathEngine';

interface WeeklyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklyCheckinModal: React.FC<WeeklyCheckinModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateWeeklyAvailability, updateCommitmentMonths } = useTraining();

  const [daysPerWeek, setDaysPerWeek] = useState<number>(profile.weeklyAvailability.daysPerWeek);
  const [minutesPerSession, setMinutesPerSession] = useState<number>(profile.weeklyAvailability.minutesPerSession);
  const [commitmentMonths, setCommitmentMonths] = useState<number>(profile.commitmentMonths);

  if (!isOpen) return null;

  const weeksRemaining = Math.max(1, Math.round(commitmentMonths * 4.33) - profile.currentWeek);
  const simulation = calculateDilution(profile.accumulatedDeficitUCE, weeksRemaining, daysPerWeek * 30);

  const handleSave = () => {
    if (commitmentMonths !== profile.commitmentMonths) {
      updateCommitmentMonths(commitmentMonths);
    }
    updateWeeklyAvailability({
      ...profile.weeklyAvailability,
      daysPerWeek,
      minutesPerSession,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-600/70 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        
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
          <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-600/50 flex items-center justify-center text-amber-400">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-serif text-amber-200">
              Check-in Semanal de Disponibilidad
            </h3>
            <p className="text-xs text-slate-400">
              Ajusta tus parámetros para la próxima semana con reajuste biomatemático seguro.
            </p>
          </div>
        </div>

        {/* Formulario de Ajustes */}
        <div className="space-y-5 text-sm">
          
          {/* Días disponibles */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Días de Entrenamiento Disponibles Esta Semana:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setDaysPerWeek(num)}
                  className={`py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    daysPerWeek === num
                      ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {num} Días
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Recomendado para sedentarismo inicial: 3 días alternos (ej. Lun-Mié-Vie) para garantizar 48h de recuperación.
            </p>
          </div>

          {/* Minutos por sesión */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Tiempo Dedicado por Sesión en Parcela:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 20, 25, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setMinutesPerSession(mins)}
                  className={`py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    minutesPerSession === mins
                      ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Compromiso total en meses */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Compromiso Total del Programa:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[6, 9, 12, 18, 24].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setCommitmentMonths(m)}
                  className={`py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    commitmentMonths === m
                      ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {m} Meses
                </button>
              ))}
            </div>
          </div>

          {/* Explicación Matemática del Algoritmo de Dilución */}
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-900/50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Garantía de Progresión Segura (Anti-Sobrecarga)</span>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              {simulation.explanation}
            </p>

            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
              <span>Semanas restantes de compromiso: <strong className="text-slate-200">{weeksRemaining}</strong></span>
              <span>Déficit actual: <strong className="text-amber-400">{profile.accumulatedDeficitUCE} UCE</strong></span>
            </div>
          </div>

        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Aplicar y Recalcular Rutina</span>
          </button>
        </div>

      </div>
    </div>
  );
};
