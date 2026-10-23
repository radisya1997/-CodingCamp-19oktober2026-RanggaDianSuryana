/* ============================================================
   app.js  –  Personal Dashboard
   Features : Greeting, Focus Timer, To-Do List, Quick Links
   Challenges: Light/Dark mode | Custom name | Change Pomodoro time
               Prevent duplicate tasks | Sort tasks
   ============================================================ */

'use strict';

/* ── LocalStorage keys ─────────────────────────────────────── */
const LS_THEME  = 'dashboard_theme';
const LS_NAME   = 'dashboard_name';
const LS_TASKS  = 'dashboard_tasks';
const LS_LINKS  = 'dashboard_links';
const LS_TIMER  = 'dashboard_timer_duration';

/* ── Utility helpers ───────────────────────────────────────── */
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

/* ================================================================
   1.  DATE / TIME / GREETING
   ================================================================ */
const greetingEl    = $('#greeting');
const datetimeEl    = $('#datetime');
const displayNameEl = $('#displayName');

const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

function getGreetingPhrase(hour) {
  if (hour >= 5  && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

function updateDateTime() {
  const now  = new Date();
  const h    = now.getHours();
  const m    = String(now.getMinutes()).padStart(2, '0');
  const s    = String(now.getSeconds()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr12 = h % 12 || 12;

  datetimeEl.innerHTML =
    `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}` +
    `<br>${hr12}:${m}:${s} ${ampm}`;

  const name   = lsGet(LS_NAME, '');
  const phrase = getGreetingPhrase(h);
  greetingEl.textContent = name ? `${phrase}, ${name}!` : `${phrase}!`;
}

setInterval(updateDateTime, 1000);
updateDateTime();

/* ================================================================
   2.  LIGHT / DARK MODE  (Challenge)
   ================================================================ */
const themeToggle = $('#themeToggle');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeToggle.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  lsSet(LS_THEME, theme);
}

(function initTheme() {
  const saved = lsGet(LS_THEME, null);
  if (saved) { applyTheme(saved); return; }
  // Auto-detect system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
})();

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

/* ================================================================
   3.  CUSTOM NAME  (Challenge)
   ================================================================ */
const nameModal    = $('#nameModal');
const nameInput    = $('#nameInput');
const editNameBtn  = $('#editNameBtn');
const saveNameBtn  = $('#saveNameBtn');
const cancelNameBtn = $('#cancelNameBtn');
const backdrop     = $('#modalBackdrop');

function updateDisplayName() {
  const name = lsGet(LS_NAME, '');
  displayNameEl.textContent = name || '(no name set)';
}

function openNameModal() {
  nameInput.value = lsGet(LS_NAME, '');
  nameModal.classList.remove('hidden');
  backdrop.classList.remove('hidden');
  nameInput.focus();
}

function closeNameModal() {
  nameModal.classList.add('hidden');
  backdrop.classList.add('hidden');
}

editNameBtn.addEventListener('click', openNameModal);

saveNameBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  lsSet(LS_NAME, name);
  updateDisplayName();
  updateDateTime();   // refresh greeting immediately
  closeNameModal();
});

cancelNameBtn.addEventListener('click', closeNameModal);

nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter')  saveNameBtn.click();
  if (e.key === 'Escape') closeNameModal();
});

// Show name modal on first visit
(function initName() {
  updateDisplayName();
  if (!lsGet(LS_NAME, '')) openNameModal();
})();

/* ================================================================
   4.  FOCUS TIMER  +  Change Pomodoro time (Challenge)
   ================================================================ */
const timerDisplay   = $('#timerDisplay');
const timerProgress  = $('#timerProgress');
const startBtn       = $('#startBtn');
const stopBtn        = $('#stopBtn');
const resetBtn       = $('#resetBtn');
const timerDurationInput = $('#timerDuration');
const applyDuration  = $('#applyDuration');

let timerDuration   = lsGet(LS_TIMER, 25) * 60;  // seconds
let timeRemaining   = timerDuration;
let timerInterval   = null;
let timerRunning    = false;

// Sync input with saved value
timerDurationInput.value = timerDuration / 60;

function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function updateTimerUI() {
  timerDisplay.textContent = formatTime(timeRemaining);
  const pct = (timeRemaining / timerDuration) * 100;
  timerProgress.style.width = `${pct}%`;
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  startBtn.disabled = true;
  stopBtn.disabled  = false;

  timerInterval = setInterval(() => {
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      startBtn.disabled = false;
      stopBtn.disabled  = true;
      timeRemaining = 0;
      updateTimerUI();
      // Visual & audio cue when done
      timerDisplay.style.color = 'var(--success)';
      if (Notification.permission === 'granted') {
        new Notification('🍅 Focus session complete!', { body: 'Time for a break.' });
      }
      return;
    }
    timeRemaining--;
    updateTimerUI();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  startBtn.disabled = false;
  stopBtn.disabled  = true;
}

function resetTimer() {
  stopTimer();
  timeRemaining = timerDuration;
  timerDisplay.style.color = '';
  updateTimerUI();
}

// Challenge: Apply custom Pomodoro duration
applyDuration.addEventListener('click', () => {
  const val = parseInt(timerDurationInput.value, 10);
  if (isNaN(val) || val < 1 || val > 120) {
    timerDurationInput.style.borderColor = 'var(--danger)';
    setTimeout(() => { timerDurationInput.style.borderColor = ''; }, 1500);
    return;
  }
  timerDuration  = val * 60;
  timeRemaining  = timerDuration;
  lsSet(LS_TIMER, val);
  timerDisplay.style.color = '';
  updateTimerUI();
  stopTimer();
});

timerDurationInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') applyDuration.click();
});

startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener ('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);

// Request notification permission once
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

updateTimerUI();

/* ================================================================
   5.  TO-DO LIST  +  Prevent duplicates (Challenge) + Sort (Challenge)
   ================================================================ */
const todoInput   = $('#todoInput');
const addTaskBtn  = $('#addTaskBtn');
const todoListEl  = $('#todoList');
const taskCountEl = $('#taskCount');
const sortSelect  = $('#sortSelect');
const editModal   = $('#editModal');
const editInput   = $('#editInput');
const saveEditBtn = $('#saveEditBtn');
const cancelEditBtn = $('#cancelEditBtn');

let tasks = lsGet(LS_TASKS, []);
// Ensure each task has an id
tasks = tasks.map((t, i) => ({ id: t.id ?? Date.now() + i, text: t.text, done: t.done ?? false }));

let editingTaskId = null;

function saveTasks() { lsSet(LS_TASKS, tasks); }

function normText(s) { return s.trim().toLowerCase(); }

function getSortedTasks() {
  const mode = sortSelect.value;
  const copy = [...tasks];
  if (mode === 'asc')  return copy.sort((a, b) => normText(a.text).localeCompare(normText(b.text)));
  if (mode === 'desc') return copy.sort((a, b) => normText(b.text).localeCompare(normText(a.text)));
  if (mode === 'done') return copy.sort((a, b) => Number(a.done) - Number(b.done));
  return copy;  // default: insertion order
}

function renderTasks() {
  const sorted = getSortedTasks();
  todoListEl.innerHTML = '';

  sorted.forEach((task) => {
    const li = document.createElement('li');
    li.className = `todo-item${task.done ? ' done' : ''}`;
    li.dataset.id = task.id;

    li.innerHTML = `
      <input type="checkbox" class="todo-checkbox" aria-label="Mark as done"
             ${task.done ? 'checked' : ''} />
      <span class="todo-text">${escapeHtml(task.text)}</span>
      <div class="todo-actions">
        <button class="edit-btn"   title="Edit task"   aria-label="Edit task">✏️</button>
        <button class="delete-btn" title="Delete task" aria-label="Delete task">🗑️</button>
      </div>`;

    todoListEl.appendChild(li);
  });

  // Update count
  const done  = tasks.filter(t => t.done).length;
  const total = tasks.length;
  taskCountEl.textContent = total ? `${done}/${total} done` : 'No tasks yet';
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function addTask() {
  const text = todoInput.value.trim();
  if (!text) return;

  // Challenge: Prevent duplicate tasks (case-insensitive)
  const isDuplicate = tasks.some(t => normText(t.text) === normText(text));
  if (isDuplicate) {
    todoInput.style.borderColor = 'var(--danger)';
    todoInput.title = 'Task already exists!';
    setTimeout(() => {
      todoInput.style.borderColor = '';
      todoInput.title = '';
    }, 1800);
    return;
  }

  tasks.push({ id: Date.now(), text, done: false });
  saveTasks();
  renderTasks();
  todoInput.value = '';
  todoInput.focus();
}

// Toggle done
todoListEl.addEventListener('change', (e) => {
  if (!e.target.classList.contains('todo-checkbox')) return;
  const id = +e.target.closest('.todo-item').dataset.id;
  const task = tasks.find(t => t.id === id);
  if (task) { task.done = e.target.checked; saveTasks(); renderTasks(); }
});

// Edit / Delete
todoListEl.addEventListener('click', (e) => {
  const item = e.target.closest('.todo-item');
  if (!item) return;
  const id = +item.dataset.id;

  if (e.target.classList.contains('edit-btn')) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    editingTaskId = id;
    editInput.value = task.text;
    editModal.classList.remove('hidden');
    backdrop.classList.remove('hidden');
    editInput.focus();
  }

  if (e.target.classList.contains('delete-btn')) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
  }
});

// Save edit
saveEditBtn.addEventListener('click', () => {
  const newText = editInput.value.trim();
  if (!newText) return;
  const task = tasks.find(t => t.id === editingTaskId);
  if (task) {
    task.text = newText;
    saveTasks();
    renderTasks();
  }
  closeEditModal();
});

function closeEditModal() {
  editModal.classList.add('hidden');
  // Only hide backdrop if name modal is also closed
  if (nameModal.classList.contains('hidden')) {
    backdrop.classList.add('hidden');
  }
  editingTaskId = null;
}

cancelEditBtn.addEventListener('click', closeEditModal);

editInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter')  saveEditBtn.click();
  if (e.key === 'Escape') closeEditModal();
});

addTaskBtn.addEventListener('click', addTask);
todoInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });
sortSelect.addEventListener('change', renderTasks);

// Close modal on backdrop click
backdrop.addEventListener('click', () => {
  closeEditModal();
  closeNameModal();
});

renderTasks();

/* ================================================================
   6.  QUICK LINKS
   ================================================================ */
const linkNameInput = $('#linkName');
const linkUrlInput  = $('#linkUrl');
const addLinkBtn    = $('#addLinkBtn');
const linksListEl   = $('#linksList');

let links = lsGet(LS_LINKS, []);

function saveLinks() { lsSet(LS_LINKS, links); }

function renderLinks() {
  linksListEl.innerHTML = '';

  if (links.length === 0) {
    linksListEl.innerHTML = '<span style="color:var(--text-muted);font-size:.85rem;">No links yet. Add one above!</span>';
    return;
  }

  links.forEach((link, index) => {
    const chip = document.createElement('div');
    chip.className = 'link-chip';
    chip.innerHTML = `
      <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer"
         aria-label="Open ${escapeHtml(link.name)}">${escapeHtml(link.name)}</a>
      <button class="remove-link" data-index="${index}" title="Remove link" aria-label="Remove ${escapeHtml(link.name)}">✕</button>`;
    linksListEl.appendChild(chip);
  });
}

function addLink() {
  const name = linkNameInput.value.trim();
  let   url  = linkUrlInput.value.trim();
  if (!name || !url) return;

  // Auto-prepend https:// if missing
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  links.push({ name, url });
  saveLinks();
  renderLinks();
  linkNameInput.value = '';
  linkUrlInput.value  = '';
  linkNameInput.focus();
}

linksListEl.addEventListener('click', (e) => {
  if (!e.target.classList.contains('remove-link')) return;
  const idx = +e.target.dataset.index;
  links.splice(idx, 1);
  saveLinks();
  renderLinks();
});

addLinkBtn.addEventListener('click', addLink);
linkUrlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addLink(); });
linkNameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') linkUrlInput.focus(); });

renderLinks();
