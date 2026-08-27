/**
 * DeepFocus Pomodoro Timer Engine
 */

class PomodoroTimer {
  constructor() {
    this.mode = 'focus'; // 'focus', 'short-break', 'long-break'
    this.durations = {
      'focus': 25 * 60,
      'short-break': 5 * 60,
      'long-break': 15 * 60
    };
    this.timeLeft = this.durations[this.mode];
    this.isRunning = false;
    this.timerInterval = null;

    // Stats
    this.completedSessions = parseInt(localStorage.getItem('df_completed_sessions') || '0', 10);
    this.totalFocusMinutes = parseInt(localStorage.getItem('df_focus_minutes') || '0', 10);

    // DOM Elements
    this.displayElem = document.getElementById('timer-display');
    this.statusElem = document.getElementById('timer-status-text');
    this.progressRing = document.getElementById('timer-progress-ring');
    this.toggleBtn = document.getElementById('toggle-timer-btn');
    this.btnText = document.getElementById('timer-btn-text');
    this.playIcon = document.getElementById('play-pause-icon');
    this.sessionsElem = document.getElementById('completed-sessions-count');
    this.minutesElem = document.getElementById('total-focus-minutes');

    this.init();
  }

  init() {
    this.updateDisplay();
    this.updateStatsDisplay();
    this.attachEventListeners();
  }

  attachEventListeners() {
    // Mode Buttons
    const modeBtns = document.querySelectorAll('.timer-mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = btn.dataset.mode;
        const mins = parseInt(btn.dataset.minutes, 10);
        
        modeBtns.forEach(b => b.classList.remove('active', 'bg-indigo-600', 'text-white', 'shadow-lg'));
        modeBtns.forEach(b => b.classList.add('text-slate-400'));
        btn.classList.add('active', 'bg-indigo-600', 'text-white', 'shadow-lg');
        btn.classList.remove('text-slate-400');

        this.setMode(mode, mins);
      });
    });

    // Start / Pause Button
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggleTimer());
    }

    // Reset Button
    const resetBtn = document.getElementById('reset-timer-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetTimer());
    }

    // Skip / Complete Button
    const skipBtn = document.getElementById('skip-timer-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => this.completeSession());
    }
  }

  setMode(mode, minutes) {
    this.pauseTimer();
    this.mode = mode;
    this.durations[mode] = minutes * 60;
    this.timeLeft = this.durations[mode];
    
    if (this.statusElem) {
      if (mode === 'focus') this.statusElem.innerText = 'Deep Focus Session';
      else if (mode === 'short-break') this.statusElem.innerText = 'Short Relax Break';
      else this.statusElem.innerText = 'Long Rest & Recharge';
    }

    this.updateDisplay();
  }

  toggleTimer() {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    if (window.audioEngine) window.audioEngine.resume();
    this.isRunning = true;
    if (this.toggleBtn) {
      this.toggleBtn.innerHTML = '<i data-lucide="pause" class="w-5 h-5 fill-current"></i><span>Pause Focus</span>';
      if (window.lucide) lucide.createIcons();
    }

    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateDisplay();
      } else {
        this.completeSession();
      }
    }, 1000);
  }

  pauseTimer() {
    this.isRunning = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.toggleBtn) {
      this.toggleBtn.innerHTML = '<i data-lucide="play" class="w-5 h-5 fill-current"></i><span>Resume Focus</span>';
      if (window.lucide) lucide.createIcons();
    }
  }

  resetTimer() {
    this.pauseTimer();
    this.timeLeft = this.durations[this.mode];
    if (this.btnText) this.btnText.innerText = 'Start Focus';
    this.updateDisplay();
  }

  completeSession() {
    this.pauseTimer();

    // Play chime sound
    if (window.audioEngine) {
      window.audioEngine.playCompletionChime();
    }

    if (this.mode === 'focus') {
      const addedMins = Math.round(this.durations['focus'] / 60);
      this.completedSessions++;
      this.totalFocusMinutes += addedMins;

      localStorage.setItem('df_completed_sessions', this.completedSessions.toString());
      localStorage.setItem('df_focus_minutes', this.totalFocusMinutes.toString());
      this.updateStatsDisplay();
    }

    alert(this.mode === 'focus' ? '🎉 Focus Session Completed! Take a well deserved break!' : '☕ Break Finished! Ready to focus?');
    this.resetTimer();
  }

  updateDisplay() {
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (this.displayElem) this.displayElem.innerText = formatted;
    document.title = `(${formatted}) Zenvora Studio`;

    // SVG Progress Ring Calculation (Circumference ~ 276.46)
    const totalTime = this.durations[this.mode];
    const progressFraction = this.timeLeft / totalTime;
    const strokeDashoffset = 276.46 * (1 - progressFraction);

    if (this.progressRing) {
      this.progressRing.style.strokeDashoffset = strokeDashoffset;
    }
  }

  updateStatsDisplay() {
    if (this.sessionsElem) this.sessionsElem.innerText = this.completedSessions;
    if (this.minutesElem) this.minutesElem.innerText = `${this.totalFocusMinutes}m`;
  }
}

window.pomodoroTimer = null;
document.addEventListener('DOMContentLoaded', () => {
  window.pomodoroTimer = new PomodoroTimer();
});
