/**
 * Web Audio Ambient Weather Soundscape Generator
 * Synthesizes subtle soothing soundscapes (rain, gentle breeze, calm night) using Web Audio API nodes.
 * Requires zero external audio files and complies with browser audio autoplay guidelines.
 */

export class WeatherAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.gainNode = null;
    this.noiseNode = null;
    this.filterNode = null;
    this.isPlaying = false;
    this.currentMode = 'breeze'; // 'rain' | 'breeze' | 'night'
  }

  init() {
    if (this.audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.audioCtx = new AudioContextClass();
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
    this.gainNode.connect(this.audioCtx.destination);
  }

  setWeatherMode(category) {
    if (category === 'rain' || category === 'thunder') {
      this.currentMode = 'rain';
    } else if (category === 'clear') {
      this.currentMode = 'breeze';
    } else {
      this.currentMode = 'breeze';
    }

    if (this.isPlaying) {
      this.updateNodes();
    }
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
    this.gainNode.gain.cancelScheduledValues(this.audioCtx.currentTime);
    this.gainNode.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(0.12, this.audioCtx.currentTime + 1.5);
  }

  stop() {
    if (!this.audioCtx || !this.isPlaying) return;

    this.gainNode.gain.cancelScheduledValues(this.audioCtx.currentTime);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.audioCtx.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 1.0);

    setTimeout(() => {
      this.tearDownSoundscape();
      this.isPlaying = false;
    }, 1100);
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

    // Generate 5-second noise buffer
    const bufferSize = this.audioCtx.sampleRate * 4;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    // Pink-noise / soft atmospheric noise
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    this.noiseNode = this.audioCtx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    // Filter node
    this.filterNode = this.audioCtx.createBiquadFilter();
    this.updateNodes();

    this.noiseNode.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.noiseNode.start();
  }

  updateNodes() {
    if (!this.filterNode || !this.audioCtx) return;

    if (this.currentMode === 'rain') {
      // Deeper lowpass for rain patter
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setTargetAtTime(900, this.audioCtx.currentTime, 0.5);
      this.filterNode.Q.setTargetAtTime(1.5, this.audioCtx.currentTime, 0.5);
    } else {
      // Gentle wind breeze
      this.filterNode.type = 'bandpass';
      this.filterNode.frequency.setTargetAtTime(420, this.audioCtx.currentTime, 0.5);
      this.filterNode.Q.setTargetAtTime(2.2, this.audioCtx.currentTime, 0.5);
    }
  }

  tearDownSoundscape() {
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      } catch {
        // Ignore
      }
      this.noiseNode = null;
    }
    if (this.filterNode) {
      try {
        this.filterNode.disconnect();
      } catch {
        // Ignore
      }
      this.filterNode = null;
    }
  }
}

export const weatherAudio = new WeatherAudioEngine();
