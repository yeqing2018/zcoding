import { DanmakuRenderer } from './Renderer';
import { TrackManager } from './TrackManager';
import { danmakuPool, PooledDanmaku } from './Pool';
import type {
  Danmaku,
  DanmakuStats,
  EngineStatus,
  DanmakuEngineConfig,
  PlayerConfig,
  DanmakuType,
} from '../types/danmaku';
import { DEFAULT_ENGINE_CONFIG } from '../types/danmaku';

type EventCallback = (...args: any[]) => void;

export class DanmakuEngine {
  private renderer: DanmakuRenderer;
  private trackManager: TrackManager;
  private config: DanmakuEngineConfig;
  private playerConfig: PlayerConfig;

  private canvas: HTMLCanvasElement | null = null;
  private status: EngineStatus = 'idle';
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private startTime: number = 0;

  private boundHandleCanvasClick: (e: MouseEvent) => void;
  private boundHandleCanvasMouseMove: (e: MouseEvent) => void;

  private activeDanmakus: PooledDanmaku[] = [];
  private pendingDanmakus: Danmaku[] = [];
  private history: Danmaku[] = [];

  private eventListeners: Map<string, EventCallback[]> = new Map();

  private stats: DanmakuStats = {
    totalCount: 0,
    displayedCount: 0,
    blockedCount: 0,
    fps: 0,
    memoryUsage: 0,
  };

  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;

  constructor(config?: Partial<DanmakuEngineConfig>, playerConfig?: Partial<PlayerConfig>) {
    this.config = { ...DEFAULT_ENGINE_CONFIG, ...config };
    this.playerConfig = playerConfig as PlayerConfig;
    
    this.renderer = new DanmakuRenderer();
    this.trackManager = new TrackManager(
      this.config.maxTracks,
      this.config.trackHeight,
      this.config.horizontalGap,
      this.playerConfig?.display?.area || 0.8
    );

    this.boundHandleCanvasClick = this.handleCanvasClick.bind(this);
    this.boundHandleCanvasMouseMove = this.handleCanvasMouseMove.bind(this);
  }

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.renderer.init(canvas);
    
    const rect = canvas.getBoundingClientRect();
    this.resize(rect.width, rect.height);
    
    this.status = 'idle';
    this.startTime = performance.now();
    
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.canvas) return;
    
    this.canvas.addEventListener('click', this.boundHandleCanvasClick);
    this.canvas.addEventListener('mousemove', this.boundHandleCanvasMouseMove);
  }

  private handleCanvasClick(e: MouseEvent): void {
    if (!this.canvas) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const hit = this.hitTest(x, y);
    if (hit) {
      this.emit('click', hit, e.clientX, e.clientY);
    }
  }

  private handleCanvasMouseMove(e: MouseEvent): void {
    if (!this.canvas) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const hit = this.hitTest(x, y);
    this.emit('hover', hit);
  }

  start(): void {
    if (this.status === 'running') return;
    
    this.status = 'running';
    this.lastFrameTime = performance.now();
    this.animate();
  }

  pause(): void {
    this.status = 'paused';
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  stop(): void {
    this.status = 'stopped';
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.clear();
  }

  private animate(): void {
    if (this.status !== 'running') return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    this.updateFPS(currentTime);
    this.processPendingDanmakus(currentTime);
    this.updateDanmakus(deltaTime, currentTime);
    
    if (this.playerConfig.display.showDanmaku) {
      this.renderer.clear();
      this.renderAllDanmakus(currentTime);
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  private updateFPS(currentTime: number): void {
    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.stats.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
    }
  }

  private processPendingDanmakus(currentTime: number): void {
    if (this.pendingDanmakus.length === 0) return;

    const maxBatch = Math.ceil(10 * this.playerConfig.display.density);
    const batch = this.pendingDanmakus.splice(0, maxBatch);

    for (const danmakuData of batch) {
      if (this.shouldFilterDanmaku(danmakuData)) {
        this.stats.blockedCount++;
        continue;
      }

      this.spawnDanmaku(danmakuData, currentTime);
    }
  }

  private shouldFilterDanmaku(danmaku: Danmaku): boolean {
    const filter = this.playerConfig.filter;

    if (filter.blockedUsers.includes(danmaku.userId)) {
      return true;
    }

    if (filter.blockedTypes.includes(danmaku.type as DanmakuType)) {
      return true;
    }

    for (const keyword of filter.blockedKeywords) {
      if (danmaku.content.includes(keyword)) {
        return true;
      }
    }

    if (danmaku.content.length > filter.maxLength) {
      return true;
    }

    return false;
  }

  private spawnDanmaku(danmakuData: Danmaku, currentTime: number): void {
    if (this.activeDanmakus.length >= this.config.maxDanmakuCount) {
      return;
    }

    const pooled = danmakuPool.acquire();
    pooled.assignFrom(danmakuData);

    const textSize = this.renderer.measureText(pooled.content, pooled.fontSize);
    pooled.width = textSize.width;
    pooled.height = textSize.height;

    const track = this.trackManager.getAvailableTrack(pooled, currentTime);
    if (!track) {
      danmakuPool.release(pooled);
      return;
    }

    pooled.trackIndex = track.index;
    pooled.y = track.y;
    pooled.startTime = currentTime;

    if (pooled.type === 'scroll') {
      pooled.x = this.renderer.getWidth();
    } else {
      pooled.x = (this.renderer.getWidth() - pooled.width) / 2;
    }

    this.trackManager.updateTrackOccupancy(track, pooled, currentTime);
    this.activeDanmakus.push(pooled);

    this.stats.totalCount++;
    this.stats.displayedCount++;
    this.history.push(danmakuData);
  }

  private updateDanmakus(deltaTime: number, currentTime: number): void {
    const toRemove: number[] = [];
    const speedMultiplier = this.playerConfig.display.speedMultiplier;
    const canvasWidth = this.renderer.getWidth();

    for (let i = 0; i < this.activeDanmakus.length; i++) {
      const danmaku = this.activeDanmakus[i];

      if (danmaku.type === 'scroll') {
        danmaku.x -= danmaku.speed * deltaTime * speedMultiplier;
        
        if (danmaku.x + danmaku.width < 0) {
          toRemove.push(i);
        }
      } else {
        const duration = 5000;
        if (currentTime - danmaku.startTime > duration) {
          toRemove.push(i);
        }
      }
    }

    for (let i = toRemove.length - 1; i >= 0; i--) {
      const index = toRemove[i];
      const danmaku = this.activeDanmakus[index];
      
      const tracks = this.trackManager.getTracks();
      const track = tracks[danmaku.trackIndex];
      if (track) {
        this.trackManager.releaseTrack(track);
      }

      danmakuPool.release(danmaku);
      this.activeDanmakus.splice(index, 1);
      this.stats.displayedCount--;
    }
  }

  private renderAllDanmakus(currentTime: number): void {
    for (const danmaku of this.activeDanmakus) {
      this.renderer.renderDanmaku(danmaku, this.playerConfig.display.opacity, currentTime);
    }
  }

  send(danmaku: Danmaku): void {
    this.pendingDanmakus.push(danmaku);
    this.emit('send', danmaku);
  }

  batchSend(danmakus: Danmaku[]): void {
    this.pendingDanmakus.push(...danmakus);
  }

  clear(): void {
    for (const danmaku of this.activeDanmakus) {
      danmakuPool.release(danmaku);
    }
    this.activeDanmakus = [];
    this.pendingDanmakus = [];
    this.trackManager.clear();
    this.renderer.clear();
    this.stats.displayedCount = 0;
  }

  hitTest(x: number, y: number): Danmaku | null {
    for (let i = this.activeDanmakus.length - 1; i >= 0; i--) {
      const danmaku = this.activeDanmakus[i];
      if (
        x >= danmaku.x &&
        x <= danmaku.x + danmaku.width &&
        y >= danmaku.y &&
        y <= danmaku.y + danmaku.height
      ) {
        return danmaku as Danmaku;
      }
    }
    return null;
  }

  resize(width: number, height: number): void {
    this.renderer.resize(width, height);
    this.trackManager.resize(width, height);
  }

  setSpeed(multiplier: number): void {
    this.playerConfig.display.speedMultiplier = Math.max(0.5, Math.min(2, multiplier));
  }

  setOpacity(opacity: number): void {
    this.playerConfig.display.opacity = Math.max(0, Math.min(1, opacity));
  }

  setFontSize(size: number): void {
    this.playerConfig.display.fontSize = Math.max(12, Math.min(72, size));
    this.renderer.setFontFamily(this.playerConfig.display.fontFamily);
  }

  setDensity(density: number): void {
    this.playerConfig.display.density = Math.max(0.1, Math.min(1, density));
  }

  setArea(area: number): void {
    this.playerConfig.display.area = Math.max(0.2, Math.min(1, area));
    this.trackManager.setAreaRatio(area);
  }

  toggleDisplay(show: boolean): void {
    this.playerConfig.display.showDanmaku = show;
    if (!show) {
      this.renderer.clear();
    }
  }

  setFontFamily(fontFamily: string): void {
    this.playerConfig.display.fontFamily = fontFamily;
    this.renderer.setFontFamily(fontFamily);
  }

  setShadowEnabled(enabled: boolean): void {
    this.playerConfig.display.shadowEnabled = enabled;
    this.renderer.setShadowEnabled(enabled);
  }

  getStats(): DanmakuStats {
    const perf = performance as any;
    if (perf.memory) {
      this.stats.memoryUsage = perf.memory.usedJSHeapSize / 1024 / 1024;
    }
    return { ...this.stats };
  }

  getHistory(startTime?: number, endTime?: number): Danmaku[] {
    if (startTime === undefined && endTime === undefined) {
      return [...this.history];
    }
    
    return this.history.filter(d => {
      const ts = d.timestamp;
      if (startTime !== undefined && ts < startTime) return false;
      if (endTime !== undefined && ts > endTime) return false;
      return true;
    });
  }

  getActiveDanmakuCount(): number {
    return this.activeDanmakus.length;
  }

  getStatus(): EngineStatus {
    return this.status;
  }

  on(event: string, callback: EventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback): void {
    const listeners = this.eventListeners.get(event);
    if (!listeners) return;
    
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  private emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (!listeners) return;
    
    for (const callback of listeners) {
      try {
        callback(...args);
      } catch (e) {
        console.error('Event listener error:', e);
      }
    }
  }

  updateConfig(playerConfig: Partial<PlayerConfig>): void {
    this.playerConfig = {
      ...this.playerConfig,
      ...playerConfig,
      display: { ...this.playerConfig.display, ...playerConfig.display },
      filter: { ...this.playerConfig.filter, ...playerConfig.filter },
      shortcut: { ...this.playerConfig.shortcut, ...playerConfig.shortcut },
    };
  }

  getConfig(): PlayerConfig {
    return { ...this.playerConfig };
  }

  destroy(): void {
    this.stop();
    
    if (this.canvas) {
      this.canvas.removeEventListener('click', this.boundHandleCanvasClick);
      this.canvas.removeEventListener('mousemove', this.boundHandleCanvasMouseMove);
    }
    
    this.clear();
    danmakuPool.clear();
    this.renderer.destroy();
    
    this.eventListeners.clear();
    this.history = [];
    
    this.canvas = null;
    this.status = 'idle';
  }
}
