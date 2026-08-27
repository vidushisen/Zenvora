/**
 * DeepFocus Web Audio API Sound Generator Engine
 * Generates realistic ambient & meditation sounds dynamically offline!
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.isInitialized = false;

    // Track Nodes
    this.tracks = {
      rain: { gain: null, source: null, volume: 0.6 },
      thunder: { gain: null, source: null, volume: 0.3 },
      fire: { gain: null, source: null, volume: 0.2 },
      synth: { gain: null, source: null, volume: 0.5 },
      wind: { gain: null, source: null, volume: 0.15 },
      birds: { gain: null, source: null, volume: 0.4 },
      meditation: { gain: null, source: null, volume: 0.5 }
    };
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this._setupRainNode();
      this._setupThunderNode();
      this._setupFireNode();
      this._setupSynthNode();
      this._setupWindNode();
      this._setupBirdsNode();
      this._setupMeditationNode();

      this.isInitialized = true;
    } catch (e) {
      console.warn("Web Audio API not supported or user gesture needed.", e);
    }
  }

  resume() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  setVolume(soundType, valPercent) {
    this.resume();
    const normVal = Math.max(0, Math.min(1, valPercent / 100));
    if (this.tracks[soundType]) {
      this.tracks[soundType].volume = normVal;
      if (this.tracks[soundType].gain && this.ctx) {
        this.tracks[soundType].gain.gain.setTargetAtTime(normVal, this.ctx.currentTime, 0.05);
      }
    }
  }

  /**
   * Rain Sound Node (Filtered Pink Noise)
   */
  _setupRainNode() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      let white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.08;
      b6 = white * 0.115926;
    }

    const whiteSource = this.ctx.createBufferSource();
    whiteSource.buffer = noiseBuffer;
    whiteSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = this.tracks.rain.volume;

    whiteSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    whiteSource.start(0);
    this.tracks.rain.gain = gainNode;
  }

  /**
   * Thunder Rumble Node
   */
  _setupThunderNode() {
    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 180;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = this.tracks.thunder.volume;

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    noiseSource.start(0);
    this.tracks.thunder.gain = gainNode;

    setInterval(() => {
      if (this.ctx && this.tracks.thunder.volume > 0.05 && Math.random() > 0.6) {
        const now = this.ctx.currentTime;
        gainNode.gain.setValueAtTime(this.tracks.thunder.volume, now);
        gainNode.gain.exponentialRampToValueAtTime(this.tracks.thunder.volume * 2.5, now + 0.8);
        gainNode.gain.exponentialRampToValueAtTime(this.tracks.thunder.volume * 0.1, now + 3.5);
      }
    }, 9000);
  }

  /**
   * Fireplace Crackle
   */
  _setupFireNode() {
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      if (Math.random() > 0.996) {
        output[i] = (Math.random() * 2 - 1) * 0.9;
      } else {
        output[i] = (Math.random() * 2 - 1) * 0.02;
      }
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2200;
    filter.Q.value = 1.2;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = this.tracks.fire.volume;

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    noiseSource.start(0);
    this.tracks.fire.gain = gainNode;
  }

  /**
   * Lo-Fi Synth Ambient Pad Generator
   */
  _setupSynthNode() {
    const gainNode = this.ctx.createGain();
    gainNode.gain.value = this.tracks.synth.volume;

    const freqs = [130.81, 164.81, 196.00, 246.94, 293.66]; // C3, E3, G3, B3, D4

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500 + idx * 80;

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.2 + idx * 0.05;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 1.5;

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const oscGain = this.ctx.createGain();
      oscGain.gain.value = 0.08;

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(gainNode);

      osc.start(0);
      lfo.start(0);
    });

    gainNode.connect(this.masterGain);
    this.tracks.synth.gain = gainNode;
  }

  /**
   * Forest Wind Generator
   */
  _setupWindNode() {
    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 3.0;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = this.tracks.wind.volume;

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    noiseSource.start(0);
    this.tracks.wind.gain = gainNode;

    setInterval(() => {
      if (this.ctx && this.tracks.wind.volume > 0.02) {
        const now = this.ctx.currentTime;
        const targetFreq = 300 + Math.random() * 400;
        filter.frequency.setTargetAtTime(targetFreq, now, 2.5);
      }
    }, 4000);
  }

  /**
   * Relaxing Forest Birds Generator (Multi-species realistic bird call phrases)
   */
  _setupBirdsNode() {
    const gainNode = this.ctx.createGain();
    gainNode.gain.value = this.tracks.birds.volume;
    gainNode.connect(this.masterGain);
    this.tracks.birds.gain = gainNode;

    // Trigger realistic bird phrase sequences periodically
    setInterval(() => {
      if (this.ctx && this.tracks.birds.volume > 0.02 && Math.random() > 0.35) {
        this._playBirdPhrase(gainNode);
      }
    }, 2800);
  }

  _playBirdPhrase(targetGainNode) {
    if (!this.ctx) return;
    
    // Choose bird call species type (0: Nightingale/Robin trill, 1: Morning Sparrow whistle, 2: Wood Warbler soft call)
    const callType = Math.floor(Math.random() * 3);
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panner) {
      panner.pan.value = (Math.random() * 1.6) - 0.8; // Random spatial placement (left to right)
      panner.connect(targetGainNode);
    }

    const outputNode = panner || targetGainNode;
    const numNotes = Math.floor(Math.random() * 3) + 2; // 2 to 4 notes in a phrase

    for (let i = 0; i < numNotes; i++) {
      const noteDelay = i * (0.1 + Math.random() * 0.08);
      
      if (callType === 0) {
        this._playRobinTrillNote(outputNode, noteDelay);
      } else if (callType === 1) {
        this._playSparrowWhistleNote(outputNode, noteDelay);
      } else {
        this._playWarblerSoftNote(outputNode, noteDelay);
      }
    }
  }

  _playRobinTrillNote(targetNode, delaySec) {
    const now = this.ctx.currentTime + delaySec;
    const baseFreq = 2600 + Math.random() * 600;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    osc.type = 'sine';
    lfo.type = 'sine';
    lfo.frequency.value = 14 + Math.random() * 6; // Rapid micro-vibrato
    lfoGain.gain.value = 80;

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq + 500, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(baseFreq - 200, now + 0.11);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(targetNode);

    osc.start(now);
    lfo.start(now);
    osc.stop(now + 0.13);
    lfo.stop(now + 0.13);
  }

  _playSparrowWhistleNote(targetNode, delaySec) {
    const now = this.ctx.currentTime + delaySec;
    const startFreq = 3000 + Math.random() * 400;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq + 700, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(startFreq + 300, now + 0.14);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(targetNode);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  _playWarblerSoftNote(targetNode, delaySec) {
    const now = this.ctx.currentTime + delaySec;
    const startFreq = 2200 + Math.random() * 300;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq - 400, now + 0.09);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(targetNode);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  /**
   * Meditation Tibetan Singing Bowl & Drone Generator
   */
  _setupMeditationNode() {
    const gainNode = this.ctx.createGain();
    gainNode.gain.value = this.tracks.meditation.volume;

    // Deep 432Hz & 216Hz Healing Meditation Drones
    const freqs = [108.00, 216.00, 432.00, 648.00];

    freqs.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      // Slow amplitude breathing modulation (LFO)
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.08 + index * 0.02; // Very slow 12-second breath pulse
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.04;

      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);

      oscGain.gain.value = 0.12 / (index + 1);

      osc.connect(oscGain);
      oscGain.connect(gainNode);

      osc.start(0);
      lfo.start(0);
    });

    gainNode.connect(this.masterGain);
    this.tracks.meditation.gain = gainNode;

    // Periodic gentle singing bowl strike
    setInterval(() => {
      if (this.ctx && this.tracks.meditation.volume > 0.05 && Math.random() > 0.5) {
        this._strikeSingingBowl(gainNode);
      }
    }, 12000);
  }

  _strikeSingingBowl(targetGainNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const bowlFreq = 340; // Warm singing bowl fundamental

    const osc = this.ctx.createOscillator();
    const strikeGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(bowlFreq, now);

    strikeGain.gain.setValueAtTime(0, now);
    strikeGain.gain.linearRampToValueAtTime(0.25, now + 0.1);
    strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 5.0); // Long 5-second ring sustain

    osc.connect(strikeGain);
    strikeGain.connect(targetGainNode);

    osc.start(now);
    osc.stop(now + 5.2);
  }

  /**
   * Play Completion Chime for Pomodoro Timer
   */
  playCompletionChime() {
    this.resume();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = this.ctx.currentTime + index * 0.15;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 1.2);
    });
  }
}

// Global Singleton Engine
window.audioEngine = new AudioEngine();
