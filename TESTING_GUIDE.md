# Testing Offline POI Mode - Step by Step Guide

## Prerequisites ✅

**Backend running on: `http://localhost:8080`**
**Frontend running on: `http://localhost:5173` or `http://localhost:5174`**

---

## Step 1: Start Backend (if not running)

```bash
cd d:\OneDrive\Documents\SmartFoodStreet-Backend

# Option A: Maven (if installed)
mvn spring-boot:run

# Option B: IDE (IntelliJ/Eclipse)
- Right-click SmartFoodStreetApplication.java → Run
```

**Expected output:**
```
Starting SmartFoodStreetApplication
Tomcat started on port 8080
```

---

## Step 2: Start Frontend (if not running)

```bash
cd d:\OneDrive\Documents\fe-sf

npm run dev
```

**Expected output:**
```
VITE v8.0.0  ready in XXX ms
Local:   http://localhost:5173/
```

---

## Step 3: Login to App

1. Open browser: `http://localhost:5173`
2. Click "Map" or go to `/map`
3. **First visit will auto-cache** ✅

---

## Step 4: Test Online Mode (Baseline)

### Check DevTools to verify cache

**For Cached Data:**
1. Press `F12` (DevTools)
2. Go to **Application** tab
3. Left sidebar → **IndexedDB** → `smartfood-offline`
4. Expand to see `stalls` and `foods` object stores
5. **Should see data loaded!** ✅

**For Service Worker:**
1. DevTools → **Application** → **Service Workers**
2. **Should see registered:** `Status: Running`
3. Scope: `/`

**For Network Cache:**
1. DevTools → **Network** tab
2. Refresh page while online
3. Look for `/api/stalls` response
4. Should see **200 OK** ✅

---

## Step 5: Test Offline Mode 🔴

### Method A: Browser DevTools (Recommended)

1. **DevTools → Network tab**
2. Check checkbox: **"Offline"** ⚠️
3. **Refresh page** (F5)

**Expected:**
- ✅ Stalls still showing
- ✅ "Offline Mode" badge appears (red at top)
- ✅ Data from IndexedDB cache

### Method B: Disable WiFi (Real Test)
1. Disable WiFi/mobile data
2. Refresh page
3. Same behavior as DevTools offline

---

## Step 6: Test Menu Access Offline

1. **While offline**, click on any stall
2. Modal opens
3. **Can see menu even offline!** ✅

**If cached:**
- Shows 📦 "Using cached data"
- Menu items display

**If not cached:**
- Shows warning "No cached food data available"

---

## Step 7: Test Auto-Sync (Come Back Online)

1. **Currently offline** - menu displayed from cache
2. **Check "Offline" box OFF** to go online
3. **Refresh page** (or page auto-syncs)
4. **Fresh data loads** ✅
5. **Badge changes to green** 🟢 "Synced"

---

## Step 8: GPS Simulator Test

1. Click **GPS Simulator button** (📍 top-right)
2. Select stall from dropdown
3. **Markers appear on map** (even offline!)
4. Move location slider
5. When close enough:
   - 📍 Marker highlights
   - `🔔 Entering geofence` message

---

## Step 9: Verify Console Logs

Press `F12` → **Console** tab to see debugging messages:

**Online:**
```
✅ OfflineDB initialized
✅ Service Worker registered
🟢 Online - fetching from API
✅ Stalls cached: 10
```

**Going Offline:**
```
❌ Network lost
🔴 Offline - fetching from cache
📦 Using cache as fallback
```

**Coming Online:**
```
🟢 Network restored
🔄 Auto-syncing cache...
✅ Stalls cached: 10 (refreshed)
```

---

## Test Checklist ✅

| Feature | Online | Offline | Status |
|---------|--------|---------|--------|
| Load stalls | ✅ API | ✅ Cache | Test! |
| View menu | ✅ API | ✅ Cache | Test! |
| Geofence detection | ✅ SMS | ✅ GPS Sim | Test! |
| Auto-sync | ✅ Refresh | N/A | Test! |
| Offline badge | ✅ Green | ✅ Red | Test! |
| IndexedDB cache | ✅ Stores | ✅ Retrieves | Test! |
| Service Worker | ✅ Caches | ✅ Intercepts | Test! |

---

## Troubleshooting

### Stalls not showing offline?
```
1. Check IndexedDB has data (DevTools → Application → IndexedDB)
2. Check console for errors
3. Refresh page while online first
4. Try clearing cache: offlineDB.clearAll()
```

### Service Worker not registered?
```
1. Check console for errors
2. Ensure file exists: public/service-worker.js
3. Check DevTools → Service Workers
4. Refresh with hard reload (Ctrl+Shift+R)
```

### Cache not updating?
```
1. Cache valid for 24 hours
2. Force clear: localStorage.clear() + IndexedDB clear
3. Come back online → should auto-sync
4. Check Network tab for API calls
```

### GPS Simulator not working?
```
1. Browser needs geolocation API
2. If blocked: DevTools → Settings → Permissions
3. Check "Geolocation" enabled for localhost
```

---

## Advanced Testing

### Clear Cache & Start Fresh
```javascript
// In browser console (F12):
offlineDB.clearAll().then(() => console.log('Cache cleared'))
location.reload()
```

### Check Cache Size
```javascript
// In browser console:
const stalls = await offlineDB.getStalls()
const foods = await offlineDB.getAllFoods()
console.log('Stalls:', stalls.length)
console.log('Foods:', foods.length)
```

### Simulate Network Errors
```javascript
// DevTools → Network tab → Throttling
// Select: Slow 3G or Offline
// Refresh to see fallback behavior
```

---

## Expected Performance

| Metric | Value |
|--------|-------|
| First load (online) | ~2-3s |
| Offline load | <500ms (from cache) |
| Cache size | ~50-100KB |
| Auto-sync delay | ~1-2s when back online |

---

## Success Indicators ✅

✅ App loads even with offline mode  
✅ Stalls visible both online & offline  
✅ Menu accessible offline  
✅ Offline badge shows correct status  
✅ Console shows proper log messages  
✅ IndexedDB stores data  
✅ Service Worker running  
✅ Auto-sync works when coming online  

**If all ✅ → Feature working perfectly!**
