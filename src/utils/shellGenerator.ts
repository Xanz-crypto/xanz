import { PrivilegeMode, CpuGovernor, TextureTweakConfig } from '../types';

export const generateOptimizeShellCommands = (
  mode: PrivilegeMode,
  selectedAppPackages: string[] = []
): string[] => {
  const isRoot = mode === 'root';
  const prefix = isRoot ? 'su -c ' : mode === 'shizuku' ? 'rish -c ' : 'adb shell ';

  const cmds: string[] = [
    `# ======================================================`,
    `# [XA OPTIMIZER V2] AUTO SYSTEM OPTIMIZATION PIPELINE`,
    `# PRIVILEGE LEVEL: ${mode.toUpperCase()}`,
    `# ======================================================`,
    `# 1. Bersihkan System Cache & Trim Dalvik VM Cache`,
    `${prefix}"pm trim-caches 4096M"`,
  ];

  if (isRoot) {
    cmds.push(
      `${prefix}"sync && echo 3 > /proc/sys/vm/drop_caches"`,
      `${prefix}"echo 1 > /proc/sys/vm/compact_memory"`
    );
  }

  cmds.push(
    `# 2. Hentikan background apps & hibernate service tidak penting`,
  );

  selectedAppPackages.forEach((pkg) => {
    cmds.push(`${prefix}"am force-stop ${pkg}"`);
    if (isRoot) {
      cmds.push(`${prefix}"rm -rf /data/data/${pkg}/cache/* 2>/dev/null"`);
      cmds.push(`${prefix}"rm -rf /data/data/${pkg}/code_cache/* 2>/dev/null"`);
    }
  });

  cmds.push(
    `# 3. Optimasi I/O Scheduler & Low Memory Killer (LMK)`,
    `${prefix}"setprop persist.sys.purgeable_assets 1"`,
    `${prefix}"setprop debug.sf.disable_backpressure 1"`
  );

  return cmds;
};

export const generateCpuGovernorCommands = (
  mode: PrivilegeMode,
  governor: CpuGovernor,
  littleMhz: number,
  bigMhz: number,
  primeMhz: number
): string[] => {
  const prefix = mode === 'root' ? 'su -c ' : mode === 'shizuku' ? 'rish -c ' : 'adb shell ';

  return [
    `# [XA OPTIMIZER V2] CPU PERFORMANCE GOVERNOR CONFIG`,
    `# TARGET GOVERNOR: ${governor.toUpperCase()}`,
    `${prefix}"echo ${governor} > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor"`,
    `${prefix}"echo ${governor} > /sys/devices/system/cpu/cpu4/cpufreq/scaling_governor"`,
    `${prefix}"echo ${governor} > /sys/devices/system/cpu/cpu7/cpufreq/scaling_governor"`,
    `${prefix}"echo ${littleMhz * 1000} > /sys/devices/system/cpu/cpu0/cpufreq/scaling_max_freq"`,
    `${prefix}"echo ${bigMhz * 1000} > /sys/devices/system/cpu/cpu4/cpufreq/scaling_max_freq"`,
    `${prefix}"echo ${primeMhz * 1000} > /sys/devices/system/cpu/cpu7/cpufreq/scaling_max_freq"`,
    `# Scheduler Latency tuning (Schedutil/Energy-Aware)`,
    `${prefix}"echo 500 > /sys/devices/system/cpu/cpufreq/schedutil/up_rate_limit_us 2>/dev/null || true"`,
    `${prefix}"echo 2000 > /sys/devices/system/cpu/cpufreq/schedutil/down_rate_limit_us 2>/dev/null || true"`
  ];
};

export const generateGameSpaceTweakCommands = (
  mode: PrivilegeMode,
  gamePackage: string,
  options: {
    bypassCharging: boolean;
    touchSamplingTurbo: boolean;
    lock120Hz: boolean;
    highPrioritySchedule: boolean;
    thermalGuardActive: boolean;
    fanSpeedLevel: number;
  }
): string[] => {
  const prefix = mode === 'root' ? 'su -c ' : mode === 'shizuku' ? 'rish -c ' : 'adb shell ';
  const cmds: string[] = [
    `# ======================================================`,
    `# [XA OPTIMIZER V2] NUBIA RED MAGIC GAME SPACE SESSION`,
    `# TARGET GAME: ${gamePackage}`,
    `# ======================================================`,
  ];

  if (options.highPrioritySchedule) {
    cmds.push(
      `# Prioritas Tinggi CPU & Core Pinning ke Big Core`,
      `GAME_PID=$(${prefix}"pidof ${gamePackage}")`,
      `if [ -n "$GAME_PID" ]; then`,
      `  ${prefix}"renice -n -20 -p $GAME_PID"`,
      `  ${prefix}"taskset -p 0xF0 $GAME_PID 2>/dev/null || true"`,
      `  ${prefix}"ionice -c 1 -n 0 -p $GAME_PID 2>/dev/null || true"`,
      `fi`
    );
  }

  if (options.touchSamplingTurbo) {
    cmds.push(
      `# Touch Sampling Rate Boost (Up to 960Hz Polling)`,
      `${prefix}"echo 1 > /sys/class/touch/touch_dev/game_mode 2>/dev/null || true"`,
      `${prefix}"setprop persist.vendor.touch.sampling 960"`
    );
  }

  if (options.lock120Hz) {
    cmds.push(
      `# Display Refresh Rate Force Lock 120Hz / Peak Refresh`,
      `${prefix}"settings put system min_refresh_rate 120.0"`,
      `${prefix}"settings put system peak_refresh_rate 120.0"`
    );
  }

  if (options.bypassCharging) {
    cmds.push(
      `# Nubia Bypass Charging / Separation (Mencegah panas baterai saat dicolok)`,
      `${prefix}"echo 0 > /sys/class/power_supply/battery/charging_enabled 2>/dev/null || true"`,
      `${prefix}"echo 1 > /sys/class/power_supply/battery/input_suspend 2>/dev/null || true"`
    );
  }

  if (options.thermalGuardActive) {
    cmds.push(
      `# Manajemen Suhu Dingin (Suppress Aggressive Thermal Daemon Drop)`,
      `${prefix}"stop thermal-engine 2>/dev/null || stop mi_thermald 2>/dev/null || true"`
    );
  }

  return cmds;
};

export const generateTextureDownscaleCommands = (
  mode: PrivilegeMode,
  config: TextureTweakConfig
): string[] => {
  const prefix = mode === 'root' ? 'su -c ' : mode === 'shizuku' ? 'rish -c ' : 'adb shell ';
  const cmds: string[] = [
    `# ======================================================`,
    `# [XA OPTIMIZER V2] REDMI GAME TURBO TEXTURE DOWNSCALER`,
    `# METODE: Safe Resolution Scaler & GL LOD Bias Reduction`,
    `# TARGET GAME: ${config.gamePackage} (${config.gameTitle})`,
    `# ======================================================`,
  ];

  if (config.resolutionScalePercent < 100) {
    cmds.push(
      `# 1. Safe Display Surface Scaler (wm size & wm density)`,
      `# Mengurangi beban render GPU tanpa modifikasi file apk (Aman dari ban)`,
      `${prefix}"wm size ${config.targetResolution}"`,
      `${prefix}"wm density ${Math.round(420 * (config.resolutionScalePercent / 100))}"`
    );
  }

  if (config.disableMsaa) {
    cmds.push(
      `# 2. Disable MSAA & Anti-Aliasing Overhead`,
      `${prefix}"setprop debug.egl.force_msaa 0"`,
      `${prefix}"setprop debug.hwui.disable_msaa true"`
    );
  }

  if (config.force16BitColor) {
    cmds.push(
      `# 3. Force 16-bit RGB565 Framebuffer (Hemat 50% GPU Bandwidth)`,
      `${prefix}"setprop debug.hwui.render_dirty_regions false"`,
      `${prefix}"setprop persist.sys.ui.half_color 1"`
    );
  }

  if (config.lodBias !== 0) {
    cmds.push(
      `# 4. GLTools / Game Turbo Texture Mipmap LOD Bias (+${config.lodBias})`,
      `# Menghaluskan/meringankan tekstur 3D game secara drastis`,
      `${prefix}"setprop debug.gl.lod_bias ${config.lodBias}"`,
      `${prefix}"setprop persist.vendor.gl.texture_lod ${config.lodBias}"`
    );
  }

  cmds.push(
    `# 5. Android Game Mode API Enforcement (Android 12+)`,
    `${prefix}"cmd game set --mode 2 --downscale ${(config.resolutionScalePercent / 100).toFixed(2)} ${config.gamePackage}"`
  );

  return cmds;
};
