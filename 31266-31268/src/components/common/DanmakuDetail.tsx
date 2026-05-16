import React from 'react';
import { X, Heart, Flag, User, Clock, MessageCircle } from 'lucide-react';
import type { Danmaku } from '../../types/danmaku';

interface DanmakuDetailProps {
  danmaku: Danmaku;
  position: { x: number; y: number };
  onClose: () => void;
  onLike: () => void;
  onReport: () => void;
}

export const DanmakuDetail: React.FC<DanmakuDetailProps> = ({
  danmaku,
  position,
  onClose,
  onLike,
  onReport,
}) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const typeLabels: Record<string, string> = {
    scroll: '滚动弹幕',
    top: '顶部固定',
    bottom: '底部固定',
    color: '彩色弹幕',
    special: '特效弹幕',
  };

  return (
    <div
      className="fixed z-50 bg-game-dark-800/95 backdrop-blur-lg rounded-xl border border-neon-cyan/30 shadow-2xl shadow-neon-cyan/10 p-4 w-72 animate-fade-in"
      style={{
        left: Math.min(position.x + 20, window.innerWidth - 300),
        top: Math.min(position.y, window.innerHeight - 250),
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-pink flex items-center justify-center text-white font-bold">
            {danmaku.userName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="text-white font-semibold font-jetbrains-mono">
              {danmaku.userName || '匿名用户'}
            </div>
            <div className="text-xs text-gray-500 font-jetbrains-mono">
              {typeLabels[danmaku.type]}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mb-4 p-3 rounded-lg bg-game-dark-700/50">
        <p
          className="text-sm break-words"
          style={{ color: danmaku.color || '#ffffff' }}
        >
          {danmaku.content}
        </p>
      </div>

      <div className="space-y-2 text-xs text-gray-400 font-jetbrains-mono mb-4">
        <div className="flex items-center gap-2">
          <User size={12} />
          <span>用户ID: {danmaku.userId || '未登录'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={12} />
          <span>发送时间: {formatTime(danmaku.timestamp)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageCircle size={12} />
          <span>弹幕ID: {danmaku.id.slice(0, 8)}...</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onLike}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-neon-pink/10 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/20 transition-all duration-200 text-sm"
        >
          <Heart size={14} />
          点赞 {danmaku.likes || 0}
        </button>
        <button
          onClick={onReport}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-700/50 text-gray-400 border border-gray-600/30 hover:bg-gray-700 transition-all duration-200 text-sm"
        >
          <Flag size={14} />
          举报
        </button>
      </div>
    </div>
  );
};
