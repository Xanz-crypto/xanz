import React from 'react';
import { X, RotateCcw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PrivilegeMode, StockDeviceDefaults } from '../types';
import { playSound } from '../utils/audio';
import { ActiveTweakState, FACTORY_STOCK_DEFAULTS, generateStockRestoreCommands } from '../utils/tweakDetector';

interface RestoreStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTweaks: ActiveTweakState;
  privilegeMode: PrivilegeMode;
  onConfirmRestore: () => void;
  onViewRestoreScript: (commands: string[]) => void;
}

export const RestoreStockModal: React.FC<RestoreStockModalProps> = ({
  isOpen,
  onClose,
  activeTweaks,
  privilegeMode,
  onConfirmRestore,
  onViewRestoreScript,
}) => {
  if (!isOpen) return null;

  const restoreCommands = generateStockRestoreCommands(privilegeMode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl bg-[#090b10] border border-amber-500/40 rounded-3xl p-6 shadow-[0_0_40px_rgba(245,158,11,0.2)] text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-white">
                Detektor & Reset Tweak Default HP
              </h3>
              <p className="text-xs text-slate-400">
                Deteksi konfigurasi aktif dan pulihkan ke setelan bawaan pabrik
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tweak Audit List */}
        <div className="py-4 space-y-3">
          <div className="text-xs font-mono font-bold text-slate-300">
            STATUS PERBANDINGAN TWEAK DENGAN SETELAN ASLI:
          </div>

          <div className="space-y-2 text-xs font-mono">
            {/* Governor */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-300 block font-semibold">Governor CPU</span>
                <span className="text-[10px] text-slate-500">Bawaan pabrik: {FACTORY_STOCK_DEFAULTS.governor}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activeTweaks.isGovernorModified
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {activeTweaks.isGovernorModified ? 'Terganti (Tweak Aktif)' : 'Stock Bawaan'}
              </span>
            </div>

            {/* Resolution */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-300 block font-semibold">Resolusi Layar (wm size)</span>
                <span className="text-[10px] text-slate-500">Bawaan pabrik: {FACTORY_STOCK_DEFAULTS.resolution} ({FACTORY_STOCK_DEFAULTS.densityDpi} DPI)</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activeTweaks.isResolutionDownscaled
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {activeTweaks.isResolutionDownscaled ? 'Terdowngrade (Potato Boost)' : 'Stock Native'}
              </span>
            </div>

            {/* Thermal Daemon */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-300 block font-semibold">Daemon Manajemen Termal</span>
                <span className="text-[10px] text-slate-500">Bawaan pabrik: Berjalan aktif</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activeTweaks.isThermalSuppressed
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {activeTweaks.isThermalSuppressed ? 'Disupresi (Bypass Throttling)' : 'Stock Aktif'}
              </span>
            </div>

            {/* Texture LOD */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-300 block font-semibold">Tekstur Game & LOD Bias</span>
                <span className="text-[10px] text-slate-500">Bawaan pabrik: Standard Native</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activeTweaks.isTextureReduced
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {activeTweaks.isTextureReduced ? 'Terdowngrade (Redmi Mode)' : 'Stock Normal'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 space-y-2.5">
          <button
            onClick={() => {
              playSound('restore');
              onConfirmRestore();
              onClose();
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm tracking-wider shadow-lg shadow-amber-950/60 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>KEMBALIKAN KE TWEAK DEFAULT BAWAAN HP (1-CLICK)</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onViewRestoreScript(restoreCommands);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-mono text-cyan-300 border border-slate-800 transition-colors"
          >
            Lihat Script Perintah Pemulihan ADB
          </button>
        </div>
      </div>
    </div>
  );
};
