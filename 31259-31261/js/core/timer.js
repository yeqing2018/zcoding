class HighPrecisionTimer {
  constructor(config) {
    this.id = config.id || this._generateId();
    this.name = config.name || '计时器';
    this.mode = config.mode || 'countdown';
    this.duration = config.duration || (config.totalSeconds || 300) * 1000;
    this.totalSeconds = Math.floor(this.duration / 1000);
    this.totalMilliseconds = this.duration;
    this.showMilliseconds = config.showMilliseconds || false;
    
    this.loop = {
      enabled: config.loop?.enabled || false,
      count: config.loop?.count || 0,
      currentLoop: 0,
      interval: config.loop?.interval || 0
    };
    
    this.schedule = config.schedule || {
      enabled: false,
      startTime: null,
      endTime: null,
      repeatDays: []
    };
    
    this.reminders = config.reminders || {
      early: [],
      complete: {
        sound: true,
        visual: true,
        notification: false,
        speech: false
      },
      everyMinute: false
    };
    
    this.display = config.display || {
      fontSize: 1,
      color: null,
      showProgress: true
    };
    
    this.createdAt = config.createdAt || Date.now();
    this.updatedAt = Date.now();
    
    this._initState();
    this._callbacks = {
      tick: [],
      complete: [],
      loop: [],
      reminder: [],
      stateChange: []
    };
    
    this._triggeredReminders = new Set();
    this._lastMinuteReminder = -1;
  }

  _generateId() {
    return 'timer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  _initState() {
    this.isRunning = false;
    this.isPaused = false;
    this.currentMilliseconds = this.mode === 'countdown' ? this.totalMilliseconds : 0;
    this.progress = 0;
    this.startTime = null;
    this.pauseTime = null;
    this.accumulatedPause = 0;
    this.loopCount = 0;
    this.lastTick = null;
    this._animationId = null;
  }

  onTick(callback) {
    this._callbacks.tick.push(callback);
  }

  onComplete(callback) {
    this._callbacks.complete.push(callback);
  }

  onLoop(callback) {
    this._callbacks.loop.push(callback);
  }

  onReminder(callback) {
    this._callbacks.reminder.push(callback);
  }

  onStateChange(callback) {
    this._callbacks.stateChange.push(callback);
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = performance.now() - (this.mode === 'countdown' 
      ? (this.totalMilliseconds - this.currentMilliseconds)
      : this.currentMilliseconds);
    this.lastTick = this.currentMilliseconds;
    this._triggeredReminders.clear();
    this._lastMinuteReminder = -1;
    
    this._notifyStateChange('running');
    this._tick();
  }

  pause() {
    if (!this.isRunning || this.isPaused) return;
    
    this.isPaused = true;
    this.pauseTime = performance.now();
    if (this._animationId) {
      cancelAnimationFrame(this._animationId);
      this._animationId = null;
    }
    this._notifyStateChange('paused');
  }

  resume() {
    if (!this.isPaused) return;
    
    const pauseDuration = performance.now() - this.pauseTime;
    this.accumulatedPause += pauseDuration;
    this.startTime += pauseDuration;
    this.isPaused = false;
    this.pauseTime = null;
    this._notifyStateChange('running');
    this._tick();
  }

  reset() {
    if (this._animationId) {
      cancelAnimationFrame(this._animationId);
      this._animationId = null;
    }
    this._initState();
    this._notifyStateChange('idle');
    this._notifyTick();
  }

  skip(ms) {
    if (this.mode === 'countdown') {
      this.currentMilliseconds = Math.max(0, this.currentMilliseconds - ms);
      this.startTime = performance.now() - (this.totalMilliseconds - this.currentMilliseconds);
    } else {
      this.currentMilliseconds = Math.min(this.totalMilliseconds, this.currentMilliseconds + ms);
      this.startTime = performance.now() - this.currentMilliseconds;
    }
    this._notifyTick();
  }

  setDuration(ms) {
    if (this.isRunning) return;
    this.duration = ms;
    this.totalSeconds = Math.floor(ms / 1000);
    this.totalMilliseconds = ms;
    this.currentMilliseconds = this.mode === 'countdown' ? ms : 0;
    this.updatedAt = Date.now();
    this._notifyTick();
  }

  setTotalSeconds(seconds) {
    this.setDuration(seconds * 1000);
  }

  setMode(mode) {
    if (this.isRunning) return;
    this.mode = mode;
    this.currentMilliseconds = mode === 'countdown' ? this.totalMilliseconds : 0;
    this.updatedAt = Date.now();
    this._notifyTick();
  }

  setShowMilliseconds(show) {
    this.showMilliseconds = show;
    this.updatedAt = Date.now();
    this._notifyTick();
  }

  setLoopConfig(config) {
    this.loop = { ...this.loop, ...config };
    this.updatedAt = Date.now();
  }

  getTime() {
    const totalSeconds = Math.floor(this.currentMilliseconds / 1000);
    const ms = Math.floor(this.currentMilliseconds % 1000);
    return {
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
      milliseconds: ms,
      totalSeconds,
      totalMilliseconds: this.currentMilliseconds
    };
  }

  getProgress() {
    if (this.totalMilliseconds === 0) return 0;
    if (this.mode === 'countdown') {
      return ((this.totalMilliseconds - this.currentMilliseconds) / this.totalMilliseconds) * 100;
    } else {
      return (this.currentMilliseconds / this.totalMilliseconds) * 100;
    }
  }

  getState() {
    return {
      id: this.id,
      name: this.name,
      mode: this.mode,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      currentMilliseconds: this.currentMilliseconds,
      progress: this.getProgress(),
      loopCount: this.loopCount,
      loopConfig: this.loop
    };
  }

  toConfig() {
    return {
      id: this.id,
      name: this.name,
      mode: this.mode,
      totalSeconds: this.totalSeconds,
      showMilliseconds: this.showMilliseconds,
      loop: { ...this.loop },
      schedule: { ...this.schedule },
      reminders: JSON.parse(JSON.stringify(this.reminders)),
      display: { ...this.display },
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  _tick() {
    if (!this.isRunning || this.isPaused) return;

    const now = performance.now();
    const elapsed = now - this.startTime;

    if (this.mode === 'countdown') {
      this.currentMilliseconds = Math.max(0, this.totalMilliseconds - elapsed);
    } else {
      this.currentMilliseconds = Math.min(this.totalMilliseconds, elapsed);
    }

    const currentSecond = Math.floor(this.currentMilliseconds / 1000);
    const lastSecond = Math.floor(this.lastTick / 1000);
    
    if (currentSecond !== lastSecond) {
      this._notifyTick();
      this._checkReminders(currentSecond);
      this.lastTick = this.currentMilliseconds;
    }

    if (this.showMilliseconds) {
      this._notifyTick();
    }

    if (this.mode === 'countdown' && this.currentMilliseconds <= 0) {
      this._handleComplete();
      return;
    }

    if (this.mode === 'countup' && this.currentMilliseconds >= this.totalMilliseconds) {
      this._handleComplete();
      return;
    }

    this._animationId = requestAnimationFrame(() => this._tick());
  }

  _notifyTick() {
    const time = this.getTime();
    const progress = this.getProgress();
    this._callbacks.tick.forEach(callback => {
      try {
        callback(time, progress, this);
      } catch (e) {
        console.error('Tick callback error:', e);
      }
    });
  }

  _notifyStateChange(state) {
    this._callbacks.stateChange.forEach(callback => {
      try {
        callback(state, this);
      } catch (e) {
        console.error('State change callback error:', e);
      }
    });
  }

  _checkReminders(currentSecond) {
    this.reminders.early.forEach((reminderSeconds, index) => {
      if (this._triggeredReminders.has(index)) return;
      
      if (this.mode === 'countdown') {
        if (currentSecond <= reminderSeconds && currentSecond > 0) {
          this._triggeredReminders.add(index);
          this._triggerReminder('early', reminderSeconds);
        }
      } else {
        const remainingSeconds = Math.floor(this.totalSeconds) - currentSecond;
        if (remainingSeconds <= reminderSeconds && remainingSeconds > 0) {
          this._triggeredReminders.add(index);
          this._triggerReminder('early', reminderSeconds);
        }
      }
    });

    if (this.reminders.everyMinute && currentSecond > 0) {
      const minutes = Math.floor(currentSecond / 60);
      if (minutes !== this._lastMinuteReminder && currentSecond % 60 === 0) {
        this._lastMinuteReminder = minutes;
        this._triggerReminder('minute', minutes);
      }
    }
  }

  _triggerReminder(type, data) {
    this._callbacks.reminder.forEach(callback => {
      try {
        callback(type, data, this);
      } catch (e) {
        console.error('Reminder callback error:', e);
      }
    });
  }

  _handleComplete() {
    this.isRunning = false;
    this.isPaused = false;
    if (this._animationId) {
      cancelAnimationFrame(this._animationId);
      this._animationId = null;
    }

    if (this.loop.enabled) {
      this.loopCount++;
      
      if (this.loop.count === 0 || this.loopCount < this.loop.count) {
        this._callbacks.loop.forEach(callback => {
          try {
            callback(this.loopCount, this);
          } catch (e) {
            console.error('Loop callback error:', e);
          }
        });
        
        this._triggerReminder('loop-complete', this.loopCount);
        
        if (this.loop.interval > 0) {
          setTimeout(() => {
            this._resetForNextLoop();
          }, this.loop.interval);
        } else {
          this._resetForNextLoop();
        }
        return;
      }
    }

    this._triggerReminder('complete', null);
    this._notifyStateChange('completed');
    this._callbacks.complete.forEach(callback => {
      try {
        callback(this);
      } catch (e) {
        console.error('Complete callback error:', e);
      }
    });
  }

  _resetForNextLoop() {
    this.currentMilliseconds = this.mode === 'countdown' ? this.totalMilliseconds : 0;
    this._triggeredReminders.clear();
    this._lastMinuteReminder = -1;
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = performance.now();
    this.lastTick = this.currentMilliseconds;
    this._notifyStateChange('running');
    this._tick();
  }

  destroy() {
    if (this._animationId) {
      cancelAnimationFrame(this._animationId);
    }
    this._callbacks = {
      tick: [],
      complete: [],
      loop: [],
      reminder: [],
      stateChange: []
    };
  }
}
