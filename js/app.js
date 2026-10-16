/* ================================================
   Life Dashboard — app.js
   Vanilla JS, no frameworks
   ================================================ */

'use strict';

/* ------------------------------------------------
   Local Storage Keys
   ------------------------------------------------ */
const LS = {
  USERNAME:      'ld_username',
  THEME:         'ld_theme',
  TIMER_MINUTES: 'ld_timer_minutes',
  TASKS:         'ld_tasks',
  LINKS:         'ld_links',
};

/* ================================================
   1. THEME — apply before DOM paint to avoid flash
   ================================================ */
(function applyThemeEarly() {
  if (localStorage.getItem(LS.THEME) === 'dark') {
    document.body.classList.add('dark');
  }
})();

/* ================================================
   Run everything after DOM is ready
   ================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------
     DOM References
     ---------------------------------------------- */
  // Greeting
  const clockEl      = document.getElementById('clock');
  const dateEl       = document.getElementById('dateDisplay');
  const greetingEl   = document.getElementById('greetingText');
  const changeNameBtn = document.getElementById('changeNameBtn');

  // Modal
  const nameModal    = document.getElementById('nameModal');
  const nameInput    = document.getElementById('nameInput');
  const saveNameBtn  = document.getElementById('saveNameBtn');

  // Timer
  const timerDisplay  = document.getElementById('timerDisplay');
  const timerStatus   = document.getElementById('timerStatus');
  const timerDuration = document.getElementById('timerDuration');
  const durationMinus = document.getElementById('durationMinus');
  const durationPlus  = document.getElementById('durationPlus');
  const startBtn      = document.getElementById('startBtn');
  const stopBtn       = document.getElementById('stopBtn');
  const resetBtn      = document.getElementById('resetBtn');

  // Tasks
  const taskInput   = document.getElementById('taskInput');
  const addTaskBtn  = document.getElementById('addTaskBtn');
  const taskList    = document.getElementById('taskList');
  const taskError   = document.getElementById('taskError');
  const taskCounter = document.getElementById('taskCounter');
  const taskEmpty   = document.getElementById('taskEmpty');

  // Links
  const linkName   = document.getElementById('linkName');
  const linkUrl    = document.getElementById('linkUrl');
  const addLinkBtn = document.getElementById('addLinkBtn');
  const linksGrid  = document.getElementById('linksGrid');
  const linkError  = document.getElementById('linkError');
  const linksEmpty = document.getElementById('linksEmpty');

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');


  /* ================================================
     2. GREETING — Clock, Date, Greeting
     ================================================ */

  /**
   * Returns a greeting string based on current hour.
   * @param {number} hour - 0-23
   * @param {string} name - user's name or empty string
   */
  function getGreeting(hour, name) {
    let prefix;
    if (hour >= 5 && hour < 12) {
      prefix = 'Good Morning';
    } else if (hour >= 12 && hour < 18) {
      prefix = 'Good Afternoon';
    } else {
      prefix = 'Good Evening';
    }
    const suffix = name ? `, ${name} 👋` : '! 👋';
    return prefix + suffix;
  }

  /** Pads a number to 2 digits. */
  function pad(n) {
    return String(n).padStart(2, '0');
  }

  /** Full day/month name arrays. */
  const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];

  /** Updates clock, date, and greeting every second. */
  function updateClock() {
    const now  = new Date();
    const h    = now.getHours();
    const m    = now.getMinutes();
    const s    = now.getSeconds();

    clockEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;

    const dayName   = DAYS[now.getDay()];
    const monthName = MONTHS[now.getMonth()];
    const date      = now.getDate();
    const year      = now.getFullYear();
    dateEl.textContent = `${dayName}, ${monthName} ${date}, ${year}`;

    const name = localStorage.getItem(LS.USERNAME) || '';
    greetingEl.textContent = getGreeting(h, name);
  }

  updateClock();
  setInterval(updateClock, 1000);

  /* ================================================
     3. NAME MODAL
     ================================================ */

  function showModal() {
    nameInput.value = localStorage.getItem(LS.USERNAME) || '';
    nameModal.classList.add('active');
    // Focus input after transition
    setTimeout(() => nameInput.focus(), 260);
  }

  function hideModal() {
    nameModal.classList.remove('active');
  }

  function saveName() {
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      return;
    }
    localStorage.setItem(LS.USERNAME, name);
    hideModal();
    updateClock(); // refresh greeting immediately
  }

  // Show modal on first visit (no name saved)
  if (!localStorage.getItem(LS.USERNAME)) {
    showModal();
  }

  saveNameBtn.addEventListener('click', saveName);

  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveName();
    if (e.key === 'Escape') {
      // Only allow closing if a name is already set
      if (localStorage.getItem(LS.USERNAME)) hideModal();
    }
  });

  changeNameBtn.addEventListener('click', showModal);

  // Close modal on overlay click (only if name already set)
  nameModal.addEventListener('click', (e) => {
    if (e.target === nameModal && localStorage.getItem(LS.USERNAME)) {
      hideModal();
    }
  });


  /* ================================================
     4. FOCUS TIMER
     ================================================ */

  let timerInterval  = null;
  let timerRunning   = false;
  let totalSeconds   = 0;   // current countdown value
  let targetSeconds  = 0;   // full duration in seconds

  /** Reads the duration input and returns seconds. */
  function getDurationSeconds() {
    const mins = parseInt(timerDuration.value, 10);
    if (isNaN(mins) || mins < 1) return 25 * 60;
    if (mins > 120) return 120 * 60;
    return mins * 60;
  }

  /** Displays the current totalSeconds on the timer. */
  function renderTimer() {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    timerDisplay.textContent = `${pad(m)}:${pad(s)}`;
  }

  /** Sets button states based on running/stopped. */
  function setTimerUI(running) {
    timerRunning = running;
    startBtn.disabled   = running;
    stopBtn.disabled    = !running;
    timerDuration.disabled = running;
    durationMinus.disabled = running;
    durationPlus.disabled  = running;

    if (running) {
      timerDisplay.classList.add('running');
      timerStatus.textContent = '⏳ Stay focused…';
    } else {
      timerDisplay.classList.remove('running');
    }
  }

  /** Initialise timer to current duration setting. */
  function initTimer() {
    targetSeconds = getDurationSeconds();
    totalSeconds  = targetSeconds;
    renderTimer();
    timerDisplay.classList.remove('running', 'finished');
    timerStatus.textContent = 'Ready to focus 🎯';
  }

  // Load saved duration preference
  const savedMins = localStorage.getItem(LS.TIMER_MINUTES);
  if (savedMins) {
    timerDuration.value = savedMins;
  }
  initTimer();

  // Duration +/- buttons
  durationMinus.addEventListener('click', () => {
    const v = parseInt(timerDuration.value, 10) || 25;
    if (v > 1) {
      timerDuration.value = v - 1;
      saveDurationAndReset();
    }
  });

  durationPlus.addEventListener('click', () => {
    const v = parseInt(timerDuration.value, 10) || 25;
    if (v < 120) {
      timerDuration.value = v + 1;
      saveDurationAndReset();
    }
  });

  timerDuration.addEventListener('change', saveDurationAndReset);

  function saveDurationAndReset() {
    const mins = parseInt(timerDuration.value, 10);
    if (!isNaN(mins) && mins >= 1 && mins <= 120) {
      localStorage.setItem(LS.TIMER_MINUTES, mins);
    }
    if (!timerRunning) initTimer();
  }

  // Start
  startBtn.addEventListener('click', () => {
    if (timerRunning) return;
    if (totalSeconds <= 0) initTimer();
    setTimerUI(true);

    timerInterval = setInterval(() => {
      totalSeconds--;
      renderTimer();

      if (totalSeconds <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        setTimerUI(false);
        timerDisplay.classList.add('finished');
        timerStatus.textContent = '🎉 Session complete! Great work!';
        // Audio beep via Web Audio API (no external file needed)
        playBeep();
      }
    }, 1000);
  });

  // Pause / Stop
  stopBtn.addEventListener('click', () => {
    if (!timerRunning) return;
    clearInterval(timerInterval);
    timerInterval = null;
    setTimerUI(false);
    timerStatus.textContent = '⏸ Paused — resume when ready';
  });

  // Reset
  resetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    setTimerUI(false);
    initTimer();
  });

  /** Plays a short beep via Web Audio API. */
  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.2);
    } catch (_) {
      // Audio not supported — silently skip
    }
  }


  /* ================================================
     5. TASKS
     ================================================ */

  /** @type {Array<{id: string, text: string, completed: boolean}>} */
  let tasks = [];

  function loadTasks() {
    try {
      tasks = JSON.parse(localStorage.getItem(LS.TASKS)) || [];
    } catch (_) {
      tasks = [];
    }
  }

  function saveTasks() {
    localStorage.setItem(LS.TASKS, JSON.stringify(tasks));
  }

  /** Generates a simple unique ID. */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /** Shows an error message that auto-clears after 2.5 s. */
  function showTaskError(msg) {
    taskError.textContent = msg;
    clearTimeout(showTaskError._t);
    showTaskError._t = setTimeout(() => { taskError.textContent = ''; }, 2500);
  }

  /* ================================================
     5a. DAILY PROGRESS
     ================================================ */
  const progressPercent  = document.getElementById('progressPercent');
  const progressFraction = document.getElementById('progressFraction');
  const progressBarFill  = document.getElementById('progressBarFill');
  const progressBarTrack = progressBarFill ? progressBarFill.parentElement : null;
  const progressLabel    = document.getElementById('progressLabel');

  /** Motivational messages keyed by progress tier. */
  const PROGRESS_MSGS = {
    empty:  'Add tasks to get started! ✨',
    low:    "Let's get going — you've got this! 💪",
    mid:    "Good progress — keep the momentum! 🔥",
    high:   "Almost there — finish strong! 🚀",
    done:   "All done! Amazing work today! 🎉",
  };

  /**
   * Re-renders the Daily Progress card based on current tasks state.
   * Called every time renderTasks() runs.
   */
  function renderProgress() {
    const total  = tasks.length;
    const done   = tasks.filter(t => t.completed).length;
    const pct    = total === 0 ? 0 : Math.round((done / total) * 100);

    // Text
    progressPercent.textContent  = `${pct}%`;
    progressFraction.textContent = total === 0
      ? 'No tasks yet'
      : `${done} of ${total} task${total !== 1 ? 's' : ''} done`;

    // Bar width
    progressBarFill.style.width = `${pct}%`;

    // ARIA
    if (progressBarTrack) {
      progressBarTrack.setAttribute('aria-valuenow', pct);
    }

    // Colour tier
    const allClasses = ['p-done', 'p-high', 'p-mid'];
    progressPercent.classList.remove(...allClasses);
    progressBarFill.classList.remove(...allClasses);

    let tier = '';
    if (total === 0)    tier = '';
    else if (pct === 100) tier = 'p-done';
    else if (pct >= 75)   tier = 'p-high';
    else if (pct >= 40)   tier = 'p-mid';

    if (tier) {
      progressPercent.classList.add(tier);
      progressBarFill.classList.add(tier);
    }

    // Motivational label
    if (total === 0)      progressLabel.textContent = PROGRESS_MSGS.empty;
    else if (pct === 100) progressLabel.textContent = PROGRESS_MSGS.done;
    else if (pct >= 75)   progressLabel.textContent = PROGRESS_MSGS.high;
    else if (pct >= 40)   progressLabel.textContent = PROGRESS_MSGS.mid;
    else                  progressLabel.textContent = PROGRESS_MSGS.low;
  }

  /** Renders the task list into the DOM. */
  function renderTasks() {
    taskList.innerHTML = '';

    const done  = tasks.filter(t => t.completed).length;
    taskCounter.textContent = `${done} / ${tasks.length}`;

    // Update progress card every time tasks change
    renderProgress();

    if (tasks.length === 0) {
      taskEmpty.style.display = 'block';
      return;
    }
    taskEmpty.style.display = 'none';

    tasks.forEach((task) => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.completed ? ' completed' : '');
      li.dataset.id = task.id;

      // Checkbox
      const cb = document.createElement('input');
      cb.type      = 'checkbox';
      cb.className = 'task-checkbox';
      cb.checked   = task.completed;
      cb.setAttribute('aria-label', `Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`);
      cb.addEventListener('change', () => toggleTask(task.id));

      // Text
      const span = document.createElement('span');
      span.className   = 'task-text';
      span.textContent = task.text;

      // Actions
      const actions = document.createElement('div');
      actions.className = 'task-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-edit';
      editBtn.textContent = 'Edit';
      editBtn.setAttribute('aria-label', `Edit task "${task.text}"`);
      editBtn.addEventListener('click', () => startEditTask(task.id, li, span, editBtn));

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-danger';
      delBtn.textContent = 'Delete';
      delBtn.setAttribute('aria-label', `Delete task "${task.text}"`);
      delBtn.addEventListener('click', () => deleteTask(task.id));

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      li.appendChild(cb);
      li.appendChild(span);
      li.appendChild(actions);
      taskList.appendChild(li);
    });
  }

  /** Adds a new task, checking for duplicates. */
  function addTask() {
    const text = taskInput.value.trim();
    if (!text) {
      showTaskError('Please enter a task name.');
      taskInput.focus();
      return;
    }

    // Prevent duplicates (Challenge)
    const duplicate = tasks.some(
      t => t.text.toLowerCase() === text.toLowerCase()
    );
    if (duplicate) {
      showTaskError(`"${text}" already exists in your list.`);
      taskInput.select();
      return;
    }

    tasks.push({ id: uid(), text, completed: false });
    saveTasks();
    renderTasks();
    taskInput.value = '';
    taskInput.focus();
    taskError.textContent = '';
  }

  function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    }
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
  }

  /** Switches a task row to inline edit mode. */
  function startEditTask(id, li, span, editBtn) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const input = document.createElement('input');
    input.type      = 'text';
    input.className = 'task-edit-input';
    input.value     = task.text;
    input.maxLength = 80;

    li.replaceChild(input, span);

    // Change Edit → Save
    editBtn.textContent = 'Save';
    editBtn.className   = 'btn btn-save';

    // Replace listener
    const newEditBtn = editBtn.cloneNode(true);
    editBtn.parentNode.replaceChild(newEditBtn, editBtn);
    newEditBtn.addEventListener('click', () => commitEdit(id, input));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter')  commitEdit(id, input);
      if (e.key === 'Escape') renderTasks(); // cancel
    });

    input.focus();
    input.select();
  }

  /** Saves an edited task. */
  function commitEdit(id, input) {
    const newText = input.value.trim();
    if (!newText) return;

    // Prevent duplicate (excluding self)
    const duplicate = tasks.some(
      t => t.id !== id && t.text.toLowerCase() === newText.toLowerCase()
    );
    if (duplicate) {
      showTaskError(`"${newText}" already exists in your list.`);
      input.select();
      return;
    }

    const task = tasks.find(t => t.id === id);
    if (task) {
      task.text = newText;
      saveTasks();
      renderTasks();
    }
  }

  addTaskBtn.addEventListener('click', addTask);

  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
  });

  loadTasks();
  renderTasks();


  /* ================================================
     6. QUICK LINKS
     ================================================ */

  /** @type {Array<{id: string, name: string, url: string}>} */
  let links = [];

  function loadLinks() {
    try {
      links = JSON.parse(localStorage.getItem(LS.LINKS)) || [];
    } catch (_) {
      links = [];
    }
  }

  function saveLinks() {
    localStorage.setItem(LS.LINKS, JSON.stringify(links));
  }

  function showLinkError(msg) {
    linkError.textContent = msg;
    clearTimeout(showLinkError._t);
    showLinkError._t = setTimeout(() => { linkError.textContent = ''; }, 2500);
  }

  /** Normalises a URL — adds https:// if no protocol present. */
  function normaliseUrl(url) {
    url = url.trim();
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    return url;
  }

  function renderLinks() {
    // Remove all pills but keep the empty message element
    Array.from(linksGrid.querySelectorAll('.link-pill')).forEach(el => el.remove());

    if (links.length === 0) {
      linksEmpty.style.display = 'block';
      return;
    }
    linksEmpty.style.display = 'none';

    links.forEach((link) => {
      const pill = document.createElement('a');
      pill.className   = 'link-pill';
      pill.href        = link.url;
      pill.target      = '_blank';
      pill.rel         = 'noopener noreferrer';
      pill.dataset.id  = link.id;
      pill.setAttribute('aria-label', `Open ${link.name}`);

      const nameSpan = document.createElement('span');
      nameSpan.textContent = link.name;

      const delBtn = document.createElement('button');
      delBtn.className = 'link-delete-btn';
      delBtn.textContent = '×';
      delBtn.setAttribute('aria-label', `Remove ${link.name}`);
      delBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        deleteLink(link.id);
      });

      pill.appendChild(nameSpan);
      pill.appendChild(delBtn);
      linksGrid.appendChild(pill);
    });
  }

  function addLink() {
    const name = linkName.value.trim();
    const url  = normaliseUrl(linkUrl.value);

    if (!name) {
      showLinkError('Please enter a link name.');
      linkName.focus();
      return;
    }
    if (!url) {
      showLinkError('Please enter a URL.');
      linkUrl.focus();
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch (_) {
      showLinkError('Please enter a valid URL (e.g. https://google.com).');
      linkUrl.focus();
      return;
    }

    links.push({ id: uid(), name, url });
    saveLinks();
    renderLinks();
    linkName.value = '';
    linkUrl.value  = '';
    linkName.focus();
    linkError.textContent = '';
  }

  function deleteLink(id) {
    links = links.filter(l => l.id !== id);
    saveLinks();
    renderLinks();
  }

  addLinkBtn.addEventListener('click', addLink);

  linkUrl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addLink();
  });

  linkName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') linkUrl.focus();
  });

  loadLinks();
  renderLinks();


  /* ================================================
     7. LIGHT / DARK MODE TOGGLE
     ================================================ */

  function applyTheme(dark) {
    if (dark) {
      document.body.classList.add('dark');
      themeToggle.innerHTML = '<i class="fa-solid fa-sun" style="color: #fafafa;"></i>';
      themeToggle.setAttribute('aria-label', 'Switch to light mode');
      localStorage.setItem(LS.THEME, 'dark');
    } else {
      document.body.classList.remove('dark');
      themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
      themeToggle.setAttribute('aria-label', 'Switch to dark mode');
      localStorage.setItem(LS.THEME, 'light');
    }
  }

  // Set initial toggle icon from saved preference
  const isDark = document.body.classList.contains('dark');
  themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun" style="color: #fafafa;"></i>' : '<i class="fa-solid fa-moon"></i>';
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');

  themeToggle.addEventListener('click', () => {
    applyTheme(!document.body.classList.contains('dark'));
  });

}); // end DOMContentLoaded
