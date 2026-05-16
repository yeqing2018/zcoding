import React, { useState, useMemo } from 'react';
import { X, Play, Pause, SkipBack, SkipForward, Search, SortAsc, SortDesc, Filter } from 'lucide-react';
import { useDanmakuStore } from '../../store/useDanmakuStore';
import type { Danmaku, DanmakuType } from '../../types/danmaku';
import { DanmakuType as DanmakuTypeEnum } from '../../types/danmaku';

export const DanmakuPreview: React.FC = () => {
  const { loadedDanmakus, showPreview, setShowPreview, gameProgress } = useDanmakuStore();
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'time' | 'type' | 'content'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<DanmakuType | 'all'>('all');
  const [previewTime, setPreviewTime] = useState(0);

  const typeLabels: Record<string, string> = {
    [DanmakuTypeEnum.SCROLL]: '滚动',
    [DanmakuTypeEnum.TOP]: '顶部',
    [DanmakuTypeEnum.BOTTOM]: '底部',
    [DanmakuTypeEnum.COLOR]: '彩色',
    [DanmakuTypeEnum.SPECIAL]: '特效',
  };

  const filteredDanmakus = useMemo(() => {
    let result = [...loadedDanmakus];

    if (searchText) {
      result = result.filter(d => 
        d.content.toLowerCase().includes(searchText.toLowerCase()) ||
        d.userName.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      result = result.filter(d => d.type === filterType);
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'time':
          comparison = a.playTime - b.playTime;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'content':
          comparison = a.content.localeCompare(b.content);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [loadedDanmakus, searchText, sortBy, sortOrder, filterType]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showPreview) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-game-dark-800/95 backdrop-blur-lg border-l border-neon-cyan/20 z-40 flex flex-col animate-slide-in-right">
      <div className="flex items-center justify-between p-4 border-b border-neon-cyan/20">
        <h2 className="text-lg font-bold text-white font-orbitron">弹幕预览</h2>
        <button
          onClick={() => setShowPreview(false)}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4 border-b border-neon-cyan/10">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="搜索弹幕..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-game-dark-700 text-white placeholder-gray-500 border border-neon-cyan/30 focus:border-neon-cyan outline-none text-sm"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as DanmakuType | 'all')}
            className="px-3 py-2 rounded-lg bg-game-dark-700 text-white border border-neon-cyan/30 focus:border-neon-cyan outline-none text-sm"
          >
            <option value="all">全部</option>
            <option value={DanmakuTypeEnum.SCROLL}>滚动</option>
            <option value={DanmakuTypeEnum.TOP}>顶部</option>
            <option value={DanmakuTypeEnum.BOTTOM}>底部</option>
            <option value={DanmakuTypeEnum.COLOR}>彩色</option>
            <option value={DanmakuTypeEnum.SPECIAL}>特效</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-jetbrains-mono">排序:</span>
          <div className="flex gap-1">
            {(['time', 'type', 'content'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSortBy(type)}
                className={`px-2 py-1 rounded text-xs font-jetbrains-mono transition-colors ${
                  sortBy === type
                    ? 'bg-neon-cyan/20 text-neon-cyan'
                    : 'bg-game-dark-700 text-gray-400 hover:text-white'
                }`}
              >
                {type === 'time' ? '时间' : type === 'type' ? '类型' : '内容'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 rounded bg-game-dark-700 text-gray-400 hover:text-white transition-colors"
          >
            {sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-neon-cyan/10">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setPreviewTime(Math.max(0, previewTime - 10))}
            className="p-2 rounded-lg bg-game-dark-700 text-gray-400 hover:text-white hover:bg-game-dark-600 transition-colors"
          >
            <SkipBack size={16} />
          </button>
          <button
            onClick={() => useDanmakuStore.getState().togglePlay()}
            className="p-2 rounded-lg bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 transition-colors"
          >
            {gameProgress.isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={() => setPreviewTime(Math.min(gameProgress.totalDuration, previewTime + 10))}
            className="p-2 rounded-lg bg-game-dark-700 text-gray-400 hover:text-white hover:bg-game-dark-600 transition-colors"
          >
            <SkipForward size={16} />
          </button>
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max={gameProgress.totalDuration}
              value={previewTime}
              onChange={(e) => setPreviewTime(Number(e.target.value))}
              className="w-full h-2 bg-game-dark-600 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
            />
          </div>
          <span className="text-xs text-gray-400 font-jetbrains-mono w-16 text-right">
            {formatTime(previewTime)}
          </span>
        </div>
        <div className="text-xs text-gray-500 font-jetbrains-mono">
          共 {loadedDanmakus.length} 条弹幕 · 当前显示 {filteredDanmakus.length} 条
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredDanmakus.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Filter size={48} className="mb-4 opacity-30" />
            <p className="text-sm">暂无匹配的弹幕</p>
          </div>
        ) : (
          <div className="divide-y divide-game-dark-700">
            {filteredDanmakus.map((danmaku, index) => (
              <div
                key={danmaku.id}
                className={`p-3 hover:bg-white/5 transition-colors cursor-pointer ${
                  Math.abs(danmaku.playTime - previewTime) < 2 ? 'bg-neon-cyan/5' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs text-neon-cyan font-jetbrains-mono">
                    {formatTime(danmaku.playTime)}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    danmaku.type === DanmakuTypeEnum.SCROLL ? 'bg-blue-500/20 text-blue-400' :
                    danmaku.type === DanmakuTypeEnum.TOP ? 'bg-yellow-500/20 text-yellow-400' :
                    danmaku.type === DanmakuTypeEnum.BOTTOM ? 'bg-green-500/20 text-green-400' :
                    danmaku.type === DanmakuTypeEnum.COLOR ? 'bg-pink-500/20 text-pink-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {typeLabels[danmaku.type]}
                  </span>
                </div>
                <p
                  className="text-sm mb-1 break-words"
                  style={{ color: danmaku.color }}
                >
                  {danmaku.content}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{danmaku.userName}</span>
                  <span>·</span>
                  <span>{danmaku.fontSize}px</span>
                  <span>·</span>
                  <span>#{index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
