/**
 * Web Audio Ambient Weather Soundscape Synthesizer
 * Real-time procedural audio engine generating weather-synchronized atmospheric soundscapes:
 * - Rain: soothing rain patter with subtle randomized water droplet impacts.
 * - Thunder: torrential rainstorms with periodic rolling sub-bass thunder rumbles.
 * - Snow: gentle icy winter breeze whistling softly through cold air.
 * - Sunny Day: warm sunlit breeze with occasional melodic distant birdsong chirps.
 * - Clear Night: peaceful nocturnal ambience with rhythmical field crickets.
 * - Clouds / Fog: atmospheric rolling wind drone with slow resonant breath.
 *
 * Uses 100% Web Audio API native synthesis (zero external audio files, zero latency, offline-ready).
 * Respects browser autoplay requirements.
 */

export class WeatherAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.noiseNode = null;
    this.filterNode = null;
    this.lfoNode = null;
    this.lfoGain = null;
    this.isPlaying = false;
    this.weatherState = {
      category: 'clear', // 'clear' | 'clouds' | 'rain' | 'snow' | 'thunder' | 'fog'
      isDay: true,
      windSpeed: 12,
      weatherCode: 0
    };

    // Sub-generator interval timers
    this.thunderInterval = null;
    this.dropletInterval = null;
    this.birdInterval = null;
    this.cricketInterval = null;
  }

  init() {
    if (this.audioCtx) return;
    const AudioContextClass = typeof window !== 'undefined'
      ? (window.AudioContext || window.webkitAudioContext)
      : null;
    if (!AudioContextClass) return;

    this.audioCtx = new AudioContextClass();
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime);
    this.masterGain.connect(this.audioCtx.destination);
  }

  setWeather(options = {}) {
    this.weatherState = {
      category: options.category || this.weatherState.category || 'clear',
      isDay: options.isDay !== undefined ? Boolean(options.isDay) : this.weatherState.isDay,
      windSpeed: Number(options.windSpeed) || this.weatherState.windSpeed || 12,
      weatherCode: Number(options.weatherCode) || this.weatherState.weatherCode || 0
    };

    if (this.isPlaying && this.audioCtx && this.audioCtx.state === 'running') {
      this.reconfigureSoundscape();
    }
  }

  setWeatherMode(category) {
    this.setWeather({ category });
  }

  async start() {
    this.init();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    this.buildSoundscape();
    this.isPlaying = true;

    // Smooth fade in
    const now = this.audioCtx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0.0001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.12, now + 1.2);
  }

  stop() {
    if (!this.audioCtx || !this.isPlaying) return;

    const now = this.audioCtx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

    setTimeout(() => {
      this.tearDownSoundscape();
      this.isPlaying = false;
    }, 850);
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  buildSoundscape() {
    this.tearDownSoundscape();
    if (!this.audioCtx) return;

    // 1. Generate 4-second pink-noise buffer for natural atmospheric texture
    const sampleRate = this.audioCtx.sampleRate;
    const bufferSize = sampleRate * 4;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.1;
      b6 = white * 0.115926;
    }

    this.noiseNode = this.audioCtx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    // 2. Primary atmospheric Biquad filter
    this.filterNode = this.audioCtx.createBiquadFilter();

    // 3. Low-frequency oscillator (LFO) for organic wind swells
    this.lfoNode = this.audioCtx.createOscillator();
    this.lfoGain = this.audioCtx.createGain();
    this.lfoNode.frequency.value = 0.18; // Slow breathing wave
    this.lfoGain.gain.value = 80;
    this.lfoNode.connect(this.lfoGain);
    this.lfoGain.connect(this.filterNode.frequency);
    this.lfoNode.start();

    // Connect graph
    this.noiseNode.connect(this.filterNode);
    this.filterNode.connect(this.masterGain);
    this.noiseNode.start();

    this.reconfigureSoundscape();
  }

  reconfigureSoundscape() {
    if (!this.audioCtx || !this.filterNode) return;
    const now = this.audioCtx.currentTime;
    const cat = this.weatherState.category;
    const isDay = this.weatherState.isDay;
    const wind = Math.min(60, Math.max(5, this.weatherState.windSpeed));

    // Clear active procedural sub-generators
    this.stopSubGenerators();

    switch (cat) {
      case 'rain': {
        // Crisp, soothing rainfall patter
        this.filterNode.type = 'bandpass';
        this.filterNode.frequency.setTargetAtTime(1200 + wind * 8, now, 0.4);
        this.filterNode.Q.setTargetAtTime(1.2, now, 0.4);
        if (this.lfoGain) this.lfoGain.gain.setTargetAtTime(60, now, 0.4);

        // Water droplet impact synthesizer
        this.startDropletGenerator();
        break;
      }

      case 'thunder': {
        // Deep torrential storm
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.setTargetAtTime(950 + wind * 10, now, 0.4);
        this.filterNode.Q.setTargetAtTime(1.6, now, 0.4);
        if (this.lfoGain) this.lfoGain.gain.setTargetAtTime(120, now, 0.4);

        this.startDropletGenerator(180);
        this.startThunderGenerator();
        break;
      }

      case 'snow': {
        // High, delicate, whistling winter breeze
        this.filterNode.type = 'bandpass';
        this.filterNode.frequency.setTargetAtTime(800 + wind * 6, now, 0.5);
        this.filterNode.Q.setTargetAtTime(3.2, now, 0.5);
        if (this.lfoGain) this.lfoGain.gain.setTargetAtTime(90, now, 0.5);
        break;
      }

      case 'fog':
      case 'clouds': {
        // Muted rolling atmospheric wind
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.setTargetAtTime(450 + wind * 5, now, 0.5);
        this.filterNode.Q.setTargetAtTime(1.8, now, 0.5);
        if (this.lfoGain) this.lfoGain.gain.setTargetAtTime(70, now, 0.5);
        break;
      }

      case 'clear':
      default: {
        if (isDay) {
          // Warm sunny day: soft gentle breeze with pleasant distant birdsong
          this.filterNode.type = 'bandpass';
          this.filterNode.frequency.setTargetAtTime(420 + wind * 4, now, 0.5);
          this.filterNode.Q.setTargetAtTime(2.0, now, 0.5);
          if (this.lfoGain) this.lfoGain.gain.setTargetAtTime(45, now, 0.5);

          this.startBirdsongGenerator();
        } else {
          // Clear night: calm nocturnal breeze with subtle cricket chirps
          this.filterNode.type = 'bandpass';
          this.filterNode.frequency.setTargetAtTime(360 + wind * 3, now, 0.5);
          this.filterNode.Q.setTargetAtTime(2.4, now, 0.5);
          if (this.lfoGain) this.lfoGain.gain.setTargetAtTime(35, now, 0.5);

          this.startCricketGenerator();
        }
        break;
      }
    }
  }

  /* -------------------------------------------------------------
   * PROCEDURAL SUB-GENERATORS
   * ------------------------------------------------------------- */

  /**
   * Water Droplets: short delicate pitch-decay sine blips
   */
  startDropletGenerator(intervalMs = 320) {
    this.dropletInterval = setInterval(() => {
      if (!this.isPlaying || !this.audioCtx || this.audioCtx.state !== 'running') return;
      if (Math.random() < 0.35) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const dropGain = this.audioCtx.createGain();

      const baseFreq = 1400 + Math.random() * 800;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, now + 0.045);

      dropGain.gain.setValueAtTime(0.0001, now);
      dropGain.gain.linearRampToValueAtTime(0.045 + Math.random() * 0.035, now + 0.006);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(dropGain);
      dropGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.055);
    }, intervalMs);
  }

  /**
   * Thunder Rumbles: low-frequency sub-bass noise rumble with long decay
   */
  startThunderGenerator() {
    const triggerRumble = () => {
      if (!this.isPlaying || !this.audioCtx || this.audioCtx.state !== 'running') return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const rumbleGain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(55, now);
      osc.frequency.linearRampToValueAtTime(36, now + 2.8);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(110, now);

      rumbleGain.gain.setValueAtTime(0.0001, now);
      rumbleGain.gain.linearRampToValueAtTime(0.18, now + 0.35);
      rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(filter);
      filter.connect(rumbleGain);
      rumbleGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 3.3);
    };

    // First rumble after 3 seconds, then periodically
    setTimeout(triggerRumble, 2800);
    this.thunderInterval = setInterval(triggerRumble, 9500);
  }

  /**
   * Distant Birdsong: melodic double-tone FM sine chirp
   */
  startBirdsongGenerator() {
    this.birdInterval = setInterval(() => {
      if (!this.isPlaying || !this.audioCtx || this.audioCtx.state !== 'running') return;
      if (Math.random() < 0.45) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const chirpGain = this.audioCtx.createGain();

      const melody = [2600, 3100, 2900, 3400];
      const startPitch = melody[Math.floor(Math.random() * melody.length)];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startPitch, now);
      osc.frequency.linearRampToValueAtTime(startPitch + 400, now + 0.08);
      osc.frequency.linearRampToValueAtTime(startPitch + 150, now + 0.16);

      chirpGain.gain.setValueAtTime(0.0001, now);
      chirpGain.gain.linearRampToValueAtTime(0.025, now + 0.03);
      chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(chirpGain);
      chirpGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.24);
    }, 4200);
  }

  /**
   * Night Crickets: rapid micro-pulse oscillations
   */
  startCricketGenerator() {
    this.cricketInterval = setInterval(() => {
      if (!this.isPlaying || !this.audioCtx || this.audioCtx.state !== 'running') return;
      if (Math.random() < 0.3) return;

      const now = this.audioCtx.currentTime;
      const pulses = 3 + Math.floor(Math.random() * 2);

      for (let p = 0; p < pulses; p++) {
        const pulseTime = now + p * 0.055;
        const osc = this.audioCtx.createOscillator();
        const pulseGain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(4600 + (Math.random() * 150 - 75), pulseTime);

        pulseGain.gain.setValueAtTime(0.0001, pulseTime);
        pulseGain.gain.linearRampToValueAtTime(0.02, pulseTime + 0.008);
        pulseGain.gain.exponentialRampToValueAtTime(0.0001, pulseTime + 0.035);

        osc.connect(pulseGain);
        pulseGain.connect(this.masterGain);

        osc.start(pulseTime);
        osc.stop(pulseTime + 0.04);
      }
    }, 2400);
  }

  stopSubGenerators() {
    if (this.thunderInterval) {
      clearInterval(this.thunderInterval);
      this.thunderInterval = null;
    }
    if (this.dropletInterval) {
      clearInterval(this.dropletInterval);
      this.dropletInterval = null;
    }
    if (this.birdInterval) {
      clearInterval(this.birdInterval);
      this.birdInterval = null;
    }
    if (this.cricketInterval) {
      clearInterval(this.cricketInterval);
      this.cricketInterval = null;
    }
  }

  tearDownSoundscape() {
    this.stopSubGenerators();

    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      } catch {}
      this.noiseNode = null;
    }
    if (this.lfoNode) {
      try {
        this.lfoNode.stop();
        this.lfoNode.disconnect();
      } catch {}
      this.lfoNode = null;
    }
    if (this.lfoGain) {
      try {
        this.lfoGain.disconnect();
      } catch {}
      this.lfoGain = null;
    }
    if (this.filterNode) {
      try {
        this.filterNode.disconnect();
      } catch {}
      this.filterNode = null;
    }
  }

  getSoundscapeDescription() {
    const cat = this.weatherState.category;
    const isDay = this.weatherState.isDay;
    switch (cat) {
      case 'rain': return 'Soothing Rain & Gentle Droplets';
      case 'thunder': return 'Thunderstorm & Rolling Rumbles';
      case 'snow': return 'Soft Whispering Winter Breeze';
      case 'clouds': return 'Rolling Atmospheric Cloud Breeze';
      case 'fog': return 'Peaceful Misty Wind';
      case 'clear':
      default:
        return isDay ? 'Warm Sunlit Breeze & Distant Birdsong' : 'Calm Starry Night & Field Crickets';
    }
  }
}

export const weatherAudio = new WeatherAudioEngine();
