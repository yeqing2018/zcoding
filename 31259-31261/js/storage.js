const Storage = (() => {
  const SETTINGS_KEY = 'timer_settings';
  const LAST_RECORD_KEY = 'timer_last_record';

  const defaultSettings = {
    theme: 'blue',
    fontSize: 1,
    soundEnabled: true,
    lastDuration: 300,
    earlyReminders: []
  };

  const saveSettings = (settings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  };

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return { ...defaultSettings };
  };

  const saveLastRecord = (record) => {
    try {
      localStorage.setItem(LAST_RECORD_KEY, JSON.stringify(record));
    } catch (e) {
      console.error('Failed to save last record:', e);
    }
  };

  const loadLastRecord = () => {
    try {
      const saved = localStorage.getItem(LAST_RECORD_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load last record:', e);
    }
    return null;
  };

  return {
    saveSettings,
    loadSettings,
    saveLastRecord,
    loadLastRecord
  };
})();
