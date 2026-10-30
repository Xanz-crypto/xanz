import React, { useState } from 'react';
import { Gamepad2, Zap, Wind, BatteryCharging, Flame, ShieldAlert, Crosshair, Sparkles, Activity, Play, Gauge } from 'lucide-react';
import { PrivilegeMode, DeviceTelemetry } from '../types';
import { playSound } from '../utils/audio';
import { generateGameSpaceTweakCommands } from '../utils/shellGenerator';

interface GameSpaceTabProps {
  privilegeMode: PrivilegeMode;
  telemetry: DeviceTelemetry;
  hudBackdropImage?: string;
  onOpenTerminalModal: (commands: string[]) => void;
  onOpenOverlayHud: () => void;
  onBoostLaunchGame: (gamePackage: string) => void;
}

const INSTALLED_GAMES = [
  { id: 'com.mobile.legends', name: 'Mobile Legends', bannerColor: 'from-blue-600 to-indigo-900', targetFps: 120, state: 'Boost Ready' },
  { id: 'com.dts.freefiremax', name: 'Free Fire MAX', bannerColor: 'from-amber-600 to-red-900', targetFps: 90, state: 'Boost Ready' },
  { id: 'com.tencent.ig', name: 'PUBG Mobile', bannerColor: 'from-yellow-600 to-orange-950', targetFps: 90, state: 'Boost Ready' },
  { id: 'com.miHoYo.GenshinImpact', name: 'Genshin Impact', bannerColor: 'from-purple-600 to-slate-900', targetFps: 60, state: 'Boost Ready' },
  { id: 'com.activision.callofduty.shooter', name: 'Call of Duty: Mobile', bannerColor: 'from-emerald-600 to-slate-900', targetFps: 120, state: 'Boost Ready' },
  { id: 'com.activision.callofduty.warzone', name: 'Warzone Mobile', bannerColor: 'from-rose-600 to-zinc-950', targetFps: 60, state: 'Boost Ready' },
];

export const GameSpaceTab: React.FC<GameSpaceTabProps> = ({
  privilegeMode,
  telemetry,
  hudBackdropImage,
  onOpenTerminalModal,
  onOpenOverlayHud,
  onBoostLaunchGame,
}) => {
  const [selectedGame, setSelectedGame] = useState(INSTALLED_GAMES[0].id);
  const [bypassCharging, setBypassCharging] = useState(true);
  const [touchTurbo, setTouchTurbo] = useState(true);
  const [lock120Hz, setLock120Hz] = useState(true);
  const [prioritySchedule, setPrioritySchedule] = useState(true);
  const [thermalGuard, setThermalGuard] = useState(true);
  const [fanLevel, setFanLevel] = useState<number>(2); // 0 = off, 1 = low, 2 = turbo, 3 = storm
  const [crosshairActive, setCrosshairActive] = useState(false);

  const activeGame = INSTALLED_GAMES.find((g) => g.id === selectedGame) || INSTALLED_GAMES[0];

  const handleFanChange = (lvl: number) => {
    setFanLevel(lvl);
    if (lvl > 0) {
      playSound('fan');
    } else {
      playSound('click');
    }
  };

  const handleLaunch = () => {
    playSound('boost');
    onBoostLaunchGame(activeGame.id);
  };

  const gameCommands = generateGameSpaceTweakCommands(privilegeMode, activeGame.id, {
    bypassCharging,
    touchSamplingTurbo: touchTurbo,
    lock120Hz,
    highPrioritySchedule: prioritySchedule,
    thermalGuardActive: thermalGuard,
    fanSpeedLevel: fanLevel,
  });

  return (
    <div className="space-y-6">
      {/* Red Magic Cyber HUD Banner */}
      <div className="relative rounded-2xl border border-rose-500/30 overflow-hidden bg-gradient-to-r from-[#090b12] via-[#0d0d17] to-slate-900 p-5 sm:p-7">
        {hudBackdropImage && (
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none mix-blend-luminosity"
            style={{ backgroundImage: `url(${hudBackdropImage})` }}
          />
        )}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-600 text-white tracking-widest uppercase">
                RED MAGIC OS 9
              </span>
              <span className="text-xs font-mono text-cyan-400">NUBIA TURBO ENGINE V2</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-wide text-white">
              Tactical Game Space HUD
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Panel Game Booster lengkap dengan modul Bypass Charging, kipas ICE pendingin aktif, stabilisasi target FPS, dan isolasi CPU big core khusus game.
            </p>
          </div>

          {/* Quick HUD Overlay Launch Trigger */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenOverlayHud}
              className="py-3 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-heading font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(244,63,94,0.4)] flex items-center gap-2 transition-all"
            >
              <Activity className="w-4 h-4 fill-white" />
              <span>Buka Floating Panel Red Magic</span>
            </button>
            <button
              onClick={() => onOpenTerminalModal(gameCommands)}
              className="py-3 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 transition-colors"
            >
              Export Script Shell
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Strip (FPS, Temp, CPU, GPU, Battery, Ping) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: FPS Counter */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>FPS COUNTER</span>
            <Gauge className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-2xl font-black font-heading text-rose-500 tabular-nums">
            {telemetry.fps}{' '}
            <span className="text-xs font-mono text-slate-400 font-normal">/ {telemetry.targetFps}</span>
          </div>
          <p className="text-[10px] font-mono text-emerald-400 mt-0.5">● Frame Stable 99.4%</p>
        </div>

        {/* Metric 2: Battery Temp */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>SUHU BATERAI</span>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-heading text-amber-400 tabular-nums">
            {telemetry.batteryTempC.toFixed(1)}°C
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">ICE Thermal Guard Aktif</p>
        </div>

        {/* Metric 3: CPU Frequency */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>CPU PRIME</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-heading text-cyan-400 tabular-nums">
            {telemetry.cpuFrequencyMhz}{' '}
            <span className="text-xs font-mono text-slate-400 font-normal">MHz</span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">Cortex-X4 Governor Boost</p>
        </div>

        {/* Metric 4: GPU Load */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>GPU ADRENO</span>
            <Gauge className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-heading text-purple-400 tabular-nums">
            {telemetry.gpuUsage}%
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">Vulkan API Driver 1.3</p>
        </div>

        {/* Metric 5: RAM & zRAM */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>RAM DIGUNAKAN</span>
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-black font-heading text-white tabular-nums">
            {telemetry.ramUsedGB.toFixed(1)}{' '}
            <span className="text-xs font-mono text-slate-400 font-normal">/ {telemetry.ramTotalGB}GB</span>
          </div>
          <p className="text-[10px] font-mono text-cyan-400 mt-0.5">zRAM Swap +{telemetry.zramTotalGB}GB</p>
        </div>

        {/* Metric 6: Network Ping */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>PING GAME</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-heading text-emerald-400 tabular-nums">
            {telemetry.networkPingMs}{' '}
            <span className="text-xs font-mono text-slate-400 font-normal">ms</span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">Jitter {telemetry.networkJitterMs}ms · WiFi 6</p>
        </div>
      </div>

      {/* Main Grid: Game Selection & Tactical Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Installed Game Library Carousel (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-rose-500" />
                Library Game Terpasang
              </h3>
              <span className="text-xs font-mono text-slate-400">{INSTALLED_GAMES.length} Game Terdeteksi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INSTALLED_GAMES.map((game) => (
                <div
                  key={game.id}
                  onClick={() => {
                    setSelectedGame(game.id);
                    playSound('click');
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedGame === game.id
                      ? 'bg-rose-950/40 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-bold font-heading">{game.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400">
                      {game.targetFps} FPS
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 truncate mb-3">{game.id}</p>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-emerald-400">{game.state}</span>
                    {selectedGame === game.id && (
                      <span className="text-rose-400 font-bold">● Terpilih</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Launch CTA */}
            <div className="pt-2">
              <button
                onClick={handleLaunch}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-heading font-black text-sm tracking-wider shadow-[0_0_25px_rgba(244,63,94,0.45)] transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>LAUNCH GAME DENGAN NUBIA BOOST ({activeGame.name})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Nubia Tactical Controls & Toggles (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Fitur Panel Game Booster Nubia
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Privilege: {privilegeMode}</span>
            </div>

            {/* Nubia Fan Speed Control */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Wind className={`w-4 h-4 ${fanLevel > 0 ? 'text-cyan-400 animate-spin' : 'text-slate-500'}`} />
                  Kipas Pendingin Internal ICE (Fan Turbo)
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {fanLevel === 0 ? 'OFF' : fanLevel === 1 ? '10,000 RPM' : fanLevel === 2 ? '14,000 RPM' : 'STORM 18,000 RPM'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {['Mati', 'Level 1', 'Turbo', 'Storm'].map((label, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleFanChange(idx)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-all ${
                      fanLevel === idx
                        ? 'bg-cyan-600 text-white font-bold shadow-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Toggles List */}
            <div className="space-y-2">
              {/* Bypass Charging */}
              <div
                onClick={() => {
                  setBypassCharging(!bypassCharging);
                  playSound('toggle');
                }}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <BatteryCharging className="w-4 h-4 text-rose-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Bypass Charging (Charge Separation)</p>
                    <p className="text-[10px] text-slate-400">Listrik langsung menghidupkan motherboard tanpa mengisi baterai agar HP tetap dingin.</p>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${bypassCharging ? 'bg-rose-600' : 'bg-slate-800'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${bypassCharging ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* Touch Sampling Rate 960Hz */}
              <div
                onClick={() => {
                  setTouchTurbo(!touchTurbo);
                  playSound('toggle');
                }}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Touch Sampling Rate Boost (960Hz)</p>
                    <p className="text-[10px] text-slate-400">Responsivitas sentuhan instan tanpa delay untuk gameplay kompetitif.</p>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${touchTurbo ? 'bg-rose-600' : 'bg-slate-800'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${touchTurbo ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* Force Lock 120Hz */}
              <div
                onClick={() => {
                  setLock120Hz(!lock120Hz);
                  playSound('toggle');
                }}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Kunci Refresh Rate Layar (120Hz Peak)</p>
                    <p className="text-[10px] text-slate-400">Mencegah adaptive display menurunkan frame rate secara mendadak.</p>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${lock120Hz ? 'bg-rose-600' : 'bg-slate-800'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${lock120Hz ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* Game Priority Scheduler */}
              <div
                onClick={() => {
                  setPrioritySchedule(!prioritySchedule);
                  playSound('toggle');
                }}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Penjadwalan Prioritas Tinggi (Renice -20)</p>
                    <p className="text-[10px] text-slate-400">Mengalokasikan core CPU utama (Cortex Big Core) secara eksklusif untuk proses game.</p>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${prioritySchedule ? 'bg-rose-600' : 'bg-slate-800'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${prioritySchedule ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* Crosshair Overlay Assist */}
              <div
                onClick={() => {
                  setCrosshairActive(!crosshairActive);
                  playSound('toggle');
                }}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Crosshair className="w-4 h-4 text-rose-500" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Tactical Crosshair HUD (Bidik Akurat)</p>
                    <p className="text-[10px] text-slate-400">Titik bidik presisi layar tengah untuk game shooter / no-scope.</p>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${crosshairActive ? 'bg-rose-600' : 'bg-slate-800'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${crosshairActive ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
