class Scheduler {
  constructor() {
    this.timers = new Map();
    this._checkInterval = null;
  }

  static getInstance() {
    if (!Scheduler._instance) {
      Scheduler._instance = new Scheduler();
    }
    return Scheduler._instance;
  }

  registerTimer(timer) {
    if (timer.schedule?.enabled) {
      this.timers.set(timer.id, timer);
      this._startChecking();
    }
  }

  unregisterTimer(timerId) {
    this.timers.delete(timerId);
    if (this.timers.size === 0) {
      this._stopChecking();
    }
  }

  _startChecking() {
    if (this._checkInterval) return;
    this._checkInterval = setInterval(() => this._checkSchedules(), 1000);
  }

  _stopChecking() {
    if (this._checkInterval) {
      clearInterval(this._checkInterval);
      this._checkInterval = null;
    }
  }

  _checkSchedules() {
    const now = new Date();
    const currentTime = `${this._pad(now.getHours())}:${this._pad(now.getMinutes())}`;
    const currentDay = now.getDay();

    this.timers.forEach(timer => {
      if (!timer.schedule?.enabled) return;
      if (timer.isRunning) return;
      
      if (!Scheduler.isScheduledDay(timer.schedule.repeatDays, currentDay)) return;
      
      if (timer.schedule.startTime === currentTime) {
        timer.start();
      }
      
      if (timer.schedule.endTime === currentTime && timer.isRunning) {
        timer.pause();
      }
    });
  }

  _pad(num) {
    return num.toString().padStart(2, '0');
  }

  static isScheduledDay(days, currentDay) {
    if (!days || days.length === 0) return true;
    return days.includes(currentDay);
  }

  static getNextRunTime(schedule) {
    if (!schedule?.enabled || !schedule.startTime) return null;
    
    const now = new Date();
    const [hours, minutes] = schedule.startTime.split(':').map(Number);
    const nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);
    
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    if (schedule.repeatDays && schedule.repeatDays.length > 0) {
      let attempts = 0;
      while (!schedule.repeatDays.includes(nextRun.getDay()) && attempts < 7) {
        nextRun.setDate(nextRun.getDate() + 1);
        attempts++;
      }
    }
    
    return nextRun;
  }

  static checkSchedule(schedule) {
    if (!schedule?.enabled) return false;
    
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${this._pad(now.getHours())}:${this._pad(now.getMinutes())}`;
    
    if (!this.isScheduledDay(schedule.repeatDays, currentDay)) return false;
    
    if (schedule.startTime && schedule.endTime) {
      return currentTime >= schedule.startTime && currentTime < schedule.endTime;
    }
    
    return true;
  }

  destroy() {
    this._stopChecking();
    this.timers.clear();
  }
}
