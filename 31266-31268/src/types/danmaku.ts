export enum DanmakuType {
  SCROLL = 'scroll',
  TOP = 'top',
  BOTTOM = 'bottom',
  COLOR = 'color',
  SPECIAL = 'special',
}

export enum DanmakuEffectType {
  GLOW = 'glow',
  SHAKE = 'shake',
  RAINBOW = 'rainbow',
  BOUNCE = 'bounce',
}

export interface DanmakuEffect {
  type: DanmakuEffectType;
  intensity: number;
}

export interface Danmaku {
  id: string;
  type: DanmakuType;
  content: string;
  color: string;
  fontSize: number;
  speed: number;
  opacity: number;
  userId: string;
  userName: string;
  sender?: string;
  timestamp: number;
  playTime: number;
  likes: number;
  isBlocked: boolean;
  effects?: DanmakuEffect;
}

export interface DanmakuRenderData extends Danmaku {
  x: number;
  y: number;
  width: number;
  height: number;
  trackIndex: number;
  isRendering: boolean;
  startTime: number;
}

export interface BackgroundConfig {
  type: 'color' | 'image' | 'gradient';
  color: string;
  imageUrl: string;
  gradient: string;
  opacity: number;
  blur: number;
}

export interface UILayoutConfig {
  borderRadius: number;
  showBorder: boolean;
  borderColor: string;
  borderWidth: number;
  multiWindowMode: boolean;
  windowLayout: 'single' | 'split-vertical' | 'split-horizontal' | 'grid';
  previewWindowSize: number;
}

export interface GameProgressConfig {
  enabled: boolean;
  totalDuration: number;
  currentTime: number;
  isPlaying: boolean;
  syncEnabled: boolean;
  triggerPoints: ProgressTriggerPoint[];
}

export interface ProgressTriggerPoint {
  id: string;
  time: number;
  name: string;
  danmakuIds: string[];
  triggered: boolean;
}

export interface PlayerDisplayConfig {
  showDanmaku: boolean;
  opacity: number;
  fontSize: number;
  speedMultiplier: number;
  density: number;
  area: number;
  fontFamily: string;
  shadowEnabled: boolean;
}

export interface PlayerFilterConfig {
  blockedUsers: string[];
  blockedKeywords: string[];
  blockedTypes: DanmakuType[];
  maxLength: number;
}

export interface PlayerShortcutConfig {
  toggleDanmaku: string;
  toggleFullscreen: string;
  sendDanmaku: string;
  toggleSettings: string;
  playPause: string;
  reload: string;
  togglePreview: string;
  toggleEditor: string;
  skipForward: string;
  skipBackward: string;
}

export interface PlayerConfig {
  display: PlayerDisplayConfig;
  filter: PlayerFilterConfig;
  shortcut: PlayerShortcutConfig;
  background: BackgroundConfig;
  uiLayout: UILayoutConfig;
  gameProgress: GameProgressConfig;
}

export interface DanmakuStats {
  totalCount: number;
  displayedCount: number;
  blockedCount: number;
  fps: number;
  memoryUsage: number;
}

export type EngineStatus = 'idle' | 'running' | 'paused' | 'stopped';

export interface DanmakuEngineConfig {
  maxTracks: number;
  trackHeight: number;
  horizontalGap: number;
  minSpeed: number;
  maxSpeed: number;
  maxDanmakuCount: number;
  zIndex: number;
}

export const DEFAULT_ENGINE_CONFIG: DanmakuEngineConfig = {
  maxTracks: 20,
  trackHeight: 36,
  horizontalGap: 50,
  minSpeed: 80,
  maxSpeed: 200,
  maxDanmakuCount: 500,
  zIndex: 10,
};

export const DEFAULT_DISPLAY_CONFIG: PlayerDisplayConfig = {
  showDanmaku: true,
  opacity: 0.85,
  fontSize: 24,
  speedMultiplier: 1,
  density: 0.7,
  area: 0.8,
  fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
  shadowEnabled: true,
};

export const DEFAULT_FILTER_CONFIG: PlayerFilterConfig = {
  blockedUsers: [],
  blockedKeywords: [],
  blockedTypes: [],
  maxLength: 100,
};

export const DEFAULT_SHORTCUT_CONFIG: PlayerShortcutConfig = {
  toggleDanmaku: 'Ctrl+D',
  toggleFullscreen: 'F',
  sendDanmaku: 'Enter',
  toggleSettings: 'Ctrl+S',
  playPause: ' ',
  reload: 'R',
  togglePreview: 'Ctrl+P',
  toggleEditor: 'Ctrl+E',
  skipForward: 'ArrowRight',
  skipBackward: 'ArrowLeft',
};

export const DEFAULT_BACKGROUND_CONFIG: BackgroundConfig = {
  type: 'color',
  color: '#0a0a0f',
  imageUrl: '',
  gradient: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0f 100%)',
  opacity: 1,
  blur: 0,
};

export const DEFAULT_UI_LAYOUT_CONFIG: UILayoutConfig = {
  borderRadius: 12,
  showBorder: true,
  borderColor: '#00fff5',
  borderWidth: 1,
  multiWindowMode: false,
  windowLayout: 'single',
  previewWindowSize: 30,
};

export const DEFAULT_GAME_PROGRESS_CONFIG: GameProgressConfig = {
  enabled: false,
  totalDuration: 3600,
  currentTime: 0,
  isPlaying: false,
  syncEnabled: false,
  triggerPoints: [],
};

export const DEFAULT_CONFIG: PlayerConfig = {
  display: DEFAULT_DISPLAY_CONFIG,
  filter: DEFAULT_FILTER_CONFIG,
  shortcut: DEFAULT_SHORTCUT_CONFIG,
  background: DEFAULT_BACKGROUND_CONFIG,
  uiLayout: DEFAULT_UI_LAYOUT_CONFIG,
  gameProgress: DEFAULT_GAME_PROGRESS_CONFIG,
};

export const PRESET_COLORS = [
  '#ffffff',
  '#ff0000',
  '#ff7f00',
  '#ffff00',
  '#00ff00',
  '#00ffff',
  '#0000ff',
  '#8b00ff',
  '#ff00ff',
  '#ff69b4',
  '#ffd700',
  '#00fff5',
  '#ff006e',
  '#9d4edd',
  '#06ffa5',
];

export const EMOJI_LIST = [
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆',
  '😉', '😊', '😋', '😎', '😍', '🥰', '😘', '😗',
  '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏',
  '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '🥱',
  '😴', '😌', '😛', '😜', '🤤', '😒', '😓', '😔',
  '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞',
  '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩',
  '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪',
  '😵', '🥴', '🤠', '🥳', '🤡', '🤫', '🤭', '🧐',
  '👍', '👎', '👏', '🙌', '🤝', '❤️', '💔', '🔥',
  '⭐', '🎉', '🎊', '💯', '✅', '❌', '⚡', '💀',
];
