import type { DanmakuType } from '../types/danmaku';
import type { PooledDanmaku } from './Pool';

export interface Track {
  index: number;
  y: number;
  lastDanmakuTime: number;
  lastDanmakuRight: number;
  danmakuCount: number;
  isFixed: boolean;
}

export class TrackManager {
  private tracks: Track[] = [];
  private fixedTopTracks: Track[] = [];
  private fixedBottomTracks: Track[] = [];
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;
  private trackHeight: number;
  private maxTracks: number;
  private areaRatio: number;
  private horizontalGap: number;

  constructor(
    maxTracks: number = 20,
    trackHeight: number = 36,
    horizontalGap: number = 50,
    areaRatio: number = 0.8
  ) {
    this.maxTracks = maxTracks;
    this.trackHeight = trackHeight;
    this.horizontalGap = horizontalGap;
    this.areaRatio = areaRatio;
  }

  resize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.initializeTracks();
  }

  private initializeTracks(): void {
    this.tracks = [];
    this.fixedTopTracks = [];
    this.fixedBottomTracks = [];

    const availableHeight = this.canvasHeight * this.areaRatio;
    const actualTrackCount = Math.min(
      this.maxTracks,
      Math.floor(availableHeight / this.trackHeight)
    );

    for (let i = 0; i < actualTrackCount; i++) {
      this.tracks.push({
        index: i,
        y: i * this.trackHeight,
        lastDanmakuTime: 0,
        lastDanmakuRight: -this.horizontalGap,
        danmakuCount: 0,
        isFixed: false,
      });
    }

    for (let i = 0; i < 3; i++) {
      this.fixedTopTracks.push({
        index: i,
        y: i * this.trackHeight + 10,
        lastDanmakuTime: 0,
        lastDanmakuRight: 0,
        danmakuCount: 0,
        isFixed: true,
      });
    }

    for (let i = 0; i < 3; i++) {
      this.fixedBottomTracks.push({
        index: i,
        y: this.canvasHeight - (i + 1) * this.trackHeight - 10,
        lastDanmakuTime: 0,
        lastDanmakuRight: 0,
        danmakuCount: 0,
        isFixed: true,
      });
    }
  }

  getAvailableTrack(
    danmaku: PooledDanmaku,
    currentTime: number
  ): Track | null {
    if (danmaku.type === 'top') {
      return this.getAvailableFixedTrack(this.fixedTopTracks, danmaku, currentTime);
    } else if (danmaku.type === 'bottom') {
      return this.getAvailableFixedTrack(this.fixedBottomTracks, danmaku, currentTime);
    }

    return this.getAvailableScrollTrack(danmaku, currentTime);
  }

  private getAvailableScrollTrack(
    danmaku: PooledDanmaku,
    currentTime: number
  ): Track | null {
    const minTrackIndex = 0;
    const maxTrackIndex = Math.floor(this.tracks.length * this.areaRatio);

    let bestTrack: Track | null = null;
    let bestScore = Infinity;

    for (let i = minTrackIndex; i < maxTrackIndex; i++) {
      const track = this.tracks[i];
      
      if (!track) continue;

      const timeSinceLastDanmaku = currentTime - track.lastDanmakuTime;
      if (timeSinceLastDanmaku < 100) continue;

      const requiredGap = danmaku.width + this.horizontalGap;
      const estimatedCurrentRight = track.lastDanmakuRight + danmaku.speed * (timeSinceLastDanmaku / 1000);
      
      if (estimatedCurrentRight < this.canvasWidth - requiredGap) {
        const score = track.danmakuCount * 1000 + i;
        if (score < bestScore) {
          bestScore = score;
          bestTrack = track;
        }
      }
    }

    return bestTrack;
  }

  private getAvailableFixedTrack(
    tracks: Track[],
    danmaku: PooledDanmaku,
    currentTime: number
  ): Track | null {
    for (const track of tracks) {
      const timeSinceLastDanmaku = currentTime - track.lastDanmakuTime;
      if (timeSinceLastDanmaku > 3000) {
        return track;
      }
    }
    return tracks[0] || null;
  }

  updateTrackOccupancy(track: Track, danmaku: PooledDanmaku, currentTime: number): void {
    track.lastDanmakuTime = currentTime;
    track.lastDanmakuRight = this.canvasWidth;
    track.danmakuCount++;
  }

  releaseTrack(track: Track): void {
    track.danmakuCount = Math.max(0, track.danmakuCount - 1);
  }

  getTrackY(trackIndex: number, type: DanmakuType): number {
    if (type === 'top') {
      return this.fixedTopTracks[trackIndex]?.y || trackIndex * this.trackHeight;
    } else if (type === 'bottom') {
      return this.fixedBottomTracks[trackIndex]?.y || this.canvasHeight - trackIndex * this.trackHeight;
    }
    return this.tracks[trackIndex]?.y || trackIndex * this.trackHeight;
  }

  getMaxScrollTracks(): number {
    return Math.floor(this.tracks.length * this.areaRatio);
  }

  setAreaRatio(ratio: number): void {
    this.areaRatio = Math.max(0.2, Math.min(1, ratio));
    this.initializeTracks();
  }

  getTracks(): Track[] {
    return this.tracks;
  }

  clear(): void {
    this.tracks.forEach(track => {
      track.lastDanmakuTime = 0;
      track.lastDanmakuRight = -this.horizontalGap;
      track.danmakuCount = 0;
    });
    this.fixedTopTracks.forEach(track => {
      track.lastDanmakuTime = 0;
      track.danmakuCount = 0;
    });
    this.fixedBottomTracks.forEach(track => {
      track.lastDanmakuTime = 0;
      track.danmakuCount = 0;
    });
  }
}
