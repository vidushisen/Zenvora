/**
 * DeepFocus Task Manager & Scratchpad Engine
 */

class ScratchpadManager {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('df_tasks') || '[]');
    this.scratchText = localStorage.getItem('df_scratchpad') || '';

    this.taskListElem = document.getElementById('task-list');
    this.taskForm = document.getElementById('add-task-form');
    this.taskInput = document.getElementById('task-input');
    this.badgeElem = document.getElementById('tasks-progress-badge');
    this.textarea = document.getElementById('scratchpad-textarea');
    this.sidebarContainer = document.getElementById('sidebar-container');

    this.init();
  }

  init() {
    this.renderTasks();
    this.initScratchpad();
    this.attachEventListeners();
  }

  attachEventListeners() {
    if (this.taskForm) {
      this.taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = this.taskInput.value.trim();
        if (text) {
          this.addTask(text);
          this.taskInput.value = '';
        }
      });
    }

    const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
    if (toggleSidebarBtn && this.sidebarContainer) {
      toggleSidebarBtn.addEventListener('click', () => {
        this.sidebarContainer.classList.toggle('hidden');
      });
    }
  }

  addTask(text) {
    const newTask = {
      id: Date.now(),
      text,
      completed: false
    };
    this.tasks.push(newTask);
    this.saveTasks();
    this.renderTasks();
  }

  toggleTask(id) {
    this.tasks = this.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    this.saveTasks();
    this.renderTasks();
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveTasks();
    this.renderTasks();
  }

  saveTasks() {
    localStorage.setItem('df_tasks', JSON.stringify(this.tasks));
  }

  renderTasks() {
    if (!this.taskListElem) return;
    this.taskListElem.innerHTML = '';

    if (this.tasks.length === 0) {
      this.taskListElem.innerHTML = `
        <li class="text-xs text-slate-500 italic text-center py-4">No study targets added yet!</li>
      `;
    } else {
      this.tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition text-xs ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
          <div class="flex items-center gap-2 flex-1 cursor-pointer" onclick="scratchpadManager.toggleTask(${task.id})">
            <input type="checkbox" ${task.completed ? 'checked' : ''} class="rounded border-slate-600 text-indigo-600 focus:ring-0 cursor-pointer">
            <span class="text-slate-200 truncate">${this.escapeHtml(task.text)}</span>
          </div>
          <button onclick="scratchpadManager.deleteTask(${task.id})" class="text-slate-500 hover:text-rose-400 p-1 transition" title="Delete Task">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        `;
        this.taskListElem.appendChild(li);
      });
    }

    if (window.lucide) lucide.createIcons();

    // Update Progress Badge
    const completedCount = this.tasks.filter(t => t.completed).length;
    if (this.badgeElem) {
      this.badgeElem.innerText = `${completedCount}/${this.tasks.length}`;
    }
  }

  initScratchpad() {
    if (this.textarea) {
      this.textarea.value = this.scratchText;
      this.textarea.addEventListener('input', (e) => {
        localStorage.setItem('df_scratchpad', e.target.value);
      });
    }
  }

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
}

window.scratchpadManager = null;
document.addEventListener('DOMContentLoaded', () => {
  window.scratchpadManager = new ScratchpadManager();
});
