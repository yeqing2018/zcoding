class TimerApp {
  constructor() {
    this.settings = Storage.loadSettings();
    this.timerManager = TimerManager.getInstance();
    this.statistics = Statistics;
    this.reminder = ReminderManager;
    this.hotkeyManager = HotkeyManager.getInstance();
    this.currentView = 'timers';
    this.activeTimerId = null;
    this.currentEmbedTheme = 'blue';
    this.recordingHotkey = null;
    this.titleFlashInterval = null;
    this.originalTitle = document.title;

    this.init();
  }

  init() {
    this.applySettings();
    this.initTimerManager();
    this.bindGlobalEvents();
    this.timerManager.load();
    this.renderTimerTabs();
    this.renderTimers();
    this.renderHotkeys();
    this.updateEmbedCode();

    if (this.timerManager.getTimers().length === 0) {
      this.createDefaultTimer();
    } else {
      const timers = this.timerManager.getTimers();
      this.activeTimerId = this.timerManager.activeTimerId || timers[0].id;
    }
  }

  applySettings() {
    this.applyTheme(this.settings.theme);
    this.applyFontSize(this.settings.fontSize);
    this.applyGlassEffect(this.settings.glassEffect);
    this.applyCustomBackground(this.settings.backgroundImage);

    if (this.settings.reminderSettings) {
      this.reminder.setConfig(this.settings.reminderSettings);
    }

    SoundManager.setEnabled(this.settings.soundEnabled);

    if (this.settings.hotkeys) {
      Object.entries(this.settings.hotkeys).forEach(([action, key]) => {
        if (key) {
          this.hotkeyManager.register(key, () => this.handleHotkey(action));
        }
      });
    }
  }

  initTimerManager() {
    this.timerManager.onTimerAdded((timer) => {
      this.renderTimerTabs();
      this.renderTimers();
      this.activeTimerId = timer.id;
      this.updateActiveTab();
    });

    this.timerManager.onTimerRemoved((timerId) => {
      this.renderTimerTabs();
      this.renderTimers();
      const timers = this.timerManager.getTimers();
      if (timers.length > 0 && this.activeTimerId === timerId) {
        this.activeTimerId = timers[0].id;
      }
      this.updateActiveTab();
    });

    this.timerManager.onTimerTick((timer) => {
      this.updateTimerDisplay(timer.id);
    });

    this.timerManager.onTimerComplete((timer) => {
      this.handleTimerComplete(timer);
    });

    this.timerManager.onTimerStateChange((timer) => {
      this.updateTimerTabStatus(timer.id);
      this.updateTimerControls(timer.id);
    });
  }

  createDefaultTimer() {
    const timer = this.timerManager.createTimer({
      name: '默认计时器',
      mode: 'countdown',
      duration: 300,
      showMilliseconds: false,
      loop: {
        enabled: false,
        count: 0,
        interval: 0
      }
    });
    this.activeTimerId = timer.id;
  }

  bindGlobalEvents() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const view = tab.dataset.view;
        this.switchView(view);
      });
    });

    document.getElementById('soundToggle').addEventListener('click', () => {
      this.toggleSound();
    });

    document.getElementById('fullscreenToggle').addEventListener('click', () => {
      this.toggleFullscreen();
    });

    document.querySelectorAll('#themeSelector .theme-option').forEach(option => {
      option.addEventListener('click', () => {
        const theme = option.dataset.theme;
        this.setTheme(theme);
      });
    });

    document.getElementById('globalFontSize').addEventListener('input', (e) => {
      const size = parseFloat(e.target.value);
      this.setFontSize(size);
    });

    document.getElementById('glassEffectToggle').addEventListener('click', () => {
      const toggle = document.getElementById('glassEffectToggle');
      toggle.classList.toggle('active');
      this.setGlassEffect(toggle.classList.contains('active'));
    });

    document.getElementById('bgImageBtn').addEventListener('click', () => {
      document.getElementById('bgImageInput').click();
    });

    document.getElementById('bgImageInput').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          this.setBackgroundImage(ev.target.result);
        };
        reader.readAsDataURL(file);
      }
    });

    document.getElementById('bgClearBtn').addEventListener('click', () => {
      this.clearBackgroundImage();
    });

    ['soundReminderToggle', 'visualReminderToggle', 'notificationToggle', 
     'speechToggle', 'vibrationToggle', 'titleFlashToggle'].forEach(id => {
      document.getElementById(id).addEventListener('click', () => {
        this.updateReminderSettings();
      });
    });

    document.getElementById('newTimerLoopToggle').addEventListener('click', () => {
      const toggle = document.getElementById('newTimerLoopToggle');
      toggle.classList.toggle('active');
      document.getElementById('loopSettings').style.display = 
        toggle.classList.contains('active') ? 'block' : 'none';
    });

    document.getElementById('newTimerMsToggle').addEventListener('click', () => {
      const toggle = document.getElementById('newTimerMsToggle');
      toggle.classList.toggle('active');
    });

    document.getElementById('confirmNewTimer').addEventListener('click', () => {
      this.createTimerFromModal();
    });

    document.getElementById('cancelNewTimer').addEventListener('click', () => {
      this.closeNewTimerModal();
    });

    document.getElementById('closeNewTimerModal').addEventListener('click', () => {
      this.closeNewTimerModal();
    });

    ['embedMode', 'embedWidth', 'embedHeight', 'embedDuration'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => {
        this.updateEmbedCode();
      });
    });

    document.querySelectorAll('#embedThemeSelector .theme-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('#embedThemeSelector .theme-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        this.currentEmbedTheme = option.dataset.theme;
        this.updateEmbedCode();
      });
    });

    document.getElementById('copyEmbedCode').addEventListener('click', () => {
      this.copyEmbedCode();
    });

    document.getElementById('previewEmbed').addEventListener('click', () => {
      this.showEmbedPreview();
    });

    document.getElementById('closeEmbedPreview').addEventListener('click', () => {
      document.getElementById('embedPreviewModal').style.display = 'none';
    });

    document.getElementById('exportJsonBtn').addEventListener('click', () => {
      this.exportData('json');
    });

    document.getElementById('exportCsvBtn').addEventListener('click', () => {
      this.exportData('csv');
    });

    window.addEventListener('keydown', (e) => {
      if (this.recordingHotkey && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        const key = this.hotkeyManager.formatKey(e);
        this.completeHotkeyRecording(key);
      }
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.style.display = 'none';
        }
      });
    });
  }

  switchView(view) {
    this.currentView = view;

    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === view);
    });

    document.querySelectorAll('.view').forEach(v => {
      v.style.display = 'none';
    });

    document.getElementById(`view-${view}`).style.display = 'block';

    if (view === 'statistics') {
      this.renderStatistics();
    }
  }

  renderTimerTabs() {
    const container = document.getElementById('timerTabs');
    const timers = this.timerManager.getTimers();

    container.innerHTML = '';

    timers.forEach(timer => {
      const tab = document.createElement('div');
      tab.className = `timer-tab ${timer.id === this.activeTimerId ? 'active' : ''}`;
      tab.dataset.timerId = timer.id;

      const statusClass = timer.isRunning ? 'running' : timer.isPaused ? 'paused' : '';

      tab.innerHTML = `
        <span class="tab-status ${statusClass}"></span>
        <span class="tab-name">${timer.name}</span>
        <span class="tab-close" title="删除">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </span>
      `;

      tab.addEventListener('click', (e) => {
        if (e.target.closest('.tab-close')) {
          e.stopPropagation();
          this.removeTimer(timer.id);
        } else {
          this.activeTimerId = timer.id;
          this.updateActiveTab();
        }
      });

      container.appendChild(tab);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'add-timer-btn';
    addBtn.title = '新建计时器';
    addBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    `;
    addBtn.addEventListener('click', () => {
      this.openNewTimerModal();
    });
    container.appendChild(addBtn);
  }

  updateActiveTab() {
    document.querySelectorAll('.timer-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.timerId === this.activeTimerId);
    });
  }

  updateTimerTabStatus(timerId) {
    const timer = this.timerManager.getTimer(timerId);
    if (!timer) return;

    const tab = document.querySelector(`.timer-tab[data-timer-id="${timerId}"]`);
    if (tab) {
      const statusDot = tab.querySelector('.tab-status');
      statusDot.className = 'tab-status';
      if (timer.isRunning) statusDot.classList.add('running');
      else if (timer.isPaused) statusDot.classList.add('paused');
    }
  }

  renderTimers() {
    const container = document.getElementById('timersGrid');
    container.innerHTML = '';

    const timer = this.timerManager.getTimer(this.activeTimerId);
    if (!timer) return;

    const card = this.createTimerCard(timer);
    container.appendChild(card);
  }

  createTimerCard(timer) {
    const card = document.createElement('div');
    card.className = 'timer-card active';
    card.dataset.timerId = timer.id;

    const time = timer.getTime();
    const progress = timer.getProgress();
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (progress / 100) * circumference;

    const modeText = timer.mode === 'countdown' ? '倒计时' : '正计时';
    const statusText = timer.isRunning ? '计时中...' : timer.isPaused ? '已暂停' : timer.isCompleted ? '已完成' : '准备就绪';
    const statusClass = timer.isRunning ? 'running' : timer.isPaused ? 'paused' : timer.isCompleted ? 'completed' : '';

    const timeDisplay = timer.showMilliseconds
      ? `${this.pad(time.hours)}:${this.pad(time.minutes)}:${this.pad(time.seconds)}<span class="milliseconds">.${this.padMs(time.milliseconds)}</span>`
      : `${this.pad(time.hours)}:${this.pad(time.minutes)}:${this.pad(time.seconds)}`;

    card.innerHTML = `
      <div class="timer-card-header">
        <input type="text" class="timer-card-name" value="${timer.name}" data-timer-id="${timer.id}">
        <div class="timer-card-actions">
          <button class="icon-btn" data-action="settings" title="设置" data-timer-id="${timer.id}">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <button class="icon-btn" data-action="delete" title="删除" data-timer-id="${timer.id}">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="timer-display-section">
        <div class="mode-badge">${modeText}</div>
        ${timer.loop && timer.loop.enabled ? `
          <div class="loop-indicator">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            ${timer.loop.count > 0 ? `第 ${timer.currentLoop + 1}/${timer.loop.count} 轮` : '无限循环'}
          </div>
        ` : ''}
        <div class="timer-circle">
          <svg class="progress-ring" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="gradient-${timer.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:var(--accent-primary)"/>
                <stop offset="100%" style="stop-color:var(--accent-secondary)"/>
              </linearGradient>
            </defs>
            <circle class="bg" cx="100" cy="100" r="90"/>
            <circle class="progress" cx="100" cy="100" r="90" 
              stroke="url(#gradient-${timer.id})"
              stroke-dasharray="${circumference}" 
              stroke-dashoffset="${offset}" 
              data-timer-id="${timer.id}"/>
          </svg>
          <div class="timer-content">
            <div class="timer-display" data-timer-id="${timer.id}">${timeDisplay}</div>
            <div class="progress-text" data-timer-id="${timer.id}">${progress.toFixed(1)}% 完成</div>
          </div>
        </div>
        <div class="timer-status">
          <span class="status-dot ${statusClass}"></span>
          <span data-timer-id="${timer.id}">${statusText}</span>
        </div>
      </div>

      <div class="timer-controls">
        <div class="quick-buttons">
          <button class="quick-btn" data-seconds="60" data-timer-id="${timer.id}">
            1分钟
            <span class="label">快速设置</span>
          </button>
          <button class="quick-btn" data-seconds="300" data-timer-id="${timer.id}">
            5分钟
            <span class="label">快速设置</span>
          </button>
          <button class="quick-btn" data-seconds="600" data-timer-id="${timer.id}">
            10分钟
            <span class="label">快速设置</span>
          </button>
          <button class="quick-btn" data-seconds="1800" data-timer-id="${timer.id}">
            30分钟
            <span class="label">快速设置</span>
          </button>
        </div>
        <div class="main-controls">
          <button class="control-btn primary" data-action="toggle" data-timer-id="${timer.id}">
            ${timer.isRunning ? `
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
              暂停
            ` : timer.isPaused ? `
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              继续
            ` : `
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              开始
            `}
          </button>
          <button class="control-btn secondary" data-action="reset" data-timer-id="${timer.id}">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            重置
          </button>
        </div>
      </div>
    `;

    this.bindTimerCardEvents(card, timer);

    return card;
  }

  bindTimerCardEvents(card, timer) {
    const nameInput = card.querySelector('.timer-card-name');
    nameInput.addEventListener('change', (e) => {
      timer.name = e.target.value;
      this.timerManager.save();
      this.renderTimerTabs();
    });

    card.querySelectorAll('.quick-btn[data-seconds]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!timer.isRunning) {
          const seconds = parseInt(btn.dataset.seconds);
          timer.setDuration(seconds * 1000);
          this.updateTimerDisplay(timer.id);
          SoundManager.playBeep();
        }
      });
    });

    card.querySelector('[data-action="toggle"]').addEventListener('click', () => {
      this.toggleTimer(timer.id);
    });

    card.querySelector('[data-action="reset"]').addEventListener('click', () => {
      this.resetTimer(timer.id);
    });

    card.querySelector('[data-action="delete"]').addEventListener('click', () => {
      this.removeTimer(timer.id);
    });
  }

  updateTimerDisplay(timerId) {
    const timer = this.timerManager.getTimer(timerId);
    if (!timer || timerId !== this.activeTimerId) return;

    const time = timer.getTime();
    const progress = timer.getProgress();

    const displayEl = document.querySelector(`.timer-display[data-timer-id="${timerId}"]`);
    const progressEl = document.querySelector(`.progress-text[data-timer-id="${timerId}"]`);
    const circleEl = document.querySelector(`.progress[data-timer-id="${timerId}"]`);

    if (displayEl) {
      const timeDisplay = timer.showMilliseconds
        ? `${this.pad(time.hours)}:${this.pad(time.minutes)}:${this.pad(time.seconds)}<span class="milliseconds">.${this.padMs(time.milliseconds)}</span>`
        : `${this.pad(time.hours)}:${this.pad(time.minutes)}:${this.pad(time.seconds)}`;
      displayEl.innerHTML = timeDisplay;
    }

    if (progressEl) {
      progressEl.textContent = `${progress.toFixed(1)}% 完成`;
    }

    if (circleEl) {
      const circumference = 2 * Math.PI * 90;
      const offset = circumference - (progress / 100) * circumference;
      circleEl.style.strokeDashoffset = offset;
    }
  }

  updateTimerControls(timerId) {
    const timer = this.timerManager.getTimer(timerId);
    if (!timer || timerId !== this.activeTimerId) return;

    const statusEl = document.querySelector(`.timer-status span[data-timer-id="${timerId}"]`);
    const statusDot = document.querySelector(`.timer-status .status-dot`);
    const toggleBtn = document.querySelector(`[data-action="toggle"][data-timer-id="${timerId}"]`);

    const statusText = timer.isRunning ? '计时中...' : timer.isPaused ? '已暂停' : timer.isCompleted ? '已完成' : '准备就绪';

    if (statusEl) statusEl.textContent = statusText;
    if (statusDot) {
      statusDot.className = 'status-dot';
      if (timer.isRunning) statusDot.classList.add('running');
      else if (timer.isPaused) statusDot.classList.add('paused');
      else if (timer.isCompleted) statusDot.classList.add('completed');
    }

    if (toggleBtn) {
      if (timer.isRunning) {
        toggleBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
          暂停
        `;
      } else if (timer.isPaused) {
        toggleBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          继续
        `;
      } else {
        toggleBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          开始
        `;
      }
    }
  }

  toggleTimer(timerId) {
    const timer = this.timerManager.getTimer(timerId);
    if (!timer) return;

    if (!timer.isRunning && !timer.isPaused) {
      timer.start();
      SoundManager.playBeep();
    } else if (timer.isRunning) {
      timer.pause();
    } else if (timer.isPaused) {
      timer.resume();
      SoundManager.playBeep();
    }
  }

  resetTimer(timerId) {
    const timer = this.timerManager.getTimer(timerId);
    if (!timer) return;

    timer.reset();
    SoundManager.playBeep();
    this.stopTitleFlash();
  }

  removeTimer(timerId) {
    if (this.timerManager.getTimers().length <= 1) {
      alert('至少需要保留一个计时器');
      return;
    }

    if (confirm('确定要删除这个计时器吗？')) {
      this.timerManager.removeTimer(timerId);
    }
  }

  handleTimerComplete(timer) {
    this.statistics.addRecord({
      timerId: timer.id,
      timerName: timer.name,
      mode: timer.mode,
      duration: timer.duration,
      completed: true,
      endTime: Date.now(),
      loopCount: timer.currentLoop
    });

    this.reminder.trigger('complete', {
      timerName: timer.name,
      duration: timer.duration
    });

    this.startTitleFlash();
  }

  startTitleFlash() {
    if (!this.settings.reminderSettings?.titleFlash) return;

    let flash = false;
    this.titleFlashInterval = setInterval(() => {
      document.title = flash ? '⏰ 计时完成！' : this.originalTitle;
      flash = !flash;
    }, 500);

    setTimeout(() => {
      this.stopTitleFlash();
    }, 10000);
  }

  stopTitleFlash() {
    if (this.titleFlashInterval) {
      clearInterval(this.titleFlashInterval);
      this.titleFlashInterval = null;
      document.title = this.originalTitle;
    }
  }

  openNewTimerModal() {
    document.getElementById('newTimerModal').style.display = 'flex';
    document.getElementById('newTimerName').value = '';
    document.getElementById('newTimerMode').value = 'countdown';
    document.getElementById('newTimerHours').value = 0;
    document.getElementById('newTimerMinutes').value = 5;
    document.getElementById('newTimerSeconds').value = 0;
    document.getElementById('newTimerLoopToggle').classList.remove('active');
    document.getElementById('loopSettings').style.display = 'none';
    document.getElementById('newTimerLoopCount').value = 0;
    document.getElementById('newTimerLoopInterval').value = 0;
    document.getElementById('newTimerMsToggle').classList.remove('active');
  }

  closeNewTimerModal() {
    document.getElementById('newTimerModal').style.display = 'none';
  }

  createTimerFromModal() {
    const name = document.getElementById('newTimerName').value.trim() || `计时器 ${this.timerManager.getTimers().length + 1}`;
    const mode = document.getElementById('newTimerMode').value;
    const hours = parseInt(document.getElementById('newTimerHours').value) || 0;
    const minutes = parseInt(document.getElementById('newTimerMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('newTimerSeconds').value) || 0;
    const duration = (hours * 3600 + minutes * 60 + seconds) * 1000;
    const loopEnabled = document.getElementById('newTimerLoopToggle').classList.contains('active');
    const loopCount = parseInt(document.getElementById('newTimerLoopCount').value) || 0;
    const loopInterval = parseInt(document.getElementById('newTimerLoopInterval').value) || 0;
    const showMs = document.getElementById('newTimerMsToggle').classList.contains('active');

    if (duration <= 0) {
      alert('请设置有效的计时时长');
      return;
    }

    this.timerManager.createTimer({
      name,
      mode,
      duration,
      showMilliseconds: showMs,
      loop: {
        enabled: loopEnabled,
        count: loopCount,
        interval: loopInterval * 1000
      }
    });

    this.closeNewTimerModal();
  }

  applyTheme(theme) {
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);

    document.querySelectorAll('#themeSelector .theme-option').forEach(option => {
      option.classList.toggle('active', option.dataset.theme === theme);
    });
  }

  setTheme(theme) {
    this.settings.theme = theme;
    Storage.saveSettings(this.settings);
    this.applyTheme(theme);
  }

  applyFontSize(size) {
    document.documentElement.style.setProperty('--font-scale', size);
    document.getElementById('fontSizeValue').textContent = `${Math.round(size * 100)}%`;

    document.querySelectorAll('.timer-display').forEach(el => {
      el.style.fontSize = `calc(clamp(36px, 6vw, 42px) * ${size})`;
    });
  }

  setFontSize(size) {
    this.settings.fontSize = size;
    Storage.saveSettings(this.settings);
    this.applyFontSize(size);
  }

  applyGlassEffect(enabled) {
    const wrapper = document.querySelector('.app-wrapper');
    if (enabled) {
      wrapper.classList.add('glass-effect');
    } else {
      wrapper.classList.remove('glass-effect');
    }

    document.getElementById('glassEffectToggle').classList.toggle('active', enabled);
  }

  setGlassEffect(enabled) {
    this.settings.glassEffect = enabled;
    Storage.saveSettings(this.settings);
    this.applyGlassEffect(enabled);
  }

  applyCustomBackground(imageData) {
    if (imageData) {
      document.body.style.backgroundImage = `url(${imageData})`;
      document.body.classList.add('custom-bg');
      document.getElementById('bgClearBtn').style.display = 'block';
    } else {
      document.body.style.backgroundImage = '';
      document.body.classList.remove('custom-bg');
      document.getElementById('bgClearBtn').style.display = 'none';
    }
  }

  setBackgroundImage(imageData) {
    this.settings.backgroundImage = imageData;
    Storage.saveSettings(this.settings);
    this.applyCustomBackground(imageData);
  }

  clearBackgroundImage() {
    this.settings.backgroundImage = null;
    Storage.saveSettings(this.settings);
    this.applyCustomBackground(null);
  }

  toggleSound() {
    const enabled = !SoundManager.isEnabled();
    SoundManager.setEnabled(enabled);
    this.settings.soundEnabled = enabled;
    Storage.saveSettings(this.settings);

    const btn = document.getElementById('soundToggle');
    btn.classList.toggle('active', enabled);

    if (enabled) {
      SoundManager.playBeep();
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  updateReminderSettings() {
    const config = {
      sound: document.getElementById('soundReminderToggle').classList.contains('active'),
      visual: document.getElementById('visualReminderToggle').classList.contains('active'),
      notification: document.getElementById('notificationToggle').classList.contains('active'),
      speech: document.getElementById('speechToggle').classList.contains('active'),
      vibration: document.getElementById('vibrationToggle').classList.contains('active'),
      titleFlash: document.getElementById('titleFlashToggle').classList.contains('active')
    };

    this.settings.reminderSettings = config;
    Storage.saveSettings(this.settings);
    this.reminder.setConfig(config);

    if (config.notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  renderHotkeys() {
    const container = document.getElementById('hotkeyList');
    const hotkeys = this.settings.hotkeys || {
      toggleStart: 'Space',
      reset: 'KeyR',
      addTimer: 'KeyN',
      switchView: 'Tab'
    };

    const hotkeyNames = {
      toggleStart: '开始/暂停',
      reset: '重置计时器',
      addTimer: '新建计时器',
      switchView: '切换视图'
    };

    container.innerHTML = '';

    Object.entries(hotkeys).forEach(([action, key]) => {
      const item = document.createElement('div');
      item.className = 'hotkey-item';
      item.innerHTML = `
        <span class="hotkey-name">${hotkeyNames[action] || action}</span>
        <span class="hotkey-key">
          ${key ? `<span class="key-badge">${this.formatKeyDisplay(key)}</span>` : '<span style="color: var(--text-muted);">未设置</span>'}
          <button class="hotkey-record-btn" data-action="${action}">
            ${this.recordingHotkey === action ? '录制中...' : '设置'}
          </button>
        </span>
      `;

      const recordBtn = item.querySelector('.hotkey-record-btn');
      recordBtn.addEventListener('click', () => {
        this.startHotkeyRecording(action);
      });

      container.appendChild(item);
    });
  }

  startHotkeyRecording(action) {
    this.recordingHotkey = action;
    this.renderHotkeys();
  }

  completeHotkeyRecording(key) {
    if (!this.recordingHotkey) return;

    if (!this.settings.hotkeys) {
      this.settings.hotkeys = {};
    }

    const oldKey = this.settings.hotkeys[this.recordingHotkey];
    if (oldKey) {
      this.hotkeyManager.unregister(oldKey);
    }

    this.settings.hotkeys[this.recordingHotkey] = key;
    this.hotkeyManager.register(key, () => this.handleHotkey(this.recordingHotkey));
    Storage.saveSettings(this.settings);

    this.recordingHotkey = null;
    this.renderHotkeys();
  }

  formatKeyDisplay(key) {
    const keyMap = {
      'Space': '空格',
      'Control': 'Ctrl',
      'Meta': 'Win/Cmd',
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→'
    };
    return keyMap[key] || key.replace('Key', '');
  }

  handleHotkey(action) {
    switch (action) {
      case 'toggleStart':
        if (this.activeTimerId) {
          this.toggleTimer(this.activeTimerId);
        }
        break;
      case 'reset':
        if (this.activeTimerId) {
          this.resetTimer(this.activeTimerId);
        }
        break;
      case 'addTimer':
        this.openNewTimerModal();
        break;
      case 'switchView':
        const views = ['timers', 'statistics', 'settings', 'embed'];
        const currentIndex = views.indexOf(this.currentView);
        const nextView = views[(currentIndex + 1) % views.length];
        this.switchView(nextView);
        break;
    }
  }

  renderStatistics() {
    const summary = this.statistics.getSummary();
    const summaryContainer = document.getElementById('statsSummary');

    summaryContainer.innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${summary.totalCount}</div>
        <div class="stat-label">总计时次数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${this.formatDuration(summary.totalDuration)}</div>
        <div class="stat-label">总计时时长</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${summary.completedCount}</div>
        <div class="stat-label">完成次数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${summary.completionRate}%</div>
        <div class="stat-label">完成率</div>
      </div>
    `;

    this.renderStatsChart();
    this.renderStatsTable();
  }

  renderStatsChart() {
    const canvas = document.getElementById('statsChart');
    const ctx = canvas.getContext('2d');
    const dailyData = this.statistics.getDailyStats();

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const data = dailyData.slice(-7);
    const maxValue = Math.max(...data.map(d => d.duration), 1);

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;
    const barWidth = chartWidth / data.length * 0.6;
    const gap = chartWidth / data.length * 0.4;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'var(--border-color)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(canvas.width - padding.right, y);
      ctx.stroke();

      const value = Math.round(maxValue - (maxValue / 4) * i);
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.font = '11px var(--font-sans)';
      ctx.textAlign = 'right';
      ctx.fillText(`${value}m`, padding.left - 8, y + 4);
    }

    data.forEach((item, index) => {
      const x = padding.left + index * (barWidth + gap) + gap / 2;
      const height = (item.duration / maxValue) * chartHeight;
      const y = padding.top + chartHeight - height;

      const gradient = ctx.createLinearGradient(0, y, 0, y + height);
      gradient.addColorStop(0, 'var(--accent-primary)');
      gradient.addColorStop(1, 'var(--accent-secondary)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, height, 4);
      ctx.fill();

      const date = new Date(item.date);
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.font = '11px var(--font-sans)';
      ctx.textAlign = 'center';
      ctx.fillText(`${date.getMonth() + 1}/${date.getDate()}`, x + barWidth / 2, canvas.height - 15);
    });
  }

  renderStatsTable() {
    const tbody = document.getElementById('statsTableBody');
    const records = this.statistics.getRecords().slice(-20).reverse();

    tbody.innerHTML = records.map(record => {
      const modeText = record.mode === 'countdown' ? '倒计时' : '正计时';
      const statusText = record.completed ? '已完成' : '未完成';
      const statusClass = record.completed ? 'success' : 'danger';
      const endTime = new Date(record.endTime).toLocaleString('zh-CN');

      return `
        <tr>
          <td>${record.timerName}</td>
          <td>${modeText}</td>
          <td>${this.formatDuration(record.duration)}</td>
          <td><span style="color: var(--${statusClass});">${statusText}</span></td>
          <td>${endTime}</td>
        </tr>
      `;
    }).join('');

    if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 40px;">暂无记录</td></tr>';
    }
  }

  exportData(format) {
    if (format === 'csv') {
      const csv = this.statistics.exportCSV();
      this.downloadFile(csv, 'timer-records.csv', 'text/csv');
    } else {
      const json = this.statistics.exportJSON();
      this.downloadFile(json, 'timer-records.json', 'application/json');
    }
  }

  downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  updateEmbedCode() {
    const mode = document.getElementById('embedMode').value;
    const width = document.getElementById('embedWidth').value;
    const height = document.getElementById('embedHeight').value;
    const duration = document.getElementById('embedDuration').value;
    const theme = this.currentEmbedTheme;

    const url = `${window.location.origin}${window.location.pathname}?embed=true&mode=${mode}&theme=${theme}&duration=${duration}`;
    const code = `<iframe src="${url}" width="${width}" height="${height}" frameborder="0" allow="autoplay"></iframe>`;

    document.getElementById('embedCode').value = code;
  }

  copyEmbedCode() {
    const code = document.getElementById('embedCode').value;
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.getElementById('copyEmbedCode');
      const originalText = btn.innerHTML;
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        已复制
      `;
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 2000);
    });
  }

  showEmbedPreview() {
    const code = document.getElementById('embedCode').value;
    const urlMatch = code.match(/src="([^"]+)"/);
    if (urlMatch) {
      document.getElementById('embedPreviewFrame').src = urlMatch[1];
      document.getElementById('embedPreviewFrame').style.height = `${parseInt(document.getElementById('embedHeight').value) + 20}px`;
      document.getElementById('embedPreviewModal').style.display = 'flex';
    }
  }

  pad(num) {
    return num.toString().padStart(2, '0');
  }

  padMs(ms) {
    return Math.floor(ms / 10).toString().padStart(2, '0');
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}时${minutes}分`;
    } else if (minutes > 0) {
      return `${minutes}分${secs}秒`;
    } else {
      return `${secs}秒`;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new TimerApp();
});
