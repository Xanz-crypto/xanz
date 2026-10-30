import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Smartphone,
  Download,
  Play,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  ArrowRight,
  Package,
  Layers,
  Sparkles,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { playSound } from '../utils/audio';
import { usePWAInstall } from '../utils/usePWAInstall';

interface ApkPlayStoreTabProps {
  onOpenReleaseModal: () => void;
}

export const ApkPlayStoreTab: React.FC<ApkPlayStoreTabProps> = ({ onOpenReleaseModal }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [installSuccess, setInstallSuccess] = useState(false);

  const handleInstallNow = async () => {
    playSound('boost');
    try {
      const res = await install();
      if (res === 'accepted') {
        setInstallSuccess(true);
      }
    } catch {
      // fallback
    }
  };

  const copyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    playSound('click');
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner: APK HP & Play Store Release */}
      <div className="relative overflow-hidden rounded-2xl border border-rose-600/40 bg-gradient-to-br from-slate-950 via-[#0d0e17] to-rose-950/40 p-6 shadow-[0_0_40px_rgba(244,63,94,0.2)]">
        <div className="cyber-hex-pattern absolute inset-0 opacity-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 text-xs font-mono text-rose-300">
              <Smartphone className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>XA OPTIMIZER V2 — ANDROID APK HP & PLAY STORE READY</span>
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl font-black text-white tracking-wide">
              Jadikan Aplikasi Ini <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-cyan-400">APK HP Android Asli</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Aplikasi ini dikonfigurasi penuh dengan standar <strong className="text-cyan-300">WebAPK (TWA — Trusted Web Activity)</strong> dan <strong className="text-rose-300">Google Play Store Bundle (.AAB)</strong>. Anda dapat menginstalnya langsung ke smartphone Android tanpa PC, atau meng-compile file package untuk diunggah ke Google Play Console!
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-slate-300">
                Package: <code className="text-rose-400 font-bold">com.xa.optimizer.gaming</code>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-slate-300">
                Target SDK: <code className="text-cyan-400 font-bold">35 (Android 15)</code>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-slate-300">
                Min SDK: <code className="text-emerald-400 font-bold">26 (Android 8.0+)</code>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={handleInstallNow}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(244,63,94,0.5)] flex items-center justify-center gap-2.5 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Pasang APK Langsung ke HP</span>
            </button>

            <button
              onClick={() => {
                onOpenReleaseModal();
                playSound('powerup');
              }}
              className="px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/40 hover:border-cyan-400 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Buka Play Store Release Hub</span>
            </button>
          </div>
        </div>

        {installSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Aplikasi telah berhasil terpasang di HP Anda! Cek daftar aplikasi dan home screen Anda.</span>
          </div>
        )}
      </div>

      {/* Two Columns: 1-Click Install vs Play Store AAB Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Cara Pasang Instan ke HP Android */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-white">
                Metode 1: Pasang APK Langsung (WebAPK)
              </h3>
              <p className="text-xs text-slate-400">
                Paling cepat tanpa perlu Android Studio atau PC
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-rose-600/30 text-rose-300 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="text-white block">Buka link ini di Google Chrome HP</strong>
                Buka URL aplikasi ini langsung dari browser Chrome atau browser bawaan smartphone Android Anda.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-rose-600/30 text-rose-300 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong className="text-white block">Tekan tombol 'Pasang APK Sekarang'</strong>
                Atau tekan menu titik tiga (⋮) di Chrome &gt; klik <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Install Aplikasi"</strong>.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-rose-600/30 text-rose-300 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong className="text-white block">Aplikasi siap dijalankan seperti APK resmi</strong>
                Icon XA Optimizer v2 akan muncul di daftar aplikasi HP Anda dengan mode layar penuh (Immersive HUD) tanpa URL bar!
              </div>
            </div>
          </div>

          <button
            onClick={handleInstallNow}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-rose-500/40 hover:border-rose-400 text-rose-300 hover:text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Klik Di Sini Untuk Memulai Instalasi
          </button>
        </div>

        {/* Card 2: Build AAB untuk Google Play Store */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-white">
                Metode 2: Build File .AAB untuk Play Store
              </h3>
              <p className="text-xs text-slate-400">
                1-command menggunakan CLI resmi Google Bubblewrap
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-slate-300 leading-relaxed">
              Google mewajibkan format <strong className="text-white">.AAB (Android App Bundle)</strong> untuk rilis aplikasi baru di Google Play Console. Anda dapat membuatnya dalam 1 menit:
            </p>

            <div className="rounded-xl border border-slate-800 bg-[#06070a] p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Perintah Terminal:</span>
                <button
                  onClick={() => copyCommand('npx @bubblewrap/cli build', 'bwrap')}
                  className="text-cyan-400 hover:text-white flex items-center gap-1"
                >
                  {copiedCmd === 'bwrap' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCmd === 'bwrap' ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
              <code className="block text-cyan-300 font-mono text-xs overflow-x-auto whitespace-pre p-2 bg-slate-950 rounded">
                npm i -g @bubblewrap/cli{'\n'}
                bubblewrap init --manifest="/manifest.webmanifest"{'\n'}
                bubblewrap build
              </code>
            </div>

            <ul className="space-y-1.5 text-slate-400 text-[11px] pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Menghasilkan file <code className="text-white">app-release-bundle.aab</code> siap upload</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Menghasilkan file <code className="text-white">app-release.apk</code> untuk tes langsung</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Tersertifikasi verifikasi Digital Asset Links Play Store</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => {
              onOpenReleaseModal();
              playSound('powerup');
            }}
            className="w-full py-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Buka Source Code Lengkap (Manifest & Gradle)
          </button>
        </div>
      </div>

      {/* Shizuku Native Bridge Showcase */}
      <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950 p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Integrasi Performa HP Nyata Tanpa Root (Shizuku API)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Sebagai APK Android resmi di Google Play Store, XA Optimizer memanfaatkan arsitektur <strong className="text-white">Shizuku (<code className="text-cyan-300">moe.shizuku.privilege.api</code>)</strong> untuk menjalankan eksekusi perintah shell tingkat sistem secara aman:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">
              PERFORMA TINGKAT SYSTEM
            </span>
            <span className="text-slate-300 text-[11px]">
              Menghapus cache sistem semua aplikasi dan game dalam 1 klik tanpa hapus data pengguna (<code className="text-rose-400">pm trim-caches</code>).
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-mono text-rose-400 font-bold block mb-1">
              LOCK MAX FPS GOVERNOR
            </span>
            <span className="text-slate-300 text-[11px]">
              Mengunci clock frekuensi CPU & GPU ke mode performa tinggi saat game dibuka (<code className="text-rose-400">set-fixed-performance-mode</code>).
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">
              TEXTURE DOWNSCALER GL
            </span>
            <span className="text-slate-300 text-[11px]">
              Menurunkan beban render shader GPU hingga 40% untuk menjaga FPS stabil bebas drop frame saat teamfight panas.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
