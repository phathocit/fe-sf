# OFFLINE AUDIO - IMPLEMENTATION GUIDE
## SmartFoodStreet Offline Mode

---

## 📋 TABLE OF CONTENTS
1. UI/UX Design (Mockups)
2. Frontend Implementation (React Components)
3. IndexedDB Utility
4. Service Worker Setup
5. Testing Checklist

---

## 1️⃣ UI/UX DESIGN - STATUS INDICATORS

### **1.1 Online Status Bar**
```
Position: Top-left of MapPage
Style: Minimal, non-intrusive

ONLINE STATE:
┌──────────────────────────┐
│ ✅ Online  [Language: VI ▼] │
└──────────────────────────┘
Background: #4CAF50 (green)
Font: 12px, semi-transparent

OFFLINE STATE:
┌──────────────────────────┐
│ 🔴 Offline [Language: VI ▼] │
└──────────────────────────┘
Background: #FF6B6B (red)
Font: 12px, semi-transparent
```

### **1.2 Audio Cache Badge**
```
Location: Next to "Play Audio" button

CACHED:
[🔊 Play Audio] 💾 
→ When hovered: "Saved offline"

CACHING:
[🔊 Play Audio] ⏳
→ When hovered: "Downloading..."

NOT CACHED:
[🔊 Play Audio] 📦
→ When hovered (offline): "Not saved yet"
```

### **1.3 Toast Notifications**
```
Auto-hide: 3 seconds
Position: Bottom-right

SCENARIOS:
1. 📦 Audio chưa tải
   "Khi có mạng, sẽ tự động tải"

2. ⏳ Đang tải
   "Đang tải audio guide..."

3. ✅ Tải xong
   "Audio đã lưu offline"

4. 🔄 Đồng bộ
   "Kiểm tra cập nhật audio..."

5. ❌ Lỗi
   "Lỗi tải audio. Thử lại khi online"
```

### **1.4 Audio Player (Offline Playback)**
```
┌─────────────────────────────────┐
│ 🎵 Audio Guide: Lãng Quán       │
│                                 │
│ [⏮ 0:00] ░░░░░░░░░░░░░░ [3:45] │
│ [⏯ Play]  [⏸ Pause]  [⏹ Stop]  │
│                                 │
│ 💾 Phát từ bộ nhớ (Offline)     │
│    ← Show when offline          │
└─────────────────────────────────┘
```

---

## 2️⃣ REACT COMPONENTS

### **Component 1: OfflineStatusBar.tsx**
```typescript
import React, { useState, useEffect } from 'react';

interface OfflineStatusBarProps {
  preferredLanguage: string;
  onLanguageChange: (lang: string) => void;
}

export const OfflineStatusBar: React.FC<OfflineStatusBarProps> = ({
  preferredLanguage,
  onLanguageChange
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`status-bar ${isOnline ? 'online' : 'offline'}`}>
      <div className="status-indicator">
        {isOnline ? (
          <>
            <span className="status-icon">✅</span>
            <span className="status-text">Online</span>
          </>
        ) : (
          <>
            <span className="status-icon">🔴</span>
            <span className="status-text">Offline</span>
          </>
        )}
      </div>

      <select 
        value={preferredLanguage} 
        onChange={(e) => onLanguageChange(e.target.value)}
        className="language-selector"
      >
        <option value="vi">Tiếng Việt</option>
        <option value="en-US">English</option>
        <option value="zh">中文</option>
      </select>
    </div>
  );
};
```

**CSS:**
```css
.status-bar {
  position: fixed;
  top: 10px;
  left: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 600;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.status-bar.online {
  background: rgba(76, 175, 80, 0.9);
  color: white;
}

.status-bar.offline {
  background: rgba(255, 107, 107, 0.9);
  color: white;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 0.7; }
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.language-selector {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 12px;
  cursor: pointer;
}
```

---

### **Component 2: AudioPlayButton.tsx**
```typescript
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { audioApi } from '../api/audioApi';
import { AudioCache } from '../utils/audioCache';

interface AudioPlayButtonProps {
  stallId: number;
  stallName: string;
  language: string;
}

export const AudioPlayButton: React.FC<AudioPlayButtonProps> = ({
  stallId,
  stallName,
  language
}) => {
  const [cacheStatus, setCacheStatus] = useState<'cached' | 'caching' | 'not-cached'>('not-cached');
  const [isOnline] = useState(navigator.onLine);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // Check cache status on mount
  useEffect(() => {
    checkCacheStatus();
  }, [stallId, language]);

  const checkCacheStatus = async () => {
    const cached = await AudioCache.get(stallId, language);
    setCacheStatus(cached ? 'cached' : 'not-cached');
  };

  const handlePlayAudio = async () => {
    try {
      // 1. Check cache first
      const cached = await AudioCache.get(stallId, language);

      if (cached) {
        // ✅ Phát từ cache
        playFromCache(cached.audioBlob);
        return;
      }

      // 2. Offline & không cache
      if (!isOnline) {
        toast.info('📦 Audio chưa tải. Khi có mạng, sẽ tự động tải', {
          autoClose: 3000,
          position: 'bottom-right'
        });
        return;
      }

      // 3. Online & không cache → download
      setCacheStatus('caching');
      toast.loading('⏳ Đang tải audio...', { toastId: 'audio-loading' });

      const audioData = await audioApi.getStallAudio(stallId, language);
      const audioBlob = await fetch(audioData.audioUrl).then(r => r.blob());

      // Lưu cache
      await AudioCache.save(stallId, language, audioBlob, audioData.audioHash);
      toast.dismiss('audio-loading');
      toast.success('✅ Audio đã lưu offline', { autoClose: 2000 });

      setCacheStatus('cached');
      playFromCache(audioBlob);

    } catch (error) {
      toast.error('❌ Lỗi tải audio. Thử lại khi online', { autoClose: 3000 });
      console.error('Error playing audio:', error);
    }
  };

  const playFromCache = (blob: Blob) => {
    const blobUrl = URL.createObjectURL(blob);
    const audioElement = new Audio(blobUrl);

    audioElement.play();
    setAudio(audioElement);
    setIsPlaying(true);

    // Show toast khi phát từ offline
    if (!isOnline || cacheStatus === 'cached') {
      toast.info('💾 Phát từ bộ nhớ (Offline)', {
        autoClose: 2000,
        position: 'bottom-right'
      });
    }

    audioElement.onended = () => setIsPlaying(false);
  };

  const getBadge = () => {
    switch (cacheStatus) {
      case 'cached':
        return <span className="cache-badge cached">💾</span>;
      case 'caching':
        return <span className="cache-badge caching">⏳</span>;
      case 'not-cached':
        return <span className="cache-badge not-cached">📦</span>;
    }
  };

  return (
    <div className="audio-play-button-container">
      <button
        className={`audio-play-button ${isPlaying ? 'playing' : ''}`}
        onClick={handlePlayAudio}
        title={cacheStatus === 'cached' ? 'Play (saved offline)' : 'Play audio guide'}
      >
        🔊 Nghe Audio
      </button>
      {getBadge()}
    </div>
  );
};
```

**CSS:**
```css
.audio-play-button-container {
  position: relative;
  display: inline-block;
}

.audio-play-button {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.audio-play-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.audio-play-button.playing {
  animation: pulse-button 1.5s infinite;
}

@keyframes pulse-button {
  0%, 100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
  50% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
}

.cache-badge {
  position: absolute;
  right: -8px;
  top: -8px;
  font-size: 14px;
  background: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cache-badge.cached {
  animation: none;
}

.cache-badge.caching {
  animation: spin 1s linear infinite;
}

.cache-badge.not-cached {
  opacity: 0.6;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

### **Component 3: AudioPlayer.tsx (Enhanced)**
```typescript
import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  audioBlob: Blob;
  stallName: string;
  isOffline: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioBlob,
  stallName,
  isOffline
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={URL.createObjectURL(audioBlob)} />

      <div className="player-header">
        <span className="stall-name">🎵 Audio Guide: {stallName}</span>
      </div>

      <div className="player-progress">
        <span className="time">{formatTime(currentTime)}</span>
        <progress
          className="progress-bar"
          value={currentTime}
          max={duration}
          onChange={(e) => {
            const audio = audioRef.current;
            if (audio) audio.currentTime = parseFloat(e.currentTarget.value);
          }}
        />
        <span className="time">{formatTime(duration)}</span>
      </div>

      <div className="player-controls">
        <button onClick={togglePlay} className="control-btn">
          {isPlaying ? '⏸ Pause' : '⏯ Play'}
        </button>
        <button className="control-btn">⏹ Stop</button>
      </div>

      {isOffline && (
        <div className="offline-indicator">
          💾 Phát từ bộ nhớ (Offline)
        </div>
      )}
    </div>
  );
};
```

**CSS:**
```css
.audio-player {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border: 1px solid #667eea30;
  border-radius: 12px;
  padding: 16px;
  margin: 12px 0;
}

.player-header {
  margin-bottom: 12px;
  font-weight: 600;
  color: #333;
}

.player-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.time {
  font-size: 12px;
  color: #666;
  min-width: 40px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  cursor: pointer;
}

.player-controls {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.control-btn {
  padding: 6px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.offline-indicator {
  margin-top: 12px;
  padding: 8px;
  background: rgba(255, 107, 107, 0.1);
  color: #FF6B6B;
  border-left: 3px solid #FF6B6B;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
```

---

## 3️⃣ INDEXEDDB UTILITY

### **File: src/utils/audioCache.ts**
```typescript
interface AudioCacheEntry {
  key: string;
  audioBlob: Blob;
  fileName: string;
  fileSize: number;
  audioHash: string;
  downloadedAt: Date;
  expiresAt: Date;
}

export class AudioCache {
  private static readonly DB_NAME = 'SmartFoodStreetDB';
  private static readonly STORE_NAME = 'audioCache';
  private static readonly MAX_SIZE = 80 * 1024 * 1024; // 80MB
  private static readonly EXPIRY_DAYS = 30;

  static async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'key' });
        }
      };
    });
  }

  static async save(
    stallId: number,
    language: string,
    blob: Blob,
    audioHash: string
  ): Promise<void> {
    const db = await this.openDB();
    const key = `audioCache_${stallId}_${language}`;

    const entry: AudioCacheEntry = {
      key,
      audioBlob: blob,
      fileName: `stall_${stallId}_${language}.mp3`,
      fileSize: blob.size,
      audioHash,
      downloadedAt: new Date(),
      expiresAt: new Date(Date.now() + this.EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put(entry);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.cleanupIfNeeded(); // Async cleanup
        resolve();
      };
    });
  }

  static async get(stallId: number, language: string): Promise<AudioCacheEntry | null> {
    const db = await this.openDB();
    const key = `audioCache_${stallId}_${language}`;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const entry = request.result;
        if (entry && new Date(entry.expiresAt) > new Date()) {
          resolve(entry);
        } else {
          resolve(null);
        }
      };
    });
  }

  static async getAll(): Promise<AudioCacheEntry[]> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  static async delete(stallId: number, language: string): Promise<void> {
    const db = await this.openDB();
    const key = `audioCache_${stallId}_${language}`;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  static async update(
    stallId: number,
    language: string,
    newBlob: Blob,
    newHash: string
  ): Promise<void> {
    await this.delete(stallId, language);
    await this.save(stallId, language, newBlob, newHash);
  }

  static async cleanupIfNeeded(): Promise<void> {
    const allEntries = await this.getAll();
    const now = new Date();

    // 1. Delete expired entries
    const expiredEntries = allEntries.filter(
      entry => new Date(entry.expiresAt) <= now
    );

    for (const entry of expiredEntries) {
      const [_, stallId, language] = entry.key.match(/audioCache_(\d+)_(.+)/) || [];
      if (stallId && language) {
        await this.delete(parseInt(stallId), language);
      }
    }

    // 2. Check total size
    const totalSize = allEntries.reduce((sum, entry) => sum + entry.fileSize, 0);

    if (totalSize > this.MAX_SIZE) {
      // Sort by downloadedAt, delete oldest
      const sortedEntries = allEntries.sort(
        (a, b) => new Date(a.downloadedAt).getTime() - new Date(b.downloadedAt).getTime()
      );

      let currentSize = totalSize;
      for (const entry of sortedEntries) {
        if (currentSize <= this.MAX_SIZE * 0.8) break; // 80% threshold

        const [_, stallId, language] = entry.key.match(/audioCache_(\d+)_(.+)/) || [];
        if (stallId && language) {
          await this.delete(parseInt(stallId), language);
          currentSize -= entry.fileSize;
        }
      }
    }
  }
}
```

---

## 4️⃣ SERVICE WORKER

### **File: public/sw.js**
```javascript
const CACHE_NAME = 'smartfoodstreet-v1';
const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching offline pages');
      return cache.addAll(OFFLINE_URLS);
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // API requests - Network first
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets - Cache first, fallback to network
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});
```

### **Register in src/main.tsx:**
```typescript
// After app mount
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      console.log('✅ Service Worker registered');
    })
    .catch((error) => {
      console.error('❌ Service Worker registration failed:', error);
    });
}
```

---

## 5️⃣ TESTING CHECKLIST

### **Test Case 1: Online → Cache Audio**
- [ ] Vào MapPage (online)
- [ ] Bấy "Play Audio" cho nearby stall
- [ ] Verify: Badge từ 📦 → ⏳ → 💾
- [ ] Toast: "Audio đã lưu offline"
- [ ] Dev Tools → Storage → IndexedDB → Verify data

### **Test Case 2: Offline → Play Cached**
- [ ] DevTools → Network → Offline
- [ ] Bấy "Play Audio" (cached)
- [ ] Verify: Audio plays từ IndexedDB
- [ ] Toast: "💾 Phát từ bộ nhớ (Offline)"
- [ ] Status bar: 🔴 Offline

### **Test Case 3: Offline → Not Cached**
- [ ] Offline mode
- [ ] Bấy "Play Audio" (not cached)
- [ ] Verify: Toast "Audio chưa tải"
- [ ] No error logs

### **Test Case 4: Online Again → Sync**
- [ ] Offline mode
- [ ] DevTools → Network → Online
- [ ] Verify: Status bar ✅ Online
- [ ] No toast spam
- [ ] Console: "Audio cache synced"

### **Test Case 5: Storage Limit**
- [ ] Cache 20+ audios
- [ ] Verify: Total size ~80MB
- [ ] Add 1 more audio
- [ ] Verify: Oldest audio deleted

### **Test Case 6: Expiry**
- [ ] Offline mode
- [ ] DevTools → Storage → IndexedDB
- [ ] Manually change `expiresAt` to past date
- [ ] Refresh app
- [ ] Verify: Expired audio auto-deleted

---

## 📊 IMPLEMENTATION TIMELINE

| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| 1 | Create IndexedDB utility | 1 day | |
| 2 | Create React components | 1 day | |
| 3 | Implement Service Worker | 0.5 day | |
| 4 | Integrate with MapPage | 1 day | |
| 5 | Testing + bug fixes | 1 day | |
| **Total** | | **4.5 days** | |

---

**Last Updated:** April 2026
**Author:** SmartFoodStreet Dev Team
**Status:** Ready for Implementation
