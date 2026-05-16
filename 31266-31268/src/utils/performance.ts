const metrics = {
  fps: 0,
  frameCount: 0,
  lastFpsTime: 0,
  avgFrameTime: 0,
  frameTimes: [] as number[],
  memoryUsage: 0,
  lastMemoryCheck: 0,
};

export const performanceMonitor = {

  startFrame(): number {
    return performance.now();
  },

  endFrame(startTime: number): void {
    const now = performance.now();
    const frameTime = now - startTime;

    metrics.frameCount++;
    metrics.frameTimes.push(frameTime);
    
    if (metrics.frameTimes.length > 60) {
      metrics.frameTimes.shift();
    }

    if (now - metrics.lastFpsTime >= 1000) {
      metrics.fps = metrics.frameCount;
      metrics.frameCount = 0;
      metrics.lastFpsTime = now;
      
      const total = metrics.frameTimes.reduce((a, b) => a + b, 0);
      metrics.avgFrameTime = total / metrics.frameTimes.length;
    }

    if (now - metrics.lastMemoryCheck >= 5000) {
      const perf = performance as any;
      if (perf.memory) {
        metrics.memoryUsage = perf.memory.usedJSHeapSize / 1024 / 1024;
      }
      metrics.lastMemoryCheck = now;
    }
  },

  getFPS(): number {
    return metrics.fps;
  },

  getAvgFrameTime(): number {
    return metrics.avgFrameTime;
  },

  getMemoryUsage(): number {
    return metrics.memoryUsage;
  },

  getMetrics() {
    return {
      fps: metrics.fps,
      avgFrameTime: metrics.avgFrameTime,
      memoryUsage: metrics.memoryUsage,
    };
  },

  reset(): void {
    metrics.fps = 0;
    metrics.frameCount = 0;
    metrics.lastFpsTime = 0;
    metrics.avgFrameTime = 0;
    metrics.frameTimes = [];
    metrics.memoryUsage = 0;
    metrics.lastMemoryCheck = 0;
  },
};

export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

export const randomRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const randomInt = (min: number, max: number): number => {
  return Math.floor(randomRange(min, max + 1));
};

export const randomItem = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};
