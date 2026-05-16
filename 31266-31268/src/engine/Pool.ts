import type { Danmaku, DanmakuRenderData, DanmakuType } from '../types/danmaku';

export class ObjectPool<T> {
  private pool: T[] = [];
  private maxSize: number;
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    maxSize: number = 200
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  release(obj: T): void {
    this.resetFn(obj);
    if (this.pool.length < this.maxSize) {
      this.pool.push(obj);
    }
  }

  clear(): void {
    this.pool = [];
  }

  get size(): number {
    return this.pool.length;
  }
}

export class PooledDanmaku implements DanmakuRenderData {
  id: string = '';
  type: DanmakuType = 'scroll' as DanmakuType;
  content: string = '';
  color: string = '#ffffff';
  fontSize: number = 24;
  speed: number = 100;
  opacity: number = 1;
  userId: string = '';
  userName: string = '';
  timestamp: number = 0;
  playTime: number = 0;
  likes: number = 0;
  isBlocked: boolean = false;
  effects?: any;
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  trackIndex: number = -1;
  isRendering: boolean = false;
  startTime: number = 0;

  static create(): PooledDanmaku {
    return new PooledDanmaku();
  }

  static reset(obj: PooledDanmaku): void {
    obj.id = '';
    obj.content = '';
    obj.color = '#ffffff';
    obj.fontSize = 24;
    obj.speed = 100;
    obj.opacity = 1;
    obj.userId = '';
    obj.userName = '';
    obj.timestamp = 0;
    obj.playTime = 0;
    obj.likes = 0;
    obj.isBlocked = false;
    obj.effects = undefined;
    obj.x = 0;
    obj.y = 0;
    obj.width = 0;
    obj.height = 0;
    obj.trackIndex = -1;
    obj.isRendering = false;
    obj.startTime = 0;
  }

  assignFrom(data: Danmaku): void {
    Object.assign(this, data);
    this.isRendering = true;
  }
}

export const danmakuPool = new ObjectPool<PooledDanmaku>(
  PooledDanmaku.create,
  PooledDanmaku.reset,
  300
);
