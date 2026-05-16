import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  MessageSquare,
  MessageSquareOff,
  Maximize2,
  Minimize2,
  Settings,
  Trash2,
  Zap,
  Gauge,
  Eye,
  Activity,
} from 'lucide-react';
import { useDanmakuStore } from '../../store/useDanmakuStore';
import { generateRandomDanmaku, generateBatchDanmaku } from '../../data/mockData';
import type { Danmaku, DanmakuStats } from '../../types/danmaku';

interface ControlBarProps {
  onSendTestDanmaku: (danmaku: Danmaku) => void;
  onBatchSend: (danmakus: Danmaku[]) => void;
  onClear: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  getStats: () => DanmakuStats | null;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  onSendTestDanmaku,
  onBatchSend,
  onClear,
  onToggleFullscreen,
  isFullscreen,
  getStats,
}) => {
  const {
    config,
    isPlaying,
    togglePlay,
    toggleSettings,
    updateDisplayConfig,
  } = useDanmakuStore();

  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<DanmakuStats | null>(null);

  useEffect(() => {
    if (!showStats) return;

    const interval = setInterval(() => {
      const currentStats = getStats();
      if (currentStats) {
        setStats(currentStats);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [showStats, getStats]);

  const handleSendTest = useCallback(() => {
    const danmaku = generateRandomDanmaku();
    onSendTestDanmaku(danmaku);
  }, [onSendTestDanmaku]);

  const handleBatchSend = useCallback(() => {
    const danmakus = generateBatchDanmaku(20);
    onBatchSend(danmakus);
  }, [onBatchSend]);

  const handleToggleDanmaku = useCallback(() => {
    updateDisplayConfig({ showDanmaku: !config.display.showDanmaku });
  }, [config.display.showDanmaku, updateDisplayConfig]);

  const speedLabel = `${config.display.speedMultiplier.toFixed(1)}x`;
  const densityLabel = `${Math.round(config.display.density * 100)}%`;
  const opacityLabel = `${Math.round(config.display.opacity * 100)}%`;

  return (
    <div className="absolute top-0 left-0 right-0 z-20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="p-2 rounded-lg bg-game-dark-700/80 backdrop-blur-md text-white hover:bg-neon-cyan/20 hover:text-neon-cyan transition-all duration-200 border border-neon-cyan/20 hover:border-neon-cyan/50"
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            onClick={handleToggleDanmaku}
            className={`p-2 rounded-lg backdrop-blur-md transition-all duration-200 border ${
              config.display.showDanmaku
                ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50'
                : 'bg-game-dark-700/80 text-gray-400 border-gray-600/50 hover:text-white hover:border-gray-500/50'
            }`}
            title={config.display.showDanmaku ? '隐藏弹幕' : '显示弹幕'}
          >
            {config.display.showDanmaku ? <MessageSquare size={20} /> : <MessageSquareOff size={20} />}
          </button>

          <div className="h-6 w-px bg-gray-600/50 mx-1" />

          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-game-dark-700/80 backdrop-blur-md border border-neon-cyan/20">
            <Gauge size={16} className="text-neon-cyan" />
            <span className="text-xs font-jetbrains-mono text-white">{speedLabel}</span>
          </div>

          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-game-dark-700/80 backdrop-blur-md border border-neon-pink/20">
            <Eye size={16} className="text-neon-pink" />
            <span className="text-xs font-jetbrains-mono text-white">{densityLabel}</span>
          </div>

          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-game-dark-700/80 backdrop-blur-md border border-neon-yellow/20">
            <Activity size={16} className="text-neon-yellow" />
            <span className="text-xs font-jetbrains-mono text-white">{opacityLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSendTest}
            className="px-3 py-1.5 rounded-lg bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/20 hover:border-neon-cyan/50 transition-all duration-200 text-sm font-jetbrains-mono flex items-center gap-1.5"
          >
            <Zap size={16} />
            发送测试
          </button>

          <button
            onClick={handleBatchSend}
            className="px-3 py-1.5 rounded-lg bg-neon-purple/10 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/20 hover:border-neon-purple/50 transition-all duration-200 text-sm font-jetbrains-mono flex items-center gap-1.5"
          >
            <MessageSquare size={16} />
            批量发送
          </button>

          <button
            onClick={onClear}
            className="p-2 rounded-lg bg-game-dark-700/80 backdrop-blur-md text-gray-400 hover:text-neon-pink hover:bg-neon-pink/10 hover:border-neon-pink/30 transition-all duration-200 border border-gray-600/30"
            title="清屏"
          >
            <Trash2 size={20} />
          </button>

          <div className="h-6 w-px bg-gray-600/50 mx-1" />

          <button
            onClick={() => setShowStats(!showStats)}
            className={`p-2 rounded-lg backdrop-blur-md transition-all duration-200 border ${
              showStats
                ? 'bg-neon-green/20 text-neon-green border-neon-green/50'
                : 'bg-game-dark-700/80 text-gray-400 border-gray-600/30 hover:text-white hover:border-gray-500/50'
            }`}
            title="性能统计"
          >
            <Activity size={20} />
          </button>

          <button
            onClick={toggleSettings}
            className="p-2 rounded-lg bg-game-dark-700/80 backdrop-blur-md text-gray-400 hover:text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan/30 transition-all duration-200 border border-gray-600/30"
            title="设置"
          >
            <Settings size={20} />
          </button>

          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-lg bg-game-dark-700/80 backdrop-blur-md text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 border border-gray-600/30"
            title={isFullscreen ? '退出全屏' : '全屏'}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      {showStats && stats && (
        <div className="mt-3 p-4 rounded-xl bg-game-dark-800/90 backdrop-blur-md border border-neon-cyan/20 animate-fade-in">
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-cyan font-jetbrains-mono">{stats.fps}</div>
              <div className="text-xs text-gray-400 mt-1">FPS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-green font-jetbrains-mono">{stats.displayedCount}</div>
              <div className="text-xs text-gray-400 mt-1">当前显示</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-yellow font-jetbrains-mono">{stats.totalCount}</div>
              <div className="text-xs text-gray-400 mt-1">总发送</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-pink font-jetbrains-mono">{stats.blockedCount}</div>
              <div className="text-xs text-gray-400 mt-1">已屏蔽</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-purple font-jetbrains-mono">{stats.memoryUsage.toFixed(1)} MB</div>
              <div className="text-xs text-gray-400 mt-1">内存使用</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
