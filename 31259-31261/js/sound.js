const SoundManager = (() => {
  let audioContext = null;
  let enabled = true;

  const initAudioContext = () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  };

  const playTone = (frequency, duration, type = 'sine', volume = 0.3) => {
    if (!enabled) return;
    initAudioContext();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  const playBeep = () => {
    playTone(800, 0.15, 'sine', 0.2);
  };

  const playComplete = () => {
    playTone(523.25, 0.2, 'sine', 0.3);
    setTimeout(() => playTone(659.25, 0.2, 'sine', 0.3), 200);
    setTimeout(() => playTone(783.99, 0.4, 'sine', 0.3), 400);
  };

  const playEarlyReminder = () => {
    playTone(440, 0.1, 'square', 0.2);
    setTimeout(() => playTone(440, 0.1, 'square', 0.2), 150);
  };

  const setEnabled = (value) => {
    enabled = value;
  };

  const isEnabled = () => enabled;

  return {
    playBeep,
    playComplete,
    playEarlyReminder,
    setEnabled,
    isEnabled
  };
})();
