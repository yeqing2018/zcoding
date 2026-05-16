const ReminderManager = (() => {
  let notificationPermission = 'default';
  let config = {
    sound: true,
    visual: true,
    notification: false,
    speech: false,
    vibration: false,
    titleFlash: true
  };
  
  const setConfig = (newConfig) => {
    config = { ...config, ...newConfig };
  };
  
  const getConfig = () => ({ ...config });
  
  const trigger = (type, data = {}) => {
    if (type === 'complete') {
      if (config.sound) {
        SoundManager.playComplete();
      }
      if (config.visual) {
        triggerVisualFlash('var(--success)');
      }
      if (config.titleFlash) {
        triggerTitleFlash('⏰ 计时完成！', 10000);
      }
      if (config.notification) {
        showNotification('计时完成！', {
          body: `${data.timerName || '计时器'} 已完成`,
          requireInteraction: false
        });
      }
      if (config.speech) {
        speak(`${data.timerName || '计时器'} 计时完成`);
      }
      if (config.vibration) {
        triggerVibration([300, 100, 300, 100, 300]);
      }
    }
  };
  
  const init = async () => {
    if ('Notification' in window) {
      notificationPermission = Notification.permission;
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      return false;
    }
    
    if (notificationPermission === 'granted') {
      return true;
    }
    
    try {
      notificationPermission = await Notification.requestPermission();
      return notificationPermission === 'granted';
    } catch (e) {
      console.error('Failed to request notification permission:', e);
      return false;
    }
  };

  const showNotification = (title, options = {}) => {
    if (notificationPermission !== 'granted') return null;
    
    try {
      const notification = new Notification(title, {
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%233b82f6"/><text x="50" y="65" text-anchor="middle" fill="white" font-size="40" font-family="Arial">⏱</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%233b82f6"/></svg>',
        vibrate: [200, 100, 200],
        tag: 'timer-reminder',
        ...options
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      setTimeout(() => notification.close(), 5000);
      
      return notification;
    } catch (e) {
      console.error('Failed to show notification:', e);
      return null;
    }
  };

  const speak = (text, options = {}) => {
    if (!('speechSynthesis' in window)) return;
    
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || 'zh-CN';
      utterance.volume = options.volume || 1;
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      
      speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Failed to speak:', e);
    }
  };

  const triggerVisualFlash = (color = 'var(--accent-primary)', duration = 1500) => {
    const overlay = document.getElementById('flashOverlay');
    if (!overlay) return;
    
    overlay.style.background = color;
    overlay.classList.add('active');
    
    setTimeout(() => {
      overlay.classList.remove('active');
    }, duration);
  };

  const triggerTitleFlash = (text, duration = 3000) => {
    const originalTitle = document.title;
    let flashState = false;
    const interval = setInterval(() => {
      document.title = flashState ? originalTitle : text;
      flashState = !flashState;
    }, 500);
    
    setTimeout(() => {
      clearInterval(interval);
      document.title = originalTitle;
    }, duration);
  };

  const triggerVibration = (pattern = [200, 100, 200]) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.error('Failed to vibrate:', e);
      }
    }
  };

  const handleTimerReminder = (type, data, timer, settings) => {
    const reminderSettings = timer.reminders || {};
    
    if (type === 'complete') {
      if (reminderSettings.complete?.sound) {
        SoundManager.playComplete();
      }
      if (reminderSettings.complete?.visual) {
        triggerVisualFlash('var(--success)');
        triggerTitleFlash('⏰ 计时完成！');
      }
      if (reminderSettings.complete?.notification) {
        showNotification('计时完成！', {
          body: `${timer.name} 已完成`,
          requireInteraction: false
        });
      }
      if (reminderSettings.complete?.speech) {
        speak(`${timer.name} 计时完成`);
      }
      triggerVibration([300, 100, 300, 100, 300]);
    } else if (type === 'early') {
      SoundManager.playEarlyReminder();
      triggerVisualFlash('var(--warning)', 800);
      triggerVibration([100, 50, 100]);
      
      if (reminderSettings.complete?.notification) {
        showNotification('计时提醒', {
          body: `${timer.name} 还有 ${data} 秒`,
          silent: true
        });
      }
      
      if (reminderSettings.complete?.speech) {
        speak(`还有 ${data} 秒`);
      }
    } else if (type === 'loop-complete') {
      SoundManager.playBeep();
      triggerVisualFlash('var(--accent-primary)', 500);
    } else if (type === 'minute') {
      if (reminderSettings.everyMinute) {
        SoundManager.playBeep();
      }
    }
  };

  return {
    init,
    setConfig,
    getConfig,
    trigger,
    requestNotificationPermission,
    showNotification,
    speak,
    triggerVisualFlash,
    triggerTitleFlash,
    triggerVibration,
    handleTimerReminder
  };
})();
