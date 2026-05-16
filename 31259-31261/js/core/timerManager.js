class TimerManager {
  constructor() {
    this.timers = new Map();
    this.activeTimerId = null;
    this._callbacks = {
      timerAdded: [],
      timerRemoved: [],
      timerUpdated: [],
      activeTimerChanged: [],
      timerTick: [],
      timerComplete: [],
      timerStateChange: []
    };
  }

  static getInstance() {
    if (!TimerManager._instance) {
      TimerManager._instance = new TimerManager();
    }
    return TimerManager._instance;
  }

  createTimer(config) {
    const timer = new HighPrecisionTimer(config);
    this.timers.set(timer.id, timer);
    
    timer.onTick((time, progress) => {
      this._notify('timerTick', timer);
    });
    
    timer.onComplete(() => {
      this._notify('timerComplete', timer);
    });
    
    timer.onStateChange((state) => {
      this._notify('timerStateChange', timer);
    });
    
    if (this.timers.size === 1) {
      this.activeTimerId = timer.id;
    }
    
    this._notify('timerAdded', timer);
    this.save();
    return timer;
  }

  removeTimer(id) {
    const timer = this.timers.get(id);
    if (!timer) return false;
    
    timer.destroy();
    this.timers.delete(id);
    
    if (this.activeTimerId === id) {
      const remaining = Array.from(this.timers.keys());
      this.activeTimerId = remaining.length > 0 ? remaining[0] : null;
      this._notify('activeTimerChanged', this.activeTimerId);
    }
    
    this._notify('timerRemoved', id);
    this.save();
    return true;
  }

  getTimer(id) {
    return this.timers.get(id) || null;
  }

  getTimers() {
    return Array.from(this.timers.values());
  }

  getRunningTimers() {
    return this.getTimers().filter(t => t.isRunning);
  }

  getActiveTimer() {
    return this.activeTimerId ? this.getTimer(this.activeTimerId) : null;
  }

  setActiveTimer(id) {
    if (this.timers.has(id) && this.activeTimerId !== id) {
      this.activeTimerId = id;
      this._notify('activeTimerChanged', id);
    }
  }

  pauseAll() {
    this.getRunningTimers().forEach(timer => timer.pause());
  }

  resumeAll() {
    this.getTimers().forEach(timer => {
      if (timer.isRunning && timer.isPaused) {
        timer.resume();
      }
    });
  }

  resetAll() {
    this.getTimers().forEach(timer => timer.reset());
  }

  onTimerAdded(callback) {
    this._callbacks.timerAdded.push(callback);
  }

  onTimerRemoved(callback) {
    this._callbacks.timerRemoved.push(callback);
  }

  onTimerUpdated(callback) {
    this._callbacks.timerUpdated.push(callback);
  }

  onActiveTimerChanged(callback) {
    this._callbacks.activeTimerChanged.push(callback);
  }

  onTimerTick(callback) {
    this._callbacks.timerTick.push(callback);
  }

  onTimerComplete(callback) {
    this._callbacks.timerComplete.push(callback);
  }

  onTimerStateChange(callback) {
    this._callbacks.timerStateChange.push(callback);
  }

  _notify(event, data) {
    if (this._callbacks[event]) {
      this._callbacks[event].forEach(callback => {
        try {
          callback(data);
        } catch (e) {
          console.error(`Callback error for ${event}:`, e);
        }
      });
    }
  }

  save() {
    const data = this.saveToStorage();
    Storage.saveTimers(data);
  }

  load() {
    const data = Storage.loadTimers();
    if (data) {
      this.loadFromStorage(data);
    }
  }

  saveToStorage() {
    const configs = this.getTimers().map(timer => timer.toConfig());
    return {
      timers: configs,
      activeTimerId: this.activeTimerId
    };
  }

  loadFromStorage(data) {
    if (!data || !Array.isArray(data.timers)) return;
    
    this.timers.forEach(timer => timer.destroy());
    this.timers.clear();
    
    data.timers.forEach(config => {
      const timer = new HighPrecisionTimer(config);
      this.timers.set(timer.id, timer);
      
      timer.onTick((time, progress) => {
        this._notify('timerTick', timer);
      });
      
      timer.onComplete(() => {
        this._notify('timerComplete', timer);
      });
      
      timer.onStateChange((state) => {
        this._notify('timerStateChange', timer);
      });
    });
    
    this.activeTimerId = data.activeTimerId || (this.timers.size > 0 ? this.timers.keys().next().value : null);
  }

  destroy() {
    this.timers.forEach(timer => timer.destroy());
    this.timers.clear();
    this._callbacks = {
      timerAdded: [],
      timerRemoved: [],
      timerUpdated: [],
      activeTimerChanged: []
    };
  }
}
