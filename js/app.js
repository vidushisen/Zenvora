/**
 * DeepFocus Main Entry Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Initialize Web Audio API on first user gesture
  const initAudioOnGesture = () => {
    if (window.audioEngine) {
      window.audioEngine.init();
      window.audioEngine.resume();
    }
    document.removeEventListener('click', initAudioOnGesture);
    document.removeEventListener('keydown', initAudioOnGesture);
  };

  document.addEventListener('click', initAudioOnGesture);
  document.addEventListener('keydown', initAudioOnGesture);

  console.log("⚡ Zenvora Studio Initialized Successfully!");
});
