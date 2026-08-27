/**
 * DeepFocus Soundboard & Preset Controller
 */

class Soundboard {
  constructor() {
    this.presets = {
      'cozy-rain': { label: 'Preset: Cozy Rain', rain: 60, thunder: 30, fire: 20, synth: 50, wind: 15 },
      'rainy-cafe': { label: 'Preset: Rainy Cafe', rain: 45, thunder: 10, fire: 40, synth: 60, wind: 5 },
      'midnight-forest': { label: 'Preset: Deep Forest', rain: 20, thunder: 5, fire: 25, synth: 30, wind: 75 },
      'cyber-ambient': { label: 'Preset: Cyberpunk', rain: 35, thunder: 45, fire: 5, synth: 85, wind: 20 }
    };

    this.init();
  }

  init() {
    this.attachSliderListeners();
    this.attachPresetListeners();
    this.attachMuteListener();
  }

  attachSliderListeners() {
    const sliders = document.querySelectorAll('input[data-sound]');
    sliders.forEach(slider => {
      slider.addEventListener('input', (e) => {
        const soundType = slider.dataset.sound;
        const val = parseInt(slider.value, 10);
        
        // Update percent label text
        const textElem = slider.parentElement.querySelector('.sound-vol-text');
        if (textElem) textElem.innerText = `${val}%`;

        // Update Web Audio Engine
        if (window.audioEngine) {
          window.audioEngine.setVolume(soundType, val);
        }
      });
    });

    const resetBtn = document.getElementById('reset-mixer-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        sliders.forEach(s => {
          s.value = 0;
          s.dispatchEvent(new Event('input'));
        });
      });
    }
  }

  attachPresetListeners() {
    const presetsBtn = document.getElementById('presets-btn');
    const presetsMenu = document.getElementById('presets-menu');
    const labelElem = document.getElementById('current-preset-label');

    if (presetsBtn && presetsMenu) {
      presetsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        presetsMenu.classList.toggle('hidden');
      });

      document.addEventListener('click', () => {
        presetsMenu.classList.add('hidden');
      });
    }

    const presetOptions = document.querySelectorAll('.preset-option');
    presetOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        const key = opt.dataset.preset;
        if (this.presets[key]) {
          this.applyPreset(key);
          if (labelElem) labelElem.innerText = this.presets[key].label;
          if (presetsMenu) presetsMenu.classList.add('hidden');
        }
      });
    });
  }

  applyPreset(presetKey) {
    const p = this.presets[presetKey];
    if (!p) return;

    for (const [soundType, vol] of Object.entries(p)) {
      if (soundType === 'label') continue;
      const slider = document.querySelector(`input[data-sound="${soundType}"]`);
      if (slider) {
        slider.value = vol;
        slider.dispatchEvent(new Event('input'));
      }
    }
  }

  attachMuteListener() {
    const muteBtn = document.getElementById('master-mute-btn');

    const svgSpeakerOn = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;

    const svgSpeakerMuted = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;

    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        if (window.audioEngine) {
          const isMuted = window.audioEngine.toggleMute();
          muteBtn.innerHTML = isMuted ? svgSpeakerMuted : svgSpeakerOn;
        }
      });
    }
  }
}

window.soundboard = null;
document.addEventListener('DOMContentLoaded', () => {
  window.soundboard = new Soundboard();
});
