import React, { useEffect } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { ACHIEVEMENT_BADGES } from '../game/curriculum';
import { soundManager } from '../game/audio';
import { computeMasteryGrade, formatTimeMMSS } from '../game/gameLogic';
import { GameProgressState } from '../game/types';
import { BadgeEmblemSvg, GoldStarSvg } from './AdabIllustrations';

interface CertificateModalProps {
  state: GameProgressState;
  onNameChange: (name: string) => void;
  onClassChange: (cls: string) => void;
  onPlayAgain: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  state,
  onNameChange,
  onClassChange,
  onPlayAgain,
}) => {
  const mastery = computeMasteryGrade(
    state.starsEarned,
    state.maxStars,
    state.mistakesCount
  );

  useEffect(() => {
    soundManager.playVictoryAnthem();
  }, []);

  const handleDownloadCertificate = () => {
    soundManager.playClick();
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Warm parchment background
    ctx.fillStyle = '#FDFBF5';
    ctx.fillRect(0, 0, 1200, 850);

    // Outer emerald & gold borders
    ctx.strokeStyle = '#065F46';
    ctx.lineWidth = 18;
    ctx.strokeRect(32, 32, 1136, 786);

    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 4;
    ctx.strokeRect(54, 54, 1092, 742);

    // Header Crest
    ctx.fillStyle = '#065F46';
    ctx.font = '700 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PENDIDIKAN ISLAM TAHUN 2 · ADAB MAKAN & MINUM', 600, 130);

    ctx.fillStyle = '#0F172A';
    ctx.font = '700 54px sans-serif';
    ctx.fillText('SIJIL KEJAYAAN', 600, 200);

    ctx.fillStyle = '#B45309';
    ctx.font = '600 22px sans-serif';
    ctx.fillText('Dianugerahkan dengan bangga kepada:', 600, 265);

    // Student Name & Class
    ctx.fillStyle = '#064E3B';
    ctx.font = '700 48px sans-serif';
    ctx.fillText(state.studentName.trim() || 'Murid Cemerlang', 600, 340);

    ctx.fillStyle = '#475569';
    ctx.font = '600 26px sans-serif';
    ctx.fillText(`Kelas: ${state.studentClass.trim() || 'Tahun 2'}`, 600, 390);

    // Divider
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(260, 425);
    ctx.lineTo(940, 425);
    ctx.stroke();

    // Achievement statement
    ctx.fillStyle = '#1E293B';
    ctx.font = '500 23px sans-serif';
    ctx.fillText(
      'Kerana telah berjaya menamatkan kesemua 6 Misi Pengembaraan 3D',
      600,
      475
    );
    ctx.fillText(
      'dan mengamalkan Adab Makan & Minum dengan cemerlang.',
      600,
      510
    );

    // Stats Box
    ctx.fillStyle = '#ECFDF5';
    ctx.fillRect(180, 555, 840, 110);
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.strokeRect(180, 555, 840, 110);

    ctx.fillStyle = '#065F46';
    ctx.font = '700 26px sans-serif';
    ctx.fillText(
      `Bintang Emas: ${state.starsEarned}/${state.maxStars}   |   Lencana: ${state.unlockedBadges.length}/6   |   Tahap: ${mastery.grade}`,
      600,
      618
    );

    // Date & Signature
    const dateStr = new Date().toLocaleDateString('ms-MY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    ctx.fillStyle = '#64748B';
    ctx.font = '600 20px sans-serif';
    ctx.fillText(`Tarikh: ${dateStr} · Kembara Adab 3D`, 600, 745);

    const link = document.createElement('a');
    link.download = `Sijil_Adab_Makan_Minum_${(state.studentName || 'Murid').replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 28, 20, 0.78)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-modal-title"
    >
      <div className="w-full max-w-2xl rounded-2xl border-4 border-amber-500 bg-[#FDFBF5] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Inner Islamic-style framed header */}
        <div className="px-6 py-5 bg-emerald-800 text-white text-center border-b-4 border-amber-400">
          <p className="text-xs font-semibold tracking-wider text-amber-200 uppercase">
            Tahniah! Semua Misi Selesai
          </p>
          <h2 id="cert-modal-title" className="font-display text-2xl md:text-3xl font-bold mt-1">
            Sijil Kejayaan Adab Makan &amp; Minum
          </h2>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Mastery Stats Row */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center justify-center gap-1.5">
                <GoldStarSvg className="w-5 h-5" />
                <span className="font-mono-num text-xl font-bold text-amber-700">
                  {state.starsEarned}/{state.maxStars}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">Bintang Emas</p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="font-mono-num text-xl font-bold text-emerald-800">
                {state.unlockedBadges.length}/6
              </p>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">Lencana</p>
            </div>

            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
              <p className="font-mono-num text-xl font-bold text-sky-800">
                {formatTimeMMSS(state.elapsedSeconds)}
              </p>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">Masa Tamat</p>
            </div>
          </div>

          {/* Printable Certificate Preview Card */}
          <div className="p-5 rounded-xl border-2 border-amber-400 bg-white text-center space-y-3">
            <p className="text-xs font-semibold text-emerald-800">
              Pencapaian: {mastery.grade} · {mastery.title}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div>
                <label htmlFor="cert-name" className="block text-xs font-semibold text-slate-600 mb-1">
                  Nama pada Sijil
                </label>
                <input
                  id="cert-name"
                  type="text"
                  value={state.studentName}
                  onChange={(e) => onNameChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-slate-300 text-slate-900"
                />
              </div>
              <div>
                <label htmlFor="cert-class" className="block text-xs font-semibold text-slate-600 mb-1">
                  Kelas
                </label>
                <input
                  id="cert-class"
                  type="text"
                  value={state.studentClass}
                  onChange={(e) => onClassChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-slate-300 text-slate-900"
                />
              </div>
            </div>

            {/* Earned Badges Strip */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              {ACHIEVEMENT_BADGES.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center">
                  <BadgeEmblemSvg
                    badgeId={badge.id}
                    unlocked={state.unlockedBadges.includes(badge.id)}
                    accentColor={badge.accentColor}
                    className="w-11 h-11"
                  />
                  <span className="text-[11px] font-semibold text-slate-700 mt-0.5">
                    {badge.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleDownloadCertificate}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-bold text-sm cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Simpan Sijil (PNG)</span>
            </button>

            <button
              type="button"
              data-start="true"
              onClick={onPlayAgain}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-display font-bold text-sm cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Main Semula</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
