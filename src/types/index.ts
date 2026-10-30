export type PrivilegeMode = 'shizuku' | 'root' | 'non_root';

export type CpuGovernor = 'performance' | 'schedutil' | 'powersave' | 'conservative' | 'interactive';

export interface AppProcess {
  id: string;
  name: string;
  packageName: string;
  category: 'game' | 'system' | 'social' | 'media';
  icon: string;
  ramUsageMB: number;
  cacheSizeMB: number;
  cpuUsagePercent: number;
  isRunning: boolean;
  isHibernated: boolean;
  isPriorityGame: boolean;
}

export interface DeviceTelemetry {
  fps: number;
  targetFps: number;
  cpuUsage: number;
  cpuFrequencyMhz: number;
  gpuUsage: number;
  gpuFrequencyMhz: number;
  batteryTempC: number;
  batteryLevel: number;
  isCharging: boolean;
  ramTotalGB: number;
  ramUsedGB: number;
  ramFreeGB: number;
  zramUsedGB: number;
  zramTotalGB: number;
  networkPingMs: number;
  networkJitterMs: number;
  socModel: string;
  gpuModel: string;
  androidVersion: string;
  kernelVersion: string;
  displayRefreshRateHz: number;
  displayResolution: string;
}

export interface GameSpaceTweak {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'fps' | 'thermal' | 'touch' | 'network' | 'system';
}

export interface OverclockProfile {
  id: string;
  name: string;
  description: string;
  governor: CpuGovernor;
  littleClusterMhz: number;
  bigClusterMhz: number;
  primeClusterMhz: number;
  thermalCeilingC: number;
  voltageStepMv: number;
  bypassCharging: boolean;
  fanSpeedLevel: 0 | 1 | 2 | 3;
}

export interface TextureTweakConfig {
  gamePackage: string;
  gameTitle: string;
  resolutionScalePercent: number; // 33, 50, 70, 85, 100
  targetResolution: string; // e.g. "720x1600"
  lodBias: number; // -1.5 to +3.0
  textureCompression: 'normal' | 'half' | 'quarter' | 'potato';
  disableMsaa: boolean;
  force16BitColor: boolean;
  vulkanDriverTweak: boolean;
  renderBufferLimit: number; // 2, 3, 4 buffers
  applied: boolean;
}

export interface StockDeviceDefaults {
  governor: CpuGovernor;
  thermalDaemonActive: boolean;
  resolution: string;
  densityDpi: number;
  touchPollingRateHz: number;
  zramSizeGB: number;
  ioScheduler: string;
  cpuMaxFreqBig: number;
  cpuMaxFreqLittle: number;
}
