/**
 * DeepFocus Visual Theme & Fullscreen Manager
 */

class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('df_theme') || 'cozy-rain';
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.attachThemeListeners();
    this.attachFullscreenListener();
  }

  attachThemeListeners() {
    const themeCards = document.querySelectorAll('.theme-card');
    themeCards.forEach(card => {
      card.addEventListener('click', () => {
        const theme = card.dataset.theme;
        this.applyTheme(theme);
      });
    });
  }

  applyTheme(themeName) {
    this.currentTheme = themeName;
    localStorage.setItem('df_theme', themeName);

    // Update Body Class
    document.body.className = document.body.className.replace(/theme-[a-z-]+/g, '');
    document.body.classList.add(`theme-${themeName}`);

    // Update Theme Cards Active UI State
    const themeCards = document.querySelectorAll('.theme-card');
    themeCards.forEach(card => {
      if (card.dataset.theme === themeName) {
        card.classList.add('active', 'border-indigo-500/50', 'bg-indigo-500/10', 'text-white');
        card.classList.remove('border-white/10', 'bg-white/5', 'text-slate-300');
      } else {
        card.classList.remove('active', 'border-indigo-500/50', 'bg-indigo-500/10', 'text-white');
        card.classList.add('border-white/10', 'bg-white/5', 'text-slate-300');
      }
    });

    // Update Rain Canvas Particle Generator
    if (window.rainCanvas) {
      window.rainCanvas.setTheme(themeName);
    }
  }

  attachFullscreenListener() {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    // Keyboard Shortcut 'F' for Fullscreen
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'f' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        this.toggleFullscreen();
      }
    });
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Fullscreen error: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
}

window.themeManager = null;
document.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new ThemeManager();
});
