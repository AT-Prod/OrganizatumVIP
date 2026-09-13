import React from 'react';
import { useTraining } from '../../context/TrainingContext';
import { ShieldCheck, X } from 'lucide-react';

export const DilutionToast: React.FC = () => {
  const { dilutionNotice, dismissDilutionNotice } = useTraining();

  if (!dilutionNotice) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full p-4 rounded-xl bg-slate-900 border-2 border-amber-500/80 shadow-2xl text-slate-100 animate-slideUp">
      <div className="flex items-start justify-between gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-600/60 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 text-xs">
          <h4 className="font-bold text-amber-300 font-serif text-sm">
            Reajuste Biomatemático Activado
          </h4>
          <p className="text-slate-300 mt-1 leading-relaxed">
            {dilutionNotice.explanation}
          </p>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Semana actual protegida contra lesiones tendinosas</span>
          </div>
        </div>
        <button
          onClick={dismissDilutionNotice}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
