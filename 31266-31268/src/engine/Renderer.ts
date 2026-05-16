import type { PooledDanmaku } from './Pool';
import type { DanmakuEffectType } from '../types/danmaku';

export class DanmakuRenderer {
  private ctx: CanvasRenderingContext2D | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private width: number = 0;
  private height: number = 0;
  private dpr: number = 1;
  private fontFamily: string = "'Microsoft YaHei', 'PingFang SC', sans-serif";
  private shadowEnabled: boolean = true;

  constructor() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
  }

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error('Failed to get 2D rendering context');
    }
    this.ctx.textBaseline = 'top';
  }

  resize(width: number, height: number): void {
    if (!this.canvas || !this.ctx) return;

    this.width = width;
    this.height = height;

    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.scale(this.dpr, this.dpr);
    this.ctx.textBaseline = 'top';
  }

  clear(): void {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  renderDanmaku(danmaku: PooledDanmaku, globalOpacity: number, currentTime: number): void {
    if (!this.ctx || !danmaku.isRendering) return;

    const ctx = this.ctx;
    const opacity = danmaku.opacity * globalOpacity;

    ctx.save();
    ctx.globalAlpha = opacity;

    if (danmaku.effects) {
      this.applyEffect(ctx, danmaku, danmaku.effects.type, danmaku.effects.intensity, currentTime);
    }

    ctx.font = `${danmaku.fontSize}px ${this.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    if (this.shadowEnabled) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
    }

    ctx.fillStyle = danmaku.color;
    ctx.fillText(danmaku.content, danmaku.x, danmaku.y);

    ctx.restore();
  }

  private applyEffect(
    ctx: CanvasRenderingContext2D,
    danmaku: PooledDanmaku,
    effectType: DanmakuEffectType,
    intensity: number,
    currentTime: number
  ): void {
    switch (effectType) {
      case 'glow':
        ctx.shadowColor = danmaku.color;
        ctx.shadowBlur = 10 + intensity * 10;
        break;
      case 'shake':
        const shakeX = Math.sin(currentTime * 0.02) * intensity * 3;
        const shakeY = Math.cos(currentTime * 0.02) * intensity * 3;
        ctx.translate(shakeX, shakeY);
        break;
      case 'rainbow':
        const hue = (currentTime * 0.1) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
        break;
      case 'bounce':
        const bounceY = Math.abs(Math.sin(currentTime * 0.01)) * intensity * 10;
        ctx.translate(0, -bounceY);
        break;
    }
  }

  measureText(content: string, fontSize: number): { width: number; height: number } {
    if (!this.ctx) {
      return { width: content.length * fontSize * 0.6, height: fontSize };
    }

    this.ctx.font = `${fontSize}px ${this.fontFamily}`;
    const metrics = this.ctx.measureText(content);
    return {
      width: metrics.width,
      height: fontSize,
    };
  }

  setFontFamily(fontFamily: string): void {
    this.fontFamily = fontFamily;
  }

  setShadowEnabled(enabled: boolean): void {
    this.shadowEnabled = enabled;
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D | null {
    return this.ctx;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getDpr(): number {
    return this.dpr;
  }

  destroy(): void {
    this.ctx = null;
    this.canvas = null;
  }
}
