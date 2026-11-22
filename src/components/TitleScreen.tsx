import React from 'react';
import { AvatarStyle } from '../game/types';
import { GoldStarSvg } from './AdabIllustrations';

interface TitleScreenProps {
  studentName: string;
  studentClass: string;
  avatarStyle: AvatarStyle;
  onNameChange: (name: string) => void;
  onClassChange: (cls: string) => void;
  onAvatarChange: (style: AvatarStyle) => void;
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  studentName,
  studentClass,
  avatarStyle,
  onNameChange,
  onClassChange,
  onAvatarChange,
  onStart,
}) => {
  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-6 md:p-10">
      {/* Top-left title lockup over calm negative space */}
      <div className="max-w-md pointer-events-auto rounded-2xl p-6 md:p-7 border border-amber-900/20 shadow-xl bg-[#FDFBF5]/94">
        {/* Custom Inline SVG Emblem Lockup */}
        <div className="flex items-center gap-3 mb-4">
          <svg viewBox="0 0 56 56" className="w-12 h-12 shrink-0" aria-hidden="true">
            <path
              d="M28 4l20 8v15c0 12.5-8.4 23.2-20 27C16.4 50.2 8 39.5 8 27V12l20-8z"
              fill="#059669"
              stroke="#064E3B"
              strokeWidth="2.5"
            />
            <path
              d="M28 13l3.3 6.8 7.5 1.1-5.4 5.3 1.3 7.4L28 30.1l-6.7 3.5 1.3-7.4-5.4-5.3 7.5-1.1L28 13z"
              fill="#FBBF24"
              stroke="#78350F"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <p className="text-xs font-semibold tracking-wide text-emerald-800">
              Pendidikan Islam Tahun 2 · Adab Makan &amp; Minum
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              Kembara Adab 3D
            </h1>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed mb-5">
          Terokai Taman Harmoni 3D, selesaikan 6 misi adab makan dan minum dengan audio interaktif,
          kumpul Bintang Emas serta Lencana, dan raih Sijil Kejayaan!
        </p>

        {/* Student Profile Inputs for Certificate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label
              htmlFor="student-name-input"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Nama Murid
            </label>
            <input
              id="student-name-input"
              type="text"
              value={studentName}
              onChange={(e) => onNameChange(e.target.value)}
              maxLength={32}
              placeholder="Contoh: Ahmad Iman"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label
              htmlFor="student-class-input"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Kelas
            </label>
            <input
              id="student-class-input"
              type="text"
              value={studentClass}
              onChange={(e) => onClassChange(e.target.value)}
              maxLength={20}
              placeholder="Contoh: 2 Al-Farabi"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Avatar Gender Style Toggle */}
        <div className="mb-5">
          <span className="block text-xs font-semibold text-slate-700 mb-1.5">
            Pilih Watak Murid 3D
          </span>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => onAvatarChange('lelaki')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                avatarStyle === 'lelaki'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              Murid Lelaki (Songkok)
            </button>
            <button
              type="button"
              onClick={() => onAvatarChange('perempuan')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                avatarStyle === 'perempuan'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              Murid Perempuan (Tudung)
            </button>
          </div>
        </div>

        {/* Primary Start CTA */}
        <button
          type="button"
          data-start="true"
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-display text-lg font-bold shadow-md transition-all cursor-pointer whitespace-nowrap"
        >
          <GoldStarSvg className="w-5 h-5" />
          <span>Mula Kembara</span>
        </button>
      </div>

      {/* Single flat control-hint line in bottom safe margin */}
      <div className="self-center pointer-events-none">
        <p className="px-4 py-1.5 rounded-lg bg-[#11241A]/85 text-amber-50 text-xs font-medium tracking-wide">
          WASD / Anak Panah Gerak · Space Lompat · Seret Tetikus Pusing Kamera · E / Klik Interaksi · Esc Jeda
        </p>
      </div>
    </div>
  );
};
