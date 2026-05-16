class Timer {
  constructor(mode = 'countdown', totalSeconds = 300) {
    this.mode = mode;
    this.totalSeconds = totalSeconds;
    this.remainingSeconds = mode === 'countdown' ? totalSeconds : 0;
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = null;
    this.pausedAt = null;
    this.animationId = null;
    this.tickCallbacks = [];
    this.completeCallbacks = [];
    this.earlyReminders = [];
    this.triggeredReminders = new Set();
    this.lastTickSecond = null;
  }

  onTick(callback) {
    this.tickCallbacks.push(callback);
  }

  onComplete(callback) {
    this.completeCallbacks.push(callback);
  }

  setEarlyReminders(reminders) {
    this.earlyReminders = reminders || [];
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now() - (this.mode === 'countdown' 
      ? (this.totalSeconds - this.remainingSeconds) * 1000 
      : this.remainingSeconds * 1000);
    this.lastTickSecond = null;
    this.triggeredReminders.clear();
    this._tick();
  }

  pause() {
    if (!this.isRunning || this.isPaused) return;
    
    this.isPaused = true;
    this.pausedAt = Date.now();
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  resume() {
    if (!this.isPaused) return;
    
    const pauseDuration = Date.now() - this.pausedAt;
    this.startTime += pauseDuration;
    this.isPaused = false;
    this.pausedAt = null;
    this._tick();
  }

  reset() {
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = null;
    this.pausedAt = null;
    this.remainingSeconds = this.mode === 'countdown' ? this.totalSeconds : 0;
    this.triggeredReminders.clear();
    this.lastTickSecond = null;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this._notifyTick();
  }

  skip(seconds) {
    if (this.mode === 'countdown') {
      this.remainingSeconds = Math.max(0, this.remainingSeconds - seconds);
      this.startTime = Date.now() - (this.totalSeconds - this.remainingSeconds) * 1000;
    } else {
      this.remainingSeconds = Math.min(this.totalSeconds, this.remainingSeconds + seconds);
      this.startTime = Date.now() - this.remainingSeconds * 1000;
    }
    this._notifyTick();
  }

  setMode(mode) {
    if (this.isRunning) return;
    this.mode = mode;
    this.remainingSeconds = mode === 'countdown' ? this.totalSeconds : 0;
    this.triggeredReminders.clear();
    this._notifyTick();
  }

  setTotalSeconds(seconds) {
    if (this.isRunning) return;
    this.totalSeconds = seconds;
    this.remainingSeconds = this.mode === 'countdown' ? seconds : 0;
    this.triggeredReminders.clear();
    this._notifyTick();
  }

  getRemaining() {
    return this.remainingSeconds;
  }

  getProgress() {
    if (this.totalSeconds === 0) return 0;
    if (this.mode === 'countdown') {
      return ((this.totalSeconds - this.remainingSeconds) / this.totalSeconds) * 100;
    } else {
      return (this.remainingSeconds / this.totalSeconds) * 100;
    }
  }

  _tick() {
    if (!this.isRunning || this.isPaused) return;

    const now = Date.now();
    const elapsed = (now - this.startTime) / 1000;

    if (this.mode === 'countdown') {
      this.remainingSeconds = Math.max(0, Math.ceil(this.totalSeconds - elapsed));
    } else {
      this.remainingSeconds = Math.min(this.totalSeconds, Math.floor(elapsed));
    }

    const currentSecond = Math.floor(this.remainingSeconds);
    if (currentSecond !== this.lastTickSecond) {
      this.lastTickSecond = currentSecond;
      this._notifyTick();
      this._checkEarlyReminders();
    }

    if (this.mode === 'countdown' && this.remainingSeconds <= 0) {
      this._complete();
      return;
    }

    if (this.mode === 'countup' && this.remainingSeconds >= this.totalSeconds) {
      this._complete();
      return;
    }

    this.animationId = requestAnimationFrame(() => this._tick());
  }

  _notifyTick() {
    this.tickCallbacks.forEach(callback => {
      try {
        callback(this.remainingSeconds, this.getProgress());
      } catch (e) {
        console.error('Tick callback error:', e);
      }
    });
  }

  _checkEarlyReminders() {
    this.earlyReminders.forEach((reminderSeconds, index) => {
      if (this.triggeredReminders.has(index)) return;
      
      if (this.mode === 'countdown') {
        if (this.remainingSeconds <= reminderSeconds && this.remainingSeconds > 0) {
          this.triggeredReminders.add(index);
          this._triggerEarlyReminder(reminderSeconds);
        }
      } else {
        const remaining = this.totalSeconds - this.remainingSeconds;
        if (remaining <= reminderSeconds && remaining > 0) {
          this.triggeredReminders.add(index);
          this._triggerEarlyReminder(reminderSeconds);
        }
      }
    });
  }

  _triggerEarlyReminder(seconds) {
    if (this.earlyReminderCallback) {
      try {
        this.earlyReminderCallback(seconds);
      } catch (e) {
        console.error('Early reminder callback error:', e);
      }
    }
  }

  onEarlyReminder(callback) {
    this.earlyReminderCallback = callback;
  }

  _complete() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.completeCallbacks.forEach(callback => {
      try {
        callback();
      } catch (e) {
        console.error('Complete callback error:', e);
      }
    });
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.tickCallbacks = [];
    this.completeCallbacks = [];
    this.earlyReminderCallback = null;
  }
}
