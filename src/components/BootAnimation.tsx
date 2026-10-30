import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, ShieldCheck, Flame, Zap, FastForward } from 'lucide-react';
import { playSound } from '../utils/audio';

interface BootAnimationProps {
  onComplete: () => void;
  heroImage?: string;
}

export const BootAnimation: React.FC<BootAnimationProps> = ({ onComplete, heroImage }) => {
  const [phase, setPhase] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    playSound('powerup');

    const t1 = setTimeout(() => {
      setPhase(1);
      setLogs((prev) => [...prev, '[SHIZUKU] Binder daemon connected (UID 2000)']);
      playSound('click');
    }, 600);

    const t2 = setTimeout(() => {
      setPhase(2);
      setLogs((prev) => [...prev, '[ROOT] KernelSU/Magisk core verified']);
      setLogs((prev) => [...prev, '[NUBIA ENGINE] Red Magic cyber space initialized']);
      playSound('boost');
    }, 1300);

    const t3 = setTimeout(() => {
      setPhase(3);
      setLogs((prev) => [...prev, '[TURBO] CPU big.LITTLE clusters synchronized']);
      setLogs((prev) => [...prev, '[TEXTURE ENGINE] Safe GL downscale module ready']);
      playSound('fan');
    }, 2000);

    const t4 = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07080c] text-white overflow-hidden select-none">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 opacity-20 cyber-hex-pattern pointer-events-none" />

      {/* Hero Image ambient glow */}
      {heroImage && (
        <div
          className="absolute inset-0 opacity-15 bg-cover bg-center blur-md scale-110 pointer-events-none"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
      )}

      {/* Glowing Energy Rings */}
      <div className="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center">
        {/* Outer Rotating Tactical Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-dashed border-rose-600/40"
        />

        {/* Counter-rotating Segment Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
          className="absolute inset-4 rounded-full border-2 border-t-rose-500 border-r-transparent border-b-cyan-500 border-l-transparent opacity-80"
        />

        {/* Pulsing Core */}
        <motion.div
          animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="relative z-10 w-44 h-44 rounded-2xl bg-gradient-to-br from-rose-950/80 via-slate-900 to-black border border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.35)] flex flex-col items-center justify-center p-4 backdrop-blur-md"
        >
          {/* Logo Mark */}
          <div className="relative flex items-center justify-center mb-2">
            <Flame className="w-12 h-12 text-rose-500 animate-pulse" />
            <Zap className="w-6 h-6 text-cyan-400 absolute -top-1 -right-1" />
          </div>

          <span className="font-heading text-2xl font-black tracking-widest bg-gradient-to-r from-white via-rose-200 to-rose-500 bg-clip-text text-transparent">
            XA OPTIMIZER
          </span>
          <span className="text-[10px] font-mono tracking-widest text-rose-400 uppercase">
            VERSION 2.0 // RED MAGIC HUD
          </span>
        </motion.div>
      </div>

      {/* Progress & Status Log */}
      <div className="mt-8 w-72 sm:w-88 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-rose-500" />
            <span>Memeriksa Kernel & Shizuku...</span>
          </span>
          <span className="text-rose-400 font-bold tabular-nums">
            {phase === 0 ? '25%' : phase === 1 ? '55%' : phase === 2 ? '85%' : '100%'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <motion.div
            initial={{ width: '10%' }}
            animate={{
              width: phase === 0 ? '25%' : phase === 1 ? '55%' : phase === 2 ? '85%' : '100%',
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-cyan-400 shadow-[0_0_12px_rgba(244,63,94,0.8)]"
          />
        </div>

        {/* Animated Terminal Logs */}
        <div className="h-16 mt-2 font-mono text-[11px] text-slate-400 space-y-0.5 overflow-hidden">
          <AnimatePresence>
            {logs.map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1.5 text-slate-300 truncate"
              >
                <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">{log}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Skip button for rapid user testing */}
      <button
        onClick={onComplete}
        className="mt-6 flex items-center gap-1.5 px-4 py-2 text-xs font-mono text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-lg transition-colors"
      >
        <FastForward className="w-3.5 h-3.5 text-rose-500" />
        <span>Lewati Animasi (Skip)</span>
      </button>
    </div>
  );
};
