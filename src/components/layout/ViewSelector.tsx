import React from 'react';
import { List, Calendar, ShieldAlert, Award } from 'lucide-react';

export type AppView = 'list' | 'calendar' | 'widget' | 'benchmarks';

interface ViewSelectorProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  unlockedHeroicsCount: number;
}

export const ViewSelector: React.FC<ViewSelectorProps> = ({
  currentView,
  onSelectView,
  unlockedHeroicsCount,
}) => {
  const tabs: { id: AppView; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'list',
      label: 'Vista Lista & Roadmap',
      icon: <List className="w-4 h-4" />,
    },
    {
      id: 'calendar',
      label: 'Vista Calendario',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'widget',
      label: 'Widget WoW (HUD)',
      icon: <ShieldAlert className="w-4 h-4 text-amber-400" />,
      badge: 'En directo',
    },
    {
      id: 'benchmarks',
      label: 'Baremos Oficiales & Marcas',
      icon: <Award className="w-4 h-4 text-yellow-400" />,
      badge: unlockedHeroicsCount > 0 ? `${unlockedHeroicsCount} Heroicas` : undefined,
    },
  ];

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 sticky top-[65px] z-20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
        <div className="flex items-center space-x-1 sm:space-x-2">
          {tabs.map((tab) => {
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onSelectView(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30 ring-1 ring-amber-400/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      isActive
                        ? 'bg-amber-950/80 text-amber-200 border border-amber-400/30'
                        : 'bg-slate-800 text-amber-400 border border-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>Material: Parcela • Barra • Paralelas • Pesas • Bandas</span>
        </div>
      </div>
    </div>
  );
};
