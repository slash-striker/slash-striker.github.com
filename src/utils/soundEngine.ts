class CyberAudioEngine {
  private ctx: AudioContext | null = null;
  private isEnabled = false;
  private droneGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private listeners = new Set<(enabled: boolean) => void>();

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public subscribe(listener: (enabled: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.isEnabled));
  }

  public async toggle(): Promise<boolean> {
    if (this.isEnabled) {
      this.disable();
    } else {
      await this.enable();
    }
    return this.isEnabled;
  }

  public async enable(): Promise<void> {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.isEnabled = true;
    this.startAmbientDrone();
    this.playActivationChord();
    this.notify();
  }

  public disable(): void {
    this.isEnabled = false;
    this.stopAmbientDrone();
    this.notify();
  }

  private startAmbientDrone(): void {
    if (!this.ctx || this.droneOsc1) return;

    const now = this.ctx.currentTime;

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.032, now + 1.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(190, now);
    filter.Q.setValueAtTime(3.5, now);

    // Deep sub-bass cosmic oscillators (D1 + A1 fifth)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(55, now); // A1

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(82.41, now); // E2

    // Slow LFO modulating the lowpass filter cutoff for breathing nebula feel
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.14, now);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(65, now);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    lfo.start(now);

    this.droneGain = masterGain;
    this.droneOsc1 = osc1;
    this.droneOsc2 = osc2;
    this.lfoOsc = lfo;
  }

  private stopAmbientDrone(): void {
    if (!this.ctx || !this.droneGain) return;
    const now = this.ctx.currentTime;
    try {
      this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
      this.droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    } catch {
      // ignore
    }

    const osc1 = this.droneOsc1;
    const osc2 = this.droneOsc2;
    const lfo = this.lfoOsc;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.lfoOsc = null;
    this.droneGain = null;

    window.setTimeout(() => {
      try {
        osc1?.stop();
        osc2?.stop();
        lfo?.stop();
      } catch {
        // ignore
      }
    }, 280);
  }

  public playHoverBlip(): void {
    if (!this.isEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.045);

    gain.gain.setValueAtTime(0.018, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.055);
  }

  public playClickPulse(): void {
    if (!this.isEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(1040, now + 0.09);

    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  private playActivationChord(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const freqs = [440, 554.37, 659.25, 880];
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.04);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.028, now + idx * 0.04 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.38);
    });
  }
}

export const cyberAudio = new CyberAudioEngine();
