import { StockDeviceDefaults, CpuGovernor, TextureTweakConfig } from '../types';

export const FACTORY_STOCK_DEFAULTS: StockDeviceDefaults = {
  governor: 'schedutil',
  thermalDaemonActive: true,
  resolution: '1080x2400',
  densityDpi: 420,
  touchPollingRateHz: 120,
  zramSizeGB: 3,
  ioScheduler: 'mq-deadline',
  cpuMaxFreqBig: 2803,
  cpuMaxFreqLittle: 2000,
};

export interface ActiveTweakState {
  isGovernorModified: boolean;
  isThermalSuppressed: boolean;
  isResolutionDownscaled: boolean;
  isTouchOverclocked: boolean;
  isZramExpanded: boolean;
  isPriorityActive: boolean;
  isTextureReduced: boolean;
  isCpuOverclocked: boolean;
  activeTweaksCount: number;
}

export const detectActiveTweaks = (
  currentGovernor: CpuGovernor,
  isThermalSuppressed: boolean,
  textureConfig: TextureTweakConfig,
  touchPolling: number,
  zramGB: number,
  isCpuOverclocked: boolean,
  priorityGameActive: boolean
): ActiveTweakState => {
  const isGov = currentGovernor !== FACTORY_STOCK_DEFAULTS.governor;
  const isRes = textureConfig.applied && textureConfig.resolutionScalePercent < 100;
  const isTouch = touchPolling > FACTORY_STOCK_DEFAULTS.touchPollingRateHz;
  const isZram = zramGB > FACTORY_STOCK_DEFAULTS.zramSizeGB;
  const isTex = textureConfig.applied && (textureConfig.lodBias !== 0 || textureConfig.textureCompression !== 'normal');

  const count = [
    isGov,
    isThermalSuppressed,
    isRes,
    isTouch,
    isZram,
    priorityGameActive,
    isTex,
    isCpuOverclocked,
  ].filter(Boolean).length;

  return {
    isGovernorModified: isGov,
    isThermalSuppressed,
    isResolutionDownscaled: isRes,
    isTouchOverclocked: isTouch,
    isZramExpanded: isZram,
    isPriorityActive: priorityGameActive,
    isTextureReduced: isTex,
    isCpuOverclocked,
    activeTweaksCount: count,
  };
};

export const generateStockRestoreCommands = (mode: 'root' | 'shizuku' | 'non_root'): string[] => {
  const prefix = mode === 'root' ? 'su -c ' : mode === 'shizuku' ? 'rish -c ' : 'adb shell ';

  return [
    `# [XA Optimizer v2] RESTORE DEVICE KE FACTORY STOCK DEFAULTS`,
    `${prefix}"wm size reset"`,
    `${prefix}"wm density reset"`,
    `${prefix}"echo schedutil > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor"`,
    `${prefix}"echo schedutil > /sys/devices/system/cpu/cpu4/cpufreq/scaling_governor"`,
    `${prefix}"echo schedutil > /sys/devices/system/cpu/cpu7/cpufreq/scaling_governor"`,
    `${prefix}"start thermal-engine 2>/dev/null || start mi_thermald 2>/dev/null || setprop persist.vendor.thermal.engine 1"`,
    `${prefix}"setprop debug.sf.latch_unsignaled 0"`,
    `${prefix}"setprop debug.hwui.renderer default"`,
    `${prefix}"setprop persist.vendor.touch.sampling 120"`,
    `${prefix}"settings put global game_driver_all_apps 0"`,
    `# Pemulihan Berhasil: Device kembali ke settingan bawaan pabrik yang aman.`
  ];
};
