import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Wind, Zap, Gauge, Flame, BatteryCharging, Crosshair, Wifi, ShieldAlert } from 'lucide-react';
import { DeviceTelemetry } from '../types';
import { playSound } from '../utils/audio';

interface RedMagicOverlayHudProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: DeviceTelemetry;
}

export const RedMagicOverlayHud: React.FC<RedMagicOverlayHudProps> = ({
  isOpen,
  onClose,
  telemetry,
}) => {
  const [boostActive, setBoostActive] = useState(true);
  const [bypassActive, setBypassActive] = useState(true);
  const [fanSpeed, setFanSpeed] = useState<number>(2); // 0=off, 1=med, 2=max
  const [crosshairOn, setCrosshairOn] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
      {/* Dim backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
      />

      {/* Floating Tactical Red Magic HUD Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative z-10 w-full max-w-2xl bg-[#0b0d14]/95 border-2 border-rose-500/60 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(244,63,94,0.35)] pointer-events-auto text-white"
      >
        {/* Tactical Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-500/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-xs tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.8)]">
              RM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-base tracking-widest text-white">
                  NUBIA RED MAGIC GAME SPACE
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800">
                  HUD ACTIVE
                </span>
              </div>
              <p className="text-[11px] font-mono text-cyan-400">
                CYBERNETIC PERFORMANCE OVERLAY
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-white transition-colors border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telemetry Gauge Triad (FPS / CPU-GPU / TEMP) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5">
          {/* FPS Center Gauge */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/40 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-1 text-[10px] font-mono text-slate-400">FPS MONITOR</div>
            <div className="my-2">
              <span className="text-4xl font-heading font-black text-rose-500 tracking-tight tabular-nums">
                {telemetry.fps}
              </span>
              <span className="text-xs font-mono text-slate-400 block -mt-1">
                MAX 120 FPS
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">
              ● 99.8% STABIL
            </span>
          </div>

          {/* Temperature & Cooling Gauge */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center text-center">
            <div className="text-[10px] font-mono text-slate-400 mb-1">SUHU SISTEM</div>
            <Flame className="w-6 h-6 text-amber-500 my-1 animate-pulse" />
            <div className="text-2xl font-heading font-bold text-amber-400 tabular-nums">
              {telemetry.batteryTempC.toFixed(1)}°C
            </div>
            <span className="text-[10px] font-mono text-slate-400">ICE Cold Active</span>
          </div>

          {/* CPU & GPU Clocks */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center text-center">
            <div className="text-[10px] font-mono text-slate-400 mb-1">CPU FREQUENCY</div>
            <Zap className="w-6 h-6 text-cyan-400 my-1" />
            <div className="text-2xl font-heading font-bold text-cyan-400 tabular-nums">
              {telemetry.cpuFrequencyMhz} MHz
            </div>
            <span className="text-[10px] font-mono text-slate-400">Snapdragon Prime</span>
          </div>
        </div>

        {/* Tactical Quick Toggles Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800">
          {/* Boost Mode */}
          <button
            onClick={() => {
              setBoostActive(!boostActive);
              playSound('boost');
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              boostActive
                ? 'bg-rose-950/60 border-rose-500 text-white'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Zap className="w-4 h-4 text-rose-500" />
              <span className="text-[10px] font-mono font-bold">
                {boostActive ? 'ON' : 'OFF'}
              </span>
            </div>
            <p className="text-xs font-bold">Turbo Boost</p>
          </button>

          {/* Bypass Charging */}
          <button
            onClick={() => {
              setBypassActive(!bypassActive);
              playSound('toggle');
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              bypassActive
                ? 'bg-cyan-950/60 border-cyan-500 text-white'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <BatteryCharging className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono font-bold">
                {bypassActive ? 'ON' : 'OFF'}
              </span>
            </div>
            <p className="text-xs font-bold">Bypass Cas</p>
          </button>

          {/* Fan Turbo */}
          <button
            onClick={() => {
              const next = (fanSpeed + 1) % 3;
              setFanSpeed(next);
              if (next > 0) playSound('fan');
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              fanSpeed > 0
                ? 'bg-cyan-950/60 border-cyan-500 text-white'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Wind className={`w-4 h-4 ${fanSpeed > 0 ? 'text-cyan-400 animate-spin' : 'text-slate-500'}`} />
              <span className="text-[10px] font-mono font-bold">
                {fanSpeed === 0 ? 'OFF' : fanSpeed === 1 ? '10K' : '15K'}
              </span>
            </div>
            <p className="text-xs font-bold">ICE Fan Speed</p>
          </button>

          {/* Crosshair Overlay */}
          <button
            onClick={() => {
              setCrosshairOn(!crosshairOn);
              playSound('toggle');
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              crosshairOn
                ? 'bg-amber-950/60 border-amber-500 text-white'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Crosshair className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-mono font-bold">
                {crosshairOn ? 'ON' : 'OFF'}
              </span>
            </div>
            <p className="text-xs font-bold">Crosshair HUD</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
