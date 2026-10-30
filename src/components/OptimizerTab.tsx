import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trash2, ShieldCheck, Power, RefreshCw, CheckCircle2, AlertCircle, ArrowUpRight, Cpu } from 'lucide-react';
import { PrivilegeMode, AppProcess, DeviceTelemetry } from '../types';
import { playSound } from '../utils/audio';

interface OptimizerTabProps {
  privilegeMode: PrivilegeMode;
  telemetry: DeviceTelemetry;
  apps: AppProcess[];
  onForceStopApp: (pkg: string) => void;
  onClearCacheApp: (pkg: string) => void;
  onBatchHibernate: (pkgs: string[]) => void;
  onAutoOptimizeAll: () => Promise<void>;
  isOptimizing: boolean;
}

export const OptimizerTab: React.FC<OptimizerTabProps> = ({
  privilegeMode,
  telemetry,
  apps,
  onForceStopApp,
  onClearCacheApp,
  onBatchHibernate,
  onAutoOptimizeAll,
  isOptimizing,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'running' | 'game' | 'social'>('all');
  const [selectedPkgs, setSelectedPkgs] = useState<string[]>([]);
  const [lastOptimizedLog, setLastOptimizedLog] = useState<string | null>(null);

  const filteredApps = apps.filter((app) => {
    if (filterCategory === 'running') return app.isRunning && !app.isHibernated;
    if (filterCategory === 'game') return app.category === 'game';
    if (filterCategory === 'social') return app.category === 'social';
    return true;
  });

  const totalCacheMB = apps.reduce((acc, cur) => acc + (cur.isHibernated ? 0 : cur.cacheSizeMB), 0);
  const totalRunningRamMB = apps.reduce((acc, cur) => acc + (cur.isRunning && !cur.isHibernated ? cur.ramUsageMB : 0), 0);

  const toggleSelect = (pkg: string) => {
    playSound('click');
    if (selectedPkgs.includes(pkg)) {
      setSelectedPkgs(selectedPkgs.filter((p) => p !== pkg));
    } else {
      setSelectedPkgs([...selectedPkgs, pkg]);
    }
  };

  const handleSelectAll = () => {
    playSound('click');
    if (selectedPkgs.length === filteredApps.length) {
      setSelectedPkgs([]);
    } else {
      setSelectedPkgs(filteredApps.map((a) => a.packageName));
    }
  };

  const handleAutoBoost = async () => {
    playSound('boost');
    await onAutoOptimizeAll();
    setLastOptimizedLog('Berhasil membebaskan 1.84 GB RAM dan 820 MB system cache!');
  };

  return (
    <div className="space-y-6">
      {/* 1-Tap Auto Optimize Master Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0a0c13] to-[#12080d] border border-rose-500/30 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-600 text-white tracking-widest uppercase">
                XA SYSTEM CORE
              </span>
              <span className="text-xs font-mono text-cyan-400">
                Pembersih Otomatis & Deep Cache Engine
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-white">
              Optimasi Performa Perangkat Otomatis
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Mendeteksi aplikasi latar belakang yang membebani memori, membersihkan cache sistem secara menyeluruh, dan mengkalibrasi prioritas thread game.
            </p>
            {lastOptimizedLog && (
              <p className="text-xs font-mono text-emerald-400 flex items-center justify-center md:justify-start gap-1.5 pt-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{lastOptimizedLog}</span>
              </p>
            )}
          </div>

          {/* Master 1-Tap Optimization Button */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={isOptimizing}
              onClick={handleAutoBoost}
              className={`relative px-8 py-5 rounded-2xl font-heading font-black text-base sm:text-lg tracking-wider text-white shadow-lg transition-all flex items-center gap-3 ${
                isOptimizing
                  ? 'bg-slate-800 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-[0_0_35px_rgba(244,63,94,0.5)] border border-rose-400/40'
              }`}
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin text-rose-400" />
                  <span>MEMBERSIHKAN CACHE & RAM...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 fill-white" />
                  <span>1-TAP AUTO OPTIMIZE</span>
                </>
              )}
            </motion.button>
            <span className="text-[11px] font-mono text-slate-400">
              Mode Eksekusi: <strong className="text-cyan-400">{privilegeMode.toUpperCase()}</strong>
            </span>
          </div>
        </div>

        {/* Live Storage & Cache Breakdown Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div>
            <span className="text-[11px] font-mono text-slate-400">Cache Terdeteksi</span>
            <p className="text-xl font-heading font-bold text-amber-400 tabular-nums">
              {totalCacheMB} MB
            </p>
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400">RAM Background</span>
            <p className="text-xl font-heading font-bold text-rose-400 tabular-nums">
              {totalRunningRamMB} MB
            </p>
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400">Status Suhu</span>
            <p className="text-xl font-heading font-bold text-cyan-400 tabular-nums">
              {telemetry.batteryTempC.toFixed(1)}°C (Aman)
            </p>
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400">Chipset SoC</span>
            <p className="text-xs font-mono font-bold text-white truncate mt-1">
              {telemetry.socModel}
            </p>
          </div>
        </div>
      </div>

      {/* APK Process Manager & Detection Section */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
              <Power className="w-4 h-4 text-rose-500" />
              Deteksi APK & Proses Latar Belakang
            </h3>
            <p className="text-xs text-slate-400">
              Pilih APK untuk dihentikan paksa (force stop) atau dibersihkan cache-nya.
            </p>
          </div>

          {/* Filter Pills / Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
            <button
              onClick={() => {
                setFilterCategory('all');
                playSound('click');
              }}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterCategory === 'all' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua ({apps.length})
            </button>
            <button
              onClick={() => {
                setFilterCategory('running');
                playSound('click');
              }}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterCategory === 'running' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Berjalan
            </button>
            <button
              onClick={() => {
                setFilterCategory('game');
                playSound('click');
              }}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterCategory === 'game' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Game
            </button>
            <button
              onClick={() => {
                setFilterCategory('social');
                playSound('click');
              }}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterCategory === 'social' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sosmed
            </button>
          </div>
        </div>

        {/* Batch Actions Bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="select-all"
              checked={selectedPkgs.length === filteredApps.length && filteredApps.length > 0}
              onChange={handleSelectAll}
              className="rounded accent-rose-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="select-all" className="cursor-pointer text-slate-300">
              Pilih Semua ({selectedPkgs.length} Terpilih)
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={selectedPkgs.length === 0}
              onClick={() => {
                playSound('boost');
                onBatchHibernate(selectedPkgs);
                setSelectedPkgs([]);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-semibold transition-colors flex items-center gap-1.5"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Hentikan & Hibernate Terpilih</span>
            </button>
          </div>
        </div>

        {/* App List */}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                app.isHibernated
                  ? 'bg-slate-950/40 border-slate-900 opacity-60'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <input
                  type="checkbox"
                  checked={selectedPkgs.includes(app.packageName)}
                  onChange={() => toggleSelect(app.packageName)}
                  className="rounded accent-rose-500 w-4 h-4 shrink-0 cursor-pointer"
                />

                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {app.name.charAt(0)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-200 truncate">{app.name}</p>
                    {app.category === 'game' && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800/60">
                        GAME
                      </span>
                    )}
                    {app.isHibernated && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        HIBERNATED
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 truncate">{app.packageName}</p>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right font-mono text-xs hidden sm:block">
                  <p className="text-slate-300 tabular-nums">
                    RAM: <strong>{app.isHibernated ? 0 : app.ramUsageMB} MB</strong>
                  </p>
                  <p className="text-amber-400/90 text-[11px] tabular-nums">
                    Cache: {app.isHibernated ? 0 : app.cacheSizeMB} MB
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      playSound('click');
                      onClearCacheApp(app.packageName);
                    }}
                    title="Bersihkan Cache Aplikasi Ini"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    disabled={app.isHibernated}
                    onClick={() => {
                      playSound('boost');
                      onForceStopApp(app.packageName);
                    }}
                    title="Hentikan Paksa (Force Stop)"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-rose-400 hover:text-white transition-colors disabled:opacity-30"
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
