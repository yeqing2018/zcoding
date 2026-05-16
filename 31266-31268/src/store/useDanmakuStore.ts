import { create } from 'zustand';
import type {
  Danmaku,
  PlayerConfig,
  DanmakuStats,
  EngineStatus,
  ProgressTriggerPoint,
  BackgroundConfig,
  UILayoutConfig,
  GameProgressConfig,
} from '../types/danmaku';
import { DEFAULT_CONFIG, DanmakuType } from '../types/danmaku';
import { storage } from '../utils/storage';
import { generateId } from '../utils/performance';

interface DanmakuState {
  config: PlayerConfig;
  isPlaying: boolean;
  isFullscreen: boolean;
  showSettings: boolean;
  showEmojiPicker: boolean;
  showColorPicker: boolean;
  showPreview: boolean;
  showEditor: boolean;
  showOnlineLoader: boolean;
  selectedDanmaku: Danmaku | null;
  editingDanmaku: Danmaku | null;
  loadedDanmakus: Danmaku[];
  stats: DanmakuStats;
  engineStatus: EngineStatus;
  history: Danmaku[];
  currentUser: {
    id: string;
    name: string;
  };
  gameProgress: GameProgressConfig;
  background: BackgroundConfig;
  uiLayout: UILayoutConfig;

  setConfig: (config: Partial<PlayerConfig>) => void;
  updateDisplayConfig: (config: Partial<PlayerConfig['display']>) => void;
  updateFilterConfig: (config: Partial<PlayerConfig['filter']>) => void;
  updateShortcutConfig: (config: Partial<PlayerConfig['shortcut']>) => void;
  updateBackgroundConfig: (config: Partial<BackgroundConfig>) => void;
  updateUILayoutConfig: (config: Partial<UILayoutConfig>) => void;
  updateGameProgressConfig: (config: Partial<GameProgressConfig>) => void;
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  toggleFullscreen: () => void;
  setIsFullscreen: (fullscreen: boolean) => void;
  toggleSettings: () => void;
  setShowSettings: (show: boolean) => void;
  toggleEmojiPicker: () => void;
  setShowEmojiPicker: (show: boolean) => void;
  toggleColorPicker: () => void;
  setShowColorPicker: (show: boolean) => void;
  togglePreview: () => void;
  setShowPreview: (show: boolean) => void;
  toggleEditor: () => void;
  setShowEditor: (show: boolean) => void;
  toggleOnlineLoader: () => void;
  setShowOnlineLoader: (show: boolean) => void;
  setSelectedDanmaku: (danmaku: Danmaku | null) => void;
  setEditingDanmaku: (danmaku: Danmaku | null) => void;
  setLoadedDanmakus: (danmakus: Danmaku[]) => void;
  addLoadedDanmaku: (danmaku: Danmaku) => void;
  updateLoadedDanmaku: (id: string, updates: Partial<Danmaku>) => void;
  removeLoadedDanmaku: (id: string) => void;
  setStats: (stats: Partial<DanmakuStats>) => void;
  setEngineStatus: (status: EngineStatus) => void;
  addToHistory: (danmaku: Danmaku) => void;
  clearHistory: () => void;
  addBlockedUser: (userId: string) => void;
  removeBlockedUser: (userId: string) => void;
  addBlockedKeyword: (keyword: string) => void;
  removeBlockedKeyword: (keyword: string) => void;
  blockDanmakuType: (type: DanmakuType) => void;
  unblockDanmakuType: (type: DanmakuType) => void;
  resetConfig: () => void;
  createDanmaku: (content: string, options?: Partial<Danmaku>) => Danmaku;
  updateDanmakuLikes: (id: string, likes: number) => void;
  addTriggerPoint: (point: Omit<ProgressTriggerPoint, 'id' | 'triggered'>) => void;
  removeTriggerPoint: (id: string) => void;
  updateTriggerPoint: (id: string, updates: Partial<ProgressTriggerPoint>) => void;
  setCurrentTime: (time: number) => void;
  setTotalDuration: (duration: number) => void;
  uploadBackgroundImage: (file: File) => Promise<string>;
  loadDanmakusFromUrl: (url: string) => Promise<Danmaku[]>;
}

const savedConfig = storage.loadConfig();
const savedBlockedUsers = storage.getBlockedUsers();
const savedBlockedKeywords = storage.getBlockedKeywords();

const initialConfig: PlayerConfig = {
  ...DEFAULT_CONFIG,
  ...savedConfig,
  filter: {
    ...DEFAULT_CONFIG.filter,
    ...savedConfig.filter,
    blockedUsers: savedBlockedUsers.length > 0 ? savedBlockedUsers : savedConfig.filter?.blockedUsers || [],
    blockedKeywords: savedBlockedKeywords.length > 0 ? savedBlockedKeywords : savedConfig.filter?.blockedKeywords || [],
  },
  background: { ...DEFAULT_CONFIG.background, ...savedConfig.background },
  uiLayout: { ...DEFAULT_CONFIG.uiLayout, ...savedConfig.uiLayout },
  gameProgress: { ...DEFAULT_CONFIG.gameProgress, ...savedConfig.gameProgress },
};

export const useDanmakuStore = create<DanmakuState>((set, get) => ({
  config: initialConfig,
  isPlaying: true,
  isFullscreen: false,
  showSettings: false,
  showEmojiPicker: false,
  showColorPicker: false,
  showPreview: false,
  showEditor: false,
  showOnlineLoader: false,
  selectedDanmaku: null,
  editingDanmaku: null,
  loadedDanmakus: [],
  stats: {
    totalCount: 0,
    displayedCount: 0,
    blockedCount: 0,
    fps: 0,
    memoryUsage: 0,
  },
  engineStatus: 'idle',
  history: [],
  currentUser: {
    id: `user_${generateId()}`,
    name: '玩家' + Math.floor(Math.random() * 10000),
  },
  gameProgress: initialConfig.gameProgress,
  background: initialConfig.background,
  uiLayout: initialConfig.uiLayout,

  setConfig: (config) => set((state) => {
    const newConfig = { ...state.config, ...config };
    storage.saveConfig(newConfig);
    return { config: newConfig };
  }),

  updateDisplayConfig: (displayConfig) => set((state) => {
    const newConfig = {
      ...state.config,
      display: { ...state.config.display, ...displayConfig },
    };
    storage.saveConfig(newConfig);
    return { config: newConfig };
  }),

  updateFilterConfig: (filterConfig) => set((state) => {
    const newConfig = {
      ...state.config,
      filter: { ...state.config.filter, ...filterConfig },
    };
    storage.saveConfig(newConfig);
    return { config: newConfig };
  }),

  updateShortcutConfig: (shortcutConfig) => set((state) => {
    const newConfig = {
      ...state.config,
      shortcut: { ...state.config.shortcut, ...shortcutConfig },
    };
    storage.saveConfig(newConfig);
    return { config: newConfig };
  }),

  updateBackgroundConfig: (bgConfig) => set((state) => {
    const newConfig = {
      ...state.config,
      background: { ...state.config.background, ...bgConfig },
    };
    storage.saveConfig(newConfig);
    return { config: newConfig, background: newConfig.background };
  }),

  updateUILayoutConfig: (layoutConfig) => set((state) => {
    const newConfig = {
      ...state.config,
      uiLayout: { ...state.config.uiLayout, ...layoutConfig },
    };
    storage.saveConfig(newConfig);
    return { config: newConfig, uiLayout: newConfig.uiLayout };
  }),

  updateGameProgressConfig: (progressConfig) => set((state) => {
    const newConfig = {
      ...state.config,
      gameProgress: { ...state.config.gameProgress, ...progressConfig },
    };
    storage.saveConfig(newConfig);
    return { config: newConfig, gameProgress: newConfig.gameProgress };
  }),

  togglePlay: () => set((state) => ({ 
    isPlaying: !state.isPlaying,
    gameProgress: { ...state.gameProgress, isPlaying: !state.gameProgress.isPlaying }
  })),
  setIsPlaying: (playing) => set({ 
    isPlaying: playing,
    gameProgress: { ...get().gameProgress, isPlaying: playing }
  }),

  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
  setIsFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),

  toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),
  setShowSettings: (show) => set({ showSettings: show }),

  toggleEmojiPicker: () => set((state) => ({ showEmojiPicker: !state.showEmojiPicker })),
  setShowEmojiPicker: (show) => set({ showEmojiPicker: show }),

  toggleColorPicker: () => set((state) => ({ showColorPicker: !state.showColorPicker })),
  setShowColorPicker: (show) => set({ showColorPicker: show }),

  togglePreview: () => set((state) => ({ showPreview: !state.showPreview })),
  setShowPreview: (show) => set({ showPreview: show }),

  toggleEditor: () => set((state) => ({ showEditor: !state.showEditor })),
  setShowEditor: (show) => set({ showEditor: show }),

  toggleOnlineLoader: () => set((state) => ({ showOnlineLoader: !state.showOnlineLoader })),
  setShowOnlineLoader: (show) => set({ showOnlineLoader: show }),

  setSelectedDanmaku: (danmaku) => set({ selectedDanmaku: danmaku }),
  setEditingDanmaku: (danmaku) => set({ editingDanmaku: danmaku }),

  setLoadedDanmakus: (danmakus) => set({ loadedDanmakus: danmakus }),
  addLoadedDanmaku: (danmaku) => set((state) => ({
    loadedDanmakus: [...state.loadedDanmakus, danmaku]
  })),
  updateLoadedDanmaku: (id, updates) => set((state) => ({
    loadedDanmakus: state.loadedDanmakus.map(d =>
      d.id === id ? { ...d, ...updates } : d
    )
  })),
  removeLoadedDanmaku: (id) => set((state) => ({
    loadedDanmakus: state.loadedDanmakus.filter(d => d.id !== id)
  })),

  setStats: (newStats) => set((state) => ({ stats: { ...state.stats, ...newStats } })),
  setEngineStatus: (status) => set({ engineStatus: status }),

  addToHistory: (danmaku) => set((state) => {
    const newHistory = [...state.history, danmaku].slice(-10000);
    return { history: newHistory };
  }),

  clearHistory: () => {
    storage.clearHistory();
    set({ history: [] });
  },

  addBlockedUser: (userId) => {
    storage.addBlockedUser(userId);
    set((state) => ({
      config: {
        ...state.config,
        filter: {
          ...state.config.filter,
          blockedUsers: [...state.config.filter.blockedUsers, userId],
        },
      },
    }));
  },

  removeBlockedUser: (userId) => {
    storage.removeBlockedUser(userId);
    set((state) => ({
      config: {
        ...state.config,
        filter: {
          ...state.config.filter,
          blockedUsers: state.config.filter.blockedUsers.filter(u => u !== userId),
        },
      },
    }));
  },

  addBlockedKeyword: (keyword) => {
    storage.addBlockedKeyword(keyword);
    set((state) => ({
      config: {
        ...state.config,
        filter: {
          ...state.config.filter,
          blockedKeywords: [...state.config.filter.blockedKeywords, keyword],
        },
      },
    }));
  },

  removeBlockedKeyword: (keyword) => {
    storage.removeBlockedKeyword(keyword);
    set((state) => ({
      config: {
        ...state.config,
        filter: {
          ...state.config.filter,
          blockedKeywords: state.config.filter.blockedKeywords.filter(k => k !== keyword),
        },
      },
    }));
  },

  blockDanmakuType: (type) => set((state) => ({
    config: {
      ...state.config,
      filter: {
        ...state.config.filter,
        blockedTypes: [...state.config.filter.blockedTypes, type],
      },
    },
  })),

  unblockDanmakuType: (type) => set((state) => ({
    config: {
      ...state.config,
      filter: {
        ...state.config.filter,
        blockedTypes: state.config.filter.blockedTypes.filter(t => t !== type),
      },
    },
  })),

  resetConfig: () => {
    storage.clearAll();
    set({ 
      config: { ...DEFAULT_CONFIG },
      background: DEFAULT_CONFIG.background,
      uiLayout: DEFAULT_CONFIG.uiLayout,
      gameProgress: DEFAULT_CONFIG.gameProgress,
    });
  },

  updateDanmakuLikes: (id, likes) => set((state) => ({
    history: state.history.map(d => 
      d.id === id ? { ...d, likes } : d
    ),
    loadedDanmakus: state.loadedDanmakus.map(d =>
      d.id === id ? { ...d, likes } : d
    ),
    selectedDanmaku: state.selectedDanmaku?.id === id 
      ? { ...state.selectedDanmaku, likes } 
      : state.selectedDanmaku,
  })),

  createDanmaku: (content, options = {}) => {
    const state = get();
    return {
      id: generateId(),
      type: DanmakuType.SCROLL,
      content,
      color: '#ffffff',
      fontSize: state.config.display.fontSize,
      speed: 100 + Math.random() * 50,
      opacity: 1,
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      timestamp: Date.now(),
      playTime: 0,
      likes: 0,
      isBlocked: false,
      ...options,
    };
  },

  addTriggerPoint: (point) => set((state) => ({
    gameProgress: {
      ...state.gameProgress,
      triggerPoints: [
        ...state.gameProgress.triggerPoints,
        { ...point, id: generateId(), triggered: false }
      ]
    }
  })),

  removeTriggerPoint: (id) => set((state) => ({
    gameProgress: {
      ...state.gameProgress,
      triggerPoints: state.gameProgress.triggerPoints.filter(p => p.id !== id)
    }
  })),

  updateTriggerPoint: (id, updates) => set((state) => ({
    gameProgress: {
      ...state.gameProgress,
      triggerPoints: state.gameProgress.triggerPoints.map(p =>
        p.id === id ? { ...p, ...updates } : p
      )
    }
  })),

  setCurrentTime: (time) => set((state) => ({
    gameProgress: { ...state.gameProgress, currentTime: time }
  })),

  setTotalDuration: (duration) => set((state) => ({
    gameProgress: { ...state.gameProgress, totalDuration: duration }
  })),

  uploadBackgroundImage: async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        get().updateBackgroundConfig({ imageUrl: url, type: 'image' });
        resolve(url);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  loadDanmakusFromUrl: async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load danmakus');
      const data = await response.json();
      get().setLoadedDanmakus(data);
      return data;
    } catch (error) {
      console.error('Failed to load danmakus from URL:', error);
      throw error;
    }
  },
}));
