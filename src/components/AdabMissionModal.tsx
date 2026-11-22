import React, { useEffect, useState } from 'react';
import { CheckCircle2, Volume2, X } from 'lucide-react';
import { soundManager } from '../game/audio';
import { AdabMission } from '../game/types';
import { AdabStepIllustration, GoldStarSvg } from './AdabIllustrations';

interface AdabMissionModalProps {
  mission: AdabMission;
  onComplete: (missionId: AdabMission['id']) => void;
  onMistake: () => void;
  onClose: () => void;
}

export const AdabMissionModal: React.FC<AdabMissionModalProps> = ({
  mission,
  onComplete,
  onMistake,
  onClose,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [washCount, setWashCount] = useState(0);
  const [postureOk, setPostureOk] = useState(false);
  const [doaHeard, setDoaHeard] = useState(false);
  const [sipsCount, setSipsCount] = useState(0);
  const [cooledDown, setCooledDown] = useState(false);
  const [clearedPlates, setClearedPlates] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'warn'; text: string } | null>(null);

  useEffect(() => {
    soundManager.speakNarration(mission.audioNarration, setIsSpeaking);
    return () => {
      soundManager.stopNarration();
    };
  }, [mission]);

  const handlePlayAudio = () => {
    soundManager.speakNarration(mission.audioNarration, setIsSpeaking);
  };

  const progressRatio = (() => {
    switch (mission.interactiveKind) {
      case 'wash-hands':
      case 'wash-hands-after':
        return washCount / 3;
      case 'recite-doa-before':
        return (postureOk ? 0.5 : 0) + (doaHeard ? 0.5 : 0);
      case 'choose-right-hand':
        return feedback?.type === 'ok' ? 1 : 0.15;
      case 'drink-three-sips':
        return ((cooledDown ? 1 : 0) + sipsCount) / 4;
      case 'clear-and-thanks':
        return (doaHeard ? 0.5 : 0) + (clearedPlates ? 0.5 : 0);
    }
  })();

  const canFinish = (() => {
    switch (mission.interactiveKind) {
      case 'wash-hands':
      case 'wash-hands-after':
        return washCount >= 3;
      case 'recite-doa-before':
        return postureOk && doaHeard;
      case 'choose-right-hand':
        return feedback?.type === 'ok';
      case 'drink-three-sips':
        return cooledDown && sipsCount >= 3;
      case 'clear-and-thanks':
        return doaHeard && clearedPlates;
    }
  })();

  const handleWrong = (msg: string) => {
    soundManager.playWrongChoice();
    onMistake();
    setFeedback({ type: 'warn', text: msg });
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 28, 20, 0.72)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-modal-title"
    >
      <div className="w-full max-w-xl rounded-2xl border-2 border-amber-900/20 bg-[#FDFBF5] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 bg-emerald-800 text-white">
          <div className="min-w-0">
            <p className="text-xs font-medium text-emerald-200">
              {mission.stationName} · +{mission.starsReward} Bintang Emas
            </p>
            <h2 id="mission-modal-title" className="font-display text-lg md:text-xl font-bold truncate">
              {mission.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.stopNarration();
              onClose();
            }}
            aria-label="Tutup tetingkap misi"
            className="p-2 rounded-lg bg-emerald-900/60 hover:bg-emerald-900 text-white cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-4">
          {/* Interactive Animated SVG Illustration */}
          <AdabStepIllustration kind={mission.interactiveKind} progress={progressRatio} />

          {/* Interactive Audio Player Row */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={handlePlayAudio}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer shrink-0 whitespace-nowrap"
              >
                <Volume2 className="w-4 h-4" />
                <span>Dengar Audio</span>
              </button>
              <p className="text-xs text-slate-700 line-clamp-2">{mission.subtitle}</p>
            </div>
            {/* Animated Audio Wave Bars when speaking */}
            <div className="flex items-end gap-1 h-5 shrink-0" aria-hidden="true">
              {[0, 1, 2, 3].map((bar) => (
                <span
                  key={bar}
                  className={`w-1 rounded-full bg-emerald-600 ${
                    isSpeaking ? 'animate-wave-bar h-5' : 'h-1.5 opacity-40'
                  }`}
                  style={isSpeaking ? { animationDelay: `${bar * 120}ms` } : undefined}
                />
              ))}
            </div>
          </div>

          {/* Arabic Doa Card if present */}
          {mission.arabicText && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1.5">
              <p dir="rtl" className="text-xl md:text-2xl font-bold text-emerald-950 leading-loose">
                {mission.arabicText}
              </p>
              <p className="text-xs font-semibold text-emerald-800">{mission.rumiText}</p>
              <p className="text-xs text-slate-600">Maksud: &ldquo;{mission.meaningText}&rdquo;</p>
            </div>
          )}

          {/* Interactive Activity Area per Mission */}
          {(mission.interactiveKind === 'wash-hands' || mission.interactiveKind === 'wash-hands-after') && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">
                Aktiviti: Tekan butang gosok tangan sebanyak 3 kali sehingga berbuih bersih ({washCount}/3).
              </p>
              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-all duration-200"
                  style={{ width: `${Math.min(100, (washCount / 3) * 100)}%` }}
                />
              </div>
              <button
                type="button"
                disabled={washCount >= 3}
                onClick={() => {
                  soundManager.playWaterBubble();
                  const next = Math.min(3, washCount + 1);
                  setWashCount(next);
                  if (next === 3) {
                    soundManager.playStepSuccess();
                    setFeedback({ type: 'ok', text: 'Bagus! Kedua-dua belah tangan sudah bersih.' });
                  }
                }}
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-emerald-600 text-white font-display font-bold text-sm cursor-pointer transition-colors"
              >
                {washCount >= 3 ? 'Tangan Sudah Bersih!' : `Gosok Tangan dengan Sabun (${washCount}/3)`}
              </button>
            </div>
          )}

          {mission.interactiveKind === 'recite-doa-before' && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">
                1. Pilih cara duduk sebelum makan:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playStepSuccess();
                    setPostureOk(true);
                    setFeedback({ type: 'ok', text: 'Tepat! Kita hendaklah duduk dengan tertib.' });
                  }}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold cursor-pointer transition-colors ${
                    postureOk
                      ? 'bg-emerald-100 border-emerald-600 text-emerald-950'
                      : 'bg-white border-slate-300 hover:border-emerald-500 text-slate-800'
                  }`}
                >
                  Duduk bersila atau di kerusi dengan sopan
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleWrong('Kurang tepat! Islam melarang makan sambil berjalan atau berlari.')
                  }
                  className="p-3 rounded-xl border border-slate-300 bg-white hover:border-rose-400 text-left text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  Makan sambil berdiri dan berlari
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundManager.playStepSuccess();
                  soundManager.speakNarration(
                    `Bismillahirrahmanirrahim. ${mission.rumiText ?? ''}`,
                    setIsSpeaking
                  );
                  setDoaHeard(true);
                }}
                className={`w-full py-2.5 rounded-xl border font-bold text-xs cursor-pointer transition-colors ${
                  doaHeard
                    ? 'bg-emerald-100 border-emerald-600 text-emerald-900'
                    : 'bg-amber-100 border-amber-400 hover:bg-amber-200 text-amber-950'
                }`}
              >
                {doaHeard ? '✓ Doa Sebelum Makan Telah Dibaca' : '2. Tekan untuk Baca Doa Sebelum Makan'}
              </button>
            </div>
          )}

          {mission.interactiveKind === 'choose-right-hand' && (
            <div className="space-y-2.5">
              <p className="text-sm font-semibold text-slate-800">
                Pilih adab mengambil makanan yang betul:
              </p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playStepSuccess();
                    setFeedback({
                      type: 'ok',
                      text: 'Cemerlang! Makan dengan tangan kanan dan ambil lauk yang paling dekat.',
                    });
                  }}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold cursor-pointer transition-colors ${
                    feedback?.type === 'ok'
                      ? 'bg-emerald-100 border-emerald-600 text-emerald-950'
                      : 'bg-white border-slate-300 hover:border-emerald-500 text-slate-800'
                  }`}
                >
                  Gunakan tangan kanan dan ambil makanan yang paling dekat dahulu
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleWrong('Ingat ya, Rasulullah mengajar kita makan menggunakan tangan kanan.')
                  }
                  className="p-3 rounded-xl border border-slate-300 bg-white hover:border-rose-400 text-left text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  Gunakan tangan kiri dan capai makanan yang paling jauh
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleWrong('Jangan gelojoh! Ambil makanan yang dekat dan kunyah perlahan.')
                  }
                  className="p-3 rounded-xl border border-slate-300 bg-white hover:border-rose-400 text-left text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  Suap dengan gelojoh sambil bercakap dengan mulut penuh
                </button>
              </div>
            </div>
          )}

          {mission.interactiveKind === 'drink-three-sips' && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">
                1. Air masih panas. Apa tindakan beradab?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playStepSuccess();
                    setCooledDown(true);
                    setFeedback({ type: 'ok', text: 'Betul! Tunggu sejuk tanpa meniup air.' });
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                    cooledDown
                      ? 'bg-emerald-100 border-emerald-600 text-emerald-950'
                      : 'bg-white border-slate-300 hover:border-emerald-500 text-slate-800'
                  }`}
                >
                  Tunggu sebentar supaya sejuk (tidak tiup)
                </button>
                <button
                  type="button"
                  onClick={() => handleWrong('Elakkan meniup ke dalam air panas! Tunggu air suam dahulu.')}
                  className="p-2.5 rounded-xl border border-slate-300 bg-white hover:border-rose-400 text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  Tiup kuat-kuat ke dalam gelas
                </button>
              </div>
              <button
                type="button"
                disabled={!cooledDown || sipsCount >= 3}
                onClick={() => {
                  soundManager.playSip();
                  const next = Math.min(3, sipsCount + 1);
                  setSipsCount(next);
                  if (next === 3) {
                    soundManager.playStepSuccess();
                    setFeedback({ type: 'ok', text: 'Alhamdulillah! Selesai minum 3 teguk dengan tenang.' });
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 disabled:text-slate-600 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                {sipsCount >= 3
                  ? '✓ Selesai Minum 3 Teguk'
                  : `2. Minum dengan Tangan Kanan — Teguk (${sipsCount}/3)`}
              </button>
            </div>
          )}

          {mission.interactiveKind === 'clear-and-thanks' && (
            <div className="space-y-2.5">
              <p className="text-sm font-semibold text-slate-800">
                Lengkapkan kedua-dua langkah penutup makan:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playStepSuccess();
                    soundManager.speakNarration(
                      `Alhamdulillah. ${mission.rumiText ?? ''}`,
                      setIsSpeaking
                    );
                    setDoaHeard(true);
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold cursor-pointer ${
                    doaHeard
                      ? 'bg-emerald-100 border-emerald-600 text-emerald-950'
                      : 'bg-amber-100 border-amber-400 hover:bg-amber-200 text-amber-950'
                  }`}
                >
                  {doaHeard ? '✓ Doa Selepas Makan Dibaca' : '1. Baca Doa Selepas Makan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playStepSuccess();
                    setClearedPlates(true);
                    setFeedback({ type: 'ok', text: 'Hebat! Meja kemas dan bersih.' });
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold cursor-pointer ${
                    clearedPlates
                      ? 'bg-emerald-100 border-emerald-600 text-emerald-950'
                      : 'bg-violet-100 border-violet-400 hover:bg-violet-200 text-violet-950'
                  }`}
                >
                  {clearedPlates ? '✓ Pinggan Telah Dikemas' : '2. Susun Pinggan ke Dulang'}
                </button>
              </div>
            </div>
          )}

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border ${
                feedback.type === 'ok'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* Step Tips List */}
          <div className="pt-2 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-700 mb-1.5">Nota Ringkas Adab:</p>
            <ul className="space-y-1 text-xs text-slate-600 list-disc pl-4">
              {mission.stepTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Complete Action */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              soundManager.stopNarration();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Kembali
          </button>
          <button
            type="button"
            disabled={!canFinish}
            onClick={() => {
              soundManager.stopNarration();
              onComplete(mission.id);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:text-slate-500 text-white font-display font-bold text-sm cursor-pointer transition-colors whitespace-nowrap"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Tuntut +{mission.starsReward} Bintang Emas</span>
            <GoldStarSvg className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
