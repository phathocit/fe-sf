# TESTING OFFLINE MODE - COMPLETE GUIDE
## SmartFoodStreet Offline Feature Testing

---

## 🎯 NGROK & OFFLINE MODE - GIẢI THÍCH

### **Vấn Đề Hiện Tại:**

```
┌─────────────────────────────────────────────┐
│         Your Local Development Setup        │
├─────────────────────────────────────────────┤
│                                             │
│  Your Computer                              │
│  ├─ Frontend (React): localhost:5173       │
│  ├─ Backend (Java): localhost:8080         │
│  └─ MySQL: localhost:3306                  │
│  └─ Redis: localhost:6379                  │
│                                             │
│  NGROK Tunnel:                              │
│  ├─ https://abc123.ngrok.io → localhost   │
│  └─ (cần internet để hoạt động)            │
│                                             │
│  Mobile Device:                             │
│  └─ Truy cập qua: https://abc123.ngrok.io │
│     (phải có mạng)                         │
│                                             │
└─────────────────────────────────────────────┘
```

### **Ngrok Dùng Để Làm Gì?**

```
WITHOUT NGROK:
User (Mobile) ──X─→ Your Backend (localhost)
                 (Cannot reach - local network)

WITH NGROK:
Ngrok Tunnel
↓ (Public Internet)
User (Mobile) ──→ https://abc123.ngrok.io ──→ Backend
                 (Internet accessible)
```

### **Offline Mode Hoạt Động Như Thế Nào?**

```
NGROK STATUS   │ OFFLINE MODE  │ CAN ACCESS
───────────────┼───────────────┼────────────────────
Online (✅)    │ Cached data   │ App fully functional
               │ IndexedDB     │ - Browse stalls ✅
               │ Service Worker│ - Play cached audio ✅
───────────────┼───────────────┼────────────────────
Offline (🔴)   │ Same as above │ App still works!
               │ Cache-first   │ - Browse stalls ✅
               │ (no network)  │ - Play cached audio ✅
               │               │ - But NO download
───────────────┼───────────────┼────────────────────
OFFLINE        │ Cannot work   │ Cannot test offline
(Internet down)│ because ngrok │ because ngrok link
               │ needs internet│ is broken
```

---

## ✅ TESTING STRATEGY - 3 METHODS

### **METHOD 1: DevTools Offline Mode (RECOMMENDED & EASIEST)**

**Advantage:** 
- ✅ Ko cần turn off internet thật
- ✅ NgRok vẫn hoạt động
- ✅ Giả lập offline mode mà vẫn có mạng backend
- ✅ Test tất cả scenarios

**Step-by-step:**

#### **Step 1: Open Chrome DevTools**
```
Bấy: F12 hoặc Right-click → Inspect
```

#### **Step 2: Go to Network Tab**
```
Click tab: "Network"
```

#### **Step 3: Enable Offline Mode**
```
Tìm checkbox: ☐ Offline
Bấy vào: ☑ Offline

(Hoặc dùng keyboard shortcut: Ctrl+Shift+P → "Go offline")
```

**Screenshot mockup:**
```
┌─────────────────────────────────────────────┐
│ Chrome DevTools - Network Tab              │
├─────────────────────────────────────────────┤
│ ☐ Offline  ☐ Disable cache  ☐ Throttling │
│           ↑                                 │
│        Click để turn on offline             │
│                                             │
│ Request List:                               │
│ ...                                         │
└─────────────────────────────────────────────┘
```

#### **Step 4: Test Offline**
```
1. Go to MapPage
2. Bấy "Play Audio" (cached)
   → Should play from IndexedDB ✅
3. Toast: "💾 Phát từ bộ nhớ (Offline)"
4. Try other stalls (not cached)
   → Toast: "📦 Audio chưa tải"
5. Status bar: "🔴 Offline"
```

#### **Step 5: Go Back Online**
```
1. Uncheck: ☐ Offline (turn back on)
2. Refresh page or wait 2 seconds
3. Status bar: "✅ Online"
4. Should auto-sync cache (background)
```

---

### **METHOD 2: Disable WiFi/Mobile Data (REALISTIC)**

**Advantage:**
- ✅ Thực tế nhất
- ✅ Test true offline scenario
- ✅ Like real user

**Disadvantage:**
- ❌ NgRok link không hoạt động (cần internet)
- ❌ Ko thể test online/offline switch quickly
- ❌ Chậm hơn Method 1

**Step-by-step:**

#### **Step 1: Pre-cache Audio (Online)**
```
1. Open app with internet ON
2. Go to MapPage
3. Wait for background preload (10 seconds)
4. Bấy "Play" vài stalls để cache manually
5. Verify badges: 💾 (cached)
6. Open DevTools → Storage → IndexedDB
   → Verify data là lưu
```

#### **Step 2: Turn Off Internet**
```
1. Turn off WiFi on your device
2. (or disconnect from Ngrok)
3. App should show: "🔴 Offline"
```

#### **Step 3: Test Offline Features**
```
1. Can you browse stalls? 
   → YES (data cached or loaded before)

2. Can you play cached audio?
   → YES (from IndexedDB)

3. Can you download new audio?
   → NO (no network)

4. Status bar: "🔴 Offline"
```

#### **Step 4: Turn On Internet**
```
1. Turn on WiFi
2. App should auto-sync cache
3. Status bar: "✅ Online"
```

---

### **METHOD 3: Service Worker Throttle (FOR ADVANCED)**

**Advantage:**
- ✅ Can simulate slow network
- ✅ Test edge cases

**How:**
```
DevTools → Network Tab → Throttling dropdown
  → Select "Slow 3G" or "Fast 3G"
  → App runs slower, simulate bad network
```

---

## 📋 TESTING CHECKLIST - 10 TEST CASES

### **TEST 1: Online - First Time Cache**
```
Setup: App online, fresh IndexedDB (empty)
Actions:
  1. Go to MapPage
  2. Wait 5 seconds for preload
  3. Verify: Nearby stalls should have ⏳ or 💾
  4. Click "Play Audio" on stall
  
Expected Results:
  ✅ Status bar: "✅ Online"
  ✅ Toast: "⏳ Đang tải..." (if not cached)
  ✅ Audio plays
  ✅ Toast: "✅ Audio đã lưu offline"
  ✅ Badge changes to: 💾
  ✅ DevTools → IndexedDB → Verify audio saved

PASS/FAIL: _____
```

### **TEST 2: Online - Replay Cached Audio**
```
Setup: Audio already cached from TEST 1
Actions:
  1. Refresh page (still online)
  2. Go to same stall
  3. Click "Play Audio"
  
Expected Results:
  ✅ Badge: 💾
  ✅ Toast: "💾 Phát từ bộ nhớ"
  ✅ Audio plays INSTANTLY (< 100ms)
  ✅ No download spinner
  
PASS/FAIL: _____
```

### **TEST 3: Offline DevTools - Play Cached Audio**
```
Setup: Audio cached, now turn offline
Actions:
  1. Go DevTools → Network → Check "Offline"
  2. Go to MapPage
  3. Try to play cached audio
  
Expected Results:
  ✅ Status bar: "🔴 Offline"
  ✅ Audio plays normally
  ✅ Toast: "💾 Phát từ bộ nhớ (Offline)"
  ✅ No network requests visible in Network tab
  
PASS/FAIL: _____
```

### **TEST 4: Offline DevTools - Not Cached Audio**
```
Setup: Offline, audio NOT cached yet
Actions:
  1. Offline mode ON
  2. Try to play audio that's NOT cached
  
Expected Results:
  ✅ Status bar: "🔴 Offline"
  ✅ Toast: "📦 Audio chưa tải. Khi có mạng..."
  ✅ No error
  ✅ No crash
  
PASS/FAIL: _____
```

### **TEST 5: Online Again - Auto Sync**
```
Setup: Was offline, now back online
Actions:
  1. Check "Offline" OFF in DevTools
  2. Wait 2 seconds
  3. Watch console & DevTools
  
Expected Results:
  ✅ Status bar: "✅ Online"
  ✅ Console: "✅ Audio cache synced" (if syncing)
  ✅ No toast spam
  ✅ Background requests visible (checking updates)
  
PASS/FAIL: _____
```

### **TEST 6: Storage Limit Test**
```
Setup: Cache many audios to test 80MB limit
Actions:
  1. Manually add ~15 audios to IndexedDB
  2. Add one more (trigger cleanup)
  3. Check storage
  
Expected Results:
  ✅ Total size ≤ 80MB
  ✅ Oldest audios deleted first
  ✅ Recent audios preserved
  ✅ No crash, graceful degradation
  
PASS/FAIL: _____
```

### **TEST 7: Service Worker Registration**
```
Setup: App startup
Actions:
  1. DevTools → Application → Service Workers
  2. Check if /sw.js is registered
  
Expected Results:
  ✅ Status: "activated and running"
  ✅ Scope: "/"
  ✅ No errors
  
PASS/FAIL: _____
```

### **TEST 8: IndexedDB Data Verification**
```
Setup: After caching several audios
Actions:
  1. DevTools → Application → IndexedDB
  2. SmartFoodStreetDB → audioCache
  3. Inspect entries
  
Expected Results:
  ✅ Multiple entries visible
  ✅ Each entry has:
     - key: "audioCache_2_vi"
     - audioBlob: Blob object
     - fileSize: > 0
     - audioHash: non-empty
     - expiresAt: future date
  
PASS/FAIL: _____
```

### **TEST 9: Mobile Real Device - Offline**
```
Setup: Real mobile phone, ngrok link open
Actions:
  1. Visit https://abc123.ngrok.io on mobile
  2. Cache some audios (online)
  3. Turn OFF WiFi
  4. Try to play cached audio
  
Expected Results:
  ✅ Status bar: "🔴 Offline"
  ✅ Audio plays from cache
  ✅ UI responsive (no lag)
  ✅ Toast messages show correctly
  
PASS/FAIL: _____
```

### **TEST 10: Network Throttle - Slow 3G**
```
Setup: Online, throttle to Slow 3G
Actions:
  1. DevTools → Network → Throttle: "Slow 3G"
  2. Play new audio (not cached)
  3. Observe download progress
  
Expected Results:
  ✅ Toast shows: "⏳ Đang tải..."
  ✅ Badge: ⏳ (spinning)
  ✅ Takes longer to download (expected)
  ✅ Once done: Badge → 💾
  ✅ Can play while downloading? (depends on impl)
  
PASS/FAIL: _____
```

---

## 🛠️ DEBUGGING TOOLS

### **Chrome DevTools Tabs to Check**

#### **1. Application Tab → Service Workers**
```
Path: DevTools → Application → Service Workers
Shows:
  - Is SW registered? (should be "activated and running")
  - Scope
  - No errors

Action if error:
  - Check: navigator.serviceWorker.register('/sw.js')
  - Check console for errors
  - HTTPS required (in production)
```

#### **2. Application Tab → IndexedDB**
```
Path: DevTools → Application → IndexedDB → SmartFoodStreetDB → audioCache
Shows:
  - All cached audios
  - Key, value, fileSize
  - expiresAt dates

Action if missing:
  - Check: AudioCache.save() was called
  - Check browser quota (Settings → Storage)
  - Check browser not in private mode (IndexedDB disabled)
```

#### **3. Network Tab → XHR/Fetch**
```
Path: DevTools → Network tab
Shows:
  - API requests to /stall-translations/audio
  - Status code (200, 304, offline)
  - Response time
  - Size (cached vs fresh)

Action if missing:
  - Check: Is request being made?
  - Check: Is offline mode ON?
  - Check Service Worker responding
```

#### **4. Console Tab**
```
Open: DevTools → Console
Shows:
  - Logs: "✅ Audio cache synced"
  - Errors: if any

Action:
  - Type: navigator.onLine
    (Should show: true or false)
  - Type: indexedDB.databases()
    (Should show: SmartFoodStreetDB)
```

---

## 🧪 MANUAL TEST SCRIPT - COPY & PASTE

### **Script 1: Check Online Status**
```javascript
// Paste in Console
console.log("Navigator.onLine:", navigator.onLine);
console.log("Device connected:", navigator.connection?.effective ?? "N/A");
console.log("Service Worker:", navigator.serviceWorker ? "Supported" : "Not supported");
```

### **Script 2: List All Cached Audios**
```javascript
// Paste in Console
const db = await new Promise((resolve, reject) => {
  const req = indexedDB.open('SmartFoodStreetDB', 1);
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

const tx = db.transaction(['audioCache'], 'readonly');
const store = tx.objectStore('audioCache');
const allData = store.getAll();

allData.onsuccess = () => {
  console.table(allData.result.map(item => ({
    key: item.key,
    fileSize: item.fileSize,
    expiresAt: item.expiresAt
  })));
};
```

### **Script 3: Clear All Cached Audio (Reset)**
```javascript
// Paste in Console (WARNING: Clears all cache!)
const db = await new Promise((resolve, reject) => {
  const req = indexedDB.open('SmartFoodStreetDB', 1);
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

const tx = db.transaction(['audioCache'], 'readwrite');
const store = tx.objectStore('audioCache');
store.clear();

console.log("✅ All cached audios cleared");
```

### **Script 4: Simulate Offline Event**
```javascript
// Paste in Console (simulate offline)
window.dispatchEvent(new Event('offline'));
console.log("✅ Offline event triggered");

// Simulate back online
window.dispatchEvent(new Event('online'));
console.log("✅ Online event triggered");
```

---

## 📱 TESTING ON MOBILE DEVICE (via NgRok)

### **Setup:**

```
Step 1: Start your dev environment
$ npm run dev              # Frontend on localhost:5173
$ cd backend && mvn spring-boot:run  # Backend on localhost:8080
$ ngrok http 5173        # Expose frontend

Step 2: Get NgRok URL
Output: https://abc123.ngrok.io
(NgRok shows this URL in terminal)

Step 3: On Mobile Phone
1. Open Chrome
2. Go to: https://abc123.ngrok.io
3. Wait for app to load

Step 4: Test Offline
1. Device online: Cache audio (bấy Play)
2. Turn OFF WiFi
3. Open app (already loaded)
4. Try to play cached audio
   → Should work!
5. Try to access other features
   → Might fail (no network)
```

### **NgRok Limitations:**

```
✅ Works:
  - Browse cached data
  - Play cached audio
  - All offline features

❌ Doesn't work:
  - Turn off WiFi entirely
  - Then try to download new audio
  - NgRok link dies (need internet)

⚠️ Solutions:
  - Use DevTools Offline mode (instead of real WiFi off)
  - Or: Pre-cache everything before turning off WiFi
  - Or: Test on real device with real internet disconnect
```

---

## 🎬 TEST SCENARIOS - STEP BY STEP

### **Scenario A: Full User Journey - Online to Offline**

```
TIME: 00:00 - App Load (Online)
┌─────────────────────────────────────┐
│ 1. User opens app                   │
│ 2. Status: "✅ Online"              │
│ 3. App background-loads nearby      │
│    stall audios (5 stalls)          │
│ 4. Badges: 📦 → ⏳ → 💾 (gradual)│
└─────────────────────────────────────┘

TIME: 00:30 - User Browse & Cache
┌─────────────────────────────────────┐
│ 1. User clicks "Play" on stall #2   │
│ 2. Toast: "⏳ Đang tải..." (if not) │
│ 3. Audio plays                      │
│ 4. Toast: "✅ Audio đã lưu"        │
│ 5. User plays 2-3 more stalls      │
│ 6. DevTools → IndexedDB shows 5     │
│    cached audios                    │
└─────────────────────────────────────┘

TIME: 01:00 - Simulate Offline
┌─────────────────────────────────────┐
│ 1. DevTools → Network → Offline ☑️ │
│ 2. Status: "🔴 Offline"            │
│ 3. User can still browse            │
│ 4. User plays stall #2 (cached)     │
│    → Audio plays instantly ✅       │
│ 5. User tries stall #9 (not cached) │
│    → Toast: "📦 Audio chưa tải" ✅ │
└─────────────────────────────────────┘

TIME: 02:00 - Go Back Online
┌─────────────────────────────────────┐
│ 1. DevTools → Network → Offline ☐️ │
│ 2. Status: "✅ Online"              │
│ 3. Background sync runs             │
│ 4. Console: "✅ Audio cache synced" │
│ 5. User can download new audios     │
└─────────────────────────────────────┘
```

---

## 🚨 COMMON ISSUES & FIXES

### **Issue 1: "Service Worker not registered"**
```
Problem: DevTools shows no SW
Solution:
  1. Check browser console for errors
  2. Verify public/sw.js exists
  3. Verify: navigator.serviceWorker.register('/sw.js')
  4. HTTPS required (production only, localhost ok)
  5. Try hard-refresh: Ctrl+Shift+R
  6. Unregister & re-register:
     navigator.serviceWorker.getRegistrations()
       .then(regs => regs.forEach(r => r.unregister()))
```

### **Issue 2: "IndexedDB empty, no data"**
```
Problem: Cached audios not showing in IndexedDB
Solution:
  1. Check: Is AudioCache.save() being called?
  2. Check quota: DevTools → Application → Storage
  3. Not in private/incognito mode? (IndexedDB disabled)
  4. Try manual cache:
     AudioCache.save(2, 'vi', audioBlob, 'hash123')
  5. Refresh page, check again
```

### **Issue 3: "Audio not playing offline"**
```
Problem: Offline but audio won't play
Solution:
  1. Is audio actually cached?
     → Check IndexedDB (Issue 2)
  2. Is offline mode ON in DevTools?
     → Try turning OFF/ON again
  3. Try fresh page load
  4. Check Service Worker status:
     → DevTools → Application → Service Workers
  5. Hard-refresh browser cache:
     → Ctrl+Shift+R
```

### **Issue 4: "NgRok link dies when offline"**
```
Problem: Can't test on mobile after WiFi off
Solution:
  1. Use DevTools offline mode instead (easier)
  2. Or: Pre-cache everything before WiFi off
  3. Or: Use slower throttle (Slow 3G) to test
  4. Or: Test on real device first, then mobile
```

---

## 📊 TESTING REPORT TEMPLATE

```
┌─────────────────────────────────────────────┐
│       OFFLINE MODE TEST REPORT              │
│       Date: ________________                │
│       Tester: ________________              │
├─────────────────────────────────────────────┤
│                                             │
│ Environment:                                │
│  Browser: Chrome v___  / Firefox v___      │
│  Device: Desktop / Mobile                  │
│  Network: WiFi / Mobile Data               │
│  NgRok: Yes / No                           │
│                                             │
│ Test Results:                               │
│                                             │
│ TEST 1 - Online Cache:        ✅/❌        │
│ TEST 2 - Replay Cached:       ✅/❌        │
│ TEST 3 - Offline Play:        ✅/❌        │
│ TEST 4 - Offline Not Cached:  ✅/❌        │
│ TEST 5 - Auto Sync:           ✅/❌        │
│ TEST 6 - Storage Limit:       ✅/❌        │
│ TEST 7 - SW Register:         ✅/❌        │
│ TEST 8 - IDB Data:            ✅/❌        │
│ TEST 9 - Mobile Real:         ✅/❌        │
│ TEST 10 - Throttle:           ✅/❌        │
│                                             │
│ Overall: ✅ PASS / ❌ FAIL                 │
│                                             │
│ Issues Found:                               │
│ 1. ________________________                 │
│ 2. ________________________                 │
│ 3. ________________________                 │
│                                             │
│ Notes:                                      │
│ ________________________________            │
│ ________________________________            │
│                                             │
└─────────────────────────────────────────────┘
```

---

## ✅ QUICK CHECKLIST - Before Submit

- [ ] All 10 tests passing
- [ ] No console errors
- [ ] IndexedDB data verified
- [ ] Service Worker registered
- [ ] Status bar shows correct state
- [ ] Toast messages show correctly
- [ ] Badges update correctly (📦 → ⏳ → 💾)
- [ ] Offline play works
- [ ] Online sync works
- [ ] Mobile real device tested

---

**Last Updated:** April 2026
**Version:** 1.0
**Status:** Ready for QA Testing
