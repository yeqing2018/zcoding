import type { Danmaku, DanmakuEffect } from '../types/danmaku';
import { DanmakuType, DanmakuEffectType } from '../types/danmaku';

function validateAndTransformDanmaku(item: any, index: number): Danmaku {
  const validTypes: DanmakuType[] = [
    DanmakuType.SCROLL,
    DanmakuType.TOP,
    DanmakuType.BOTTOM,
    DanmakuType.COLOR,
    DanmakuType.SPECIAL,
  ];
  const validEffectTypes: DanmakuEffectType[] = [
    DanmakuEffectType.GLOW,
    DanmakuEffectType.SHAKE,
    DanmakuEffectType.RAINBOW,
    DanmakuEffectType.BOUNCE,
  ];

  const type = validTypes.includes(item.type) ? item.type : DanmakuType.SCROLL;
  const content = typeof item.content === 'string' ? item.content : String(item.content || '');
  const color = /^#[0-9A-Fa-f]{6}$/.test(item.color) ? item.color : '#ffffff';
  
  let effects: DanmakuEffect | undefined;
  if (item.effects && validEffectTypes.includes(item.effects.type)) {
    effects = {
      type: item.effects.type,
      intensity: Math.min(1, Math.max(0, Number(item.effects.intensity) || 0.5)),
    };
  }

  return {
    id: item.id || `imported_${Date.now()}_${index}`,
    type,
    content: content.substring(0, 200),
    color,
    fontSize: Math.min(72, Math.max(12, Number(item.fontSize) || 24)),
    speed: Math.min(300, Math.max(50, Number(item.speed) || 100)),
    opacity: Math.min(1, Math.max(0, Number(item.opacity) || 1)),
    userId: item.userId || 'anonymous',
    userName: item.userName || '匿名用户',
    timestamp: Number(item.timestamp) || Date.now(),
    playTime: Number(item.playTime) || 0,
    likes: Number(item.likes) || 0,
    isBlocked: Boolean(item.isBlocked),
    effects,
  };
}

export const danmakuJSON = {
  exportToJSON(danmakus: Danmaku[], pretty: boolean = true): string {
    const data = danmakus.map(d => ({
      id: d.id,
      type: d.type,
      content: d.content,
      color: d.color,
      fontSize: d.fontSize,
      speed: d.speed,
      opacity: d.opacity,
      userId: d.userId,
      userName: d.userName,
      timestamp: d.timestamp,
      playTime: d.playTime,
      likes: d.likes,
      isBlocked: d.isBlocked,
      effects: d.effects,
    }));

    return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  },

  importFromJSON(jsonString: string): Danmaku[] {
    try {
      const data = JSON.parse(jsonString);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid JSON format: expected an array');
      }

      return data.map((item: any, index: number) => validateAndTransformDanmaku(item, index));
    } catch (e) {
      console.error('Failed to import JSON:', e);
      throw e;
    }
  },

  downloadJSON(danmakus: Danmaku[], filename: string = 'danmakus.json'): void {
    const json = this.exportToJSON(danmakus);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  async readFromFile(file: File): Promise<Danmaku[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const danmakus = this.importFromJSON(content);
          resolve(danmakus);
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },
};
