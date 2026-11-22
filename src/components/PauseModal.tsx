import React from 'react';
import { Home, Play, RotateCcw } from 'lucide-react';

interface PauseModalProps {
  starsEarned: number;
  completedCount: number;
  onResume: () => void;
  onRestart: () => void;
  onBackToTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  starsEarned,
  completedCount,
  onResume,
  onRestart,
  onBackToTitle,
}) => {
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 28, 20, 0.72)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-modal-title"
    >
      <div className="w-full max-w-sm rounded-2xl border-2 border-amber-900/20 bg-[#FDFBF5] p-6 shadow-2xl text-center">
        <h2 id="pause-modal-title" className="font-display text-2xl font-bold text-slate-900 mb-1">
          Permainan Dijedakan
        </h2>
        <p className="text-xs text-slate-600 mb-5">
          Misi Selesai: <span className="font-mono-num font-bold">{completedCount}/6</span> · Bintang Emas:{' '}
          <span className="font-mono-num font-bold text-amber-700">{starsEarned}</span>
        </p>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-display font-bold text-sm cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>Sambung Kembara</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-display font-bold text-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Mula Semula</span>
          </button>

          <button
            type="button"
            onClick={onBackToTitle}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-display font-bold text-sm cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Skrin Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
};
