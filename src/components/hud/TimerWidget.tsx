import React, { useState, useEffect, useRef } from 'react';
import {
  Timer as TimerIcon,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Minimize2,
  Maximize2,
  Clock,
  Zap,
  Award,
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface TimerWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTimeToTest?: (seconds: number) => void;
  initialSeconds?: number;
  initialMode?: 'rest' | 'stopwatch';
}

const PRESET_REST_TIMES = [30, 45, 60, 90, 120, 180];

export const TimerWidget: React.FC<TimerWidgetProps> = ({
  isOpen,
  onClose,
  onSendTimeToTest,
  initialSeconds = 60,
  initialMode = 'rest',
}) => {
  const [mode, setMode] = useState<'rest' | 'stopwatch'>(initialMode);
  const [isMinimized, setIsMinimized] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Estados del Temporizador de Descanso
  const [restTarget, setRestTarget] = useState<number>(initialSeconds);
  const [restRemaining, setRestRemaining] = useState<number>(initialSeconds);
  const [isRestRunning, setIsRestRunning] = useState(false);

  // Estados del Cronómetro (Stopwatch)
  const [stopwatchMs, setStopwatchMs] = useState<number>(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  const restIntervalRef = useRef<number | null>(null);
  const stopwatchIntervalRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());

  // Manejo del temporizador de descanso
  useEffect(() => {
    if (isRestRunning) {
      restIntervalRef.current = window.setInterval(() => {
        setRestRemaining((prev) => {
          if (prev <= 1) {
            if (soundEnabled) sounds.playTimerDone();
            setIsRestRunning(false);
            return 0;
          }
          if (prev <= 4 && prev > 1 && soundEnabled) {
            sounds.playTimerTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
    }
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [isRestRunning, soundEnabled]);

  // Manejo del cronómetro de alta precisión
  useEffect(() => {
    if (isStopwatchRunning) {
      lastTimeRef.current = Date.now();
      stopwatchIntervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const delta = now - lastTimeRef.current;
        lastTimeRef.current = now;
        setStopwatchMs((prev) => prev + delta);
      }, 30);
    } else if (stopwatchIntervalRef.current) {
      clearInterval(stopwatchIntervalRef.current);
    }
    return () => {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    };
  }, [isStopwatchRunning]);

  if (!isOpen) return null;

  const startRestPreset = (seconds: number) => {
    setRestTarget(seconds);
    setRestRemaining(seconds);
    setIsRestRunning(true);
    if (soundEnabled) sounds.playStepCheck();
  };

  const toggleRest = () => {
    if (restRemaining === 0) {
      setRestRemaining(restTarget);
      setIsRestRunning(true);
    } else {
      setIsRestRunning(!isRestRunning);
    }
  };

  const resetRest = () => {
    setIsRestRunning(false);
    setRestRemaining(restTarget);
  };

  const adjustRest = (delta: number) => {
    const next = Math.max(5, restRemaining + delta);
    setRestRemaining(next);
    setRestTarget(next);
  };

  // Cronómetro
  const toggleStopwatch = () => {
    setIsStopwatchRunning(!isStopwatchRunning);
  };

  const resetStopwatch = () => {
    setIsStopwatchRunning(false);
    setStopwatchMs(0);
    setLaps([]);
  };

  const addLap = () => {
    if (stopwatchMs > 0) {
      setLaps([stopwatchMs, ...laps]);
    }
  };

  const formatStopwatch = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths}`;
  };

  const progressPercent = restTarget > 0 ? ((restTarget - restRemaining) / restTarget) * 100 : 0;

  // Render flotante minimizado
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border-2 border-amber-500 rounded-full shadow-2xl p-2 px-3.5 flex items-center gap-3 text-white backdrop-blur-md animate-bounce-subtle">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-white cursor-pointer"
        >
          {mode === 'rest' ? (
            <>
              <TimerIcon className={`w-4 h-4 text-amber-400 ${isRestRunning ? 'animate-spin' : ''}`} />
              <span>{restRemaining}s descanso</span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="font-mono">{formatStopwatch(stopwatchMs)}</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            if (mode === 'rest') toggleRest();
            else toggleStopwatch();
          }}
          className="p-1 rounded-full bg-amber-600 hover:bg-amber-500 text-white cursor-pointer"
        >
          {(mode === 'rest' ? isRestRunning : isStopwatchRunning) ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-white" />
          )}
        </button>

        <button
          onClick={() => setIsMinimized(false)}
          className="text-slate-400 hover:text-white cursor-pointer p-0.5"
          title="Restaurar ventana"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-88 max-w-[calc(100vw-2rem)] bg-slate-900 border-2 border-amber-600/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md text-slate-100 animate-fadeIn">
      {/* Barra superior de la ventana */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-serif">
            {mode === 'rest' ? 'Temporizador de Descanso' : 'Cronómetro Oficial'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 rounded text-slate-400 hover:text-amber-300 cursor-pointer"
            title={soundEnabled ? 'Sonido activado' : 'Silenciado'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
            title="Minimizar a píldora flotante"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-rose-400 cursor-pointer"
            title="Cerrar temporizador"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selector de modo: Descanso vs Cronómetro */}
      <div className="grid grid-cols-2 p-1.5 bg-slate-950/60 border-b border-slate-800 text-xs text-center font-bold">
        <button
          onClick={() => setMode('rest')}
          className={`py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === 'rest'
              ? 'bg-amber-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TimerIcon className="w-3.5 h-3.5" />
          <span>Descanso entre Series</span>
        </button>
        <button
          onClick={() => setMode('stopwatch')}
          className={`py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === 'stopwatch'
              ? 'bg-amber-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Cronómetro de Marcas</span>
        </button>
      </div>

      {/* CONTENIDO MODO DESCANSO */}
      {mode === 'rest' && (
        <div className="p-5 space-y-4">
          {/* Display Circular / Numérico */}
          <div className="text-center relative py-2">
            <div className="text-5xl font-black font-mono tracking-tight text-amber-300">
              {Math.floor(restRemaining / 60)}:{(restRemaining % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
              {isRestRunning ? 'Recuperación activa de sustratos' : restRemaining === 0 ? '¡Tiempo cumplido! A por la serie' : 'Listo para iniciar'}
            </div>

            {/* Barra de progreso animada */}
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-3 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Ajuste fino +/- 10s */}
          <div className="flex items-center justify-center gap-2 text-xs">
            <button
              onClick={() => adjustRest(-15)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer border border-slate-700"
            >
              -15s
            </button>
            <button
              onClick={() => adjustRest(-5)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer border border-slate-700"
            >
              -5s
            </button>
            <span className="text-slate-500 font-bold">•</span>
            <button
              onClick={() => adjustRest(+5)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer border border-slate-700"
            >
              +5s
            </button>
            <button
              onClick={() => adjustRest(+15)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer border border-slate-700"
            >
              +15s
            </button>
          </div>

          {/* Presets rápidos */}
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Descansos recomendados:</div>
            <div className="grid grid-cols-6 gap-1">
              {PRESET_REST_TIMES.map((sec) => (
                <button
                  key={sec}
                  onClick={() => startRestPreset(sec)}
                  className={`text-xs py-1 rounded font-bold transition-all cursor-pointer ${
                    restTarget === sec
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Botones de Control Principal */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={resetRest}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
              title="Reiniciar descanso"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleRest}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                isRestRunning
                  ? 'bg-amber-700 hover:bg-amber-600 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 ring-1 ring-amber-300'
              }`}
            >
              {isRestRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pausar Descanso</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{restRemaining === 0 ? 'Repetir Descanso' : 'Iniciar Descanso'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* CONTENIDO MODO CRONÓMETRO */}
      {mode === 'stopwatch' && (
        <div className="p-5 space-y-4">
          <div className="text-center py-2">
            <div className="text-4xl font-black font-mono tracking-tight text-yellow-300">
              {formatStopwatch(stopwatchMs)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
              {isStopwatchRunning ? 'Medición en curso' : 'Cronómetro detenido'}
            </div>
          </div>

          {/* Botones de acción del cronómetro */}
          <div className="flex items-center gap-2">
            <button
              onClick={resetStopwatch}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
              title="Reiniciar cronómetro"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleStopwatch}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow cursor-pointer ${
                isStopwatchRunning
                  ? 'bg-rose-700 hover:bg-rose-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isStopwatchRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Iniciar Cronómetro</span>
                </>
              )}
            </button>

            <button
              onClick={addLap}
              disabled={!isStopwatchRunning}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs border border-slate-700 cursor-pointer"
            >
              Vuelta
            </button>
          </div>

          {/* Enviar marca a Test Oficial */}
          {stopwatchMs > 2000 && onSendTimeToTest && (
            <button
              onClick={() => {
                const totalSeconds = Number((stopwatchMs / 1000).toFixed(1));
                onSendTimeToTest(totalSeconds);
              }}
              className="w-full py-2 px-3 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-600/70 text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow"
            >
              <Award className="w-4 h-4 text-yellow-400" />
              <span>Validar esta marca ({(stopwatchMs / 1000).toFixed(1)}s) en Test Oficial</span>
            </button>
          )}

          {/* Registro de vueltas */}
          {laps.length > 0 && (
            <div className="max-h-24 overflow-y-auto border-t border-slate-800 pt-2 space-y-1 text-xs">
              {laps.map((lapMs, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-400 px-1 font-mono">
                  <span>Vuelta {laps.length - idx}:</span>
                  <span className="text-amber-300 font-bold">{formatStopwatch(lapMs)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
