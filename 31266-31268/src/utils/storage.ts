import type { PlayerConfig, Danmaku } from '../types/danmaku';
import { DEFAULT_CONFIG } from '../types/danmaku';

const STORAGE_KEYS = {
  CONFIG: 'danmaku_player_config',
  HISTORY: 'danmaku_player_history',
  BLOCKED_USERS: 'danmaku_blocked_users',
  BLOCKED_KEYWORDS: 'danmaku_blocked_keywords',
};

function compressData(data: string): string {
  if (typeof btoa === 'function') {
    try {
      return btoa(encodeURIComponent(data));
    } catch {
      return data;
    }
  }
  return data;
}

function decompressData(data: string): string {
  if (typeof atob === 'function') {
    try {
      return decodeURIComponent(atob(data));
    } catch {
      return data;
    }
  }
  return data;
}

export const storage = {
  saveConfig(config: Partial<PlayerConfig>): void {
    try {
      const existing = this.loadConfig();
      const merged = {
        ...existing,
        ...config,
        display: { ...existing.display, ...config.display },
        filter: { ...existing.filter, ...config.filter },
        shortcut: { ...existing.shortcut, ...config.shortcut },
      };
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(merged));
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  },

  loadConfig(): PlayerConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load config:', e);
    }
    return { ...DEFAULT_CONFIG };
  },

  saveHistory(danmakus: Danmaku[]): void {
    try {
      const data = JSON.stringify(danmakus);
      const compressed = compressData(data);
      localStorage.setItem(STORAGE_KEYS.HISTORY, compressed);
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  },

  loadHistory(): Danmaku[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (data) {
        const decompressed = decompressData(data);
        return JSON.parse(decompressed);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
    return [];
  },

  clearHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  },

  getBlockedUsers(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BLOCKED_USERS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load blocked users:', e);
    }
    return [];
  },

  addBlockedUser(userId: string): void {
    try {
      const users = this.getBlockedUsers();
      if (!users.includes(userId)) {
        users.push(userId);
        localStorage.setItem(STORAGE_KEYS.BLOCKED_USERS, JSON.stringify(users));
      }
    } catch (e) {
      console.error('Failed to add blocked user:', e);
    }
  },

  removeBlockedUser(userId: string): void {
    try {
      const users = this.getBlockedUsers();
      const filtered = users.filter(u => u !== userId);
      localStorage.setItem(STORAGE_KEYS.BLOCKED_USERS, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to remove blocked user:', e);
    }
  },

  getBlockedKeywords(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BLOCKED_KEYWORDS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load blocked keywords:', e);
    }
    return [];
  },

  addBlockedKeyword(keyword: string): void {
    try {
      const keywords = this.getBlockedKeywords();
      if (!keywords.includes(keyword)) {
        keywords.push(keyword);
        localStorage.setItem(STORAGE_KEYS.BLOCKED_KEYWORDS, JSON.stringify(keywords));
      }
    } catch (e) {
      console.error('Failed to add blocked keyword:', e);
    }
  },

  removeBlockedKeyword(keyword: string): void {
    try {
      const keywords = this.getBlockedKeywords();
      const filtered = keywords.filter(k => k !== keyword);
      localStorage.setItem(STORAGE_KEYS.BLOCKED_KEYWORDS, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to remove blocked keyword:', e);
    }
  },

  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};

export const indexedDBStorage = {
  dbName: 'DanmakuPlayerDB',
  version: 1,
  db: null as IDBDatabase | null,

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('danmakus')) {
          const store = db.createObjectStore('danmakus', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('playTime', 'playTime');
        }

        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id' });
        }
      };
    });
  },

  async saveDanmakus(danmakus: Danmaku[]): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction('danmakus', 'readwrite');
    const store = transaction.objectStore('danmakus');

    for (const danmaku of danmakus) {
      store.put(danmaku);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  async getDanmakusByTimeRange(startTime: number, endTime: number): Promise<Danmaku[]> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction('danmakus', 'readonly');
    const store = transaction.objectStore('danmakus');
    const index = store.index('timestamp');
    const range = IDBKeyRange.bound(startTime, endTime);

    return new Promise((resolve, reject) => {
      const request = index.openCursor(range);
      const results: Danmaku[] = [];

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  },

  async clearDanmakus(): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction('danmakus', 'readwrite');
    const store = transaction.objectStore('danmakus');
    store.clear();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  },
};
