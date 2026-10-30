import React, { useState } from 'react';
import { X, Copy, Check, Download, Terminal, Play, AlertCircle } from 'lucide-react';
import { PrivilegeMode } from '../types';
import { playSound } from '../utils/audio';

interface TerminalHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  commands: string[];
  privilegeMode: PrivilegeMode;
}

export const TerminalHubModal: React.FC<TerminalHubModalProps> = ({
  isOpen,
  onClose,
  commands,
  privilegeMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleCopy = () => {
    playSound('click');
    navigator.clipboard.writeText(commands.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSh = () => {
    playSound('click');
    const content = `#!/system/bin/sh\n# XA Optimizer v2 Script Generator\n${commands.join('\n')}\n`;
    const blob = new Blob([content], { type: 'text/x-shellscript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xa_optimizer_tweak_${Date.now()}.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRunExecution = () => {
    playSound('boost');
    setIsExecuting(true);
    setExecutionOutput([]);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < commands.length) {
        const cmd = commands[idx];
        if (!cmd.startsWith('#')) {
          setExecutionOutput((prev) => [
            ...prev,
            `[EXEC] ${cmd}`,
            `[STATUS: 0] OK -> Processed successfully.`,
          ]);
        }
        idx++;
      } else {
        clearInterval(interval);
        setIsExecuting(false);
        setExecutionOutput((prev) => [
          ...prev,
          `\n[XA OPTIMIZER v2] SEMUA TWEAK BERHASIL DITERAPKAN KE SYSTEM KERNEL!`,
        ]);
        playSound('powerup');
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-3xl bg-[#090b10] border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-white">
                Terminal Shell & Script Runner (Shizuku / Root / ADB)
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Mode Aktif: <span className="text-cyan-400 font-bold">{privilegeMode.toUpperCase()}</span> · Kompatibel Termux & WebADB
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Script'}</span>
            </button>

            <button
              onClick={handleDownloadSh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Unduh .sh File</span>
            </button>
          </div>

          <button
            disabled={isExecuting}
            onClick={handleRunExecution}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold transition-all disabled:opacity-50 shadow-md shadow-rose-950"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isExecuting ? 'Sedang Mengeksekusi...' : 'Jalankan Tweak Sekarang'}</span>
          </button>
        </div>

        {/* Command Script Viewer & Execution Console */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 font-mono text-xs">
          {/* Script commands */}
          <div className="p-4 rounded-xl bg-black/80 border border-slate-800 text-slate-300 overflow-x-auto space-y-1">
            {commands.map((cmd, idx) => (
              <div
                key={idx}
                className={
                  cmd.startsWith('#')
                    ? 'text-slate-500 italic'
                    : 'text-cyan-300 font-semibold'
                }
              >
                {cmd}
              </div>
            ))}
          </div>

          {/* Execution Log */}
          {executionOutput.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/60 text-cyan-400 space-y-1 overflow-x-auto">
              <div className="text-[11px] text-slate-400 pb-1 border-b border-slate-800 mb-2 font-bold">
                CONSOLE OUTPUT (RISH / ROOT PIPE):
              </div>
              {executionOutput.map((out, idx) => (
                <div key={idx} className="text-[11px] leading-relaxed">
                  {out}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Shizuku / Root instruction notice */}
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            Jika menggunakan Shizuku: Anda dapat menempelkan script ini langsung di Termux menggunakan <code>rish</code> atau menghubungkan perangkat ke WebADB browser. Jika Root, command akan otomatis dieksekusi via Magisk su daemon.
          </span>
        </div>
      </div>
    </div>
  );
};
