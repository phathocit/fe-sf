# OFFLINE AUDIO ARCHITECTURE
## Smart Caching & Sync Strategy

---

## 🏗️ SYSTEM ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER'S BROWSER                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    React Frontend (MapPage)                       │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │                                                                  │  │
│  │  OfflineStatusBar (✅ Online / 🔴 Offline)                     │  │
│  │           ↓                                                     │  │
│  │  AudioPlayButton (🔊 + 💾/📦/⏳ badges)                         │  │
│  │           ↓                                                     │  │
│  │  ┌─────────────────────────────────────────────────────────┐   │  │
│  │  │ handlePlayAudio()                                       │   │  │
│  │  ├─────────────────────────────────────────────────────────┤   │  │
│  │  │ 1. Check IndexedDB cache first                         │   │  │
│  │  │    │                                                   │   │  │
│  │  │    ├─ HIT → Play immediately (instant)              │   │  │
│  │  │    │         Show: "💾 Phát từ bộ nhớ"             │   │  │
│  │  │    │                                                   │   │  │
│  │  │    └─ MISS                                            │   │  │
│  │  │         │                                               │   │  │
│  │  │ 2. Check if online?                                    │   │  │
│  │  │    │                                                   │   │  │
│  │  │    ├─ OFFLINE → Toast "📦 Chưa tải. Đợi online"    │   │  │
│  │  │    │             Return (do nothing)                  │   │  │
│  │  │    │                                                   │   │  │
│  │  │    └─ ONLINE → Download from Cloudinary              │   │  │
│  │  │              Toast "⏳ Đang tải..."                   │   │  │
│  │  │              │                                         │   │  │
│  │  │ 3. Save to IndexedDB (background)                     │   │  │
│  │  │    Toast "✅ Audio đã lưu offline"                    │   │  │
│  │  │                                                        │   │  │
│  │  │ 4. Play audio                                          │   │  │
│  │  └─────────────────────────────────────────────────────────┘   │  │
│  │                                                                  │  │
│  │  Toast Notifications (Bottom-right, auto-hide 3s)             │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│           │                                                             │
│           ├──────────────────────────────┬──────────────────────┬─────┤
│           │                              │                      │     │
│     (On mount)                   (Async background)     (Online detection)
│                                                                  │
│  ┌──────────────────┐   ┌─────────────────────────┐  ┌────────────────┐
│  │ preloadAudio()   │   │ Service Worker (sw.js)  │  │ Online/Offline │
│  ├──────────────────┤   ├─────────────────────────┤  │ Event Listeners│
│  │ Get nearby 5     │   │ Fetch event interceptor │  ├────────────────┤
│  │ stalls (200m)    │   │ - Network first for API │  │ handleOnline() │
│  │ Background: tải  │   │ - Cache first for assets│  │   → Sync       │
│  │ audio của 5 stall│   │ Fallback to IndexedDB   │  │                │
│  │ ke IndexedDB     │   │ for offline playback    │  │handleOffline() │
│  │ (tidak chặn UI)  │   │                         │  │ → Show badge   │
│  └──────────────────┘   └─────────────────────────┘  └────────────────┘
│
│  ┌────────────────────────────────────────────────────────────────────┐
│  │              IndexedDB (Browser Local Storage)                      │
│  ├────────────────────────────────────────────────────────────────────┤
│  │                                                                    │
│  │ ObjectStore: "audioCache"                                         │
│  │ └─ Key: "audioCache_2_vi"                                         │
│  │    ├─ audioBlob: Blob (binary MP3)                               │
│  │    ├─ fileName: "stall_2_vi.mp3"                                  │
│  │    ├─ fileSize: 1048576 bytes                                     │
│  │    ├─ audioHash: "abc123..." (SHA256)                            │
│  │    ├─ downloadedAt: 2026-04-21T10:30:00Z                         │
│  │    └─ expiresAt: 2026-05-21T10:30:00Z (30 days TTL)             │
│  │                                                                    │
│  │ └─ Key: "audioCache_3_en-US"                                     │
│  │ └─ Key: "audioCache_4_zh"                                        │
│  │ ... (up to 80MB max, auto-cleanup oldest)                        │
│  │                                                                    │
│  └────────────────────────────────────────────────────────────────────┘
│           │ (Read/Write)
│           │
└─────────────────────────────────────────────────────────────────────────┘
          │
          │ (Network)
          │
┌─────────────────────────────────────────────────────────────────────────┐
│                       BACKEND / INTERNET                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────┐   ┌──────────────────────────────┐  │
│  │   Backend (Spring Boot)      │   │   Cloudinary CDN             │  │
│  ├──────────────────────────────┤   ├──────────────────────────────┤  │
│  │ GET /stall-translations/     │   │ Host: res.cloudinary.com     │  │
│  │  audio?stallId=2&lang=vi     │   │ Path: /video/upload/...      │  │
│  │                              │   │       /stall_2_vi.mp3        │  │
│  │ Return:                      │   │                              │  │
│  │ {                            │   │ CDN Edge Servers:            │  │
│  │   audioUrl: "https://res..   │   │ - Distributed globally       │  │
│  │   audioHash: "abc123..."     │   │ - Fast download              │  │
│  │   status: COMPLETED          │   │ - Automatic caching          │  │
│  │ }                            │   │                              │  │
│  └──────────────────────────────┘   └──────────────────────────────┘  │
│                                                                         │
│  Redis Cache (Server-side)                                             │
│  - Audio metadata cache: 1 hour TTL                                    │
│  - Stall list cache: 30 min TTL                                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLOW DIAGRAMS

### **Flow 1: FIRST TIME - Online, No Cache**

```
START
  │
  └─→ User click "Play Audio"
        │
        └─→ Check IndexedDB
              │
              ├─ CACHE HIT → Play & Return
              │
              └─ CACHE MISS
                    │
                    └─→ Check navigator.onLine
                          │
                          ├─ OFFLINE → Show toast "📦 Chưa tải"
                          │
                          └─ ONLINE
                                │
                                ├─→ Fetch from Cloudinary
                                │     (Show progress: ⏳)
                                │
                                ├─→ Save to IndexedDB
                                │     (Background, no wait)
                                │
                                ├─→ Show toast "✅ Lưu offline"
                                │
                                ├─→ Show audio player
                                │
                                └─→ Play audio
                                      │
                                      └─→ Show "💾 Phát từ bộ nhớ"
                                            (toast, auto-hide 2s)
END
```

### **Flow 2: REPEAT - Cached Audio**

```
START
  │
  └─→ User click "Play Audio"
        │
        └─→ Check IndexedDB
              │
              └─ CACHE HIT
                    │
                    ├─→ Create BlobURL
                    │
                    ├─→ Play audio INSTANTLY (0ms)
                    │
                    ├─→ Show "💾 Phát từ bộ nhớ"
                    │     (toast, auto-hide 2s)
                    │
                    └─→ Badge: 💾 (static)
END
```

### **Flow 3: OFFLINE MODE - User Goes Offline**

```
Browser detects offline
  │
  └─→ window 'offline' event fires
        │
        ├─→ OfflineStatusBar: ✅ → 🔴
        │
        ├─→ All audio play buttons:
        │   Badge: 💾 (no change if cached)
        │   Badge: 📦 (if not cached)
        │
        ├─→ Service Worker active:
        │   Network requests → Fail gracefully
        │   IndexedDB queries → Continue working
        │
        └─→ User can still play cached audios
              │
              └─→ Show "💾 Phát từ bộ nhớ (Offline)"
                    toast for reassurance
END
```

### **Flow 4: BACK ONLINE - Sync Cache**

```
Browser detects online
  │
  └─→ window 'online' event fires
        │
        ├─→ OfflineStatusBar: 🔴 → ✅
        │
        ├─→ syncAudioCache() runs
        │     (Background, async)
        │
        ├─→ Loop through all cached audios:
        │     │
        │     ├─ Check expiry (> 30 days?)
        │     │   └─ YES → Delete old audio
        │     │
        │     ├─ Check hash update (server hash ≠ local hash?)
        │     │   └─ YES → Download new audio
        │     │   └─ NO → Keep existing
        │     │
        │     └─ Continue...
        │
        └─→ Log: "✅ Audio cache synced"
              (No toast to user, silent background sync)
END
```

### **Flow 5: PRELOAD NEARBY AUDIOS (On MapPage Load)**

```
User enters MapPage (online)
  │
  └─→ useEffect runs
        │
        ├─→ Get user's GPS location
        │
        ├─→ Find nearby stalls (radius 200m)
        │     Example: [Lãng Quán, Ốc Oanh, Quán Dê]
        │
        ├─→ Get preferred language
        │
        ├─→ BACKGROUND: preloadAudio(stallId, language)
        │     for each nearby stall
        │
        │     For each:
        │     ├─ Check if already cached
        │     │   └─ YES → Skip
        │     │   └─ NO → Download + Save
        │     │
        │     └─ (Does NOT wait for all to finish)
        │
        └─→ UI fully rendered (user doesn't wait)
              │
              └─→ As audios finish downloading
                    └─→ Badges update: 📦 → ⏳ → 💾
END

NOTE: preloadAudio() is NON-BLOCKING
      User can browse, click buttons while background loading
```

---

## 💾 INDEXEDDB STORAGE DETAILS

### **Store Structure**

```
Database Name: "SmartFoodStreetDB"
Object Store: "audioCache"
Key Path: "key"

Example Entry:
{
  key: "audioCache_2_vi",
  audioBlob: Blob {
    type: "audio/mpeg",
    size: 1048576,
    [binary audio data...]
  },
  fileName: "stall_2_vi.mp3",
  fileSize: 1048576,
  audioHash: "e3b0c44298fc1c149afbf4c8996fb924",
  downloadedAt: 2026-04-21T10:30:00.000Z,
  expiresAt: 2026-05-21T10:30:00.000Z
}
```

### **Cleanup Strategy**

```
Trigger Points:
- Every 1 hour (auto cleanup)
- On app startup
- After saving new audio (if > 80MB)

Cleanup Algorithm:
1. Delete all entries where expiresAt < now()
   (Automatic expiry cleanup)

2. Calculate total size:
   sum(fileSize) for all entries

3. If total > 80MB:
   - Sort by downloadedAt (ascending)
   - Delete oldest entries until size ≤ 80% × 80MB = 64MB
   - Preserve: Recently used or visited stalls
```

---

## 🌐 NETWORK STRATEGIES

### **Service Worker Caching Levels**

```
LEVEL 1: API Requests
┌──────────────────────────────────────┐
│ Fetch: /api/stalls                   │
│                                      │
│ Strategy: Network FIRST              │
│ 1. Try network                       │
│ 2. If fails, use cache               │
│ 3. If no cache, fail gracefully      │
└──────────────────────────────────────┘

LEVEL 2: Static Assets (JS/CSS)
┌──────────────────────────────────────┐
│ Fetch: /bundle.js                    │
│                                      │
│ Strategy: Cache FIRST                │
│ 1. Try cache                         │
│ 2. If miss, fetch from network       │
│ 3. Update cache with new version     │
└──────────────────────────────────────┘

LEVEL 3: Audio Files (IndexedDB)
┌──────────────────────────────────────┐
│ Fetch: https://res.cloudinary.../mp3 │
│                                      │
│ Strategy: IndexedDB FIRST            │
│ 1. Check IndexedDB (fastest)         │
│ 2. If not found, try network         │
│ 3. Save to IndexedDB after download  │
└──────────────────────────────────────┘
```

---

## 🎨 UI STATE MACHINE

```
┌─────────────────────────────────────────┐
│         Audio Button States             │
└─────────────────────────────────────────┘

[INITIAL STATE] 📦 NOT_CACHED (online)
      │
      ├─ User click PLAY
      │  └─→ ⏳ CACHING
      │       └─→ [Download from Cloudinary]
      │           ├─ Success → ✅ [Save to IDB]
      │           │          └─→ 💾 CACHED (now and forever)
      │           │               │
      │           │               └─ User click PLAY → Play instantly
      │           │
      │           └─ Error → ❌ [Show error toast]
      │                    └─→ Back to 📦 NOT_CACHED
      │
      └─ User goes OFFLINE (no click)
         └─→ 📦 NOT_CACHED (offline mode)
            │
            └─ User click PLAY
               └─→ Toast "📦 Audio chưa tải"
                  No action taken

[CACHED STATE] 💾 CACHED (online or offline)
      │
      ├─ User click PLAY
      │  └─→ ⏯ PLAYING
      │       ├─ [Read from IndexedDB]
      │       ├─ Show audio player
      │       ├─ Toast "💾 Phát từ bộ nhớ"
      │       └─ Play completes → ⏹ STOPPED
      │
      └─ Time passes (30 days later)
         └─→ Auto cleanup runs
            └─→ 📦 DELETED
               └─→ Back to 📦 NOT_CACHED

[OFFLINE STATE] 🔴 (Whole app, all features)
      │
      ├─ Audio Player remains functional
      │  └─→ If cached → Play works normally
      │
      └─ Network requests fail gracefully
         └─→ Show offline badge
```

---

## 🔐 DATA PRIVACY & SECURITY

```
✅ Client-Side Only Storage
   - No data sent to server
   - No tracking of user's local cache
   - User has full control

✅ Hash Verification
   - Compare local hash vs server hash
   - Ensure audio hasn't been tampered
   - Update only if hash changed

✅ Auto-Expiry
   - 30 days TTL per audio
   - Automatic cleanup, no manual action
   - Prevents stale data

⚠️ Browser Storage Limits
   - IndexedDB: ~50-100MB per site (varies by browser)
   - Our limit: 80MB
   - Auto-cleanup when near limit

⚠️ HTTPS Required (Production)
   - Service Worker requires secure context
   - API calls must use HTTPS
   - Prevents man-in-the-middle
```

---

## 📊 PERFORMANCE METRICS

```
Online - First Play (New Audio):
- Network latency: ~500-1000ms (depends on CDN)
- IndexedDB save: ~50-200ms
- Total user wait: ~700-1200ms
- Status: ⏳ → 💾

Online - Repeat Play (Cached):
- IndexedDB lookup: ~10-20ms
- Audio load: ~100ms
- Total user wait: ~110-120ms
- Status: 💾 (instant)

Offline - Play (Cached):
- IndexedDB lookup: ~10-20ms
- Audio load: ~100ms
- No network overhead
- Total user wait: ~110-120ms
- Status: 💾 (instant, no difference)

Offline - Play (Not Cached):
- Toast show: ~100ms
- Zero overhead
- User experience: "Audio not saved yet"

Sync (Back Online):
- Check 10 audios: ~2-5 seconds (background)
- User doesn't wait
- Silent operation
```

---

## 🧪 EDGE CASES

### **Case 1: User Runs Out of Storage**
```
Scenario: Browser storage quota exceeded
Solution:
1. Cleanup routine detects this
2. Delete oldest audios aggressively
3. Preserve most recent 5 audios
4. Continue operation (graceful degradation)
Result: User might lose some old cached audios,
        but system keeps working
```

### **Case 2: Corrupted IndexedDB Entry**
```
Scenario: IDB entry is corrupted (rare)
Solution:
1. Try to read entry → Error
2. Catch error, delete corrupted entry
3. Re-fetch audio from network
4. Save fresh copy
Result: Transparent recovery, user experiences small delay
```

### **Case 3: Network Unstable (Flaky)**
```
Scenario: Network keeps cutting in/out
Solution:
1. First offline event → Don't trigger big sync
2. Debounce 'online' events (wait 2s)
3. Only sync if stable for 2s+
Result: Prevent race conditions, reduce errors
```

### **Case 4: Service Worker Fails to Register**
```
Scenario: Browser doesn't support SW (old browser)
Solution:
1. Graceful fallback (still works without SW)
2. IndexedDB still works manually
3. Users can cache audio but need network
4. App still functional
Result: Backward compatible, no breaking changes
```

---

**Last Updated:** April 2026
**Status:** Architecture Approved
**Next:** Implementation Phase
