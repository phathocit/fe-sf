# SmartFoodStreet Backend - Quick Reference Guide

## 🗂️ DATABASE SCHEMA (Summary)

```
ACCOUNTS (11 users)
├── 1 Admin
└── 10 Vendors

ROLES (2)
├── ADMIN
└── VENDOR

PERMISSIONS (16+)
├── ACCOUNT_* (6)
├── STREET_* (4)
├── STALL_* (4)
└── FOOD_* (3)

ACCOUNT_ROLES (N:N junction)
ROLE_PERMISSIONS (N:N junction)

FOOD_STREETS (1)
└── "Phố ẩm thực Vĩnh Khánh"

STALLS (10)
├── Each has 1 Vendor
├── Each has 1 TriggerConfig
├── Each has N Translations (vi, en-US, zh, ko)
└── Each has N Foods

STALL_TRANSLATIONS (30+)
├── Status: PENDING → PROCESSING → COMPLETED/ERROR
├── Audio URL: Cloudinary
└── Hash: For client-side caching

FOODS (80+)
└── Price: 15,000 - 200,000 VND

VISIT_EVENTS (Analytics log)
├── Event types: 9 (ENTER, EXIT, AUDIO_*, QR_SCAN, etc.)
├── Fields: hour, day, month, year (for analytics)
└── FK: stall_id

QR_CODES (Multiple)
├── STREET_GATEWAY (stall_id = NULL)
└── Per-stall QR (stall_id = 1-10)

INVALIDATED_TOKENS (Logout blacklist)
└── Index on expiry_time
```

---

## 🔌 API ENDPOINTS (Quick Map)

```
PUBLIC ENDPOINTS (No Auth)
├── /auth/register, /auth/login, /auth/introspect
├── /stalls/{id}, /stalls, /stalls/street/{streetId}
├── /foods, /foods/stall/{stallId}
├── /streets (active only), /streets/{id}
├── /qr/scan/{code}, /qr/{id}, /qr
├── /stall-translations/{id}, /stall-translations/stall/{stallId}
└── /stall-translations/audio (Zero-latency!)

PROTECTED ENDPOINTS (Auth Required)
├── /auth/logout, /auth/refresh
├── /accounts/* (CRUD + getMyInfo)
├── /stalls (create, update, delete)
├── /foods (create, update, delete)
├── /streets/admin, POST/PUT/DELETE /streets
├── /qr (create, update, toggle, regenerate)
├── /cloudinary/upload, /cloudinary/delete
├── /admin/dashboard/stats
└── /vendor/dashboard/stats/{stallId}

METHOD SUMMARY
POST   → Create resource (16 endpoints)
GET    → Read resource (25+ endpoints)
PUT    → Update resource (8 endpoints)
PATCH  → Partial update (2 endpoints)
DELETE → Delete resource (6 endpoints)
```

---

## 🔐 AUTHENTICATION

```
JWT Configuration:
├── Algorithm: HS256 (HMAC SHA-256)
├── Secret: ${jwt.secret}
├── Valid Duration: ${jwt.valid-duration} (default: 1 hour)
├── Refreshable Duration: ${jwt.refreshable-duration} (default: 7 days)
└── Library: Nimbus JOSE + JWT

Flow:
1. POST /auth/register → Account created, ready to login
2. POST /auth/login → JWT token issued
3. GET /api/endpoint with Bearer {token} → Verified
4. Token expired → POST /auth/refresh → New token
5. POST /auth/logout → Token added to blacklist

Password: BCrypt (strength=10)
```

---

## 🎙️ AUDIO PROCESSING FLOW

```
Client Request: GET /stall-translations/audio?stallId=1&language=ko&clientHash=abc123

Response Logic:
├─ If translation NOT FOUND
│  └─ Create placeholder (status=PENDING)
│
├─ If status = PENDING/ERROR
│  ├─ Set status = PROCESSING
│  ├─ @Async trigger:
│  │  ├─ Translate (Google Cloud Translate API)
│  │  ├─ Generate TTS (Google Cloud TTS API)
│  │  ├─ Upload to Cloudinary (with overwrite)
│  │  ├─ Compute MD5 hash
│  │  └─ Update DB: status=COMPLETED, audioUrl, audioHash
│  │
│  └─ Immediately return FALLBACK language (en or vi)
│     └─ needDownload=true (send URL to client)
│
├─ If status = COMPLETED & clientHash exists
│  ├─ Hash MATCH → needDownload=false (use local cache)
│  └─ Hash MISMATCH → needDownload=true (send URL)
│
└─ Return StallAudioResponse:
   {
     "needDownload": true,
     "audioUrl": "https://res.cloudinary.com/...",
     "audioHash": "md5hash...",
     "fileSize": 125000,
     "status": "COMPLETED",
     "message": "..."
   }

Voice Names:
├── vi (Vietnamese) → vi-VN-Standard-A
├── en-US → en-US-Neural2-F
├── ko (Korean) → ko-KR-Standard-A
├── ja (Japanese) → ja-JP-Standard-A
└── default → en-US-Standard-A

Cache Strategy:
├── Client stores: [stallId, language] → {audioUrl, hash, blob}
├── On next request: Send clientHash
├── Server compares hash
├── If match: Don't download (needDownload=false)
├── If mismatch/new: Download (needDownload=true)
└── Saves bandwidth & reduces latency!
```

---

## 📊 QR CODE & ANALYTICS FLOW

```
QR Code Types:
1. GATEWAY QR (stall_id = NULL)
   └── Redirects to home/landing page

2. STALL QR (stall_id = 1-10)
   └── Each stall has 1 unique QR code

Scan Flow:
Client Scan QR → GET /qr/scan/{code}?sessionId=xyz
├─ Find QRCode by code
├─ Increment scan_count
├─ @Async Log VisitEvent:
│  ├── event_type = QR_SCAN
│  ├── ip_address = extracted from request
│  ├── user_agent = browser info
│  ├── timestamp (event_time)
│  └── hour, day, month, year breakdown
├─ 302 Redirect to stall detail / external URL
└─ Complete

Analytics Dashboard (/vendor/dashboard/stats/{stallId}?days=7):
├── totalVisits (ENTER_GEOFENCE events)
├── audioCompletes (AUDIO_COMPLETE events)
├── qrScans (QR_SCAN events)
└── dailyVisits (time-series chart data)

Event Types Logged:
├── ENTER_GEOFENCE
├── EXIT_GEOFENCE
├── AUDIO_START
├── AUDIO_COMPLETE
├── QR_SCAN
├── VIEW_DETAIL
├── WEBSITE_VISIT
├── VOUCHER_GENERATED
└── VOUCHER_REDEEMED
```

---

## 🌐 EXTERNAL SERVICES

| Service | Purpose | Auth | Config |
|---------|---------|------|--------|
| **Google Cloud TTS** | Generate MP3 audio | Service Account | tts.json |
| **Google Cloud Translate** | Translate text | Service Account | tts.json |
| **Cloudinary** | Store images/audio | API Key | cloudinary config |
| **MySQL 8** | Data persistence | User/Pass | datasource config |

---

## 📁 ENTITY RELATIONSHIPS

```
Account (1) ──N:N─── account_roles ──N:N─── Roles
                                               │
                                          1:N role_permissions
                                               │
                                          Permissions

Account (Vendor) (1) ──1:N─── Stalls
FoodStreet (1) ──1:N─── Stalls
Stall (1) ──1:1─── StallTriggerConfig
Stall (1) ──1:N─── StallTranslations (vi, en-US, ko, ja, zh)
Stall (1) ──1:N─── Foods (Menu items)
Stall (N) ──1:N─── VisitEvents (Analytics)
Stall (0..1) ──1:1─── QRCode

All foreign keys have CASCADE DELETE
```

---

## 🔑 KEY FEATURES

### ✅ Completed
- [x] Multi-language audio (5 languages: vi, en-US, ko, ja, zh)
- [x] Zero-latency audio delivery (hash-based caching)
- [x] Async audio processing (Google TTS + Translation)
- [x] QR code scanning with event tracking
- [x] Vendor analytics dashboard (daily stats)
- [x] JWT authentication with refresh
- [x] Role-based authorization (ADMIN, VENDOR)
- [x] Geolocation support (latitude/longitude)
- [x] Cloudinary CDN integration
- [x] MySQL database with indices

### 🎯 Core Business Logic
- Stall vendors can manage their menus
- Multi-language translations auto-generated (Google Translate)
- Audio auto-generated from translations (Google TTS)
- Customers scan QR codes → redirected with analytics tracking
- Vendors see engagement metrics (visits, audio completes, scans)

---

## 🚀 PERFORMANCE OPTIMIZATIONS

```
1. Async Processing (@Async)
   ├── TTS generation (non-blocking)
   ├── Translation (non-blocking)
   ├── QR scan event logging (non-blocking)
   └── Analytics collection (non-blocking)

2. Client-Side Caching
   ├── Audio hash for version detection
   ├── needDownload flag to skip re-download
   └── Saves bandwidth & reduces latency

3. Database Optimization
   ├── Index on invalidated_tokens.expiry_time
   ├── Unique constraint on (stall_id, language_code)
   ├── Foreign keys for data integrity
   └── POINT index on location (geospatial)

4. CDN Integration
   ├── Cloudinary for image/audio hosting
   ├── Distributed globally
   └── Automatic cache headers
```

---

## ⚠️ ERROR HANDLING

```
Common Errors:
├── USER_ALREADY_EXISTS (400)
├── USER_NOT_EXISTS (404)
├── UNAUTHENTICATED (401)
├── RESOURCE_ALREADY_EXISTS (409)
├── STALL_TRANSLATION_NOT_FOUND (404)
├── FILE_UPLOAD_FAILED (500)
├── FILE_DELETE_FAILED (500)
├── TTS_GENERATION_FAILED (500)
└── TRANSLATION_FAILED (500)

Response Format:
{
  "code": 200,
  "message": "Success/Error message",
  "result": { /* data */ },
  "timestamp": "ISO8601"
}
```

---

## 📊 CURRENT DATA SNAPSHOT

```
Accounts: 11 (1 admin, 10 vendors)
Roles: 2 (ADMIN, VENDOR)
Permissions: 16+
Food Streets: 1 (Vĩnh Khánh, HCM)
Stalls: 10
  ├── 1: Lãng Quán (BBQ)
  ├── 2: Ốc Oanh (SEAFOOD) ← 3 translations (vi, en, zh)
  ├── 3: Quán Dê Chung (BBQ)
  ├── 4: Bò nướng ngói (BBQ)
  ├── 5: Hải sản 5 Rảnh (SEAFOOD)
  ├── 6: Phá lấu bò Cô Thảo (STREET_FOOD)
  ├── 7: Trà sữa Vĩnh Khánh (DRINK)
  ├── 8: Bánh tráng nướng (SNACK)
  ├── 9: Xiên que nướng (BBQ)
  └── 10: Cháo hải sản đêm (STREET_FOOD)

Foods: 80+
Price range: 15,000 - 200,000 VND

QR Codes: Multiple
├── STREET_GATEWAY (gateway QR, no stall)
└── Per-stall QRs
```

---

## 🛠️ TECH STACK

```
Backend:
├── Spring Boot 3.x
├── Spring Security 6.x
├── JPA/Hibernate
├── MySQL 8 (UTF8MB4)
└── Maven

Integrations:
├── Google Cloud SDK (TTS, Translation)
├── Cloudinary SDK
├── Nimbus JOSE + JWT
└── BCrypt (Password hashing)

Async:
└── Spring @Async with ThreadPoolTaskExecutor

Logging:
└── SLF4J + Logback
```

---

## 📋 QUICK INTEGRATION CHECKLIST

- [ ] Configure `application.properties`:
  - [ ] JWT secret key
  - [ ] Database connection (MySQL)
  - [ ] Cloudinary credentials
  - [ ] Google Cloud credentials (`tts.json`)

- [ ] Database Setup:
  - [ ] Run `data.sql` to create schema + sample data
  - [ ] Create `smart_food_street` database with UTF8MB4

- [ ] Google Cloud Setup:
  - [ ] Enable TTS API
  - [ ] Enable Translation API
  - [ ] Download service account key → `tts.json`

- [ ] Cloudinary Setup:
  - [ ] Create account
  - [ ] Get API credentials
  - [ ] Configure in application.properties

- [ ] Testing:
  - [ ] Postman collection for API endpoints
  - [ ] Test JWT flow (register → login → protected endpoint)
  - [ ] Test audio generation (may take 5-10 seconds async)

---

## 📌 NOTES

- Audio generation is ASYNC → Client gets fallback while processing
- Hash-based caching reduces bandwidth significantly
- Each stall can only have 1 QR code
- Vendor can only see their own stall analytics
- Admin has full access to all resources
- All timestamps in ISO8601 format
- Passwords are NOT stored in plain text (BCrypt)
- Token expiration: 1 hour (access), 7 days (refresh)

---

**Quick Reference End**
