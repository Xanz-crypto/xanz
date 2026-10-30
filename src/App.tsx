import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Gamepad2, Layers, Cpu, Terminal, Shield, RefreshCw, Smartphone } from 'lucide-react';
import { PrivilegeMode, AppProcess, DeviceTelemetry, CpuGovernor, TextureTweakConfig } from './types';
import { BootAnimation } from './components/BootAnimation';
import { TopBar } from './components/TopBar';
import { OptimizerTab } from './components/OptimizerTab';
import { GameSpaceTab } from './components/GameSpaceTab';
import { TextureDownscalerTab } from './components/TextureDownscalerTab';
import { CpuTuningTab } from './components/CpuTuningTab';
import { ApkPlayStoreTab } from './components/ApkPlayStoreTab';
import { RedMagicOverlayHud } from './components/RedMagicOverlayHud';
import { TerminalHubModal } from './components/TerminalHubModal';
import { RestoreStockModal } from './components/RestoreStockModal';
import { PlayStoreApkHubModal } from './components/PlayStoreApkHubModal';
import { detectActiveTweaks, FACTORY_STOCK_DEFAULTS } from './utils/tweakDetector';
import { generateOptimizeShellCommands } from './utils/shellGenerator';
import { playSound } from './utils/audio';

const INITIAL_APPS: AppProcess[] = [
  {
    id: 'app_1',
    name: 'Mobile Legends: Bang Bang',
    packageName: 'com.mobile.legends',
    category: 'game',
    icon: 'ML',
    ramUsageMB: 1150,
    cacheSizeMB: 680,
    cpuUsagePercent: 32,
    isRunning: true,
    isHibernated: false,
    isPriorityGame: true,
  },
  {
    id: 'app_2',
    name: 'Free Fire MAX',
    packageName: 'com.dts.freefiremax',
    category: 'game',
    icon: 'FF',
    ramUsageMB: 840,
    cacheSizeMB: 520,
    cpuUsagePercent: 18,
    isRunning: false,
    isHibernated: false,
    isPriorityGame: false,
  },
  {
    id: 'app_3',
    name: 'PUBG Mobile',
    packageName: 'com.tencent.ig',
    category: 'game',
    icon: 'PB',
    ramUsageMB: 1420,
    cacheSizeMB: 910,
    cpuUsagePercent: 44,
    isRunning: false,
    isHibernated: false,
    isPriorityGame: false,
  },
  {
    id: 'app_4',
    name: 'Instagram',
    packageName: 'com.instagram.android',
    category: 'social',
    icon: 'IG',
    ramUsageMB: 480,
    cacheSizeMB: 430,
    cpuUsagePercent: 8,
    isRunning: true,
    isHibernated: false,
    isPriorityGame: false,
  },
  {
    id: 'app_5',
    name: 'TikTok',
    packageName: 'com.zhiliaoapp.musically',
    category: 'social',
    icon: 'TT',
    ramUsageMB: 620,
    cacheSizeMB: 750,
    cpuUsagePercent: 12,
    isRunning: true,
    isHibernated: false,
    isPriorityGame: false,
  },
  {
    id: 'app_6',
    name: 'WhatsApp Messenger',
    packageName: 'com.whatsapp',
    category: 'social',
    icon: 'WA',
    ramUsageMB: 290,
    cacheSizeMB: 190,
    cpuUsagePercent: 3,
    isRunning: true,
    isHibernated: false,
    isPriorityGame: false,
  },
  {
    id: 'app_7',
    name: 'Google Chrome',
    packageName: 'com.android.chrome',
    category: 'system',
    icon: 'GC',
    ramUsageMB: 580,
    cacheSizeMB: 390,
    cpuUsagePercent: 7,
    isRunning: true,
    isHibernated: false,
    isPriorityGame: false,
  },
];

export default function App() {
  const [showBootAnimation, setShowBootAnimation] = useState(true);
  const [activeTab, setActiveTab] = useState<'optimizer' | 'gamespace' | 'texture' | 'cpu' | 'apk'>('optimizer');
  const [privilegeMode, setPrivilegeMode] = useState<PrivilegeMode>('shizuku');

  // Device Telemetry state
  const [telemetry, setTelemetry] = useState<DeviceTelemetry>({
    fps: 120,
    targetFps: 120,
    cpuUsage: 48,
    cpuFrequencyMhz: 2803,
    gpuUsage: 62,
    gpuFrequencyMhz: 850,
    batteryTempC: 38.4,
    batteryLevel: 86,
    isCharging: true,
    ramTotalGB: 12,
    ramUsedGB: 6.8,
    ramFreeGB: 5.2,
    zramUsedGB: 1.4,
    zramTotalGB: 4.0,
    networkPingMs: 24,
    networkJitterMs: 2.1,
    socModel: 'Snapdragon 8 Gen 2 (TSMC 4nm)',
    gpuModel: 'Qualcomm Adreno 740',
    androidVersion: 'Android 14 (HyperOS / RedMagic OS)',
    kernelVersion: 'Linux 5.15.110-android14-9-g3918a',
    displayRefreshRateHz: 120,
    displayResolution: '1080x2400',
  });

  // App Process Manager state
  const [apps, setApps] = useState<AppProcess[]>(INITIAL_APPS);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // CPU Governor & Tuning state
  const [currentGovernor, setCurrentGovernor] = useState<CpuGovernor>('schedutil');
  const [isThermalSuppressed, setIsThermalSuppressed] = useState(false);
  const [touchPollingRate, setTouchPollingRate] = useState(960);
  const [zramSizeGB, setZramSizeGB] = useState(4);
  const [isCpuOverclocked, setIsCpuOverclocked] = useState(false);
  const [priorityGameActive, setPriorityGameActive] = useState(true);

  // Menu Ke-2: Texture Downscaler state
  const [textureConfig, setTextureConfig] = useState<TextureTweakConfig>({
    gamePackage: 'com.mobile.legends',
    gameTitle: 'Mobile Legends: Bang Bang',
    resolutionScalePercent: 70,
    targetResolution: '756x1680',
    lodBias: 1.5,
    textureCompression: 'half',
    disableMsaa: true,
    force16BitColor: true,
    vulkanDriverTweak: true,
    renderBufferLimit: 2,
    applied: false,
  });

  // Modals & Floating Overlays
  const [isOverlayHudOpen, setIsOverlayHudOpen] = useState(false);
  const [isTerminalModalOpen, setIsTerminalModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isPlayStoreModalOpen, setIsPlayStoreModalOpen] = useState(false);
  const [terminalCommands, setTerminalCommands] = useState<string[]>([]);

  // Real smartphone hardware sensor detection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Real battery sensor
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          setTelemetry((prev) => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100),
            isCharging: battery.charging,
          }));
          battery.addEventListener('levelchange', () => {
            setTelemetry((prev) => ({
              ...prev,
              batteryLevel: Math.round(battery.level * 100),
            }));
          });
          battery.addEventListener('chargingchange', () => {
            setTelemetry((prev) => ({
              ...prev,
              isCharging: battery.charging,
            }));
          });
        }).catch(() => {});
      }

      // Real display resolution
      if (window.screen) {
        setTelemetry((prev) => ({
          ...prev,
          displayResolution: `${window.screen.width * (window.devicePixelRatio || 1)}x${window.screen.height * (window.devicePixelRatio || 1)}`,
        }));
      }

      // Real GPU detection via WebGL debug renderer info
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            if (renderer && typeof renderer === 'string') {
              setTelemetry((prev) => ({
                ...prev,
                gpuModel: renderer.replace(/ANGLE \((.*)\)/, '$1'),
              }));
            }
          }
        }
      } catch {
        // fallback to default
      }
    }
  }, []);


  // Telemetry real-time micro simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => {
        // Minor natural fluctuations
        const jitter = (Math.random() - 0.5) * 2;
        const fpsJitter = Math.min(prev.targetFps, Math.max(prev.targetFps - 3, Math.round(prev.targetFps + (Math.random() - 0.5) * 1.5)));
        const pingJitter = Math.max(16, Math.min(45, Math.round(24 + (Math.random() - 0.5) * 6)));
        
        // Temperature cools if thermal guard or fan is on
        const targetTemp = isThermalSuppressed ? 36.5 : 38.5;
        const tempDelta = (targetTemp - prev.batteryTempC) * 0.05;

        return {
          ...prev,
          fps: fpsJitter,
          batteryTempC: parseFloat((prev.batteryTempC + tempDelta).toFixed(1)),
          networkPingMs: pingJitter,
          cpuUsage: Math.max(25, Math.min(88, Math.round(prev.cpuUsage + jitter * 2))),
        };
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [isThermalSuppressed]);

  // Compute active tweaks
  const activeTweaks = detectActiveTweaks(
    currentGovernor,
    isThermalSuppressed,
    textureConfig,
    touchPollingRate,
    zramSizeGB,
    isCpuOverclocked,
    priorityGameActive
  );

  // App handlers
  const handleForceStopApp = (pkg: string) => {
    setApps((prev) =>
      prev.map((app) => (app.packageName === pkg ? { ...app, isRunning: false, isHibernated: true } : app))
    );
  };

  const handleClearCacheApp = (pkg: string) => {
    setApps((prev) =>
      prev.map((app) => (app.packageName === pkg ? { ...app, cacheSizeMB: 0 } : app))
    );
  };

  const handleBatchHibernate = (pkgs: string[]) => {
    setApps((prev) =>
      prev.map((app) => (pkgs.includes(app.packageName) ? { ...app, isRunning: false, isHibernated: true, cacheSizeMB: 0 } : app))
    );
  };

  const handleAutoOptimizeAll = async () => {
    setIsOptimizing(true);
    // Simulate multi-step system purge
    await new Promise((r) => setTimeout(r, 1400));

    setApps((prev) =>
      prev.map((app) => (app.category !== 'game' ? { ...app, isRunning: false, isHibernated: true, cacheSizeMB: 0 } : app))
    );

    setTelemetry((prev) => ({
      ...prev,
      ramUsedGB: 4.6,
      ramFreeGB: 7.4,
      cpuUsage: 28,
      batteryTempC: 35.8,
    }));

    setIsOptimizing(false);
  };

  const handleBoostLaunchGame = (gamePackage: string) => {
    // Open floating Red Magic HUD and boost target game
    setIsOverlayHudOpen(true);
    setTelemetry((prev) => ({
      ...prev,
      fps: 120,
      targetFps: 120,
      cpuFrequencyMhz: 3187,
      gpuUsage: 78,
    }));
  };

  const handleResetStockAll = () => {
    setCurrentGovernor(FACTORY_STOCK_DEFAULTS.governor);
    setIsThermalSuppressed(false);
    setTouchPollingRate(FACTORY_STOCK_DEFAULTS.touchPollingRateHz);
    setZramSizeGB(FACTORY_STOCK_DEFAULTS.zramSizeGB);
    setIsCpuOverclocked(false);
    setTextureConfig((prev) => ({
      ...prev,
      resolutionScalePercent: 100,
      lodBias: 0,
      disableMsaa: false,
      force16BitColor: false,
      applied: false,
    }));
    setTelemetry((prev) => ({
      ...prev,
      cpuFrequencyMhz: FACTORY_STOCK_DEFAULTS.cpuMaxFreqBig,
      targetFps: 60,
    }));
  };

  const handleOpenTerminalWithCommands = (cmds: string[]) => {
    setTerminalCommands(cmds);
    setIsTerminalModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white">
      {/* Opening Splash / Boot Animation */}
      <AnimatePresence>
        {showBootAnimation && (
          <BootAnimation
            heroImage="/src/assets/images/xa_optimizer_hero_1793345161014.jpg"
            onComplete={() => setShowBootAnimation(false)}
          />
        )}
      </AnimatePresence>

      {/* Top Bar Contract (3 zones) */}
      <TopBar
        privilegeMode={privilegeMode}
        onPrivilegeChange={setPrivilegeMode}
        activeTweaksCount={activeTweaks.activeTweaksCount}
        onOpenRestoreModal={() => setIsRestoreModalOpen(true)}
        onOpenTerminalModal={() =>
          handleOpenTerminalWithCommands(
            generateOptimizeShellCommands(privilegeMode, apps.filter((a) => a.isRunning).map((a) => a.packageName))
          )
        }
        onOpenPlayStoreModal={() => setIsPlayStoreModalOpen(true)}
        onTriggerFloatingHud={() => setIsOverlayHudOpen(!isOverlayHudOpen)}
        isFloatingHudOpen={isOverlayHudOpen}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-12">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 p-1.5 mb-6 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              setActiveTab('optimizer');
              playSound('click');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'optimizer'
                ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>1. Auto Optimizer & Cache</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('gamespace');
              playSound('click');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'gamespace'
                ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Game Space Nubia HUD</span>
          </button>

          {/* Menu Ke-2 Khusus: Texture Downscaler */}
          <button
            onClick={() => {
              setActiveTab('texture');
              playSound('click');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'texture'
                ? 'bg-gradient-to-r from-rose-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>2. Texture Downscaler</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('cpu');
              playSound('click');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'cpu'
                ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>3. CPU Tuning & Suhu</span>
          </button>

          {/* Tab Ke-4: APK HP & Play Store Release Hub */}
          <button
            onClick={() => {
              setActiveTab('apk');
              playSound('click');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap shrink-0 border ${
              activeTab === 'apk'
                ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-cyan-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'border-cyan-500/40 text-cyan-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>4. APK HP & Play Store</span>
          </button>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'optimizer' && (
          <OptimizerTab
            privilegeMode={privilegeMode}
            telemetry={telemetry}
            apps={apps}
            onForceStopApp={handleForceStopApp}
            onClearCacheApp={handleClearCacheApp}
            onBatchHibernate={handleBatchHibernate}
            onAutoOptimizeAll={handleAutoOptimizeAll}
            isOptimizing={isOptimizing}
          />
        )}

        {activeTab === 'gamespace' && (
          <GameSpaceTab
            privilegeMode={privilegeMode}
            telemetry={telemetry}
            hudBackdropImage="/src/assets/images/game_space_cyber_hud_1793345162088.jpg"
            onOpenTerminalModal={handleOpenTerminalWithCommands}
            onOpenOverlayHud={() => setIsOverlayHudOpen(true)}
            onBoostLaunchGame={handleBoostLaunchGame}
          />
        )}

        {activeTab === 'texture' && (
          <TextureDownscalerTab
            privilegeMode={privilegeMode}
            textureConfig={textureConfig}
            onUpdateConfig={setTextureConfig}
            onOpenTerminalModal={handleOpenTerminalWithCommands}
            onResetStock={handleResetStockAll}
          />
        )}

        {activeTab === 'cpu' && (
          <CpuTuningTab
            privilegeMode={privilegeMode}
            currentGovernor={currentGovernor}
            onSelectGovernor={setCurrentGovernor}
            onOpenTerminalModal={handleOpenTerminalWithCommands}
            onResetStock={handleResetStockAll}
            isThermalSuppressed={isThermalSuppressed}
            onToggleThermalSuppression={setIsThermalSuppressed}
          />
        )}

        {activeTab === 'apk' && (
          <ApkPlayStoreTab
            onOpenReleaseModal={() => setIsPlayStoreModalOpen(true)}
          />
        )}
      </main>

      {/* Android Mobile Bottom Navigation Bar (Dock) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07080c]/95 border-t border-slate-800/90 backdrop-blur-lg px-2 py-2 flex items-center justify-around">
        <button
          onClick={() => {
            setActiveTab('optimizer');
            playSound('click');
          }}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-mono transition-all ${
            activeTab === 'optimizer' ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Optimize</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('gamespace');
            playSound('click');
          }}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-mono transition-all ${
            activeTab === 'gamespace' ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>GameSpace</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('texture');
            playSound('click');
          }}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-mono transition-all ${
            activeTab === 'texture' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Texture</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('cpu');
            playSound('click');
          }}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-mono transition-all ${
            activeTab === 'cpu' ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>CPU</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('apk');
            playSound('click');
          }}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-mono transition-all ${
            activeTab === 'apk' ? 'text-cyan-300 font-bold' : 'text-cyan-500 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4 animate-pulse" />
          <span>APK & Play</span>
        </button>
      </nav>

      {/* Floating Red Magic Tactical HUD */}
      <RedMagicOverlayHud
        isOpen={isOverlayHudOpen}
        onClose={() => setIsOverlayHudOpen(false)}
        telemetry={telemetry}
      />

      {/* Terminal Shell Script Runner Modal */}
      <TerminalHubModal
        isOpen={isTerminalModalOpen}
        onClose={() => setIsTerminalModalOpen(false)}
        commands={terminalCommands}
        privilegeMode={privilegeMode}
      />

      {/* Restore Stock Defaults Modal */}
      <RestoreStockModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        activeTweaks={activeTweaks}
        privilegeMode={privilegeMode}
        onConfirmRestore={handleResetStockAll}
        onViewRestoreScript={handleOpenTerminalWithCommands}
      />

      {/* Android APK & Google Play Store Hub Modal */}
      <PlayStoreApkHubModal
        isOpen={isPlayStoreModalOpen}
        onClose={() => setIsPlayStoreModalOpen(false)}
      />
    </div>
  );
}
