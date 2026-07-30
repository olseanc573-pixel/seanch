/* ==========================================================================
   SeanCH - Lofi Radio Web Audio Procedural Synthesizer Engine
   ========================================================================== */

class LofiSynthRadio {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.vinylGain = null;
    this.currentTrackIndex = 0;
    this.volume = 0.7;

    // Lofi Chord Progressions (frequencies in Hz)
    this.tracks = [
      {
        name: "♫ Lofi Study Session #01 • Dusk Chill",
        tempo: 68,
        chords: [
          [261.63, 329.63, 392.00, 493.88], // Cmaj7
          [220.00, 261.63, 329.63, 392.00], // Am7
          [146.83, 174.61, 220.00, 261.63], // Dm7
          [196.00, 246.94, 293.66, 349.23]  // G7
        ],
        bass: [130.81, 110.00, 73.42, 98.00]
      },
      {
        name: "♫ Lofi Study Session #02 • Midnight Code",
        tempo: 74,
        chords: [
          [174.61, 220.00, 261.63, 329.63], // Fmaj7
          [164.81, 196.00, 246.94, 293.66], // Em7
          [146.83, 174.61, 220.00, 261.63], // Dm7
          [130.81, 164.81, 196.00, 246.94]  // Cmaj7
        ],
        bass: [87.31, 82.41, 73.42, 65.41]
      },
      {
        name: "♫ Lofi Study Session #03 • Rainy Window",
        tempo: 64,
        chords: [
          [220.00, 261.63, 329.63, 440.00], // Am9
          [174.61, 220.00, 261.63, 349.23], // Fmaj7
          [130.81, 164.81, 196.00, 261.63], // Cmaj7
          [196.00, 246.94, 293.66, 392.00]  // G6
        ],
        bass: [110.00, 87.31, 65.41, 98.00]
      }
    ];

    this.timerId = null;
    this.step = 0;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();

      // Master Gain
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);

      // Start Vinyl Crackle Noise
      this.startVinylNoise();
    }
  }

  startVinylNoise() {
    // Generate buffer of white noise for vinyl crackle
    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Crackle simulation: mostly silent with occasional pops
      if (Math.random() < 0.003) {
        output[i] = (Math.random() * 2 - 1) * 0.4;
      } else {
        output[i] = (Math.random() * 2 - 1) * 0.015;
      }
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter to sound like old vinyl dust
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 1.2;

    this.vinylGain = this.audioCtx.createGain();
    this.vinylGain.gain.value = 0.15;

    noise.connect(filter);
    filter.connect(this.vinylGain);
    this.vinylGain.connect(this.masterGain);

    noise.start();
  }

  playChord(freqs, duration) {
    if (!this.audioCtx || !this.isPlaying) return;

    const now = this.audioCtx.currentTime;

    freqs.forEach(freq => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      osc.type = 'triangle'; // Warm lofi tone
      osc.frequency.setValueAtTime(freq, now);

      // Lowpass filter to create warm, muted lofi vibe
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(350, now + duration);

      // Soft envelope
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration - 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);
    });

    // Sub Bass
    const currentTrack = this.tracks[this.currentTrackIndex];
    const bassFreq = currentTrack.bass[this.step % currentTrack.bass.length];

    const bassOsc = this.audioCtx.createOscillator();
    const bassGain = this.audioCtx.createGain();
    const bassFilter = this.audioCtx.createBiquadFilter();

    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(bassFreq, now);

    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(200, now);

    bassGain.gain.setValueAtTime(0.001, now);
    bassGain.gain.linearRampToValueAtTime(0.18, now + 0.05);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + duration - 0.05);

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.masterGain);

    bassOsc.start(now);
    bassOsc.stop(now + duration);
  }

  start() {
    this.init();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.isPlaying = true;
    this.scheduleNextBeat();
  }

  scheduleNextBeat() {
    if (!this.isPlaying) return;

    const currentTrack = this.tracks[this.currentTrackIndex];
    const chordDuration = (60 / currentTrack.tempo) * 2; // 2 beats per chord

    const chords = currentTrack.chords;
    const currentChord = chords[this.step % chords.length];

    this.playChord(currentChord, chordDuration);

    this.step++;
    this.timerId = setTimeout(() => {
      this.scheduleNextBeat();
    }, chordDuration * 1000);
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    this.step = 0;
    if (this.isPlaying) {
      this.stop();
      this.start();
    }
    return this.tracks[this.currentTrackIndex].name;
  }

  setVolume(val) {
    this.volume = val;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
  }

  getCurrentTrackName() {
    return this.tracks[this.currentTrackIndex].name;
  }
}

// Global instance
window.lofiRadio = new LofiSynthRadio();
