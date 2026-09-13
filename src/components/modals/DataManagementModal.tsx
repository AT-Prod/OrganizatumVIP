import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Database,
  FileJson,
} from 'lucide-react';
import { useTraining } from '../../context/TrainingContext';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { exportData, importData, resetData } = useTraining();
  const [pasteText, setPasteText] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    const jsonString = exportData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oposiciones_quest_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMessage({ type: 'success', text: 'Copia de seguridad descargada con éxito en archivo .json' });
  };

  const handleCopyClipboard = () => {
    const jsonString = exportData();
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      setStatusMessage({ type: 'success', text: 'Datos JSON copiados al portapapeles' });
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importData(content);
        if (success) {
          setStatusMessage({ type: 'success', text: '¡Progreso restaurado correctamente desde el archivo!' });
          setTimeout(() => onClose(), 1500);
        } else {
          setStatusMessage({ type: 'error', text: 'El archivo seleccionado no contiene un formato de copia válido.' });
        }
      }
    };
    reader.readAsText(file);
  };

  const handlePasteImport = () => {
    if (!pasteText.trim()) {
      setStatusMessage({ type: 'error', text: 'Por favor, pega el código JSON de tu copia de seguridad.' });
      return;
    }

    const success = importData(pasteText);
    if (success) {
      setStatusMessage({ type: 'success', text: '¡Progreso importado con éxito!' });
      setPasteText('');
      setTimeout(() => onClose(), 1500);
    } else {
      setStatusMessage({ type: 'error', text: 'El texto introducido no es un JSON de copia válido.' });
    }
  };

  const handleExecuteReset = () => {
    resetData();
    setConfirmReset(false);
    setStatusMessage({ type: 'success', text: 'Se ha reiniciado el progreso al estado inicial de sedentarismo suave.' });
    setTimeout(() => onClose(), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Cabecera */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-100 font-serif">
              Gestión de Datos y Copia de Seguridad
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensaje de estado */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 border-b ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/60 border-rose-800 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Sincronización Automática Local */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-300">
                Guardado automático activo en <strong>LocalStorage</strong> de este navegador.
              </span>
            </div>
            <span className="text-[10px] bg-emerald-950 border border-emerald-700 text-emerald-400 px-2 py-0.5 rounded font-bold">
              SINCRONIZADO
            </span>
          </div>

          {/* SECCIÓN 1: EXPORTAR */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Download className="w-4 h-4" /> Exportar Copia de Seguridad
            </h3>
            <p className="text-xs text-slate-400">
              Guarda un archivo de texto con todo tu progreso (XP, misiones completadas, marcas de baremos, racha y compromiso).
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadBackup}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow cursor-pointer transition-all"
              >
                <FileJson className="w-4 h-4" />
                <span>Descargar archivo .json</span>
              </button>

              <button
                onClick={handleCopyClipboard}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? '¡Copiado!' : 'Copiar texto'}</span>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800" />

          {/* SECCIÓN 2: IMPORTAR */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4" /> Restaurar o Importar Datos
            </h3>
            <p className="text-xs text-slate-400">
              Carga tu archivo de seguridad para reanudar tu preparación en otro dispositivo.
            </p>

            {/* Input oculto de archivo */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Seleccionar archivo .json del equipo</span>
            </button>

            {/* O pegar JSON */}
            <div className="space-y-2 pt-1">
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="O pega aquí el texto JSON de la copia de seguridad..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
              {pasteText.trim().length > 0 && (
                <button
                  onClick={handlePasteImport}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                >
                  Confirmar e importar texto
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-slate-800" />

          {/* SECCIÓN 3: REINICIAR */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Zona de Peligro: Reiniciar Preparación
            </h3>

            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="py-2 px-3 rounded-lg bg-rose-950/40 hover:bg-rose-950/80 border border-rose-800/60 text-rose-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                Restablecer todos los datos a cero
              </button>
            ) : (
              <div className="bg-rose-950/60 border border-rose-700 p-4 rounded-xl space-y-3">
                <div className="text-xs text-rose-200">
                  ⚠️ ¿Segura de reiniciar todo tu historial, nivel y progreso? Esta acción no se puede deshacer.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExecuteReset}
                    className="py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Sí, borrar y empezar de nuevo
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
