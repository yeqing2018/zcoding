import React, { useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Flag, Plus, X, Settings } from 'lucide-react';
import { useDanmakuStore } from '../../store/useDanmakuStore';
import type { Danmaku } from '../../types/danmaku';

export const GameProgressBar: React.FC = () => {
  const {
    gameProgress,
    isPlaying,
    loadedDanmakus,
    togglePlay,
    setCurrentTime,
    setTotalDuration,
    updateGameProgressConfig,
    addTriggerPoint,
    removeTriggerPoint,
    updateTriggerPoint,
    toggleSettings,
  } = useDanmakuStore();

  const progressRef = useRef<HTMLDivElement>(null);
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [newTriggerName, setNewTriggerName] = useState('');
  const [selectedDanmakus, setSelectedDanmakus] = useState<string[]>([]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * gameProgress.totalDuration;
    setCurrentTime(newTime);
  };

  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(gameProgress.totalDuration, gameProgress.currentTime + seconds));
    setCurrentTime(newTime);
  };

  const handleAddTrigger = () => {
    if (!newTriggerName.trim()) return;
    
    addTriggerPoint({
      time: gameProgress.currentTime,
      name: newTriggerName.trim(),
      danmakuIds: selectedDanmakus,
    });
    
    setNewTriggerName('');
    setSelectedDanmakus([]);
    setShowTriggerModal(false);
  };

  const handleToggleDanmakuSelect = (id: string) => {
    setSelectedDanmakus(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const progressPercent = (gameProgress.currentTime / gameProgress.totalDuration) * 100;

  const upcomingTriggers = gameProgress.triggerPoints
    .filter(t => t.time >= gameProgress.currentTime)
    .sort((a, b) => a.time - b.time)
    .slice(0, 3);

  return (
    <div className="w-full bg-game-dark-800/90 backdrop-blur-lg border-t border-neon-cyan/20 p-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSkip(-10)}
              className="p-2 rounded-lg bg-game-dark-700 text-gray-400 hover:text-white hover:bg-game-dark-600 transition-colors"
            >
              <SkipBack size={18} />
            </button>
            <button
              onClick={togglePlay}
              className="p-3 rounded-full bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
            <button
              onClick={() => handleSkip(10)}
              className="p-2 rounded-lg bg-game-dark-700 text-gray-400 hover:text-white hover:bg-game-dark-600 transition-colors"
            >
              <SkipForward size={18} />
            </button>
          </div>

          <div className="flex-1">
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="relative h-8 bg-game-dark-700 rounded-lg cursor-pointer group"
            >
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-cyan/30 to-neon-pink/30 rounded-l-lg transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
              
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-neon-cyan/50 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progressPercent}% - 8px)` }}
              />

              {gameProgress.triggerPoints.map(trigger => {
                const triggerPercent = (trigger.time / gameProgress.totalDuration) * 100;
                return (
                  <div
                    key={trigger.id}
                    className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full cursor-pointer transition-transform hover:scale-125 ${
                      trigger.triggered ? 'bg-gray-500' : 'bg-neon-yellow'
                    }`}
                    style={{ left: `calc(${triggerPercent}% - 6px)` }}
                    title={trigger.name}
                  />
                );
              })}

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs text-white font-jetbrains-mono drop-shadow-lg">
                  {formatTime(gameProgress.currentTime)} / {formatTime(gameProgress.totalDuration)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTriggerModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neon-yellow/20 text-neon-yellow hover:bg-neon-yellow/30 transition-colors text-sm"
            >
              <Flag size={16} />
              标记
            </button>
            <button
              onClick={toggleSettings}
              className="p-2 rounded-lg bg-game-dark-700 text-gray-400 hover:text-white hover:bg-game-dark-600 transition-colors"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {gameProgress.syncEnabled && upcomingTriggers.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-jetbrains-mono">即将触发:</span>
            {upcomingTriggers.map(trigger => (
              <div
                key={trigger.id}
                className="flex items-center gap-1 px-2 py-1 rounded bg-neon-yellow/10 text-neon-yellow"
              >
                <Flag size={12} />
                <span>{trigger.name}</span>
                <span className="text-gray-500">({formatTime(trigger.time)})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showTriggerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-game-dark-800 rounded-xl border border-neon-cyan/30 p-6 w-full max-w-lg animate-bounce-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white font-orbitron">添加触发点</h3>
              <button
                onClick={() => setShowTriggerModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-jetbrains-mono">
                  触发点名称
                </label>
                <input
                  type="text"
                  value={newTriggerName}
                  onChange={(e) => setNewTriggerName(e.target.value)}
                  placeholder="例如: Boss战开始、剧情转折等"
                  className="w-full px-4 py-2 rounded-lg bg-game-dark-700 text-white placeholder-gray-500 border border-neon-cyan/30 focus:border-neon-cyan outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2 font-jetbrains-mono">
                  触发时间: {formatTime(gameProgress.currentTime)}
                </label>
                <div className="p-3 rounded-lg bg-game-dark-700/50 text-gray-400 text-sm">
                  将在当前播放时间触发
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2 font-jetbrains-mono">
                  关联弹幕 ({selectedDanmakus.length} 条)
                </label>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-neon-cyan/20">
                  {loadedDanmakus.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      暂无弹幕数据
                    </div>
                  ) : (
                    <div className="divide-y divide-game-dark-700">
                      {loadedDanmakus.slice(0, 50).map((danmaku: Danmaku) => (
                        <label
                          key={danmaku.id}
                          className={`flex items-center gap-3 p-2 hover:bg-white/5 cursor-pointer transition-colors ${
                            selectedDanmakus.includes(danmaku.id) ? 'bg-neon-cyan/5' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedDanmakus.includes(danmaku.id)}
                            onChange={() => handleToggleDanmakuSelect(danmaku.id)}
                            className="w-4 h-4 rounded border-neon-cyan/30 text-neon-cyan focus:ring-neon-cyan"
                          />
                          <span
                            className="text-sm flex-1 truncate"
                            style={{ color: danmaku.color }}
                          >
                            {danmaku.content}
                          </span>
                          <span className="text-xs text-gray-500 font-jetbrains-mono">
                            {formatTime(danmaku.playTime)}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowTriggerModal(false)}
                  className="px-4 py-2 rounded-lg bg-game-dark-700 text-gray-400 hover:text-white transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddTrigger}
                  disabled={!newTriggerName.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                  添加触发点
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
