import React, { useState, useRef } from 'react';
import {
  X, Monitor, Filter, Keyboard, Database, RotateCcw, Download, Upload, Trash2, UserX, Type, Eye, Gauge, Palette, ChevronRight, Image, Layout, Gamepad2, Square
} from 'lucide-react';
import { useDanmakuStore } from '../../store/useDanmakuStore';
import { danmakuJSON } from '../../utils/json';
import { generateDemoDanmakus } from '../../data/mockData';
import type { DanmakuType, BackgroundConfig, UILayoutConfig } from '../../types/danmaku';

const SETTING_SECTIONS = [
  { id: 'display', label: '显示设置', icon: Monitor },
  { id: 'background', label: '背景设置', icon: Image },
  { id: 'layout', label: '界面布局', icon: Layout },
  { id: 'progress', label: '进度同步', icon: Gamepad2 },
  { id: 'filter', label: '屏蔽设置', icon: Filter },
  { id: 'shortcut', label: '快捷键', icon: Keyboard },
  { id: 'data', label: '数据管理', icon: Database },
];

export const SettingsPanel: React.FC = () => {
  const {
    config,
    toggleSettings,
    history,
    updateDisplayConfig,
    updateFilterConfig,
    updateShortcutConfig,
    updateBackgroundConfig,
    updateUILayoutConfig,
    updateGameProgressConfig,
    addBlockedKeyword,
    removeBlockedKeyword,
    addBlockedUser,
    removeBlockedUser,
    blockDanmakuType,
    unblockDanmakuType,
    resetConfig,
    clearHistory,
    uploadBackgroundImage,
    toggleOnlineLoader,
    setLoadedDanmakus,
  } = useDanmakuStore();

  const [activeSection, setActiveSection] = useState('display');
  const [newKeyword, setNewKeyword] = useState('');
  const [newUser, setNewUser] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (history.length > 0) {
      danmakuJSON.downloadJSON(history, `danmakus_${Date.now()}.json`);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await danmakuJSON.readFromFile(file);
        setLoadedDanmakus(data);
      } catch (err) {
        console.error('Failed to import:', err);
      }
    }
    e.target.value = '';
  };

  const handleBgFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadBackgroundImage(file);
      } catch (err) {
        console.error('Failed to upload background:', err);
      }
    }
    e.target.value = '';
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      addBlockedKeyword(newKeyword.trim());
      setNewKeyword('');
    }
  };

  const handleAddUser = () => {
    if (newUser.trim()) {
      addBlockedUser(newUser.trim());
      setNewUser('');
    }
  };

  const handleLoadDemo = () => {
    const demoDanmakus = generateDemoDanmakus();
    setLoadedDanmakus(demoDanmakus);
    window.dispatchEvent(new CustomEvent('load-demo', { detail: demoDanmakus }));
  };

  const shortcutLabels: Record<string, string> = {
    toggleDanmaku: '切换弹幕',
    toggleFullscreen: '切换全屏',
    sendDanmaku: '发送弹幕',
    toggleSettings: '打开设置',
    playPause: '播放/暂停',
    reload: '重新加载',
    togglePreview: '切换预览',
    toggleEditor: '切换编辑器',
    skipForward: '快进10秒',
    skipBackward: '快退10秒',
  };

  const renderDisplaySettings = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-300 font-jetbrains-mono">
          <Type size={16} className="text-neon-cyan" />
          字体大小: {config.display.fontSize}px
        </label>
        <input
          type="range"
          min="12"
          max="72"
          value={config.display.fontSize}
          onChange={(e) => updateDisplayConfig({ fontSize: Number(e.target.value) })}
          className="w-full h-2 bg-game-dark-600 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-300 font-jetbrains-mono">
          <Eye size={16} className="text-neon-pink" />
          透明度: {Math.round(config.display.opacity * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={config.display.opacity * 100}
          onChange={(e) => updateDisplayConfig({ opacity: Number(e.target.value) / 100 })}
          className="w-full h-2 bg-game-dark-600 rounded-lg appearance-none cursor-pointer accent-neon-pink"
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-300 font-jetbrains-mono">
          <Gauge size={16} className="text-neon-yellow" />
          弹幕速度: {config.display.speedMultiplier.toFixed(1)}x
        </label>
        <input
          type="range"
          min="5"
          max="20"
          value={config.display.speedMultiplier * 10}
          onChange={(e) => updateDisplayConfig({ speedMultiplier: Number(e.target.value) / 10 })}
          className="w-full h-2 bg-game-dark-600 rounded-lg appearance-none cursor-pointer accent-neon-yellow"
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-300 font-jetbrains-mono">
          <Eye size={16} className="text-neon-green" />
          弹幕密度: {Math.round(config.display.density * 100)}%
        </label>
        <input
          type="range"
          min="10"
          max="100"
          value={config.display.density * 100}
          onChange={(e) => updateDisplayConfig({ density: Number(e.target.value) / 100 })}
          className="w-full h-2 bg-game-dark-600 rounded-lg appearance-none cursor-pointer accent-neon-green"
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-300 font-jetbrains-mono">
          <Monitor size={16} className="text-neon-purple" />
          显示区域: {Math.round(config.display.area * 100)}%
        </label>
        <input
          type="range"
          min="20"
          max="100"
          value={config.display.area * 100}
          onChange={(e) => updateDisplayConfig({ area: Number(e.target.value) / 100 })}
          className="w-full h-2 bg-game-dark-600 rounded-lg appearance-none cursor-pointer accent-neon-purple"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300 font-jetbrains-mono">
          字体阴影
        </span>
        <button
          onClick={() => updateDisplayConfig({ shadowEnabled: !config.display.shadowEnabled })}
          className={`w-12 h-6 rounded-full transition-colors duration-200 ${
            config.display.shadowEnabled ? 'bg-neon-cyan' : 'bg-game-dark-600'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
              config.display.shadowEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-300 font-jetbrains-mono">
          <Palette size={16} className="text-neon-cyan" />
          字体
        </label>
        <select
          value={config.display.fontFamily}
          onChange={(e) => updateDisplayConfig({ fontFamily: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-game-dark-700 text-white border border-neon-cyan/30 focus:border-neon-cyan outline-none font-jetbrains-mono text-sm"
        >
          <option value="'Microsoft YaHei', 'PingFang SC', sans-serif">微软雅黑</option>
          <option value="'SimHei', sans-serif">黑体</option>
          <option value="'KaiTi', serif">楷体</option>
          <option value="'SimSun', serif">宋体</option>
          <option value="'Arial', sans-serif">Arial</option>
          <option value="'Georgia', serif">Georgia</option>
        </select>
      </div>
    </div>
  );

  const renderBackgroundSettings = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm text-gray-300 font-jetbrains-mono">背景类型</label>
        <div className="grid grid-cols-3 gap-2">
          {(['color', 'gradient', 'image'] as BackgroundConfig['type'][]).map((type) => (
            <button
              key={type}
              onClick={() => updateBackgroundConfig({ type })}
              className={`px-3 py-2 rounded-lg text-sm font-jetbrains-mono transition-all ${
                config.background.type === type
                  ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                  : 'bg-game-dark-700 text-gray-400 border border-transparent hover:border-gray-600'
              }`}
            >
              {type === 'color' ? '纯色' : type === 'gradient' ? '渐变' : '图片'}
            </button>
          ))}
        </div>
      </div>

      {config.background.type === 'color' && (
        <div className="space-y-2">
          <label className="text-sm text-gray-300 font-jetbrains-mono">背景颜色</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={config.background.color}
              onChange={(e) => updateBackgroundConfig({ color: e.target.value })}
              className="w-12 h-10 rounded-lg cursor-pointer border-2 border-neon-cyan/30"
            />
            <input
              type="text"
              value={config.background.color}
              onChange={(e) => updateBackgroundConfig({ color: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg bg-game-dark-700 text-white border border-neon-cyan/30 focus:border-neon-cyan outline-none font-jetbrains-mono text-sm"
            />
          </div>
        </div>
      )}

      {config.background.type === 'image' && (
        <div className="space-y-3">
          <label className="text-sm text-gray-300 font-jetbrains-mono">背景图片</label>
          <input
            ref={bgFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleBgFileChange}
            className="hidden"
          />
          <button
            onClick={() => bgFileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/20 transition-all font-jetbrains-mono text-sm"
          >
            <Upload size={16} />
            上传背景图片
          </button>
          {config.background.imageUrl && (
            <div className="relative rounded-lg overflow-hidden h-32">
              <img
                src={config.background.imageUrl}
                alt="Background preview"
                className="w-full h-full object-cover"
                style={{ filter: `blur(${config.background.blur}px)` }}
              />
              <button
                onClick={() => updateBackgroundConfig({ imageUrl: '', type: 'color' })}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-300 font-jetbrains-mono">
          背景透明度: {Math.round(config.background.opacity * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={config.background.opacity * 100}
          onChange={(e) => updateBackgroundConfig({ opacity: Number(e.target.value) / 100 })}
          className="w-full h-2 bg-game-dark-600 rounded-lg appearance-none cursor-pointer accent-neon-purple"
        />
      </div>

      {config.background.type === 'image' && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-300 font-jetbrains-mono">
            背景模糊: {config.background.blur}px
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={config.background.blur}
            onChange={(e) => updateBackgroundConfig({ blur: Number(e.target.value) })}
            className="w-full h-2 bg-game-dark-600 rounded-lg appearance-none cursor-pointer accent-neon-yellow"
          />
        </div>
      )}
    </div>
  );

  const renderLayoutSettings = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-300 font-jetbrains-mono">
          <Square size={16} className="text-neon-cyan" />
          窗口圆角: {config.uiLayout.borderRadius}px
        </label>
        <input
          type="range"
          min="0"
          max="24"
          value={config.uiLayout.borderRadius}
          onChange={(e) => updateUILayoutConfig({ borderRadius: Number(e.target.value) })}
          className="w-full h-2 bg-game-dark-600 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300 font-jetbrains-mono">
          显示边框
        </span>
        <button
          onClick={() => updateUILayoutConfig({ showBorder: !config.uiLayout.showBorder })}
          className={`w-12 h-6 rounded-full transition-colors duration-200 ${
            config.uiLayout.showBorder ? 'bg-neon-cyan' : 'bg-game-dark-600'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
              config.uiLayout.showBorder ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {config.uiLayout.showBorder && (
        <>
          <div className="space-y-2">
            <label className="text-sm text-gray-300 font-jetbrains-mono">边框颜色</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={config.uiLayout.borderColor}
                onChange={(e) => updateUILayoutConfig({ borderColor: e.target.value })}
                className="w-12 h-10 rounded-lg cursor-pointer border-2 border-neon-cyan/30"
              />
              <input
                type="text"
                value={config.uiLayout.borderColor}
                onChange={(e) => updateUILayoutConfig({ borderColor: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg bg-game-dark-700 text-white border border-neon-cyan/30 focus:border-neon-cyan outline-none font-jetbrains-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-300 font-jetbrains-mono">
              边框宽度: {config.uiLayout.borderWidth}px
            </label>
            <input
              type="range"
              min="1"
              max="4"
              value={config.uiLayout.borderWidth}
              onChange={(e) => updateUILayoutConfig({ borderWidth: Number(e.target.value) })}
              className="w-full h-2 bg-game-dark-600 rounded-lg appearance-none cursor-pointer accent-neon-pink"
            />
          </div>
        </>
      )}

      <div className="space-y-3">
        <label className="text-sm text-gray-300 font-jetbrains-mono">多窗口布局</label>
        <div className="grid grid-cols-2 gap-2">
          {(['single', 'split-vertical', 'split-horizontal', 'grid'] as UILayoutConfig['windowLayout'][]).map((layout) => (
            <button
              key={layout}
              onClick={() => updateUILayoutConfig({ windowLayout: layout, multiWindowMode: layout !== 'single' })}
              className={`px-3 py-2 rounded-lg text-sm font-jetbrains-mono transition-all ${
                config.uiLayout.windowLayout === layout
                  ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/50'
                  : 'bg-game-dark-700 text-gray-400 border border-transparent hover:border-gray-600'
              }`}
            >
              {layout === 'single' ? '单窗口' : layout === 'split-vertical' ? '垂直分屏' : layout === 'split-horizontal' ? '水平分屏' : '网格布局'}
            </button>
          ))}
        </div>
      </div>

      {config.uiLayout.multiWindowMode && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-300 font-jetbrains-mono">
            预览窗口大小: {config.uiLayout.previewWindowSize}%
          </label>
          <input
            type="range"
            min="20"
            max="50"
            value={config.uiLayout.previewWindowSize}
            onChange={(e) => updateUILayoutConfig({ previewWindowSize: Number(e.target.value) })}
            className="w-full h-2 bg-game-dark-600 rounded-lg appearance-none cursor-pointer accent-neon-green"
          />
        </div>
      )}
    </div>
  );

  const renderProgressSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-300 font-jetbrains-mono">启用进度同步</span>
          <p className="text-xs text-gray-500 mt-1">弹幕播放与游戏进度同步</p>
        </div>
        <button
          onClick={() => updateGameProgressConfig({ enabled: !config.gameProgress.enabled })}
          className={`w-12 h-6 rounded-full transition-colors duration-200 ${
            config.gameProgress.enabled ? 'bg-neon-yellow' : 'bg-game-dark-600'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
              config.gameProgress.enabled ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {config.gameProgress.enabled && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-300 font-jetbrains-mono">自动触发剧情弹幕</span>
              <p className="text-xs text-gray-500 mt-1">到达触发点时自动播放对应弹幕</p>
            </div>
            <button
              onClick={() => updateGameProgressConfig({ syncEnabled: !config.gameProgress.syncEnabled })}
              className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                config.gameProgress.syncEnabled ? 'bg-neon-cyan' : 'bg-game-dark-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                  config.gameProgress.syncEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-300 font-jetbrains-mono">
              游戏总时长: {Math.floor(config.gameProgress.totalDuration / 60)}分{config.gameProgress.totalDuration % 60}秒
            </label>
            <input
              type="range"
              min="60"
              max="7200"
              step="60"
              value={config.gameProgress.totalDuration}
              onChange={(e) => updateGameProgressConfig({ totalDuration: Number(e.target.value) })}
              className="w-full h-2 bg-game-dark-600 rounded-lg appearance-none cursor-pointer accent-neon-yellow"
            />
          </div>

          <div className="p-3 rounded-lg bg-game-dark-700/50 border border-neon-yellow/20">
            <p className="text-xs text-gray-400 font-jetbrains-mono">
              💡 提示: 使用底部进度条可以添加剧情触发点，绑定特定弹幕在指定时间播放
            </p>
          </div>

          {config.gameProgress.triggerPoints.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-jetbrains-mono">
                已有触发点 ({config.gameProgress.triggerPoints.length})
              </label>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {config.gameProgress.triggerPoints.map((point) => (
                  <div
                    key={point.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-game-dark-700"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neon-yellow font-jetbrains-mono">
                        {Math.floor(point.time / 60)}:{(point.time % 60).toString().padStart(2, '0')}
                      </span>
                      <span className="text-sm text-white">{point.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{point.danmakuIds.length}条弹幕</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderFilterSettings = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h4 className="text-sm text-gray-300 font-jetbrains-mono flex items-center gap-2">
          <UserX size={16} className="text-neon-pink" />
          屏蔽弹幕类型
        </h4>
        <div className="flex flex-wrap gap-2">
          {(['scroll', 'top', 'bottom', 'color', 'special'] as DanmakuType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                if (config.filter.blockedTypes.includes(type)) {
                  unblockDanmakuType(type);
                } else {
                  blockDanmakuType(type);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-jetbrains-mono transition-all duration-200 ${
                config.filter.blockedTypes.includes(type)
                  ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/50'
                  : 'bg-game-dark-700 text-gray-300 border border-gray-600/50 hover:border-gray-500'
              }`}
            >
              {type === 'scroll' ? '滚动' : type === 'top' ? '顶部' : type === 'bottom' ? '底部' : type === 'color' ? '彩色' : '特效'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm text-gray-300 font-jetbrains-mono">屏蔽关键词</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
            placeholder="输入关键词..."
            className="flex-1 px-3 py-2 rounded-lg bg-game-dark-700 text-white placeholder-gray-500 border border-neon-cyan/30 focus:border-neon-cyan outline-none font-jetbrains-mono text-sm"
          />
          <button
            onClick={handleAddKeyword}
            className="px-4 py-2 rounded-lg bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 hover:bg-neon-cyan/30 transition-colors duration-200 font-jetbrains-mono text-sm"
          >
            添加
          </button>
        </div>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {config.filter.blockedKeywords.map((keyword) => (
            <span
              key={keyword}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-game-dark-700 text-gray-300 text-sm font-jetbrains-mono"
            >
              {keyword}
              <button
                onClick={() => removeBlockedKeyword(keyword)}
                className="text-gray-500 hover:text-neon-pink transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm text-gray-300 font-jetbrains-mono">屏蔽用户</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
            placeholder="输入用户ID..."
            className="flex-1 px-3 py-2 rounded-lg bg-game-dark-700 text-white placeholder-gray-500 border border-neon-cyan/30 focus:border-neon-cyan outline-none font-jetbrains-mono text-sm"
          />
          <button
            onClick={handleAddUser}
            className="px-4 py-2 rounded-lg bg-neon-pink/20 text-neon-pink border border-neon-pink/50 hover:bg-neon-pink/30 transition-colors duration-200 font-jetbrains-mono text-sm"
          >
            添加
          </button>
        </div>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {config.filter.blockedUsers.map((userId) => (
            <span
              key={userId}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-game-dark-700 text-gray-300 text-sm font-jetbrains-mono"
            >
              {userId}
              <button
                onClick={() => removeBlockedUser(userId)}
                className="text-gray-500 hover:text-neon-pink transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-300 font-jetbrains-mono">
          最大弹幕长度: {config.filter.maxLength}
        </label>
        <input
          type="range"
          min="20"
          max="200"
          value={config.filter.maxLength}
          onChange={(e) => updateFilterConfig({ maxLength: Number(e.target.value) })}
          className="w-full h-2 bg-game-dark-600 rounded-lg appearance-none cursor-pointer accent-neon-purple"
        />
      </div>
    </div>
  );

  const renderShortcutSettings = () => (
    <div className="space-y-4">
      {Object.entries(config.shortcut).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between">
          <span className="text-sm text-gray-300 font-jetbrains-mono">
            {shortcutLabels[key] || key}
          </span>
          <input
            type="text"
            value={value}
            onChange={(e) => updateShortcutConfig({ [key]: e.target.value })}
            className="px-3 py-1.5 rounded-lg bg-game-dark-700 text-white border border-neon-cyan/30 focus:border-neon-cyan outline-none font-jetbrains-mono text-sm w-32 text-center"
          />
        </div>
      ))}
      <p className="text-xs text-gray-500 font-jetbrains-mono mt-4">
        提示: 使用 Ctrl+键 或 单键 形式,如 "Ctrl+D" 或 "F"
      </p>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-game-dark-700/50 border border-neon-cyan/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300 font-jetbrains-mono">历史弹幕</span>
          <span className="text-sm text-neon-cyan font-jetbrains-mono">{history.length} 条</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300 font-jetbrains-mono">已加载弹幕</span>
          <span className="text-sm text-neon-purple font-jetbrains-mono">
            {useDanmakuStore.getState().loadedDanmakus.length} 条
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleExport}
          disabled={history.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/20 transition-all duration-200 font-jetbrains-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={16} />
          导出JSON
        </button>
        <button
          onClick={handleImportClick}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neon-purple/10 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/20 transition-all duration-200 font-jetbrains-mono text-sm"
        >
          <Upload size={16} />
          导入JSON
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={toggleOnlineLoader}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/30 hover:bg-neon-yellow/20 transition-all duration-200 font-jetbrains-mono text-sm"
      >
        <Download size={16} />
        在线加载
      </button>

      <button
        onClick={handleLoadDemo}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green/20 transition-all duration-200 font-jetbrains-mono text-sm"
      >
        加载演示弹幕
      </button>

      <div className="h-px bg-gray-700 my-2" />

      <button
        onClick={clearHistory}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neon-pink/10 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/20 transition-all duration-200 font-jetbrains-mono text-sm"
      >
        <Trash2 size={16} />
        清空历史
      </button>

      <button
        onClick={resetConfig}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-600/10 text-gray-400 border border-gray-600/30 hover:bg-gray-600/20 transition-all duration-200 font-jetbrains-mono text-sm"
      >
        <RotateCcw size={16} />
        恢复默认设置
      </button>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'display':
        return renderDisplaySettings();
      case 'background':
        return renderBackgroundSettings();
      case 'layout':
        return renderLayoutSettings();
      case 'progress':
        return renderProgressSettings();
      case 'filter':
        return renderFilterSettings();
      case 'shortcut':
        return renderShortcutSettings();
      case 'data':
        return renderDataSettings();
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={toggleSettings}
      />
      <div className="relative w-96 h-full bg-game-dark-800/95 backdrop-blur-lg border-l border-neon-cyan/20 animate-slide-in-right overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-neon-cyan/20">
          <h2 className="text-xl font-bold text-white font-orbitron">设置</h2>
          <button
            onClick={toggleSettings}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-32 border-r border-neon-cyan/10 py-4 space-y-1 overflow-y-auto">
            {SETTING_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-2 px-4 py-3 text-left transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-neon-cyan/10 text-neon-cyan border-r-2 border-neon-cyan'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <section.icon size={18} />
                <span className="text-sm font-jetbrains-mono">{section.label}</span>
                {activeSection === section.id && (
                  <ChevronRight size={14} className="ml-auto" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white font-jetbrains-mono mb-4">
              {SETTING_SECTIONS.find(s => s.id === activeSection)?.label}
            </h3>
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
};
