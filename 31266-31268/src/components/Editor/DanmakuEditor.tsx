import React, { useState } from 'react';
import { X, Plus, Save, Trash2, Edit3, Clock, Type, Palette, Zap } from 'lucide-react';
import { useDanmakuStore } from '../../store/useDanmakuStore';
import type { Danmaku, DanmakuType } from '../../types/danmaku';
import { DanmakuType as DanmakuTypeEnum, PRESET_COLORS } from '../../types/danmaku';
import { generateId } from '../../utils/performance';

export const DanmakuEditor: React.FC = () => {
  const {
    showEditor,
    setShowEditor,
    loadedDanmakus,
    editingDanmaku,
    setEditingDanmaku,
    addLoadedDanmaku,
    updateLoadedDanmaku,
    removeLoadedDanmaku,
    currentUser,
  } = useDanmakuStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newDanmaku, setNewDanmaku] = useState<Partial<Danmaku>>({
    type: DanmakuTypeEnum.SCROLL,
    content: '',
    color: '#ffffff',
    fontSize: 24,
    speed: 100,
    opacity: 1,
    playTime: 0,
  });

  const typeOptions = [
    { value: DanmakuTypeEnum.SCROLL, label: '滚动弹幕' },
    { value: DanmakuTypeEnum.TOP, label: '顶部固定' },
    { value: DanmakuTypeEnum.BOTTOM, label: '底部固定' },
    { value: DanmakuTypeEnum.COLOR, label: '彩色弹幕' },
    { value: DanmakuTypeEnum.SPECIAL, label: '特效弹幕' },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const parseTime = (timeStr: string): number => {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      const [mins, secMs] = parts;
      const [secs, ms] = secMs.split('.');
      return parseInt(mins) * 60 + parseInt(secs) + (parseInt(ms || '0') / 100);
    }
    return 0;
  };

  const handleAddDanmaku = () => {
    if (!newDanmaku.content?.trim()) return;

    const danmaku: Danmaku = {
      id: generateId(),
      type: newDanmaku.type as DanmakuType,
      content: newDanmaku.content,
      color: newDanmaku.color || '#ffffff',
      fontSize: newDanmaku.fontSize || 24,
      speed: newDanmaku.speed || 100,
      opacity: newDanmaku.opacity || 1,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: Date.now(),
      playTime: newDanmaku.playTime || 0,
      likes: 0,
      isBlocked: false,
    };

    addLoadedDanmaku(danmaku);
    setNewDanmaku({
      type: DanmakuTypeEnum.SCROLL,
      content: '',
      color: '#ffffff',
      fontSize: 24,
      speed: 100,
      opacity: 1,
      playTime: 0,
    });
    setIsAdding(false);
  };

  const handleSaveEdit = () => {
    if (!editingDanmaku) return;
    updateLoadedDanmaku(editingDanmaku.id, editingDanmaku);
    setEditingDanmaku(null);
  };

  const handleEditDanmaku = (danmaku: Danmaku) => {
    setEditingDanmaku({ ...danmaku });
  };

  const handleDeleteDanmaku = (id: string) => {
    if (confirm('确定要删除这条弹幕吗？')) {
      removeLoadedDanmaku(id);
      if (editingDanmaku?.id === id) {
        setEditingDanmaku(null);
      }
    }
  };

  if (!showEditor) return null;

  return (
    <div className="fixed inset-y-0 left-0 w-[450px] bg-game-dark-800/95 backdrop-blur-lg border-r border-neon-cyan/20 z-40 flex flex-col animate-slide-in-right">
      <div className="flex items-center justify-between p-4 border-b border-neon-cyan/20">
        <h2 className="text-lg font-bold text-white font-orbitron">弹幕编辑器</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 transition-colors text-sm"
          >
            <Plus size={16} />
            新增
          </button>
          <button
            onClick={() => setShowEditor(false)}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {(isAdding || editingDanmaku) && (
        <div className="p-4 border-b border-neon-cyan/10 bg-game-dark-900/50">
          <h3 className="text-sm text-neon-cyan font-jetbrains-mono mb-3">
            {editingDanmaku ? '编辑弹幕' : '新增弹幕'}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Type size={12} />
                弹幕内容
              </label>
              <textarea
                value={editingDanmaku ? editingDanmaku.content : newDanmaku.content}
                onChange={(e) => {
                  if (editingDanmaku) {
                    setEditingDanmaku({ ...editingDanmaku, content: e.target.value });
                  } else {
                    setNewDanmaku({ ...newDanmaku, content: e.target.value });
                  }
                }}
                placeholder="输入弹幕内容..."
                className="w-full px-3 py-2 rounded-lg bg-game-dark-700 text-white placeholder-gray-500 border border-neon-cyan/30 focus:border-neon-cyan outline-none text-sm resize-none"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <Zap size={12} />
                  弹幕类型
                </label>
                <select
                  value={editingDanmaku ? editingDanmaku.type : newDanmaku.type}
                  onChange={(e) => {
                    if (editingDanmaku) {
                      setEditingDanmaku({ ...editingDanmaku, type: e.target.value as DanmakuType });
                    } else {
                      setNewDanmaku({ ...newDanmaku, type: e.target.value as DanmakuType });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-game-dark-700 text-white border border-neon-cyan/30 focus:border-neon-cyan outline-none text-sm"
                >
                  {typeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <Clock size={12} />
                  播放时间
                </label>
                <input
                  type="text"
                  value={editingDanmaku ? formatTime(editingDanmaku.playTime) : formatTime(newDanmaku.playTime || 0)}
                  onChange={(e) => {
                    const time = parseTime(e.target.value);
                    if (editingDanmaku) {
                      setEditingDanmaku({ ...editingDanmaku, playTime: time });
                    } else {
                      setNewDanmaku({ ...newDanmaku, playTime: time });
                    }
                  }}
                  placeholder="00:00.00"
                  className="w-full px-3 py-2 rounded-lg bg-game-dark-700 text-white border border-neon-cyan/30 focus:border-neon-cyan outline-none text-sm font-jetbrains-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">字体大小</label>
                <input
                  type="number"
                  min="12"
                  max="72"
                  value={editingDanmaku ? editingDanmaku.fontSize : newDanmaku.fontSize}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (editingDanmaku) {
                      setEditingDanmaku({ ...editingDanmaku, fontSize: val });
                    } else {
                      setNewDanmaku({ ...newDanmaku, fontSize: val });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-game-dark-700 text-white border border-neon-cyan/30 focus:border-neon-cyan outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">速度</label>
                <input
                  type="number"
                  min="50"
                  max="300"
                  value={editingDanmaku ? editingDanmaku.speed : newDanmaku.speed}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (editingDanmaku) {
                      setEditingDanmaku({ ...editingDanmaku, speed: val });
                    } else {
                      setNewDanmaku({ ...newDanmaku, speed: val });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-game-dark-700 text-white border border-neon-cyan/30 focus:border-neon-cyan outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">透明度</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={editingDanmaku ? editingDanmaku.opacity : newDanmaku.opacity}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (editingDanmaku) {
                      setEditingDanmaku({ ...editingDanmaku, opacity: val });
                    } else {
                      setNewDanmaku({ ...newDanmaku, opacity: val });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-game-dark-700 text-white border border-neon-cyan/30 focus:border-neon-cyan outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Palette size={12} />
                弹幕颜色
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editingDanmaku ? editingDanmaku.color : newDanmaku.color}
                  onChange={(e) => {
                    if (editingDanmaku) {
                      setEditingDanmaku({ ...editingDanmaku, color: e.target.value });
                    } else {
                      setNewDanmaku({ ...newDanmaku, color: e.target.value });
                    }
                  }}
                  className="w-10 h-10 rounded-lg cursor-pointer border-2 border-neon-cyan/30"
                />
                <div className="flex gap-1 flex-wrap">
                  {PRESET_COLORS.slice(0, 8).map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        if (editingDanmaku) {
                          setEditingDanmaku({ ...editingDanmaku, color });
                        } else {
                          setNewDanmaku({ ...newDanmaku, color });
                        }
                      }}
                      className="w-6 h-6 rounded border-2 transition-transform hover:scale-110"
                      style={{
                        backgroundColor: color,
                        borderColor: (editingDanmaku ? editingDanmaku.color : newDanmaku.color) === color ? '#00fff5' : 'transparent'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingDanmaku(null);
                }}
                className="px-4 py-2 rounded-lg bg-game-dark-700 text-gray-400 hover:text-white transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={editingDanmaku ? handleSaveEdit : handleAddDanmaku}
                disabled={!editingDanmaku?.content?.trim() && !newDanmaku.content?.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {editingDanmaku ? '保存修改' : '添加弹幕'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {loadedDanmakus.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Edit3 size={48} className="mb-4 opacity-30" />
            <p className="text-sm">暂无弹幕数据</p>
            <p className="text-xs mt-1">点击"新增"按钮添加弹幕</p>
          </div>
        ) : (
          <div className="divide-y divide-game-dark-700">
            {[...loadedDanmakus].sort((a, b) => a.playTime - b.playTime).map((danmaku, index) => (
              <div
                key={danmaku.id}
                className={`p-3 hover:bg-white/5 transition-colors ${
                  editingDanmaku?.id === danmaku.id ? 'bg-neon-cyan/10' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-jetbrains-mono">#{index + 1}</span>
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
                      {typeOptions.find(o => o.value === danmaku.type)?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditDanmaku(danmaku)}
                      className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-neon-cyan transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteDanmaku(danmaku.id)}
                      className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-neon-pink transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p
                  className="text-sm break-words"
                  style={{ color: danmaku.color }}
                >
                  {danmaku.content}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>{danmaku.fontSize}px</span>
                  <span>·</span>
                  <span>速度 {danmaku.speed}</span>
                  <span>·</span>
                  <span>透明度 {Math.round(danmaku.opacity * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-neon-cyan/10 text-xs text-gray-500 font-jetbrains-mono">
        共 {loadedDanmakus.length} 条弹幕
      </div>
    </div>
  );
};
