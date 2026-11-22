import React from 'react';
import { InteractiveKind } from '../game/types';

export const GoldStarSvg: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M12 2.2l2.92 6.02 6.64.94-4.82 4.66 1.15 6.6L12 17.28l-5.89 3.14 1.15-6.6L2.44 9.16l6.64-.94L12 2.2z"
      fill="#FBBF24"
      stroke="#78350F"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M12 4.2l1.8 4.1 4.2.6-3.1 3 .7 4.2L12 14.1l-3.6 2 .7-4.2-3.1-3 4.2-.6L12 4.2z"
      fill="#FDE68A"
      opacity="0.55"
    />
  </svg>
);

export const BadgeEmblemSvg: React.FC<{
  badgeId: string;
  unlocked: boolean;
  accentColor: string;
  className?: string;
}> = ({ badgeId, unlocked, accentColor, className = 'w-14 h-14' }) => {
  const fill = unlocked ? accentColor : '#CBD5E1';
  const stroke = unlocked ? '#1E293B' : '#64748B';
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path
        d="M32 4l22 8v17c0 14.2-9.2 26.5-22 31C19.2 55.5 10 43.2 10 29V12l22-8z"
        fill={fill}
        stroke={stroke}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M32 10l16 5.8v13.2c0 11-6.9 20.6-16 24.4-9.1-3.8-16-13.4-16-24.4V15.8L32 10z"
        fill="#FFFFFF"
        opacity={unlocked ? '0.22' : '0.35'}
      />
      {badgeId === 'lencana-tangan-bersih' && (
        <g fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round">
          <path d="M23 36c0-6 4-11 9-11s9 5 9 11" />
          <circle cx="24" cy="22" r="3" fill="#FFFFFF" opacity="0.85" />
          <circle cx="38" cy="20" r="2.2" fill="#FFFFFF" opacity="0.85" />
          <circle cx="31" cy="17" r="2.5" fill="#FFFFFF" opacity="0.85" />
        </g>
      )}
      {badgeId === 'lencana-ahli-doa' && (
        <g fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 38c2-7 6-12 10-14v18H21z" />
          <path d="M43 38c-2-7-6-12-10-14v18h10z" />
          <path d="M32 17v4" />
        </g>
      )}
      {badgeId === 'lencana-tangan-kanan' && (
        <g fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M24 38V24a2.5 2.5 0 015 0v8" />
          <path d="M29 29v-7a2.5 2.5 0 015 0v7" />
          <path d="M34 30v-5a2.5 2.5 0 015 0v12c0 5-4 8-8 8h-3c-4 0-7-3-7-7v-3" />
        </g>
      )}
      {badgeId === 'lencana-minum-berhemah' && (
        <g fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 22h20l-2.5 20h-15L22 22z" />
          <path d="M24 31h16" />
          <path d="M27 17c0-2 2-2 2-4" />
          <path d="M35 17c0-2 2-2 2-4" />
        </g>
      )}
      {badgeId === 'lencana-pengemas-hebat' && (
        <g fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="32" cy="36" rx="12" ry="4" />
          <ellipse cx="32" cy="31" rx="10" ry="3.5" />
          <path d="M28 21l4 4 6-6" />
        </g>
      )}
      {badgeId === 'lencana-juara-adab' && (
        <path
          d="M32 17l3.6 7.4 8.2 1.2-5.9 5.7 1.4 8.1-7.3-3.9-7.3 3.9 1.4-8.1-5.9-5.7 8.2-1.2L32 17z"
          fill="#FEF08A"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
};

export const AdabStepIllustration: React.FC<{
  kind: InteractiveKind;
  progress: number; // 0 to 1
}> = ({ kind, progress }) => {
  return (
    <div className="relative w-full h-44 rounded-xl overflow-hidden border border-emerald-900/15 bg-[#EAF6F1] flex items-center justify-center">
      <svg viewBox="0 0 320 170" className="w-full h-full" aria-hidden="true">
        {/* Soft Islamic Arch Background */}
        <path
          d="M40 170V74C40 36 96 14 160 14C224 14 280 36 280 74V170H40Z"
          fill="#FFFFFF"
          opacity="0.7"
        />
        <path
          d="M52 170V76C52 44 100 24 160 24C220 24 268 44 268 76V170"
          fill="none"
          stroke="#10B981"
          strokeWidth="2"
          strokeDasharray="6 4"
          opacity="0.45"
        />

        {(kind === 'wash-hands' || kind === 'wash-hands-after') && (
          <g>
            {/* Brass Faucet */}
            <path
              d="M110 26h42c10 0 18 8 18 18v12h-16V44c0-2-2-4-4-4h-40V26z"
              fill="#D97706"
              stroke="#78350F"
              strokeWidth="2.5"
            />
            <rect x="122" y="16" width="22" height="10" rx="3" fill="#F59E0B" stroke="#78350F" strokeWidth="2" />
            {/* Flowing Water Stream */}
            <path
              d="M156 56h12v62c0 4-3 8-6 8s-6-4-6-8V56z"
              fill="#38BDF8"
              opacity={progress > 0.05 ? 0.82 : 0.25}
            />
            {/* Two Hands Washing */}
            <g transform={`translate(${Math.sin(progress * Math.PI * 4) * 5}, 0)`}>
              <rect x="115" y="102" width="44" height="24" rx="11" fill="#F3C6A5" stroke="#7C2D12" strokeWidth="2" />
              <rect x="155" y="106" width="44" height="24" rx="11" fill="#E8B490" stroke="#7C2D12" strokeWidth="2" />
            </g>
            {/* Soap Bubbles */}
            <circle cx="132" cy="92" r={6 + progress * 4} fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="2" className="animate-bubble-rise" />
            <circle cx="176" cy="88" r={5 + progress * 5} fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="2" className="animate-bubble-rise" />
            <circle cx="156" cy="80" r={4 + progress * 3} fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.5" />
            {/* Soap Bottle */}
            <rect x="225" y="96" width="28" height="44" rx="6" fill="#0EA5E9" stroke="#0369A1" strokeWidth="2" />
            <path d="M239 96V84h12" fill="none" stroke="#0369A1" strokeWidth="3" strokeLinecap="round" />
            {/* Basin */}
            <path d="M90 140h140l-14 22H104l-14-22z" fill="#E2E8F0" stroke="#475569" strokeWidth="2.5" />
          </g>
        )}

        {kind === 'recite-doa-before' && (
          <g>
            {/* Woven Mat */}
            <rect x="65" y="132" width="190" height="20" rx="6" fill="#D97706" stroke="#78350F" strokeWidth="2" />
            <rect x="75" y="136" width="170" height="12" rx="3" fill="#FDE68A" />
            {/* Seated Student Avatar */}
            <rect x="136" y="72" width="48" height="46" rx="10" fill="#059669" stroke="#064E3B" strokeWidth="2.5" />
            <circle cx="160" cy="48" r="22" fill="#F3C6A5" stroke="#7C2D12" strokeWidth="2.5" />
            {/* Songkok */}
            <path d="M140 38h40v-12c0-4-3-6-6-6h-28c-3 0-6 2-6 6v12z" fill="#1E293B" />
            {/* Smiling eyes */}
            <circle cx="152" cy="48" r="2.5" fill="#1E293B" />
            <circle cx="168" cy="48" r="2.5" fill="#1E293B" />
            <path d="M153 56c4 4 10 4 14 0" fill="none" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" />
            {/* Raised Prayer Hands */}
            <path
              d="M126 98c-6-10 2-20 12-18l12 6M194 98c6-10-2-20-12-18l-12 6"
              fill="#F3C6A5"
              stroke="#7C2D12"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Low Dish */}
            <ellipse cx="160" cy="126" rx="32" ry="8" fill="#FFFFFF" stroke="#475569" strokeWidth="2" />
            <path d="M142 124c4-10 32-10 36 0" fill="#FBBF24" />
          </g>
        )}

        {kind === 'choose-right-hand' && (
          <g>
            {/* Dining Table */}
            <rect x="62" y="114" width="196" height="22" rx="6" fill="#B45309" stroke="#78350F" strokeWidth="2.5" />
            {/* Far Dish (Left) */}
            <ellipse cx="105" cy="108" rx="28" ry="10" fill="#FFFFFF" stroke="#64748B" strokeWidth="2" />
            <circle cx="105" cy="102" r="9" fill="#F43F5E" />
            {/* Nearest Dish (Right / Front) */}
            <ellipse cx="205" cy="110" rx="32" ry="11" fill="#FFFFFF" stroke="#059669" strokeWidth="2.5" />
            <path d="M188 108c6-12 28-12 34 0z" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
            {/* Right Hand Highlight */}
            <g transform="translate(198, 42)">
              <rect x="0" y="14" width="28" height="32" rx="8" fill="#F3C6A5" stroke="#7C2D12" strokeWidth="2.2" />
              <path d="M6 14V4M14 14V2M22 14V6" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" />
              <circle cx="14" cy="30" r="16" fill="none" stroke="#10B981" strokeWidth="2.5" strokeDasharray="4 3" />
            </g>
            <text x="212" y="154" textAnchor="middle" fill="#065F46" fontSize="11" fontWeight="700">
              Tangan Kanan · Terdekat
            </text>
          </g>
        )}

        {kind === 'drink-three-sips' && (
          <g>
            {/* Table */}
            <rect x="70" y="128" width="180" height="16" rx="5" fill="#92400E" />
            {/* Water Pitcher */}
            <path d="M96 68h36l6 58H90l6-58z" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2.5" />
            <path d="M132 78c12 0 14 24 0 28" fill="none" stroke="#0284C7" strokeWidth="3.5" />
            {/* Drinking Glass with Water Level */}
            <path d="M174 72h42l-5 54h-32l-5-54z" fill="#E0F2FE" stroke="#0369A1" strokeWidth="2.5" />
            <path
              d={`M177 ${84 + progress * 28}h36l-3 ${40 - progress * 28}h-30l-3 ${-(40 - progress * 28)}z`}
              fill="#38BDF8"
            />
            {/* Gentle cooling steam lines (no blowing!) */}
            <path d="M186 58c-4-8 4-12 0-20" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M202 58c-4-8 4-12 0-20" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {kind === 'clear-and-thanks' && (
          <g>
            {/* Tray & Clean Stacked Plates */}
            <rect x="78" y="122" width="164" height="16" rx="6" fill="#7C3AED" stroke="#4C1D95" strokeWidth="2" />
            <ellipse cx="160" cy="116" rx="46" ry="9" fill="#FFFFFF" stroke="#475569" strokeWidth="2" />
            <ellipse cx="160" cy="105" rx="40" ry="8" fill="#F8FAFC" stroke="#475569" strokeWidth="2" />
            <ellipse cx="160" cy="95" rx="34" ry="7" fill="#FFFFFF" stroke="#475569" strokeWidth="2" />
            {/* Sparkles of Gratitude */}
            <path d="M108 66l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="#FBBF24" />
            <path d="M214 58l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#10B981" />
            <text x="160" y="54" textAnchor="middle" fill="#4C1D95" fontSize="15" fontWeight="700">
              Alhamdulillah!
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
