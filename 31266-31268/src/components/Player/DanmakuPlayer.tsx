import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useDanmakuStore } from '../../store/useDanmakuStore';
import { useDanmakuEngine } from '../../hooks/useDanmakuEngine';
import { useFullscreen } from '../../hooks/useFullscreen';
import { useKeyboard, parseShortcut } from '../../hooks/useKeyboard';
import { ControlBar } from '../Controls/ControlBar';
import { SendBar } from '../SendBar/SendBar';
import { SettingsPanel } from '../Settings/SettingsPanel';
import { DanmakuDetail } from '../common/DanmakuDetail';
import { DanmakuPreview } from '../Preview/DanmakuPreview';
import { DanmakuEditor } from '../Editor/DanmakuEditor';
import { GameProgressBar } from '../Progress/GameProgressBar';
import { OnlineLoader } from '../OnlineLoader/OnlineLoader';
import type { Danmaku, DanmakuStats } from '../../types/danmaku';

export const DanmakuPlayer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    config, 
    isPlaying, 
    showSettings, 
    selectedDanmaku,
    showPreview,
    showEditor,
    showOnlineLoader,
    loadedDanmakus,
    gameProgress,
  } = useDanmakuStore();
  
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  
  const {
    setStats,
    setEngineStatus,
    setSelectedDanmaku,
    setIsFullscreen,
    addToHistory,
    toggleSettings,
    togglePlay,
    togglePreview,
    toggleEditor,
    updateDisplayConfig,
    updateDanmakuLikes,
    setCurrentTime,
    updateTriggerPoint,
  } = useDanmakuStore();

  const handleDanmakuClick = useCallback((danmaku: Danmaku, x: number, y: number) => {
    setClickPosition({ x, y });
    setSelectedDanmaku(danmaku);
  }, [setSelectedDanmaku]);

  const handleLikeDanmaku = useCallback(() => {
    if (selectedDanmaku) {
      updateDanmakuLikes(selectedDanmaku.id, (selectedDanmaku.likes || 0) + 1);
    }
  }, [selectedDanmaku, updateDanmakuLikes]);

  const handleReportDanmaku = useCallback(() => {
    if (selectedDanmaku) {
      alert(`已举报弹幕: ${selectedDanmaku.content}`);
      setSelectedDanmaku(null);
    }
  }, [selectedDanmaku, setSelectedDanmaku]);

  const handleDanmakuSend = useCallback((danmaku: Danmaku) => {
    addToHistory(danmaku);
  }, [addToHistory]);

  const handleStatsUpdate = useCallback((stats: DanmakuStats) => {
    setStats(stats);
  }, [setStats]);

  const {
    canvasRef,
    initEngine,
    start,
    pause,
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
  } = useDanmakuEngine({
    onDanmakuClick: handleDanmakuClick,
    onDanmakuSend: handleDanmakuSend,
    onStatsUpdate: handleStatsUpdate,
  });

  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  useEffect(() => {
    setIsFullscreen(isFullscreen);
  }, [isFullscreen, setIsFullscreen]);

  useEffect(() => {
    if (canvasRef.current) {
      const engine = initEngine(canvasRef.current, config);
      engine.start();
      setEngineStatus('running');
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        resize(rect.width, rect.height);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [resize]);

  useEffect(() => {
    if (isPlaying) {
      start();
      setEngineStatus('running');
    } else {
      pause();
      setEngineStatus('paused');
    }
  }, [isPlaying, start, pause, setEngineStatus]);

  useEffect(() => {
    toggleDisplay(config.display.showDanmaku);
  }, [config.display.showDanmaku, toggleDisplay]);

  useEffect(() => {
    setSpeed(config.display.speedMultiplier);
  }, [config.display.speedMultiplier, setSpeed]);

  useEffect(() => {
    setOpacity(config.display.opacity);
  }, [config.display.opacity, setOpacity]);

  useEffect(() => {
    setFontSize(config.display.fontSize);
  }, [config.display.fontSize, setFontSize]);

  useEffect(() => {
    setDensity(config.display.density);
  }, [config.display.density, setDensity]);

  useEffect(() => {
    setArea(config.display.area);
  }, [config.display.area, setArea]);

  useEffect(() => {
    setFontFamily(config.display.fontFamily);
  }, [config.display.fontFamily, setFontFamily]);

  useEffect(() => {
    setShadowEnabled(config.display.shadowEnabled);
  }, [config.display.shadowEnabled, setShadowEnabled]);

  useEffect(() => {
    updateConfig({ filter: config.filter });
  }, [config.filter, updateConfig]);

  useEffect(() => {
    if (!gameProgress.enabled || !gameProgress.syncEnabled || !isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(gameProgress.currentTime + 0.1);
    }, 100);

    return () => clearInterval(interval);
  }, [gameProgress.enabled, gameProgress.syncEnabled, isPlaying, gameProgress.currentTime, setCurrentTime]);

  useEffect(() => {
    if (!gameProgress.enabled || !gameProgress.syncEnabled) return;

    gameProgress.triggerPoints.forEach(point => {
      if (!point.triggered && point.time <= gameProgress.currentTime) {
        const danmakusToSend = loadedDanmakus.filter(d => point.danmakuIds.includes(d.id));
        batchSend(danmakusToSend);
        updateTriggerPoint(point.id, { triggered: true });
      }
    });
  }, [gameProgress.currentTime, gameProgress.enabled, gameProgress.syncEnabled, gameProgress.triggerPoints, loadedDanmakus, batchSend, updateTriggerPoint]);

  const keyboardHandlers = useMemo(() => [
    {
      ...parseShortcut(config.shortcut.toggleDanmaku),
      handler: () => {
        updateDisplayConfig({ showDanmaku: !config.display.showDanmaku });
      },
    },
    {
      ...parseShortcut(config.shortcut.toggleFullscreen),
      handler: () => {
        toggleFullscreen();
      },
    },
    {
      ...parseShortcut(config.shortcut.toggleSettings),
      handler: () => {
        toggleSettings();
      },
    },
    {
      ...parseShortcut(config.shortcut.playPause),
      handler: () => {
        togglePlay();
      },
      preventDefault: true,
    },
    {
      ...parseShortcut(config.shortcut.reload),
      handler: () => {
        clear();
        if (loadedDanmakus.length > 0) {
          batchSend(loadedDanmakus);
        }
      },
    },
    {
      ...parseShortcut(config.shortcut.togglePreview),
      handler: () => {
        togglePreview();
      },
    },
    {
      ...parseShortcut(config.shortcut.toggleEditor),
      handler: () => {
        toggleEditor();
      },
    },
    {
      ...parseShortcut(config.shortcut.skipForward),
      handler: () => {
        if (gameProgress.enabled) {
          setCurrentTime(Math.min(gameProgress.totalDuration, gameProgress.currentTime + 10));
        }
      },
    },
    {
      ...parseShortcut(config.shortcut.skipBackward),
      handler: () => {
        if (gameProgress.enabled) {
          setCurrentTime(Math.max(0, gameProgress.currentTime - 10));
        }
      },
    },
    {
      key: 'escape',
      handler: () => {
        setSelectedDanmaku(null);
        if (showSettings) toggleSettings();
      },
    },
  ], [config, toggleFullscreen, toggleSettings, togglePlay, togglePreview, toggleEditor, clear, loadedDanmakus, batchSend, setCurrentTime, gameProgress, updateDisplayConfig, showSettings, setSelectedDanmaku]);

  useKeyboard(keyboardHandlers, true);

  const handleSendDanmaku = useCallback((danmaku: Danmaku) => {
    send(danmaku);
  }, [send]);

  const handleBatchSend = useCallback((danmakus: Danmaku[]) => {
    batchSend(danmakus);
  }, [batchSend]);

  const handleCloseDetail = useCallback(() => {
    setSelectedDanmaku(null);
  }, [setSelectedDanmaku]);

  const backgroundStyle = useMemo(() => {
    const bg = config.background;
    let background = bg.color;

    if (bg.type === 'gradient') {
      background = bg.gradient;
    } else if (bg.type === 'image' && bg.imageUrl) {
      return {
        backgroundImage: `url(${bg.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: bg.opacity,
        filter: `blur(${bg.blur}px)`,
      };
    }

    return {
      background,
      opacity: bg.opacity,
    };
  }, [config.background]);

  const containerStyle = useMemo(() => ({
    borderRadius: `${config.uiLayout.borderRadius}px`,
    border: config.uiLayout.showBorder
      ? `${config.uiLayout.borderWidth}px solid ${config.uiLayout.borderColor}`
      : 'none',
  }), [config.uiLayout]);

  const showProgressBar = gameProgress.enabled;
  const isMultiWindow = config.uiLayout.multiWindowMode;
  const layout = config.uiLayout.windowLayout;
  const previewSize = config.uiLayout.previewWindowSize;

  return (
    <div className="w-full h-full bg-game-dark-900 p-4">
      <div className="w-full h-full max-w-7xl mx-auto">
        {isMultiWindow ? (
          <div
            className={`w-full h-full ${
              layout === 'split-vertical' ? 'flex gap-4' :
              layout === 'split-horizontal' ? 'flex flex-col gap-4' :
              'grid grid-cols-2 grid-rows-2 gap-4'
            }`}
          >
            <div
              ref={containerRef}
              className="relative bg-game-dark-900 overflow-hidden select-none"
              style={{
                ...containerStyle,
                width: layout === 'split-vertical' ? `${100 - previewSize}%` : '100%',
                height: layout === 'split-horizontal' ? `${100 - previewSize}%` : '100%',
              }}
            >
              <div className="absolute inset-0" style={backgroundStyle} />
              <div className="absolute inset-0 bg-gradient-to-br from-game-dark-800/50 via-transparent to-game-dark-800/50">
                <div className="absolute inset-0 opacity-10">
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(0, 255, 245, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 255, 245, 0.1) 1px, transparent 1px)
                      `,
                      backgroundSize: '50px 50px',
                    }}
                  />
                </div>
              </div>

              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full z-10 cursor-pointer"
                style={{ pointerEvents: config.display.showDanmaku ? 'auto' : 'none' }}
              />

              <ControlBar
                onSendTestDanmaku={handleSendDanmaku}
                onBatchSend={handleBatchSend}
                onClear={clear}
                onToggleFullscreen={toggleFullscreen}
                isFullscreen={isFullscreen}
                getStats={getStats}
              />

              <SendBar onSend={handleSendDanmaku} />

              {selectedDanmaku && (
                <DanmakuDetail
                  danmaku={selectedDanmaku}
                  position={clickPosition}
                  onClose={handleCloseDetail}
                  onLike={handleLikeDanmaku}
                  onReport={handleReportDanmaku}
                />
              )}
            </div>

            <div
              className="bg-game-dark-800/90 backdrop-blur-lg border border-neon-cyan/20 overflow-hidden"
              style={{
                ...containerStyle,
                width: layout === 'split-vertical' ? `${previewSize}%` : '100%',
                height: layout === 'split-horizontal' ? `${previewSize}%` : '100%',
              }}
            >
              {showPreview && <DanmakuPreview />}
              {showEditor && <DanmakuEditor />}
              {!showPreview && !showEditor && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                  <p className="text-sm font-jetbrains-mono mb-4">预览/编辑区域</p>
                  <div className="flex gap-3">
                    <button
                      onClick={togglePreview}
                      className="px-4 py-2 rounded-lg bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 transition-colors text-sm"
                    >
                      打开预览
                    </button>
                    <button
                      onClick={toggleEditor}
                      className="px-4 py-2 rounded-lg bg-neon-purple/20 text-neon-purple hover:bg-neon-purple/30 transition-colors text-sm"
                    >
                      打开编辑器
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="relative w-full h-full bg-game-dark-900 overflow-hidden select-none"
            style={containerStyle}
          >
            <div className="absolute inset-0" style={backgroundStyle} />
            <div className="absolute inset-0 bg-gradient-to-br from-game-dark-800/50 via-transparent to-game-dark-800/50">
              <div className="absolute inset-0 opacity-10">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(0, 255, 245, 0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0, 255, 245, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                  }}
                />
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <h1 className="text-4xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink animate-pulse-glow mb-4">
                    游戏弹幕播放器
                  </h1>
                  <p className="text-gray-400 font-jetbrains-mono text-sm">
                    按 F 全屏 · Ctrl+D 切换弹幕 · Ctrl+S 打开设置
                  </p>
                </div>
              </div>
            </div>

            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full z-10 cursor-pointer"
              style={{ pointerEvents: config.display.showDanmaku ? 'auto' : 'none' }}
            />

            <ControlBar
              onSendTestDanmaku={handleSendDanmaku}
              onBatchSend={handleBatchSend}
              onClear={clear}
              onToggleFullscreen={toggleFullscreen}
              isFullscreen={isFullscreen}
              getStats={getStats}
            />

            <SendBar onSend={handleSendDanmaku} />

            {showProgressBar && (
              <div className="absolute bottom-0 left-0 right-0 z-20">
                <GameProgressBar />
              </div>
            )}
          </div>
        )}

        {!isMultiWindow && showPreview && <DanmakuPreview />}
        {!isMultiWindow && showEditor && <DanmakuEditor />}
        {showSettings && <SettingsPanel />}
        {showOnlineLoader && <OnlineLoader />}
      </div>
    </div>
  );
};
