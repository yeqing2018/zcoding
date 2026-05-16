class HotkeyManager {
  constructor() {
    this.hotkeys = new Map();
    this.isRecording = false;
    this.recordedKey = null;
    this._bindGlobalListener();
  }

  static getInstance() {
    if (!HotkeyManager._instance) {
      HotkeyManager._instance = new HotkeyManager();
    }
    return HotkeyManager._instance;
  }

  _bindGlobalListener() {
    document.addEventListener('keydown', (e) => {
      if (this.isRecording) {
        e.preventDefault();
        this.recordedKey = this._getKeyString(e);
        return;
      }
      
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }
      
      const keyString = this._getKeyString(e);
      const hotkey = this.hotkeys.get(keyString);
      
      if (hotkey) {
        e.preventDefault();
        try {
          hotkey.action(e);
        } catch (err) {
          console.error('Hotkey action error:', err);
        }
      }
    });
  }

  _getKeyString(e) {
    const parts = [];
    
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    if (e.metaKey) parts.push('Meta');
    
    const key = e.key.length === 1 ? e.key.toUpperCase() : e.code;
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
      parts.push(key);
    }
    
    return parts.join('+');
  }

  register(key, action, context = 'global') {
    const normalizedKey = this._normalizeKey(key);
    
    if (this.hotkeys.has(normalizedKey)) {
      console.warn(`Hotkey ${normalizedKey} already registered, overwriting`);
    }
    
    this.hotkeys.set(normalizedKey, { action, context });
    return true;
  }

  unregister(key) {
    const normalizedKey = this._normalizeKey(key);
    return this.hotkeys.delete(normalizedKey);
  }

  unregisterAll(context = null) {
    if (context) {
      for (const [key, hotkey] of this.hotkeys.entries()) {
        if (hotkey.context === context) {
          this.hotkeys.delete(key);
        }
      }
    } else {
      this.hotkeys.clear();
    }
  }

  getRegistered() {
    return Array.from(this.hotkeys.entries()).map(([key, hotkey]) => ({
      key,
      context: hotkey.context
    }));
  }

  detectConflict(key) {
    const normalizedKey = this._normalizeKey(key);
    return this.hotkeys.has(normalizedKey);
  }

  async recordKey() {
    this.isRecording = true;
    this.recordedKey = null;
    
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.recordedKey) {
          this.isRecording = false;
          clearInterval(checkInterval);
          resolve(this.recordedKey);
        }
      }, 100);
      
      setTimeout(() => {
        if (this.isRecording) {
          this.isRecording = false;
          clearInterval(checkInterval);
          resolve(null);
        }
      }, 5000);
    });
  }

  _normalizeKey(key) {
    return key.split('+').map(k => k.trim()).sort().join('+');
  }

  exportConfig() {
    const config = {};
    for (const [key, hotkey] of this.hotkeys.entries()) {
      config[key] = hotkey.context;
    }
    return config;
  }

  importConfig(config, actionMap) {
    this.unregisterAll();
    
    for (const [key, context] of Object.entries(config)) {
      const action = actionMap[key];
      if (action) {
        this.register(key, action, context);
      }
    }
  }

  formatKey(e) {
    return this._getKeyString(e);
  }

  getDefaultHotkeys() {
    return {
      startPause: { key: 'Space', description: '开始/暂停当前计时器' },
      reset: { key: 'KeyR', description: '重置当前计时器' },
      skip: { key: 'KeyS', description: '跳过30秒' },
      addTimer: { key: 'KeyN', description: '新建计时器' },
      nextTimer: { key: 'Tab', description: '切换到下一个计时器' },
      prevTimer: { key: 'Shift+Tab', description: '切换到上一个计时器' },
      toggleView: { key: 'KeyV', description: '切换视图模式' },
      toggleSettings: { key: 'KeyO', description: '打开/关闭设置' },
      toggleStats: { key: 'KeyT', description: '打开/关闭统计' },
      deleteTimer: { key: 'Delete', description: '删除当前计时器' }
    };
  }
}
