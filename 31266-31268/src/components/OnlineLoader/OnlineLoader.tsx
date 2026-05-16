import React, { useState } from 'react';
import { X, Link, Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useDanmakuStore } from '../../store/useDanmakuStore';
import type { Danmaku } from '../../types/danmaku';

export const OnlineLoader: React.FC = () => {
  const {
    showOnlineLoader,
    setShowOnlineLoader,
    loadDanmakusFromUrl,
    setLoadedDanmakus,
  } = useDanmakuStore();

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  const exampleUrls = [
    { label: '示例弹幕1', url: 'https://api.example.com/danmakus/demo1.json' },
    { label: '示例弹幕2', url: 'https://api.example.com/danmakus/demo2.json' },
  ];

  const handleLoad = async () => {
    if (!url.trim()) {
      setError('请输入弹幕文件URL');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const danmakus = await loadDanmakusFromUrl(url.trim());
      setLoadedCount(danmakus.length);
      setSuccess(true);
      setTimeout(() => {
        setShowOnlineLoader(false);
        setSuccess(false);
        setUrl('');
      }, 1500);
    } catch (err) {
      setError('加载失败，请检查URL是否正确');
    } finally {
      setLoading(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      setError('无法读取剪贴板');
    }
  };

  const handleLoadExample = async (exampleUrl: string) => {
    setUrl(exampleUrl);
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockDanmakus: Danmaku[] = Array.from({ length: 50 }, (_, i) => ({
        id: `online_${i}`,
        type: ['scroll', 'scroll', 'scroll', 'top', 'bottom'][i % 5] as any,
        content: `在线弹幕 ${i + 1}: ${['666', '太强了', '精彩', '哈哈哈', '支持', '厉害', '神操作', '绝了'][i % 8]}`,
        color: ['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'][i % 6],
        fontSize: 24,
        speed: 100 + Math.random() * 50,
        opacity: 1,
        userId: `user_${i}`,
        userName: `玩家${i}`,
        timestamp: Date.now(),
        playTime: i * 2,
        likes: Math.floor(Math.random() * 100),
        isBlocked: false,
      }));
      
      setLoadedDanmakus(mockDanmakus);
      setLoadedCount(mockDanmakus.length);
      setSuccess(true);
      setTimeout(() => {
        setShowOnlineLoader(false);
        setSuccess(false);
        setUrl('');
      }, 1500);
    } catch (err) {
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  };

  if (!showOnlineLoader) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-game-dark-800 rounded-xl border border-neon-cyan/30 p-6 w-full max-w-md animate-bounce-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white font-orbitron">在线加载弹幕</h2>
          <button
            onClick={() => {
              setShowOnlineLoader(false);
              setUrl('');
              setError('');
              setSuccess(false);
            }}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2 font-jetbrains-mono">
              弹幕文件URL
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Link size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
                  placeholder="https://example.com/danmakus.json"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-game-dark-700 text-white placeholder-gray-500 border border-neon-cyan/30 focus:border-neon-cyan outline-none font-jetbrains-mono text-sm"
                />
              </div>
              <button
                onClick={handlePasteFromClipboard}
                className="px-3 py-2.5 rounded-lg bg-game-dark-700 text-gray-400 hover:text-white hover:bg-game-dark-600 transition-colors"
                title="粘贴"
              >
                粘贴
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-neon-pink/10 border border-neon-pink/30 text-neon-pink text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green text-sm">
              <CheckCircle size={16} />
              成功加载 {loadedCount} 条弹幕
            </div>
          )}

          <button
            onClick={handleLoad}
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 transition-all duration-200 font-jetbrains-mono disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                加载中...
              </>
            ) : success ? (
              <>
                <CheckCircle size={18} />
                加载成功
              </>
            ) : (
              <>
                <Download size={18} />
                加载弹幕
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-game-dark-800 text-xs text-gray-500 font-jetbrains-mono">
                示例
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {exampleUrls.map((example, index) => (
              <button
                key={index}
                onClick={() => handleLoadExample(example.url)}
                disabled={loading}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-game-dark-700/50 hover:bg-game-dark-700 transition-colors text-left group disabled:opacity-50"
              >
                <Download size={16} className="text-gray-500 group-hover:text-neon-cyan transition-colors" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{example.label}</div>
                  <div className="text-xs text-gray-500 truncate font-jetbrains-mono">{example.url}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
