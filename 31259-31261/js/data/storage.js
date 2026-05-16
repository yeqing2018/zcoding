class Storage {
  static KEYS = {
    SETTINGS: 'timer_app_settings',
    TIMERS: 'timer_app_timers',
    RECORDS: 'timer_app_records',
    LAST_RECORD: 'timer_app_last_record'
  };

  static DEFAULT_SETTINGS = {
    theme: 'blue',
    fontSize: 1,
    soundEnabled: true,
    glassEffect: true,
    backgroundImage: null,
    hotkeys: {
      toggleStart: 'Space',
      reset: 'KeyR',
      addTimer: 'KeyN',
      switchView: 'Tab'
    },
    reminderSettings: {
      sound: true,
      visual: true,
      notification: false,
      speech: false,
      vibration: false,
      titleFlash: true
    },
    lastDuration: 300,
    earlyReminders: []
  };

  static loadSettings() {
    try {
      const data = localStorage.getItem(this.KEYS.SETTINGS);
      if (data) {
        return { ...this.DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return { ...this.DEFAULT_SETTINGS };
  }

  static saveSettings(settings) {
    try {
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  static loadTimers() {
    try {
      const data = localStorage.getItem(this.KEYS.TIMERS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load timers:', e);
    }
    return null;
  }

  static saveTimers(timersData) {
    try {
      localStorage.setItem(this.KEYS.TIMERS, JSON.stringify(timersData));
    } catch (e) {
      console.error('Failed to save timers:', e);
    }
  }

  static loadRecords() {
    try {
      const data = localStorage.getItem(this.KEYS.RECORDS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load records:', e);
    }
    return [];
  }

  static saveRecords(records) {
    try {
      localStorage.setItem(this.KEYS.RECORDS, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save records:', e);
    }
  }

  static saveLastRecord(record) {
    try {
      localStorage.setItem(this.KEYS.LAST_RECORD, JSON.stringify(record));
    } catch (e) {
      console.error('Failed to save last record:', e);
    }
  }

  static loadLastRecord() {
    try {
      const data = localStorage.getItem(this.KEYS.LAST_RECORD);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load last record:', e);
    }
    return null;
  }

  static clearAll() {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}
