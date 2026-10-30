import React, { useState } from 'react';
import { Cpu, Flame, Shield, RotateCcw, Zap, Sliders, CheckCircle2, AlertTriangle, Terminal } from 'lucide-react';
import { PrivilegeMode, CpuGovernor, OverclockProfile } from '../types';
import { playSound } from '../utils/audio';
import { generateCpuGovernorCommands } from '../utils/shellGenerator';

interface CpuTuningTabProps {
  privilegeMode: PrivilegeMode;
  currentGovernor: CpuGovernor;
  onSelectGovernor: (gov: CpuGovernor) => void;
  onOpenTerminalModal: (commands: string[]) => void;
  onResetStock: () => void;
  isThermalSuppressed: boolean;
  onToggleThermalSuppression: (suppress: boolean) => void;
}

const PRESET_PROFILES: OverclockProfile[] = [
  {
    id: 'extreme_gaming',
    name: 'Overclock Extreme (Ludicrous)',
    description: 'Frekuensi CPU terkunci maksimal, bypass thermal throttling, fan kecepatan penuh.',
    governor: 'performance',
    littleClusterMhz: 2000,
    bigClusterMhz: 2803,
    primeClusterMhz: 3360,
    thermalCeilingC: 70,
    voltageStepMv: 25,
    bypassCharging: true,
    fanSpeedLevel: 3,
  },
  {
    id: 'esports_stable',
    name: 'Esports Stabil 120 FPS (Recommended)',
    description: 'Keseimbangan terbaik antara clock speed tinggi dan suhu stabil tanpa patah-patah.',
    governor: 'schedutil',
    littleClusterMhz: 1800,
    bigClusterMhz: 2600,
    primeClusterMhz: 3100,
    thermalCeilingC: 55,
    voltageStepMv: 0,
    bypassCharging: true,
    fanSpeedLevel: 2,
  },
  {
    id: 'balanced_stock',
    name: 'Default Bawaan Pabrik (Stock)',
    description: 'Profil hemat daya standar ponsel untuk pemakaian harian santai.',
    governor: 'schedutil',
    littleClusterMhz: 1400,
    bigClusterMhz: 2200,
    primeClusterMhz: 2600,
    thermalCeilingC: 45,
    voltageStepMv: 0,
    bypassCharging: false,
    fanSpeedLevel: 0,
  },
];

export const CpuTuningTab: React.FC<CpuTuningTabProps> = ({
  privilegeMode,
  currentGovernor,
  onSelectGovernor,
  onOpenTerminalModal,
  onResetStock,
  isThermalSuppressed,
  onToggleThermalSuppression,
}) => {
  const [activeProfileId, setActiveProfileId] = useState<string>('esports_stable');
  const [littleMhz, setLittleMhz] = useState(1800);
  const [bigMhz, setBigMhz] = useState(2600);
  const [primeMhz, setPrimeMhz] = useState(3100);
  const [thermalCeiling, setThermalCeiling] = useState(55);
  const [voltageOffset, setVoltageOffset] = useState(0);
  const [appliedNotice, setAppliedNotice] = useState(false);

  const applyProfile = (prof: OverclockProfile) => {
    setActiveProfileId(prof.id);
    onSelectGovernor(prof.governor);
    setLittleMhz(prof.littleClusterMhz);
    setBigMhz(prof.bigClusterMhz);
    setPrimeMhz(prof.primeClusterMhz);
    setThermalCeiling(prof.thermalCeilingC);
    setVoltageOffset(prof.voltageStepMv);
    onToggleThermalSuppression(prof.thermalCeilingC > 50);
    playSound('boost');
    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 3000);
  };

  const handleCustomApply = () => {
    playSound('boost');
    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 3000);
  };

  const currentCommands = generateCpuGovernorCommands(
    privilegeMode,
    currentGovernor,
    littleMhz,
    bigMhz,
    primeMhz
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0c0d14] to-cyan-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              CPU & THERMAL ENGINE
            </span>
            <span className="text-xs text-slate-400">big.LITTLE Architecture Tuner</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-black text-white">
            Pengaturan Performa CPU & Overclocking
          </h2>
          <p className="text-sm text-slate-300 max-w-xl">
            Tentukan governor frekuensi, limit throttling termal, dan core pinning untuk mengeliminasi micro-stuttering dalam game berat.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenTerminalModal(currentCommands)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 transition-colors"
          >
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Lihat Script Rish/SU</span>
          </button>
          <button
            onClick={() => {
              playSound('restore');
              onResetStock();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-amber-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset CPU Default</span>
          </button>
        </div>
      </div>

      {/* Preset Profiles Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PRESET_PROFILES.map((prof) => (
          <div
            key={prof.id}
            onClick={() => applyProfile(prof)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              activeProfileId === prof.id
                ? 'bg-rose-950/40 border-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-heading">{prof.name}</span>
              {activeProfileId === prof.id && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-600 text-white font-bold">
                  AKTIF
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">{prof.description}</p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 border-t border-slate-800 pt-3">
              <div>
                <span className="text-slate-500">Governor:</span> {prof.governor}
              </div>
              <div>
                <span className="text-slate-500">Prime Core:</span> {prof.primeClusterMhz} MHz
              </div>
              <div>
                <span className="text-slate-500">Batas Suhu:</span> {prof.thermalCeilingC}°C
              </div>
              <div>
                <span className="text-slate-500">Bypass Cas:</span> {prof.bypassCharging ? 'Aktif' : 'Nonaktif'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Clocks & Thermal Guard Tweaker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: CPU Frequency Sliders (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-rose-500" />
              Kustomisasi Frekuensi Cluster CPU
            </h3>
            <span className="text-xs font-mono text-slate-400">8 Cores Active</span>
          </div>

          {/* Prime Core (Cortex-X4) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-rose-400 font-bold">Prime Cluster (Cortex-X / 1 Core)</span>
              <span className="text-white font-bold tabular-nums">{primeMhz} MHz</span>
            </div>
            <input
              type="range"
              min="1400"
              max="3360"
              step="100"
              value={primeMhz}
              onChange={(e) => setPrimeMhz(parseInt(e.target.value))}
              className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>1400 MHz (Underclock)</span>
              <span>2800 MHz (Standard)</span>
              <span>3360 MHz (Overclocked)</span>
            </div>
          </div>

          {/* Big Cores (Cortex-A720) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400 font-bold">Big Cluster (Performance / 4 Cores)</span>
              <span className="text-white font-bold tabular-nums">{bigMhz} MHz</span>
            </div>
            <input
              type="range"
              min="1000"
              max="2803"
              step="100"
              value={bigMhz}
              onChange={(e) => setBigMhz(parseInt(e.target.value))}
              className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>1000 MHz (Safe)</span>
              <span>2200 MHz (Stock)</span>
              <span>2803 MHz (Peak)</span>
            </div>
          </div>

          {/* Little Cores (Cortex-A520) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold">Little Cluster (Efficiency / 3 Cores)</span>
              <span className="text-white font-bold tabular-nums">{littleMhz} MHz</span>
            </div>
            <input
              type="range"
              min="400"
              max="2000"
              step="100"
              value={littleMhz}
              onChange={(e) => setLittleMhz(parseInt(e.target.value))}
              className="w-full accent-slate-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>400 MHz (Battery)</span>
              <span>1400 MHz (Balanced)</span>
              <span>2000 MHz (Max)</span>
            </div>
          </div>

          {/* Governor Switcher */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-xs font-bold font-mono text-slate-300">Pilih CPU Governor</span>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(['performance', 'schedutil', 'powersave', 'conservative', 'interactive'] as CpuGovernor[]).map(
                (gov) => (
                  <button
                    key={gov}
                    onClick={() => {
                      onSelectGovernor(gov);
                      playSound('click');
                    }}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-mono capitalize transition-all ${
                      currentGovernor === gov
                        ? 'bg-rose-600 text-white border-rose-500 font-bold shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {gov}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Right: Thermal Management & Guard (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Manajemen Suhu & Thermal Guard
            </h3>
          </div>

          {/* Thermal Ceiling Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Batas Toleransi Suhu HP</span>
              <span className="text-amber-400 font-bold tabular-nums">{thermalCeiling}°C</span>
            </div>
            <input
              type="range"
              min="42"
              max="75"
              step="1"
              value={thermalCeiling}
              onChange={(e) => setThermalCeiling(parseInt(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>42°C (Dingin Ekstra)</span>
              <span>55°C (Gaming Ideal)</span>
              <span>75°C (No Throttle)</span>
            </div>
          </div>

          {/* Thermal Throttling Suppression Toggle */}
          <div
            onClick={() => {
              onToggleThermalSuppression(!isThermalSuppressed);
              playSound('toggle');
            }}
            className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer"
          >
            <div>
              <p className="text-xs font-semibold text-slate-200">Tekan Thermal Throttling Daemon</p>
              <p className="text-[10px] text-slate-400">
                Mencegah drop FPS tiba-tiba akibat pembatasan bawaan OS saat suhu naik.
              </p>
            </div>
            <div
              className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                isThermalSuppressed ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isThermalSuppressed ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* Voltage Offset Undervolting */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Simulasi Undervolt (Suhu Dingin)</span>
              <span className="text-cyan-400 font-bold tabular-nums">{voltageOffset} mV</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[-25, 0, 25].map((mv) => (
                <button
                  key={mv}
                  onClick={() => {
                    setVoltageOffset(mv);
                    playSound('click');
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-all ${
                    voltageOffset === mv
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-400'
                  }`}
                >
                  {mv === 0 ? 'Normal (0mV)' : `${mv} mV`}
                </button>
              ))}
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleCustomApply}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-heading font-bold text-xs tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Terapkan Profil CPU & Suhu</span>
          </button>

          {appliedNotice && (
            <p className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profil frekuensi CPU & manajemen suhu berhasil diterapkan!</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
