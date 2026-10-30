import React from 'react';
import { ShieldCheck, Volume2, VolumeX, RotateCcw, Terminal, Zap, Smartphone } from 'lucide-react';
import { PrivilegeMode } from '../types';
import { playSound, getSoundEnabled, setSoundEnabled } from '../utils/audio';

interface TopBarProps {
  privilegeMode: PrivilegeMode;
  onPrivilegeChange: (mode: PrivilegeMode) => void;
  activeTweaksCount: number;
  onOpenRestoreModal: () => void;
  onOpenTerminalModal: () => void;
  onOpenPlayStoreModal: () => void;
  onTriggerFloatingHud: () => void;
  isFloatingHudOpen: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  privilegeMode,
  onPrivilegeChange,
  activeTweaksCount,
  onOpenRestoreModal,
  onOpenTerminalModal,
  onOpenPlayStoreModal,
  onTriggerFloatingHud,
  isFloatingHudOpen,
}) => {
  const [audioOn, setAudioOn] = React.useState(getSoundEnabled());

  const toggleSound = () => {
    const next = !audioOn;
    setSoundEnabled(next);
    setAudioOn(next);
    if (next) playSound('click');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#08090d]/90 backdrop-blur-md px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-600 to-rose-950 border border-rose-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.4)]">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-black tracking-wider text-white whitespace-nowrap">
              XA <span className="text-rose-500">OPTIMIZER</span> <span className="text-xs font-mono text-cyan-400 font-semibold px-1 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40">v2</span>
            </h1>
          </div>
        </div>

        {/* Zone 2: Privilege Mode Switcher (Shizuku / Root / Non-Root) */}
        <div className="hidden sm:flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-lg text-xs font-mono">
          <button
            onClick={() => {
              onPrivilegeChange('shizuku');
              playSound('click');
            }}
            className={`px-3 py-1.5 rounded-md transition-all ${
              privilegeMode === 'shizuku'
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Shizuku (Wireless)
          </button>
          <button
            onClick={() => {
              onPrivilegeChange('root');
              playSound('click');
            }}
            className={`px-3 py-1.5 rounded-md transition-all ${
              privilegeMode === 'root'
                ? 'bg-rose-600/30 text-rose-300 border border-rose-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Root (KernelSU/Magisk)
          </button>
          <button
            onClick={() => {
              onPrivilegeChange('non_root');
              playSound('click');
            }}
            className={`px-3 py-1.5 rounded-md transition-all ${
              privilegeMode === 'non_root'
                ? 'bg-slate-700/60 text-slate-200 border border-slate-600'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Non-Root (ADB)
          </button>
        </div>

        {/* Zone 3: Quick Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* APK & Play Store Release Hub button */}
          <button
            onClick={() => {
              onOpenPlayStoreModal();
              playSound('powerup');
            }}
            title="Pasang APK ke HP & Paket Rilis Google Play Store"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-cyan-500/50 bg-gradient-to-r from-cyan-950/70 to-slate-900 text-xs font-mono font-bold text-cyan-300 hover:text-white hover:border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
            <span className="hidden sm:inline">Pasang APK / Play Store</span>
            <span className="sm:hidden">APK</span>
          </button>

          {/* Active Tweaks Indicator & Restore button */}
          <button
            onClick={() => {
              onOpenRestoreModal();
              playSound('click');
            }}
            title="Deteksi Tweak & Reset ke Standar Bawaan HP"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline font-mono">Tweak Aktif:</span>
            <span className="font-mono font-bold text-amber-400 tabular-nums">
              {activeTweaksCount}
            </span>
          </button>

          {/* Floating Game Space HUD overlay toggle */}
          <button
            onClick={() => {
              onTriggerFloatingHud();
              playSound('powerup');
            }}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isFloatingHudOpen
                ? 'bg-rose-600 text-white border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                : 'bg-rose-950/40 text-rose-400 border-rose-800/60 hover:bg-rose-900/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">HUD Red Magic</span>
          </button>

          {/* Terminal / ADB Shell viewer */}
          <button
            onClick={() => {
              onOpenTerminalModal();
              playSound('click');
            }}
            title="Buka Terminal Shell ADB / Rish"
            className="p-2 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <Terminal className="w-4 h-4" />
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            title={audioOn ? 'Matikan Suara SFX' : 'Aktifkan Suara SFX'}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {audioOn ? <Volume2 className="w-4 h-4 text-rose-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>
    </header>
  );
};
