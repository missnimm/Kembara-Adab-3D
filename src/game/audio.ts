// Procedural Web Audio API sound effects + interactive narration controller

class SoundManager {
  private ctx: AudioContext | null = null;
  private muted = false;
  private speechTimer: number | null = null;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stopNarration();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.14,
    delay = 0,
    slideTo?: number
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), now + duration);
    }
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick() {
    this.playTone(540, 0.06, 'triangle', 0.1, 0, 680);
  }

  public playFootstep() {
    const pitchVar = 0.92 + Math.random() * 0.16;
    this.playTone(135 * pitchVar, 0.055, 'triangle', 0.06, 0, 90);
  }

  public playJump() {
    const pitchVar = 0.95 + Math.random() * 0.1;
    this.playTone(280 * pitchVar, 0.18, 'sine', 0.15, 0, 560 * pitchVar);
  }

  public playLand() {
    this.playTone(150, 0.09, 'triangle', 0.12, 0, 75);
  }

  public playWaterBubble() {
    const base = 460 + Math.random() * 240;
    this.playTone(base, 0.09, 'sine', 0.11, 0, base * 1.45);
  }

  public playSip() {
    this.playTone(360, 0.12, 'sine', 0.12, 0, 490);
    this.playTone(520, 0.1, 'triangle', 0.08, 0.08, 620);
  }

  public playStarCollect() {
    const notes = [587.33, 739.99, 880, 1174.66]; // D5, F#5, A5, D6
    notes.forEach((n, idx) => {
      this.playTone(n, 0.18, 'triangle', 0.14, idx * 0.055);
    });
  }

  public playWrongChoice() {
    this.playTone(230, 0.16, 'sawtooth', 0.08, 0, 175);
    this.playTone(175, 0.2, 'sawtooth', 0.07, 0.14, 140);
  }

  public playStepSuccess() {
    this.playTone(523.25, 0.14, 'triangle', 0.14, 0);
    this.playTone(659.25, 0.16, 'triangle', 0.14, 0.08);
    this.playTone(783.99, 0.24, 'sine', 0.15, 0.16);
  }

  public playMissionComplete() {
    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, i) => {
      this.playTone(freq, 0.28, 'triangle', 0.15, i * 0.09);
    });
    this.playTone(1318.5, 0.45, 'sine', 0.14, 0.36);
  }

  public playVictoryAnthem() {
    const melody = [
      { f: 523.25, t: 0, d: 0.18 },
      { f: 659.25, t: 0.16, d: 0.18 },
      { f: 783.99, t: 0.32, d: 0.18 },
      { f: 1046.5, t: 0.48, d: 0.35 },
      { f: 880.0, t: 0.82, d: 0.18 },
      { f: 1046.5, t: 1.0, d: 0.6 },
    ];
    melody.forEach((m) => {
      this.playTone(m.f, m.d, 'triangle', 0.16, m.t);
    });
  }

  public speakNarration(
    text: string,
    onStateChange?: (speaking: boolean) => void
  ) {
    this.stopNarration();
    // Play a pleasant gentle chime when narration starts
    this.playTone(587.33, 0.12, 'sine', 0.09, 0);
    this.playTone(880.0, 0.15, 'sine', 0.08, 0.08);

    if (this.muted) {
      onStateChange?.(false);
      return;
    }

    onStateChange?.(true);

    const hasSpeech =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance !== 'undefined';

    if (hasSpeech) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const malayVoice =
          voices.find((v) => v.lang.toLowerCase().startsWith('ms')) ??
          voices.find((v) => v.lang.toLowerCase().startsWith('id')) ??
          voices.find((v) => v.lang.toLowerCase().startsWith('en'));
        if (malayVoice) {
          utter.voice = malayVoice;
          utter.lang = malayVoice.lang;
        } else {
          utter.lang = 'ms-MY';
        }
        utter.rate = 0.94;
        utter.pitch = 1.08;

        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          if (this.speechTimer !== null) {
            window.clearTimeout(this.speechTimer);
            this.speechTimer = null;
          }
          onStateChange?.(false);
        };

        utter.onend = finish;
        utter.onerror = finish;
        window.speechSynthesis.speak(utter);

        // Safety fallback timer in case headless Chromium never fires onend
        const estMs = Math.min(8500, Math.max(2500, text.length * 60));
        this.speechTimer = window.setTimeout(finish, estMs);
        return;
      } catch {
        // Fall through to timer-based visual narration pulse
      }
    }

    const estMs = Math.min(6000, Math.max(2200, text.length * 50));
    this.speechTimer = window.setTimeout(() => {
      onStateChange?.(false);
      this.speechTimer = null;
    }, estMs);
  }

  public stopNarration() {
    if (this.speechTimer !== null) {
      window.clearTimeout(this.speechTimer);
      this.speechTimer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }
}

export const soundManager = new SoundManager();
