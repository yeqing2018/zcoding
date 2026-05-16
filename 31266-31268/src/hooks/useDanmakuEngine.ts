import { useRef, useEffect, useCallback } from 'react';
import { DanmakuEngine } from '../engine/DanmakuEngine';
import type { Danmaku, PlayerConfig, DanmakuStats } from '../types/danmaku';
import { debounce } from '../utils/performance';

interface UseDanmakuEngineOptions {
  config?: Partial<PlayerConfig>;
  onDanmakuClick?: (danmaku: Danmaku, x: number, y: number) => void;
  onDanmakuHover?: (danmaku: Danmaku | null) => void;
  onDanmakuSend?: (danmaku: Danmaku) => void;
  onStatsUpdate?: (stats: DanmakuStats) => void;
}

export const useDanmakuEngine = (options: UseDanmakuEngineOptions = {}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<DanmakuEngine | null>(null);
  const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initEngine = useCallback((canvas: HTMLCanvasElement, playerConfig: PlayerConfig) => {
    if (engineRef.current) {
      engineRef.current.destroy();
    }

    const engine = new DanmakuEngine(undefined, playerConfig);
    engine.init(canvas);
    engineRef.current = engine;

    if (options.onDanmakuClick) {
      engine.on('click', options.onDanmakuClick);
    }

    if (options.onDanmakuHover) {
      engine.on('hover', options.onDanmakuHover);
    }

    if (options.onDanmakuSend) {
      engine.on('send', options.onDanmakuSend);
    }

    if (options.onStatsUpdate) {
      statsIntervalRef.current = setInterval(() => {
        if (engineRef.current) {
          options.onStatsUpdate?.(engineRef.current.getStats());
        }
      }, 1000);
    }

    return engine;
  }, [options]);

  const start = useCallback(() => {
    engineRef.current?.start();
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
  }, []);

  const send = useCallback((danmaku: Danmaku) => {
    engineRef.current?.send(danmaku);
  }, []);

  const batchSend = useCallback((danmakus: Danmaku[]) => {
    engineRef.current?.batchSend(danmakus);
  }, []);

  const clear = useCallback(() => {
    engineRef.current?.clear();
  }, []);

  const setSpeed = useCallback((multiplier: number) => {
    engineRef.current?.setSpeed(multiplier);
  }, []);

  const setOpacity = useCallback((opacity: number) => {
    engineRef.current?.setOpacity(opacity);
  }, []);

  const setFontSize = useCallback((size: number) => {
    engineRef.current?.setFontSize(size);
  }, []);

  const setDensity = useCallback((density: number) => {
    engineRef.current?.setDensity(density);
  }, []);

  const setArea = useCallback((area: number) => {
    engineRef.current?.setArea(area);
  }, []);

  const toggleDisplay = useCallback((show: boolean) => {
    engineRef.current?.toggleDisplay(show);
  }, []);

  const setFontFamily = useCallback((fontFamily: string) => {
    engineRef.current?.setFontFamily(fontFamily);
  }, []);

  const setShadowEnabled = useCallback((enabled: boolean) => {
    engineRef.current?.setShadowEnabled(enabled);
  }, []);

  const updateConfig = useCallback((config: Partial<PlayerConfig>) => {
    engineRef.current?.updateConfig(config);
  }, []);

  const resize = useCallback(
    debounce((width: number, height: number) => {
      engineRef.current?.resize(width, height);
    }, 100),
    []
  );

  const getStats = useCallback((): DanmakuStats | null => {
    return engineRef.current?.getStats() || null;
  }, []);

  const getHistory = useCallback((startTime?: number, endTime?: number): Danmaku[] => {
    return engineRef.current?.getHistory(startTime, endTime) || [];
  }, []);

  const getActiveCount = useCallback((): number => {
    return engineRef.current?.getActiveDanmakuCount() || 0;
  }, []);

  useEffect(() => {
    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
      engineRef.current?.destroy();
    };
  }, []);

  return {
    canvasRef,
    engineRef,
    initEngine,
    start,
    pause,
    stop,
    send,
    batchSend,
    clear,
    setSpeed,
    setOpacity,
    setFontSize,
    setDensity,
    setArea,
    toggleDisplay,
    setFontFamily,
    setShadowEnabled,
    updateConfig,
    resize,
    getStats,
    getHistory,
    getActiveCount,
  };
};
