import React, { useState, useEffect, useRef } from 'react';
import { Layers, Sparkles, CheckCircle2, RotateCcw, AlertTriangle, Cpu, Terminal, Play, Zap } from 'lucide-react';
import { PrivilegeMode, TextureTweakConfig } from '../types';
import { playSound } from '../utils/audio';
import { generateTextureDownscaleCommands } from '../utils/shellGenerator';

interface TextureDownscalerTabProps {
  privilegeMode: PrivilegeMode;
  textureConfig: TextureTweakConfig;
  onUpdateConfig: (config: TextureTweakConfig) => void;
  onOpenTerminalModal: (commands: string[]) => void;
  onResetStock: () => void;
}

const GAME_PRESETS = [
  { id: 'com.mobile.legends', name: 'Mobile Legends: Bang Bang', category: 'MOBA 5v5', defaultRecScale: 70 },
  { id: 'com.dts.freefiremax', name: 'Free Fire MAX', category: 'Battle Royale', defaultRecScale: 70 },
  { id: 'com.tencent.ig', name: 'PUBG Mobile', category: 'Battle Royale', defaultRecScale: 70 },
  { id: 'com.miHoYo.GenshinImpact', name: 'Genshin Impact', category: 'Open World RPG', defaultRecScale: 50 },
  { id: 'com.activision.callofduty.shooter', name: 'Call of Duty: Mobile', category: 'FPS Tactical', defaultRecScale: 70 },
  { id: 'com.activision.callofduty.warzone', name: 'Warzone Mobile', category: 'AAA Heavy FPS', defaultRecScale: 50 },
  { id: 'com.roblox.client', name: 'Roblox', category: 'Sandbox', defaultRecScale: 85 },
];

export const TextureDownscalerTab: React.FC<TextureDownscalerTabProps> = ({
  privilegeMode,
  textureConfig,
  onUpdateConfig,
  onOpenTerminalModal,
  onResetStock,
}) => {
  const [selectedGame, setSelectedGame] = useState(textureConfig.gamePackage || GAME_PRESETS[0].id);
  const [customPackage, setCustomPackage] = useState('');
  const [scale, setScale] = useState(textureConfig.resolutionScalePercent || 70);
  const [lodBias, setLodBias] = useState(textureConfig.lodBias || 1.5);
  const [disableMsaa, setDisableMsaa] = useState(textureConfig.disableMsaa);
  const [force16Bit, setForce16Bit] = useState(textureConfig.force16BitColor);
  const [applied, setApplied] = useState(textureConfig.applied);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync with current preset
  const currentGameObj = GAME_PRESETS.find((g) => g.id === selectedGame) || {
    id: customPackage || 'com.custom.game',
    name: customPackage ? `Custom: ${customPackage}` : 'Custom Game Target',
    category: 'Custom APK',
    defaultRecScale: 70,
  };

  // Canvas visual simulation of texture resolution & LOD bias
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = '#0f111a';
    ctx.fillRect(0, 0, width, height);

    // Left side: Stock Native Texture
    // Right side: Scaled / LOD Potato Texture
    const halfWidth = width / 2;

    // Draw grid/texture pattern simulation
    const drawTerrain = (startX: number, endX: number, pixelSize: number, blurAmount: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(startX, 0, endX - startX, height);
      ctx.clip();

      // Simulated 3D Cyber Grid Terrain
      const cols = Math.floor((endX - startX) / pixelSize);
      const rows = Math.floor(height / pixelSize);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = startX + i * pixelSize;
          const y = j * pixelSize;

          // Procedural cyber texture blocks
          const noise = Math.sin(i * 0.4) * Math.cos(j * 0.4) * 0.5 + 0.5;
          const r = Math.floor(20 + noise * 180 * (1 - blurAmount * 0.15));
          const g = Math.floor(30 + noise * 60);
          const b = Math.floor(60 + noise * 140);

          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(x, y, pixelSize, pixelSize);

          if (pixelSize <= 4) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.strokeRect(x, y, pixelSize, pixelSize);
          }
        }
      }

      // Draw character / weapon silhouette
      const centerX = startX + (endX - startX) / 2;
      const centerY = height / 2;
      ctx.fillStyle = 'rgba(244, 63, 94, 0.9)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30 / (pixelSize > 6 ? 1.2 : 1), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Draw Native 1080p Crisp Texture (pixel size 2)
    drawTerrain(0, halfWidth, 2, 0);

    // Draw Tweak / Potato Texture (pixel size scales inversely with resolution & LOD)
    const effectivePixelSize = Math.max(2, Math.round(18 * (1 - scale / 100) + lodBias * 2.5));
    drawTerrain(halfWidth, width, effectivePixelSize, lodBias);

    // Divider line
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(halfWidth, 0);
    ctx.lineTo(halfWidth, height);
    ctx.stroke();

    // Labels on canvas
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('NATIVE 100% (BERAT / FRAME DROP)', 12, 22);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(
      `METODE DOWNSCALE ${scale}% (LOD +${lodBias}) — FPS STABIL`,
      halfWidth + 12,
      22
    );
  }, [scale, lodBias]);

  const handleApply = () => {
    playSound('boost');
    const targetW = Math.round(1080 * (scale / 100));
    const targetH = Math.round(2400 * (scale / 100));
    const newConfig: TextureTweakConfig = {
      gamePackage: selectedGame === 'custom' ? customPackage : selectedGame,
      gameTitle: currentGameObj.name,
      resolutionScalePercent: scale,
      targetResolution: `${targetW}x${targetH}`,
      lodBias,
      textureCompression: scale <= 50 ? 'potato' : scale <= 70 ? 'quarter' : 'half',
      disableMsaa,
      force16BitColor: force16Bit,
      vulkanDriverTweak: true,
      renderBufferLimit: 2,
      applied: true,
    };
    setApplied(true);
    onUpdateConfig(newConfig);
  };

  const handleReset = () => {
    playSound('restore');
    setScale(100);
    setLodBias(0);
    setDisableMsaa(false);
    setForce16Bit(false);
    setApplied(false);
    onResetStock();
  };

  const currentCommands = generateTextureDownscaleCommands(privilegeMode, {
    gamePackage: selectedGame === 'custom' ? customPackage || 'com.game.package' : selectedGame,
    gameTitle: currentGameObj.name,
    resolutionScalePercent: scale,
    targetResolution: `${Math.round(1080 * (scale / 100))}x${Math.round(2400 * (scale / 100))}`,
    lodBias,
    textureCompression: scale <= 50 ? 'potato' : 'half',
    disableMsaa,
    force16BitColor: force16Bit,
    vulkanDriverTweak: true,
    renderBufferLimit: 2,
    applied: true,
  });

  const copyShell = () => {
    navigator.clipboard.writeText(currentCommands.join('\n'));
    setCopiedNotification(true);
    playSound('click');
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Estimated FPS gain and VRAM reduction
  const estFpsGain = Math.round((100 - scale) * 0.9 + lodBias * 8);
  const estVramSaved = Math.round((100 - scale) * 0.75 + (force16Bit ? 18 : 0));

  return (
    <div className="space-y-6">
      {/* Header Banner & Safe-Method Explanation */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0e1017] to-rose-950/40 border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                MENU KE-2: GAME SPACE
              </span>
              <span className="text-xs text-slate-400">Tekstur Modifikasi Aman · All Android</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
              Redmi Game Turbo GL Texture Downscaler
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Menerapkan metode optimasi tekstur ala <span className="text-rose-400 font-semibold">Game Turbo Xiaomi/Redmi</span> & <span className="text-cyan-400 font-semibold">GLTools</span>. Menurunkan resolusi render buffer internal dan menaikkan Mipmap LOD bias secara sistemik tanpa membongkar file APK game sehingga <span className="text-emerald-400 font-medium">100% aman dari deteksi ban anti-cheat</span>.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => onOpenTerminalModal(currentCommands)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 transition-colors"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Lihat Script Shell</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Interactive Texture & FPS Visual Canvas */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="font-heading text-sm font-bold text-white">
              Visual Preview: Perbandingan Resolusi Tekstur Game
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-400">
              Estimasi Peningkatan FPS:{' '}
              <strong className="text-emerald-400 tabular-nums">+{estFpsGain}%</strong>
            </span>
            <span className="text-slate-400">
              Penghematan VRAM:{' '}
              <strong className="text-cyan-400 tabular-nums">-{estVramSaved}%</strong>
            </span>
          </div>
        </div>

        {/* Canvas Display */}
        <div className="w-full h-44 sm:h-52 rounded-xl overflow-hidden border border-slate-800 relative bg-[#090b10]">
          <canvas
            ref={canvasRef}
            width={800}
            height={208}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Game Target & Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                Pilih Target Game
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Support All Android</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {GAME_PRESETS.map((game) => (
                <button
                  key={game.id}
                  onClick={() => {
                    setSelectedGame(game.id);
                    setScale(game.defaultRecScale);
                    playSound('click');
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    selectedGame === game.id
                      ? 'bg-rose-950/40 border-rose-500/80 text-white shadow-sm'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold truncate">{game.name}</p>
                    <p className="text-[10px] font-mono text-slate-400">{game.id}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                    {game.category}
                  </span>
                </button>
              ))}

              {/* Custom Package Option */}
              <div
                onClick={() => {
                  setSelectedGame('custom');
                  playSound('click');
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedGame === 'custom'
                    ? 'bg-rose-950/40 border-rose-500/80'
                    : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                <p className="text-xs font-semibold text-white mb-1.5">Game Lain (Kustom Package)</p>
                <input
                  type="text"
                  placeholder="Contoh: com.carxtech.sr"
                  value={customPackage}
                  onChange={(e) => {
                    setCustomPackage(e.target.value);
                    setSelectedGame('custom');
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mengapa Metode Ini Aman?</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Metode ini tidak mengubah berkas APK/OBB game sama sekali, melainkan mengubah layer display frame Android SurfaceFlinger dan flag OpenGL sistem. Game mendeteksi ponsel Anda seolah-olah memiliki layar beresolusi lebih rendah yang secara otomatis meringankan beban GPU.
            </p>
          </div>
        </div>

        {/* Right Column: Texture & Resolution Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
            {/* Resolution Scaler */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
                    1. Skala Resolusi Render Surface
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Target Resolusi: <span className="text-cyan-400 font-mono font-bold">{Math.round(1080 * (scale / 100))}x{Math.round(2400 * (scale / 100))}</span> ({scale}%)
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400">{scale}%</span>
              </div>

              {/* Resolution preset buttons */}
              <div className="grid grid-cols-5 gap-2">
                {[
                  { val: 100, label: '100% Native' },
                  { val: 85, label: '85% Mild' },
                  { val: 70, label: '70% 720p' },
                  { val: 50, label: '50% 540p' },
                  { val: 33, label: '33% Potato' },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => {
                      setScale(item.val);
                      playSound('click');
                    }}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-mono transition-all ${
                      scale === item.val
                        ? 'bg-rose-600 text-white border-rose-500 font-bold shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* GL Mipmap LOD Bias Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
                    2. Mipmap Texture LOD Bias (GLTools Style)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Meringankan detail tekstur 3D agar GPU tidak overheat saat teamfight.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400 tabular-nums">
                  {lodBias > 0 ? `+${lodBias}` : lodBias}
                </span>
              </div>

              <input
                type="range"
                min="-1.0"
                max="3.0"
                step="0.5"
                value={lodBias}
                onChange={(e) => setLodBias(parseFloat(e.target.value))}
                className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>-1.0 (Ultra Sharp)</span>
                <span>0.0 (Normal)</span>
                <span>+1.5 (Potato Ringan)</span>
                <span>+3.0 (Super Potato)</span>
              </div>
            </div>

            {/* Safe Hardware Optimization Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200 mb-2">
                3. Tweak Framebuffer Tambahan
              </h4>

              {/* Force 16-bit RGB565 */}
              <div
                onClick={() => {
                  setForce16Bit(!force16Bit);
                  playSound('toggle');
                }}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-200">Force 16-bit Framebuffer (RGB565)</p>
                  <p className="text-[10px] text-slate-400">Memangkas overhead warna 32-bit, hemat 50% bandwidth memory GPU.</p>
                </div>
                <div
                  className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                    force16Bit ? 'bg-rose-600' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      force16Bit ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* Disable MSAA */}
              <div
                onClick={() => {
                  setDisableMsaa(!disableMsaa);
                  playSound('toggle');
                }}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-200">Nonaktifkan MSAA Hardware Anti-Aliasing</p>
                  <p className="text-[10px] text-slate-400">Menghilangkan beban rendering pinggiran objek untuk kestabilan 90/120 FPS.</p>
                </div>
                <div
                  className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                    disableMsaa ? 'bg-rose-600' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      disableMsaa ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleApply}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-heading font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Terapkan Tweak Texture ke Game</span>
              </button>

              <button
                onClick={copyShell}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 transition-colors whitespace-nowrap"
              >
                {copiedNotification ? 'Tersalin ke Clipboard!' : 'Salin Perintah ADB'}
              </button>
            </div>

            {applied && (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Tweak tekstur aktif untuk <strong>{currentGameObj.name}</strong> ({scale}%, LOD +{lodBias}). GPU render buffer siap melesat kencang!
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
