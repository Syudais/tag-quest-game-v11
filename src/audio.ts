export type AudioCue = 'slash' | 'fire' | 'frost' | 'storm' | 'heal' | 'guard' | 'dodge' | 'parry'
  | 'hit' | 'enemy-hit' | 'warning' | 'victory' | 'defeat' | 'level' | 'footstep';

const cueVolume: Record<AudioCue, number> = {
  slash: 0.5, fire: 0.4, frost: 0.38, storm: 0.32, heal: 0.36, guard: 0.35,
  dodge: 0.38, parry: 0.42, hit: 0.4, 'enemy-hit': 0.24, warning: 0.22,
  victory: 0.33, defeat: 0.32, level: 0.32, footstep: 0.12,
};

export class GameAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private musicGain?: GainNode;
  private musicSource?: MediaElementAudioSourceNode;
  private readonly music: HTMLAudioElement;
  private readonly buffers = new Map<AudioCue, Promise<AudioBuffer | undefined>>();
  private readonly active = new Set<AudioBufferSourceNode>();
  private readonly lastPlayed = new Map<AudioCue, number>();
  private muted = true;
  private reading = false;
  private unlocked = false;
  private disposed = false;
  private musicDuckUntil = 0;
  private musicRestoreTimer?: ReturnType<typeof setTimeout>;

  constructor(private assetUrl: (path: string) => string) {
    this.music = new Audio(assetUrl('assets/audio/music/Iron_Under_Winter_Skies.mp3'));
    this.music.loop = true;
    this.music.preload = 'metadata';
    document.addEventListener('pointerdown', this.unlock, { capture: true });
    document.addEventListener('keydown', this.unlock, { capture: true });
    document.addEventListener('visibilitychange', this.visibilityChanged);
  }

  private unlock = () => {
    if (this.disposed || this.muted || document.hidden) return;
    if (this.unlocked && this.context?.state === 'running') {
      if (this.music.paused) this.startMusic();
      return;
    }
    try {
      this.context ??= new AudioContext();
      if (!this.master) {
        this.master = this.context.createGain();
        this.master.gain.value = 0.72;
        const limiter = this.context.createDynamicsCompressor();
        limiter.threshold.value = -8; limiter.knee.value = 3;
        limiter.ratio.value = 12; limiter.attack.value = 0.003; limiter.release.value = 0.18;
        this.master.connect(limiter).connect(this.context.destination);
        this.musicGain = this.context.createGain();
        this.musicGain.gain.value = this.reading ? 0.045 : 0.16;
        this.musicSource = this.context.createMediaElementSource(this.music);
        this.musicSource.connect(this.musicGain).connect(this.master);
      }
      this.unlocked = true;
      void this.context.resume().then(() => this.startMusic()).catch(() => undefined);
      for (const cue of Object.keys(cueVolume) as AudioCue[]) void this.load(cue);
    } catch { /* Audio support is optional; the game remains playable. */ }
  };

  private startMusic() {
    if (this.disposed || this.muted || document.hidden || !this.unlocked) return;
    this.updateMusicGain();
    void this.music.play().catch(() => undefined);
  }

  private load(cue: AudioCue): Promise<AudioBuffer | undefined> {
    let pending = this.buffers.get(cue);
    if (!pending) {
      pending = fetch(this.assetUrl(`assets/audio/sfx/${cue}.mp3`))
        .then(response => { if (!response.ok) throw new Error('Audio unavailable'); return response.arrayBuffer(); })
        .then(bytes => this.context?.decodeAudioData(bytes))
        .catch(() => undefined);
      this.buffers.set(cue, pending);
    }
    return pending;
  }

  play(cue: AudioCue, accent = false) {
    if (this.disposed || this.muted || this.reading || document.hidden || !this.unlocked || !this.context) return;
    const now = performance.now(), last = this.lastPlayed.get(cue) ?? -Infinity;
    if (now - last < (cue === 'footstep' ? 280 : 140)) return;
    this.lastPlayed.set(cue, now);
    const requestedAt = now;
    void this.load(cue).then(buffer => {
      if (!buffer || this.disposed || this.muted || this.reading || document.hidden || !this.context || !this.master
        || performance.now() - requestedAt > 500) return;
      while (this.active.size >= 3) this.stopVoice(this.active.values().next().value!);
      const voice = this.context.createBufferSource(), gain = this.context.createGain();
      voice.buffer = buffer;
      gain.gain.value = cueVolume[cue] * (accent ? 1.12 : 1);
      voice.connect(gain).connect(this.master);
      voice.onended = () => { this.active.delete(voice); voice.disconnect(); gain.disconnect(); };
      this.active.add(voice); voice.start();
      if (['victory', 'defeat', 'level'].includes(cue)) {
        this.musicDuckUntil = performance.now() + Math.min(2200, buffer.duration * 1000);
        this.updateMusicGain();
        clearTimeout(this.musicRestoreTimer);
        this.musicRestoreTimer = setTimeout(() => this.updateMusicGain(), Math.min(2300, buffer.duration * 1000 + 80));
      }
    });
  }

  private stopVoice(voice: AudioBufferSourceNode) {
    this.active.delete(voice);
    try { voice.stop(); } catch { /* A voice may already have finished. */ }
  }

  private updateMusicGain() {
    if (!this.musicGain || !this.context) return;
    const target = this.muted || document.hidden ? 0
      : this.reading ? 0.045 : performance.now() < this.musicDuckUntil ? 0.075 : 0.16;
    this.musicGain.gain.cancelScheduledValues(this.context.currentTime);
    this.musicGain.gain.setTargetAtTime(target, this.context.currentTime, 0.18);
  }

  setMuted(value: boolean) {
    this.muted = value;
    if (value) {
      this.music.pause(); for (const voice of [...this.active]) this.stopVoice(voice);
      this.updateMusicGain();
    } else this.unlock();
  }

  setReadingPaused(value: boolean) {
    if (this.reading === value) return;
    this.reading = value;
    if (value) for (const voice of [...this.active]) this.stopVoice(voice);
    this.updateMusicGain();
  }

  private visibilityChanged = () => {
    if (document.hidden) {
      this.music.pause(); for (const voice of [...this.active]) this.stopVoice(voice);
      void this.context?.suspend().catch(() => undefined);
    } else if (!this.muted && this.unlocked) {
      void this.context?.resume().then(() => this.startMusic()).catch(() => undefined);
    }
  };

  destroy() {
    this.disposed = true; this.music.pause(); this.music.removeAttribute('src'); this.music.load();
    clearTimeout(this.musicRestoreTimer);
    for (const voice of [...this.active]) this.stopVoice(voice);
    document.removeEventListener('pointerdown', this.unlock, { capture: true });
    document.removeEventListener('keydown', this.unlock, { capture: true });
    document.removeEventListener('visibilitychange', this.visibilityChanged);
    this.musicSource?.disconnect(); void this.context?.close();
  }
}
