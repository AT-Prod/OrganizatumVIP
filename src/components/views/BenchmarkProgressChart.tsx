import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useTraining } from '../../context/TrainingContext';
import { TrendingUp, Award, CheckCircle2, AlertCircle, PlusCircle, Sparkles } from 'lucide-react';

interface BenchmarkProgressChartProps {
  onOpenTrialBossForDiscipline?: (disciplineId: string) => void;
}

export const BenchmarkProgressChart: React.FC<BenchmarkProgressChartProps> = ({
  onOpenTrialBossForDiscipline,
}) => {
  const { benchmarks, profile } = useTraining();
  const currentExamBenchmarks = benchmarks.filter((b) => b.targetExam === profile.targetExam);

  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>(
    currentExamBenchmarks[0]?.id || ''
  );

  const currentDiscipline =
    currentExamBenchmarks.find((b) => b.id === selectedDisciplineId) || currentExamBenchmarks[0];

  if (!currentDiscipline) return null;

  // Formatear datos para recharts
  const chartData = currentDiscipline.history.map((h, idx) => {
    // Formatear fecha a legible
    const dateObj = new Date(h.date);
    const dateStr = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      : h.date;

    return {
      index: idx + 1,
      date: dateStr,
      fullDate: h.date,
      value: h.value,
      points: h.points,
      unit: currentDiscipline.unit,
      label: `${h.value} ${currentDiscipline.unit}`,
    };
  });

  const lastTest = currentDiscipline.history[currentDiscipline.history.length - 1];
  const firstTest = currentDiscipline.history[0];
  const isApto = (lastTest?.points || 0) >= currentDiscipline.passScoreCutoff;

  let deltaImprovement = '';
  if (firstTest && lastTest && firstTest !== lastTest) {
    const diff = lastTest.value - firstTest.value;
    if (currentDiscipline.higherIsBetter) {
      deltaImprovement = diff >= 0 ? `+${diff.toFixed(1)} ${currentDiscipline.unit}` : `${diff.toFixed(1)} ${currentDiscipline.unit}`;
    } else {
      // En carrera o agilidad, menor tiempo es mejor
      deltaImprovement = diff <= 0 ? `${diff.toFixed(1)}s (más rápido)` : `+${diff.toFixed(1)}s`;
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Cabecera y Selector de Disciplina */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 font-serif flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <span>Curva de Evolución y Validación de Marcas</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Progresión oficial de puntuación (escala 0 a 10) hacia el APTO del baremo.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedDisciplineId}
            onChange={(e) => setSelectedDisciplineId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-amber-300 focus:outline-none cursor-pointer"
          >
            {currentExamBenchmarks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => onOpenTrialBossForDiscipline?.(currentDiscipline.id)}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Nuevo Test</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas de la Disciplina */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-[11px] block">Última Marca Medida</span>
          <div className="text-lg font-black text-amber-300 font-mono mt-0.5">
            {lastTest ? `${lastTest.value} ${currentDiscipline.unit}` : 'Sin registrar'}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {lastTest ? `Puntuación: ${lastTest.points}/10 puntos` : 'Realiza tu primer test'}
          </span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-[11px] block">Estado de Aprobado</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isApto ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1 text-sm">
                <CheckCircle2 className="w-4 h-4" /> APTO OFICIAL
              </span>
            ) : (
              <span className="text-amber-400 font-bold flex items-center gap-1 text-sm">
                <AlertCircle className="w-4 h-4" /> En Progresión
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Corte mínimo: 5 Puntos ({currentDiscipline.officialTableFemale[4]?.markText})
          </span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-[11px] block">Mejora Acumulada</span>
          <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
            {deltaImprovement || 'Punto de partida'}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {currentDiscipline.history.length} evaluaciones registradas
          </span>
        </div>
      </div>

      {/* Gráfico Recharts de Progresión */}
      <div className="h-64 sm:h-72 w-full pt-2">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                ticks={[0, 2, 4, 5, 6, 8, 10]}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                unit=" pts"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-amber-500/80 p-3 rounded-xl shadow-2xl text-xs space-y-1 text-slate-200">
                        <div className="font-bold text-amber-300 font-serif border-b border-slate-800 pb-1">
                          Test: {data.fullDate}
                        </div>
                        <div>Marca registrada: <strong className="text-white font-mono">{data.value} {data.unit}</strong></div>
                        <div>Puntos oficiales: <strong className="text-amber-400 font-bold">{data.points} / 10</strong></div>
                        <div className={`font-semibold ${data.points >= 5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {data.points >= 5 ? '✓ Supera corte de APTO' : `A ${5 - data.points} puntos del APTO`}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Línea de corte de APTO (5 Puntos) */}
              <ReferenceLine
                y={5}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: 'APTO (5 Ptos)',
                  fill: '#34d399',
                  fontSize: 11,
                  position: 'insideTopRight',
                }}
              />
              {/* Línea de Nota Máxima (10 Puntos) */}
              <ReferenceLine
                y={10}
                stroke="#f59e0b"
                strokeDasharray="2 2"
                strokeWidth={1}
                label={{
                  value: '10 Ptos',
                  fill: '#fbbf24',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              <Line
                type="monotone"
                dataKey="points"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ fill: '#d97706', stroke: '#fbbf24', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 8, fill: '#fbbf24' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center">
            <Award className="w-8 h-8 text-slate-600 mb-2" />
            <span>No hay registros aún para esta prueba.</span>
            <button
              onClick={() => onOpenTrialBossForDiscipline?.(currentDiscipline.id)}
              className="mt-2 text-amber-400 underline hover:text-amber-300 font-semibold cursor-pointer"
            >
              Registrar tu primer test de evaluación
            </button>
          </div>
        )}
      </div>

      {/* Nota técnica de baremación */}
      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-200 block">Metodología de Validación Oficial:</strong>
          Al registrar una marca igual o superior a 5 puntos, la disciplina se homologa automáticamente como superada
          y desbloquea las <strong>Misiones Heroicas Extra</strong> para exprimir puntuación de 8 a 10 puntos.
        </div>
      </div>
    </div>
  );
};
