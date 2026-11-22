import React from 'react';
import { Lock, X } from 'lucide-react';
import { ACHIEVEMENT_BADGES } from '../game/curriculum';
import { BadgeEmblemSvg } from './AdabIllustrations';

interface BadgesModalProps {
  unlockedBadges: string[];
  onClose: () => void;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({ unlockedBadges, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 28, 20, 0.72)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="badges-modal-title"
    >
      <div className="w-full max-w-2xl rounded-2xl border-2 border-amber-900/20 bg-[#FDFBF5] shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-800 text-white">
          <div>
            <p className="text-xs text-emerald-200 font-medium">
              Koleksi Pencapaian ({unlockedBadges.length}/{ACHIEVEMENT_BADGES.length} Terbuka)
            </p>
            <h2 id="badges-modal-title" className="font-display text-xl font-bold">
              Lencana Pencapaian Adab
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup senarai lencana"
            className="p-2 rounded-lg bg-emerald-900/60 hover:bg-emerald-900 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ACHIEVEMENT_BADGES.map((badge) => {
            const unlocked = unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`flex items-center gap-4 p-4 rounded-xl border ${
                  unlocked
                    ? 'bg-white border-amber-300 shadow-sm'
                    : 'bg-slate-100/80 border-slate-200 opacity-75'
                }`}
              >
                <BadgeEmblemSvg
                  badgeId={badge.id}
                  unlocked={unlocked}
                  accentColor={badge.accentColor}
                  className="w-14 h-14 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-bold text-sm text-slate-900 truncate">
                      {badge.title}
                    </h3>
                    {!unlocked && <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {badge.description}
                  </p>
                  <p className="text-xs font-semibold mt-1 text-emerald-700">
                    {unlocked ? 'Telah Dicapai' : 'Belum Dibuka'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
