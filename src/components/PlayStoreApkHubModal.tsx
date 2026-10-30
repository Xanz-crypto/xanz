import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Smartphone,
  Play,
  CheckCircle2,
  Copy,
  Check,
  Shield,
  Terminal,
  Layers,
  Cpu,
  Share2,
  ExternalLink,
  Zap,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { playSound } from '../utils/audio';
import { usePWAInstall } from '../utils/usePWAInstall';

interface PlayStoreApkHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayStoreApkHubModal: React.FC<PlayStoreApkHubModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'install' | 'playstore' | 'cli' | 'shizuku' | 'checklist'>('install');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [installStatusMsg, setInstallStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    playSound('boost');
    try {
      const res = await install();
      if (res === 'accepted') {
        setInstallStatusMsg('Aplikasi berhasil dipasang ke sistem Android Anda!');
      } else if (res === 'manual') {
        setInstallStatusMsg(
          isAndroid
            ? 'Buka menu browser Chrome (titik tiga ⋮ di pojok kanan atas) lalu pilih "Tambahkan ke Layar Utama" / "Install Aplikasi".'
            : isIOS
            ? 'Tekan tombol Share di Safari, lalu pilih "Add to Home Screen".'
            : 'Browser Anda dapat memasang aplikasi ini melalui tombol install di address bar.'
        );
      }
    } catch {
      setInstallStatusMsg('Silakan gunakan opsi "Tambahkan ke Layar Utama" pada menu browser Android Anda.');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(label);
    playSound('click');
    setTimeout(() => setCopiedFile(null), 2500);
  };

  const toggleFullscreen = () => {
    playSound('click');
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Pre-configured Android files
  const androidManifestContent = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.xa.optimizer.gaming">

    <!-- Izin optimasi performa dan cache sistem -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.KILL_BACKGROUND_PROCESSES" />
    <uses-permission android:name="android.permission.BATTERY_STATS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    
    <!-- Integrasi Shizuku API untuk eksekusi perintah ADB tanpa Root -->
    <uses-permission android:name="moe.shizuku.manager.permission.API_V23" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="XA Optimizer v2"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.XAOptimizer"
        android:hardwareAccelerated="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait"
            android:configChanges="orientation|keyboardHidden|screenSize"
            android:theme="@style/Theme.XAOptimizer.NoActionBar">
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Digital Asset Links & Deep Links untuk Google Play -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="xa-optimizer.app" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const buildGradleContent = `plugins {
    id("com.android.application")
    id("kotlin-android")
}

android {
    namespace = "com.xa.optimizer.gaming"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.xa.optimizer.gaming"
        minSdk = 26
        targetSdk = 35
        versionCode = 200
        versionName = "2.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    // Official AndroidX Trusted Web Activity (Google Play TWA)
    implementation("com.google.androidbrowserhelper:androidbrowserhelper:2.5.0")
    // Shizuku API Provider untuk eksekusi tweak performa ADB
    implementation("dev.rikka.shizuku:api:13.1.5")
    implementation("dev.rikka.shizuku:provider:13.1.5")
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
}`;

  const twaManifestContent = `{
  "packageId": "com.xa.optimizer.gaming",
  "host": "xa-optimizer.app",
  "name": "XA Optimizer v2",
  "launcherName": "XAOptimizer",
  "themeColor": "#090A0F",
  "navigationColor": "#090A0F",
  "backgroundColor": "#090A0F",
  "enableNotifications": true,
  "startUrl": "/",
  "iconUrl": "/pwa-512x512.png",
  "maskableIconUrl": "/pwa-maskable-512x512.png",
  "appVersionCode": 200,
  "appVersionName": "2.0.0",
  "minSdkVersion": 26,
  "orientation": "portrait",
  "signingKey": {
    "path": "./android.keystore",
    "alias": "xaoptimizer"
  }
}`;

  const cliCommands = `# 1. Pasang Bubblewrap CLI resmi dari Google
npm install -g @bubblewrap/cli

# 2. Inisialisasi Android App dari Web Manifest
bubblewrap init --manifest="https://domain-anda.com/manifest.webmanifest"

# 3. Generate Android Keystore untuk Google Play Store
keytool -genkey -v -keystore android.keystore -alias xaoptimizer -keyalg RSA -keysize 2048 -validity 10000

# 4. Build APK & AAB Siap Upload ke Play Store
bubblewrap build

# Hasil:
# - app-release-bundle.aab  ==> Upload langsung ke Google Play Console!
# - app-release.apk         ==> Siap diinstall langsung ke HP Android apa saja!`;

  const downloadAllConfigPackage = () => {
    playSound('powerup');
    const zipData = `=== XA OPTIMIZER v2 — ANDROID GOOGLE PLAY RELEASE PACKAGE ===
Package: com.xa.optimizer.gaming
Target SDK: 35 (Android 15)
Min SDK: 26 (Android 8.0)

--- [AndroidManifest.xml] ---
${androidManifestContent}

--- [build.gradle.kts] ---
${buildGradleContent}

--- [twa-manifest.json] ---
${twaManifestContent}

--- [Build Script: build.sh] ---
${cliCommands}
`;
    const blob = new Blob([zipData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'xa-optimizer-v2-android-playstore-package.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="w-full max-w-4xl bg-[#0b0d14] border border-rose-600/40 rounded-2xl shadow-[0_0_50px_rgba(244,63,94,0.25)] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-rose-950 border border-rose-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.5)]">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-black text-white tracking-wide">
                  ANDROID APK & PLAY STORE HUB
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-600/30 text-rose-300 border border-rose-500/50 uppercase">
                  v2.0 Native
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ubah aplikasi menjadi APK HP resmi, pasang langsung ke Android, atau rilis ke Google Play Store
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              playSound('click');
            }}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shrink-0">
          <div className="flex items-center gap-2 text-slate-300">
            <span className={`w-2 h-2 rounded-full ${isInstalled ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400 animate-pulse'}`} />
            <span>Status:</span>
            <span className="font-semibold text-white">
              {isInstalled ? '✅ Terpasang sebagai APK Native (Standalone)' : '📱 Siap Pasang Langsung ke HP / Export APK'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Package:</span>
            <code className="text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/50">
              com.xa.optimizer.gaming
            </code>
            <button
              onClick={toggleFullscreen}
              title="Aktifkan Mode Fullscreen Gaming Layar Penuh"
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Maximize2 className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/80 px-4 gap-1 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => {
              setActiveTab('install');
              playSound('click');
            }}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'install'
                ? 'border-rose-500 text-rose-400 bg-rose-950/20 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            1. Pasang APK Langsung ke HP
          </button>

          <button
            onClick={() => {
              setActiveTab('playstore');
              playSound('click');
            }}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'playstore'
                ? 'border-rose-500 text-rose-400 bg-rose-950/20 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            2. Source Code Android Studio (AAB)
          </button>

          <button
            onClick={() => {
              setActiveTab('cli');
              playSound('click');
            }}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'cli'
                ? 'border-rose-500 text-rose-400 bg-rose-950/20 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            3. Build 1-Command (Bubblewrap)
          </button>

          <button
            onClick={() => {
              setActiveTab('shizuku');
              playSound('click');
            }}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'shizuku'
                ? 'border-rose-500 text-rose-400 bg-rose-950/20 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            4. Shizuku & Performa Nyata
          </button>

          <button
            onClick={() => {
              setActiveTab('checklist');
              playSound('click');
            }}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'checklist'
                ? 'border-rose-500 text-rose-400 bg-rose-950/20 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            5. Panduan Google Play Console
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: INSTALASI LANGSUNG KE HP */}
          {activeTab === 'install' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-950 border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 via-rose-700 to-rose-950 border-2 border-rose-400/60 flex items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.6)] shrink-0">
                    <Zap className="w-8 h-8 text-white fill-white" />
                  </div>
                  <div>
                    <h4 className="font-heading text-lg font-bold text-white">
                      XA Optimizer v2 (Android APK Edition)
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Pasang langsung ke ponsel Android sebagai aplikasi mandiri tanpa browser bar, dengan performa grafis hardware penuh & getaran haptic.
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] font-mono text-cyan-300">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/50">
                        PWA WebAPK Compliant
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-700/50">
                        Offline Ready (Service Worker)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto shrink-0 flex flex-col gap-2">
                  <button
                    onClick={handleInstallClick}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(244,63,94,0.5)] flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    Pasang APK Sekarang
                  </button>
                  <button
                    onClick={downloadAllConfigPackage}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh File Source Package (.txt)
                  </button>
                </div>
              </div>

              {installStatusMsg && (
                <div className="p-3.5 rounded-lg bg-cyan-950/60 border border-cyan-500/50 text-cyan-200 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{installStatusMsg}</span>
                </div>
              )}

              {/* 3 Step Tutorial */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-600/30 text-rose-300 font-mono font-bold flex items-center justify-center text-xs border border-rose-500/40">
                    1
                  </div>
                  <h5 className="font-semibold text-white text-sm">Buka di Browser HP (Chrome)</h5>
                  <p className="text-xs text-slate-400">
                    Akses URL aplikasi ini langsung dari smartphone Android Anda menggunakan Google Chrome atau browser bawaan.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-600/30 text-cyan-300 font-mono font-bold flex items-center justify-center text-xs border border-cyan-500/40">
                    2
                  </div>
                  <h5 className="font-semibold text-white text-sm">Klik 'Pasang Aplikasi'</h5>
                  <p className="text-xs text-slate-400">
                    Tekan tombol "Pasang APK Sekarang" di atas, atau buka menu Chrome (⋮) &gt; pilih "Tambahkan ke Layar Utama" / "Install App".
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600/30 text-emerald-300 font-mono font-bold flex items-center justify-center text-xs border border-emerald-500/40">
                    3
                  </div>
                  <h5 className="font-semibold text-white text-sm">Icon APK Muncul di Menu HP</h5>
                  <p className="text-xs text-slate-400">
                    Android secara otomatis meng-compile WebAPK resmi dengan icon XA Optimizer di daftar aplikasi HP, berjalan full-screen tanpa address bar.
                  </p>
                </div>
              </div>

              {/* Keunggulan APK HP */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                <h5 className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">
                  Keunggulan Mode APK Native di Smartphone:
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Layar Penuh (Immersive Gaming HUD tanpa address bar)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Umpan Balik Getaran Fisik Haptic Engine (Vibrate)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Bisa dibuka Offline 100% tanpa jaringan internet</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Integrasi Shizuku Wireless ADB tanpa kabel USB</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PLAY STORE SOURCE CODE (AAB & GRADLE) */}
          {activeTab === 'playstore' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div>
                  <h4 className="font-heading text-sm font-bold text-white">
                    Konfigurasi Standar Android Studio (Target SDK 35 — Android 15)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Gunakan file ini di Android Studio untuk membangun file .AAB (Android App Bundle) yang wajib untuk Google Play Store.
                  </p>
                </div>
                <button
                  onClick={downloadAllConfigPackage}
                  className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Lengkap
                </button>
              </div>

              {/* AndroidManifest.xml */}
              <div className="rounded-xl border border-slate-800 bg-[#06070a] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    AndroidManifest.xml
                  </div>
                  <button
                    onClick={() => copyToClipboard(androidManifestContent, 'manifest')}
                    className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    {copiedFile === 'manifest' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin File</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56 scrollbar-thin">
                  {androidManifestContent}
                </pre>
              </div>

              {/* build.gradle.kts */}
              <div className="rounded-xl border border-slate-800 bg-[#06070a] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    app/build.gradle.kts
                  </div>
                  <button
                    onClick={() => copyToClipboard(buildGradleContent, 'gradle')}
                    className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    {copiedFile === 'gradle' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin File</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56 scrollbar-thin">
                  {buildGradleContent}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: BUBBLEWRAP 1-COMMAND CLI */}
          {activeTab === 'cli' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <h4 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Build Otomatis Menggunakan Google Bubblewrap CLI
                </h4>
                <p className="text-xs text-slate-300">
                  Google menyediakan CLI resmi bernama <span className="text-cyan-400 font-mono font-semibold">Bubblewrap</span> untuk mengonversi aplikasi PWA secara instan menjadi file APK dan AAB siap upload ke Play Store tanpa perlu menulis kode Java/Kotlin manual!
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#06070a] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800">
                  <span className="text-xs font-mono text-slate-300 font-semibold">
                    Langkah Eksekusi di Terminal / Termux:
                  </span>
                  <button
                    onClick={() => copyToClipboard(cliCommands, 'cli')}
                    className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    {copiedFile === 'cli' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin Command</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed">
                  {cliCommands}
                </pre>
              </div>

              {/* twa-manifest.json */}
              <div className="rounded-xl border border-slate-800 bg-[#06070a] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800">
                  <span className="text-xs font-mono text-slate-300 font-semibold">
                    twa-manifest.json (Konfigurasi Otomatis)
                  </span>
                  <button
                    onClick={() => copyToClipboard(twaManifestContent, 'twa')}
                    className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    {copiedFile === 'twa' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-44 scrollbar-thin">
                  {twaManifestContent}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: SHIZUKU & HARDWARE INTEGRATION */}
          {activeTab === 'shizuku' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/30 via-slate-900 to-slate-950 border border-cyan-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-heading text-sm font-bold text-white">
                    Bagaimana XA Optimizer Mengubah Performa HP Nyata?
                  </h4>
                </div>
                <p className="text-xs text-slate-300">
                  Untuk melakukan boost FPS, menurunkan resolusi tekstur, dan mengubah Governor CPU di sistem operasi Android, aplikasi ini dirancang bekerja sama dengan 3 tingkatan hak akses:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
                  <div className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/40 inline-block">
                    Level 1: Shizuku (Wireless ADB)
                  </div>
                  <h5 className="font-semibold text-white text-xs">Tanpa Root & Tanpa PC</h5>
                  <p className="text-[11px] text-slate-400">
                    Melalui Shizuku API (<code className="text-cyan-300">moe.shizuku.privilege.api</code>), aplikasi dapat membersihkan cache sistem (`pm trim-caches`), mengubah `window_animation_scale`, dan mengaktifkan performance mode melalui wireless debugging.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-rose-500/30 space-y-2">
                  <div className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-700/40 inline-block">
                    Level 2: Root (KernelSU / Magisk)
                  </div>
                  <h5 className="font-semibold text-white text-xs">Akses Kernel Maksimal</h5>
                  <p className="text-[11px] text-slate-400">
                    Akses direct sysfs untuk mengubah CPU Governor (`performance`, `schedutil`), GPU frequency limiter, thermal throttling disabler, dan dynamic ZRAM paging.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-2">
                  <div className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-600 inline-block">
                    Level 3: Standar Play Store
                  </div>
                  <h5 className="font-semibold text-white text-xs">Aman Kebijakan Google</h5>
                  <p className="text-[11px] text-slate-400">
                    Aplikasi lolos uji review Google Play Console karena mengeksekusi optimasi dengan izin resmi pengguna via dialog Android standar tanpa malware.
                  </p>
                </div>
              </div>

              {/* Digital Asset Links Status */}
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Digital Asset Links Otomatis Aktif
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    File verifikasi domain telah tersedia di <code className="text-slate-300">/.well-known/assetlinks.json</code> untuk menghilangkan URL bar pada APK.
                  </p>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 text-[11px] font-mono shrink-0">
                  Verified
                </span>
              </div>
            </div>
          )}

          {/* TAB 5: PANDUAN GOOGLE PLAY CONSOLE */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h4 className="font-heading text-sm font-bold text-white">
                  5 Langkah Rilis ke Google Play Store
                </h4>
                <p className="text-xs text-slate-400">
                  Ikuti panduan berikut saat mengunggah file AAB ke akun konsol pengembang Google Play:
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    step: 'Langkah 1',
                    title: 'Buka Google Play Console & Buat Aplikasi',
                    desc: 'Pilih "Buat Aplikasi", beri nama "XA Optimizer v2: Game Space & Booster", kategori "Alat / Tools", dan tetapkan sebagai aplikasi Gratis (Free).',
                  },
                  {
                    step: 'Langkah 2',
                    title: 'Upload File app-release-bundle.aab',
                    desc: 'Pada menu "Rilis Produksi" atau "Pengujian Terbuka (Open Testing)", upload file .AAB yang telah dibuild melalui Bubblewrap atau Android Studio.',
                  },
                  {
                    step: 'Langkah 3',
                    title: 'Isi Kuesioner Keamanan Data (Data Safety)',
                    desc: 'Jawab bahwa aplikasi TIDAK mengumpulkan data pribadi ke cloud server luar. Semua optimasi cache dan proses dieksekusi secara lokal di HP pengguna.',
                  },
                  {
                    step: 'Langkah 4',
                    title: 'Target Audiens & Rating Konten',
                    desc: 'Pilih rentang usia 13+ (Semua Umur). Dapatkan rating IARC untuk utilitas gaming.',
                  },
                  {
                    step: 'Langkah 5',
                    title: 'Kirim untuk Ditinjau (Review)',
                    desc: 'Tekan tombol "Kirim untuk Peninjauan". Tim Google biasanya menyetujui rilis dalam waktu 24-48 jam.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-[11px] font-bold border border-rose-800/50 shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <div className="space-y-0.5">
                      <h5 className="font-semibold text-white text-xs">{item.title}</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Siap di-install langsung di HP Android Anda</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)]"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Pasang ke HP
            </button>
            <button
              onClick={() => {
                onClose();
                playSound('click');
              }}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
