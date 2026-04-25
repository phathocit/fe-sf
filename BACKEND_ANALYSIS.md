# SmartFoodStreet Backend - Phân Tích Chi Tiết Codebase

**Phiên bản**: Java Spring Boot  
**Ngày phân tích**: 20/04/2026

---

## 📊 I. DATABASE SCHEMA

### 1. **ACCOUNTS** (Tài khoản người dùng)
```
id (BIGINT) - Primary Key, Auto Increment
├── username (VARCHAR 100) - UNIQUE, tên đăng nhập
├── password (VARCHAR 255) - bcrypt hash
├── full_name (VARCHAR 150)
├── email (VARCHAR 150) - UNIQUE
├── is_active (BOOLEAN) - Default: TRUE
└── created_at (TIMESTAMP) - Default: CURRENT_TIMESTAMP

Foreign Keys:
└─ account_roles (account_id → accounts.id) [CASCADE DELETE]
```

### 2. **ROLES** (Vai trò hệ thống)
```
id (BIGINT) - Primary Key
├── name (VARCHAR 100) - UNIQUE (ADMIN, VENDOR)
├── description (VARCHAR 255)
└── role_permissions (role_id) [CASCADE DELETE]
```

### 3. **PERMISSIONS** (Quyền chi tiết)
```
id (BIGINT) - Primary Key
├── name (VARCHAR 100) - UNIQUE
│   ├── ACCOUNT_CREATE, ACCOUNT_GET_ALL, ACCOUNT_GET_BY_ID
│   ├── ACCOUNT_GET_MY_INFO, ACCOUNT_UPDATE, ACCOUNT_DELETE
│   ├── STREET_CREATE, STREET_READ, STREET_UPDATE, STREET_DELETE
│   ├── STALL_CREATE, STALL_READ, STALL_UPDATE, STALL_DELETE
│   └── FOOD_CREATE, FOOD_UPDATE, FOOD_DELETE
└── description (VARCHAR 255)
```

### 4. **ACCOUNT_ROLES** (Mapping N-N: Account ↔ Role)
```
Primary Key: (account_id, role_id)
├── account_id (BIGINT) - FK → accounts.id [CASCADE]
└── role_id (BIGINT) - FK → roles.id [CASCADE]
```

### 5. **ROLE_PERMISSIONS** (Mapping N-N: Role ↔ Permission)
```
Primary Key: (role_id, permission_id)
├── role_id (BIGINT) - FK → roles.id [CASCADE]
└── permission_id (BIGINT) - FK → permissions.id [CASCADE]
```

### 6. **FOOD_STREETS** (Khu phố ẩm thực)
```
id (BIGINT) - Primary Key
├── name (VARCHAR 255) - Tên khu phố
├── description (TEXT) - Mô tả chi tiết
├── address (VARCHAR 255)
├── city (VARCHAR 150)
├── latitude (DECIMAL 10,8)
├── longitude (DECIMAL 11,8)
├── is_active (BOOLEAN) - Default: TRUE
├── created_at (DATETIME)
└── updated_at (DATETIME) ON UPDATE CURRENT_TIMESTAMP
```

### 7. **STALLS** (Gian hàng / POI - Point of Interest)
```
id (BIGINT) - Primary Key
├── street_id (BIGINT) - FK → food_streets.id [CASCADE]
├── vendor_id (BIGINT) - FK → accounts.id [CASCADE] - Chủ quán
├── name (VARCHAR 255)
├── category (VARCHAR 100) - BBQ, SEAFOOD, DRINK, SNACK...
├── description (VARCHAR 255)
├── latitude (DECIMAL 10,8)
├── longitude (DECIMAL 11,8)
├── location (POINT) - GENERATED ALWAYS AS POINT(longitude, latitude) STORED
│   └─ Dùng cho geospatial query
├── image (LONGTEXT) - URL ảnh
├── script (LONGTEXT) - TTS script gốc
├── is_active (BOOLEAN) - Default: TRUE
├── created_at (DATETIME)
└── updated_at (DATETIME)

Foreign Keys:
└─ stall_trigger_config (stall_id) [CASCADE]
```

### 8. **STALL_TRIGGER_CONFIG** (Cấu hình trigger audio)
```
stall_id (BIGINT) - Primary Key, FK → stalls.id [CASCADE]
├── trigger_type (ENUM) - GEOFENCE | DISTANCE (Default: GEOFENCE)
├── radius (INT) - Bán kính trigger (m, Default: 30, Constraint: > 0)
├── trigger_distance (INT) - Khoảng cách trigger (m, Default: 50, Constraint: > 0)
├── cooldown_seconds (INT) - Tránh trigger spam (Default: 120)
└── priority (INT) - Ưu tiên nếu nhiều stall gần nhau (Default: 1)
```

### 9. **STALL_TRANSLATIONS** (Đa ngôn ngữ + TTS)
```
id (BIGINT) - Primary Key
├── stall_id (BIGINT) - FK → stalls.id [CASCADE]
├── language_code (VARCHAR 10) - vi, en-US, ko, ja, zh...
├── name (VARCHAR 255) - Tên stall theo ngôn ngữ
├── tts_script (TEXT) - Kịch bản đọc cho TTS
├── audio_url (VARCHAR 255) - Cloudinary URL (Nullable)
├── file_size (BIGINT) - Bytes (Default: 0)
├── audio_hash (VARCHAR 64) - MD5/SHA256 hash (cache check)
├── audio_status (ENUM) - PENDING | PROCESSING | COMPLETED | ERROR
│   ├── PENDING: Mới tạo, chưa có file
│   ├── PROCESSING: Dang dịch, gen TTS, upload
│   ├── COMPLETED: File sẵn sàng
│   └── ERROR: Lỗi trong quá trình
└── Unique Constraint: (stall_id, language_code)
```

### 10. **FOODS** (Danh sách món ăn)
```
id (BIGINT) - Primary Key
├── stall_id (BIGINT) - FK → stalls.id [CASCADE]
├── name (VARCHAR 255)
├── price (DECIMAL 10,2)
├── description (TEXT)
├── image (VARCHAR 255) - URL ảnh
├── is_available (BOOLEAN) - Default: TRUE
└── created_at (DATETIME)
```

### 11. **VISIT_EVENTS** (Log sự kiện - Analytics)
```
id (BIGINT) - Primary Key
├── session_id (BIGINT) - Session từ client
├── stall_id (BIGINT) - FK → stalls.id [CASCADE]
├── event_type (ENUM):
│   ├── ENTER_GEOFENCE - Người dùng vào vùng
│   ├── EXIT_GEOFENCE - Người dùng ra khỏi vùng
│   ├── AUDIO_START - Bắt đầu nghe audio
│   ├── AUDIO_COMPLETE - Kết thúc nghe audio
│   ├── QR_SCAN - Quét QR Code
│   ├── VIEW_DETAIL - Xem chi tiết stall
│   ├── WEBSITE_VISIT - Truy cập website
│   ├── VOUCHER_GENERATED - Tạo voucher
│   └── VOUCHER_REDEEMED - Dùng voucher
├── event_time (DATETIME) - Default: CURRENT_TIMESTAMP
├── qr_code (VARCHAR 255) - Mã QR scanned
├── ip_address (VARCHAR 45) - IPv6 support
├── user_agent (TEXT) - Browser info
├── hour (INT) - Phân tích dữ liệu theo giờ
├── day (INT) - Phân tích theo ngày
├── month (INT)
└── year (INT)
```

### 12. **INVALIDATED_TOKENS** (Token logout/revoke)
```
token_id (VARCHAR 255) - Primary Key
├── expiry_time (DATETIME)
└── Index: idx_invalid_token_expiry (expiry_time)
   └─ Dùng để cleanup token hết hạn
```

### 13. **QR_CODES** (Mã QR)
```
id (BIGINT) - Primary Key, Auto Increment
├── code (VARCHAR 255) - Mã QR text
├── name (VARCHAR 255) - Tên QR (vd: "Cổng Chào Dự Án")
├── stall_id (BIGINT) - FK → stalls.id (Nullable - có thể là gateway)
├── is_active (BIT/BOOLEAN)
├── scan_count (INT) - Số lần quét
├── created_at (DATETIME 6)
└── updated_at (DATETIME 6)
```

---

## 🏗️ II. ENTITIES & RELATIONSHIPS

### Entity Diagram

```
Account (1) ─────────── (N) Account_Roles ─────────── (N) Roles
                                                         │
                                                         │
                                                    (N) Role_Permissions ─── (N) Permissions
                                                         │
Account (1) ─────────── (N) Stalls ─────────── (1) Stall_Trigger_Config
                              │
FoodStreet (1) ───────── (N) Stalls
                              │
                              ├─ (1) StallTranslation (1:N) - Đa ngôn ngữ
                              │        └─ audio_status: PENDING → PROCESSING → COMPLETED
                              │
                              └─ (1) Foods (1:N)
                              
QRCode ─────────── (N) Stalls (Optional - null = gateway QR)

VisitEvent ─── (N) Stalls (Log analytics)

InvalidatedToken (Token blacklist)
```

### Key Relationships

| Entity | Relationship | Target | Cascade |
|--------|-------------|--------|---------|
| Account | N:N (account_roles) | Role | DELETE |
| Role | N:N (role_permissions) | Permission | DELETE |
| Stall | 1:1 | StallTriggerConfig | DELETE |
| Stall | 1:N | StallTranslation | DELETE |
| Stall | 1:N | Food | DELETE |
| Stall | N | VisitEvent | DELETE |
| FoodStreet | 1:N | Stall | DELETE |
| Account (Vendor) | 1:N | Stall | DELETE |

---

## 🔌 III. API ENDPOINTS

### **A. AUTHENTICATION CONTROLLER** (`/auth`)

| Method | Endpoint | Request | Response | Auth |
|--------|----------|---------|----------|------|
| POST | `/auth/register` | RegisterRequest | RegisterResponse | ❌ |
| POST | `/auth/register-vendor` | VendorRegisterRequest | RegisterResponse | ❌ |
| POST | `/auth/login` | LoginRequest | LoginResponse(token, account) | ❌ |
| POST | `/auth/login-email` | VendorLoginRequest | LoginResponse | ❌ |
| POST | `/auth/logout` | LogoutRequest(token) | Void | ✅ JWT |
| POST | `/auth/introspect` | IntrospectRequest(token) | IntrospectResponse(valid: bool) | ❌ |
| POST | `/auth/refresh` | RefreshRequest | LoginResponse | ✅ JWT |

**Auth Type**: JWT Bearer Token

---

### **B. ACCOUNT CONTROLLER** (`/accounts`)

| Method | Endpoint | Request | Response | Auth |
|--------|----------|---------|----------|------|
| POST | `/accounts` | AccountCreationRequest | Account | ✅ |
| GET | `/accounts` | - | List\<Account\> | ✅ |
| GET | `/accounts/{accountId}` | - | Account | ✅ |
| GET | `/accounts/getMyInfo` | - | Account | ✅ |
| PUT | `/accounts/{accountId}` | AccountUpdateRequest | Account | ✅ |
| DELETE | `/accounts/{accountId}` | - | Void | ✅ |

---

### **C. STALL CONTROLLER** (`/stalls`)

| Method | Endpoint | Request | Response | Auth |
|--------|----------|---------|----------|------|
| POST | `/stalls` | StallCreateRequest | StallResponse | ✅ |
| GET | `/stalls/{id}` | - | StallResponse | ❌ |
| GET | `/stalls/street/{streetId}` | - | List\<StallResponse\> | ❌ |
| GET | `/stalls/vendor/{vendorId}` | - | StallResponse | ❌ |
| GET | `/stalls` | - | List\<StallResponse\> (active) | ❌ |
| GET | `/stalls/all` | - | List\<StallResponse\> (all) | ✅ |
| PUT | `/stalls/{id}` | StallCreateRequest | StallResponse | ✅ |
| DELETE | `/stalls/{id}` | - | Void | ✅ |
| GET | `/stalls/scan/{code}` | - | Redirect (302) | ❌ |

---

### **D. FOOD CONTROLLER** (`/foods`)

| Method | Endpoint | Request | Response | Auth |
|--------|----------|---------|----------|------|
| POST | `/foods` | FoodRequest | FoodResponse | ✅ |
| GET | `/foods/stall/{stallId}` | - | List\<FoodResponse\> | ❌ |
| GET | `/foods` | - | List\<FoodResponse\> | ❌ |
| PUT | `/foods/{id}` | FoodRequest | FoodResponse | ✅ |
| DELETE | `/foods/{id}` | - | Void | ✅ |

---

### **E. STALL TRANSLATION CONTROLLER** (`/stall-translations`)

| Method | Endpoint | Request | Response | Auth | Logic |
|--------|----------|---------|----------|------|-------|
| POST | `/stall-translations` | StallTranslationRequest | StallTranslationResponse | ✅ | Tạo translation mới |
| PUT | `/stall-translations/{id}` | StallTranslationRequest | StallTranslationResponse | ✅ | Reset audio khi update |
| GET | `/stall-translations/{id}` | - | StallTranslationResponse | ❌ | |
| GET | `/stall-translations/stall/{stallId}` | - | List\<StallTranslationResponse\> | ❌ | Lấy tất cả translations |
| DELETE | `/stall-translations/{id}` | - | Void | ✅ | |
| **GET** | **`/stall-translations/audio`** | stallId, language, clientHash? | **StallAudioResponse** | ❌ | **Zero-latency flow** |

**StallAudioResponse - Zero Latency Flow**:
- **clientHash = null** → Lần đầu, tải audio
- **clientHash = audio_hash** → Cache match, dùng local (needDownload=false)
- **Ngôn ngữ chưa có** → Auto tạo placeholder + trigger async process
- **Đang PROCESSING** → Trả fallback audio (en hoặc vi)
- **COMPLETED** → Trả URL audio + hash

---

### **F. FOOD STREET CONTROLLER** (`/streets`)

| Method | Endpoint | Request | Response | Auth |
|--------|----------|---------|----------|------|
| GET | `/streets/admin` | - | List\<FoodStreetResponse\> | ✅ ADMIN |
| POST | `/streets` | FoodStreetCreationRequest | FoodStreetResponse | ✅ ADMIN |
| PUT | `/streets/{id}` | FoodStreetUpdateRequest | FoodStreetResponse | ✅ ADMIN |
| DELETE | `/streets/{id}` | - | Void | ✅ ADMIN |
| GET | `/streets` | - | List\<FoodStreetResponse\> (active) | ❌ |
| GET | `/streets/{id}` | - | FoodStreetResponse | ❌ |

---

### **G. QR CODE CONTROLLER** (`/qr`)

| Method | Endpoint | Request | Response | Auth | Logic |
|--------|----------|---------|----------|------|-------|
| POST | `/qr` | QRCodeCreateRequest | QRCodeResponse | ✅ | Tạo QR |
| PUT | `/qr/{id}` | QRCodeCreateRequest | QRCodeResponse | ✅ | Update QR |
| DELETE | `/qr/{id}` | - | Void | ✅ | |
| GET | `/qr/{id}` | - | QRCodeResponse | ❌ | |
| PATCH | `/qr/{id}/toggle` | - | QRCodeResponse | ✅ | Toggle active |
| PATCH | `/qr/{id}/regenerate` | - | QRCodeResponse | ✅ | Tạo code mới |
| GET | `/qr/stall/{stallId}` | - | QRCodeResponse | ❌ | |
| GET | `/qr/gateway` | - | QRCodeResponse | ❌ | Lấy gateway QR (stall_id=null) |
| GET | `/qr` | - | List\<QRCodeResponse\> | ❌ | |
| **GET** | **`/qr/scan/{code}`** | sessionId? | **Redirect (302)** | ❌ | **Log event** |

---

### **H. CLOUDINARY CONTROLLER** (`/cloudinary`)

| Method | Endpoint | Request | Response | Auth |
|--------|----------|---------|----------|------|
| POST | `/cloudinary/upload` | file, folder?, publicId? | CloudinaryResponse | ✅ |
| DELETE | `/cloudinary/delete` | publicId, resourceType? | Boolean | ✅ |

---

### **I. DASHBOARD CONTROLLER** (`/admin/dashboard`)

| Method | Endpoint | Response | Auth |
|--------|----------|----------|------|
| GET | `/admin/dashboard/stats` | { totalVisits, uniqueVisitors } | ✅ |

---

### **J. VENDOR DASHBOARD CONTROLLER** (`/vendor/dashboard`)

| Method | Endpoint | Response | Auth | Note |
|--------|----------|----------|------|------|
| GET | `/vendor/dashboard/stats/{stallId}?days=7` | Analytics data | ✅ | Vendor chỉ xem của mình |

**Response Schema**:
```json
{
  "totalVisits": 150,
  "audioCompletes": 120,
  "qrScans": 45,
  "dailyVisits": [
    { "day": "2024-01-01", "count": 20 },
    { "day": "2024-01-02", "count": 25 }
  ]
}
```

---

## 🔧 IV. SERVICES & BUSINESS LOGIC

### **1. AuthenticationService**

**Methods**:

| Method | Logic | External APIs |
|--------|-------|---------------|
| `register(RegisterRequest)` | Tạo tài khoản STAFF, hash password bcrypt | BCrypt |
| `registerVendor(VendorRegisterRequest)` | Tạo tài khoản VENDOR + tạo Stall placeholder (isActive=false) | BCrypt |
| `login(LoginRequest)` | Verify password, generate JWT token | BCrypt, JWT (Nimbus) |
| `loginByEmail(VendorLoginRequest)` | Login bằng email, generate JWT | BCrypt, JWT |
| `logout(LogoutRequest)` | Thêm token vào blacklist (invalidated_tokens) | |
| `introspect(IntrospectRequest)` | Verify JWT token validity | JWT |
| `refreshToken(RefreshRequest)` | Issue new token từ refresh token | JWT |

**JWT Config**:
- **Secret Key**: `${jwt.secret}` (từ application.properties)
- **Valid Duration**: `${jwt.valid-duration}` (vd: 1 hour)
- **Refreshable Duration**: `${jwt.refreshable-duration}` (vd: 7 days)
- **Library**: Nimbus JOSE + JWT
- **Algorithm**: HS256 (HMAC)

---

### **2. TtsService**

**Integrations**: Google Cloud Text-to-Speech API

**Credentials**: `/src/main/resources/tts.json` (Google Service Account)

**Methods**:

```java
public byte[] generate(String text, String languageCode, String voiceName)
```

**Voice Mappings**:
```
vi (Tiếng Việt) → vi-VN-Standard-A
en-US → en-US-Neural2-F  
ko (Korean) → ko-KR-Standard-A
ja (Japanese) → ja-JP-Standard-A
default → en-US-Standard-A
```

**Output**: MP3 byte array

**Error Handling**: Logs error, returns empty byte[0] nếu TTS không khởi tạo

---

### **3. TranslationService**

**Integrations**: Google Cloud Translation API

**Credentials**: `/src/main/resources/tts.json` (shared)

**Methods**:

```java
public String translateText(String text, String sourceLang, String targetLang)
```

**Features**:
- Sử dụng Neural Machine Translation (NMT) model
- Auto remove HTML entities (&quot;, &#39;, &amp;)
- Fallback: Nếu client không cung cấp ttsScript, dịch từ bản vi gốc

**Error Handling**: Throws TRANSLATION_FAILED exception

---

### **4. AudioProcessorService** (@Async)

**Purpose**: Xử lý âm thanh ngầm (không block request)

**Flow**:

```
Client request /audio → Check DB
  ├─ COMPLETED & hash match → Return local cache
  ├─ COMPLETED & hash mismatch → Return download URL
  ├─ PENDING/ERROR → Trigger async + return fallback
  └─ async processAudioAsync():
      1. Dịch (nếu ttsScript rỗng)
      2. Lấy voice config
      3. Generate TTS (Google API)
      4. Upload Cloudinary (ghi đè)
      5. Tính hash MD5
      6. Update DB status → COMPLETED
```

**Cache Strategy**:
- Client gửi `clientHash` trong request
- Nếu match → Dùng local audio (needDownload=false)
- Nếu không match → Download từ URL

---

### **5. CloudinaryService**

**Integrations**: Cloudinary Cloud Storage

**Methods**:

| Method | Purpose |
|--------|---------|
| `uploadFileImage(file, folder, publicId)` | Upload ảnh, có thể overwrite |
| `uploadAudio(byte[], fileName)` | Upload audio (MP3) |
| `uploadAudioWithOverwrite(byte[], publicId)` | Upload audio + ghi đè cũ |
| `deleteFile(publicId, resourceType)` | Xóa file |
| `deleteByUrl(url)` | Xóa file bằng URL |
| `extractPublicId(url)` | Parse publicId từ Cloudinary URL |

**Response**: `CloudinaryResponse(publicId, url, resourceType, bytes)`

---

### **6. StallTranslationService**

**Logic**:
- Create: Validate unique (stall_id, language_code), set status=PENDING
- Update: Reset audio status → PENDING (để tạo lại)
- Get By Stall: Lấy tất cả translations
- **Get Audio**: Complex zero-latency flow

**Cache Strategy**: audio_hash + needDownload flag

---

### **7. QRCodeService**

**Logic**:
- **Create**: Generate UUID nếu code không cung cấp, validate unique, 1 stall = 1 QR
- **Update**: Validate duplicate code trước khi update
- **Regenerate**: Tạo code mới
- **Toggle**: Active/Inactive QR
- **Handle Scan**: 
  - Increment scan_count
  - Log VisitEvent (event_type=QR_SCAN)
  - Return redirect URL

---

### **8. StallService**

**Logic**:
- CRUD stall
- Get by vendor/street
- Geospatial query (nếu cần)

---

### **9. VisitEventAsyncService**

**Purpose**: Log analytics event async (không block)

**Flow**:
```
@Async
handleScan(code, request, sessionId)
  → Create VisitEvent
  → Save DB
```

**Logged Data**:
- IP address, User-Agent
- Event timestamp + Date breakdown (hour, day, month, year)

---

## 🔐 V. SECURITY & CACHING

### **Authentication & Authorization**

| Feature | Implementation |
|---------|-----------------|
| **Password Encryption** | BCrypt (strength=10) |
| **JWT Token** | HS256, Nimbus JOSE |
| **Token Revocation** | Blacklist table (invalidated_tokens) |
| **Authorization** | Role-based (RBAC) + Permissions |
| **API Security** | @PreAuthorize, SecurityContext |

---

### **Caching Strategy**

| Resource | Cache Method | TTL | Key |
|----------|------------|-----|-----|
| Audio | **Client-side + Hash** | Until changed | audio_hash |
| Stall Translation | **Async generation** | Per language | stall_id + language |
| Fallback Audio | **Auto fallback** | Until ready | en OR vi |

---

### **External Services Integration**

| Service | Purpose | Auth | Credentials |
|---------|---------|------|-------------|
| **Google Cloud TTS** | Generate audio MP3 | Service Account | tts.json |
| **Google Cloud Translate** | Translate text | Service Account | tts.json |
| **Cloudinary** | Image/Audio storage | API Key | cloudinary.yml |

---

## 📊 VI. DATA FLOW DIAGRAMS

### **Audio Generation Flow**

```
Client Request /audio?stallId=1&language=ko&clientHash=abc123
    │
    ├─ StallTranslation NOT FOUND
    │   └─ Create placeholder (status=PENDING)
    │
    ├─ Status = PENDING/ERROR
    │   ├─ Change to PROCESSING
    │   ├─ Trigger @Async processAudioAsync():
    │   │   ├─ Translate (Google API)
    │   │   ├─ TTS Generate (Google Cloud)
    │   │   ├─ Upload Cloudinary
    │   │   ├─ MD5 Hash
    │   │   └─ Update DB (COMPLETED)
    │   │
    │   └─ Return FALLBACK (en or vi) + needDownload=true
    │
    ├─ Status = COMPLETED
    │   ├─ Hash MATCH → needDownload=false (use cache)
    │   └─ Hash MISMATCH → needDownload=true + URL
    │
    └─ Return StallAudioResponse
```

### **QR Code Scan Flow**

```
Client Scan QR Code
    │
    ├─ GET /qr/scan/{code}
    │   ├─ Find QRCode by code
    │   ├─ Increment scan_count
    │   ├─ @Async Log VisitEvent
    │   │   ├─ event_type = QR_SCAN
    │   │   ├─ ip_address = client IP
    │   │   ├─ user_agent = browser info
    │   │   └─ timestamp + date breakdown
    │   │
    │   └─ 302 Redirect to target URL
    │       (stall detail page / external website)
    │
    └─ Complete
```

### **Authentication Flow**

```
1. Register / Login
   └─ POST /auth/register or /auth/login
      ├─ Hash password (BCrypt)
      ├─ Generate JWT token
      └─ Return token + account info

2. API Request
   └─ GET /stalls with Authorization: Bearer {token}
      ├─ Verify JWT (Nimbus)
      ├─ Check roles/permissions
      ├─ Extract user info from token
      └─ Process request

3. Logout
   └─ POST /auth/logout with token
      ├─ Add token to invalidated_tokens table
      └─ Token invalid for future requests

4. Token Refresh
   └─ POST /auth/refresh with refresh token
      ├─ Verify refresh token
      ├─ Generate new access token
      └─ Return new token
```

---

## 🎯 VII. CURRENT SAMPLE DATA

### **Accounts (11 total)**
```
ID │ Username      │ Role    │ Full Name              │ Email
───┼───────────────┼─────────┼────────────────────────┼──────────────────────
1  │ admin         │ ADMIN   │ Quản trị viên         │ admin@system.com
2  │ vendor        │ VENDOR  │ Chủ quán              │ vendor@system.com
3  │ xuanquynh     │ VENDOR  │ Nguyễn Xuân Quỳnh    │ nxq@sv.sgu.edu.vn
4  │ ngochan       │ VENDOR  │ Trần Ngọc Hân        │ tnh@sv.sgu.edu.vn
...
11 │ conghau       │ VENDOR  │ Trần Công Hậu        │ tch@gmail.com
```

### **Food Street (1)**
```
ID │ Name                      │ City       │ Latitude   │ Longitude
───┼───────────────────────────┼────────────┼────────────┼──────────
1  │ Phố ẩm thực Vĩnh Khánh   │ HCM        │ 10.757622  │ 106.704018
```

### **Stalls (10 in Vĩnh Khánh)**
```
ID │ Name                    │ Category    │ Vendor ID  │ Status
───┼─────────────────────────┼─────────────┼────────────┼────────
1  │ Lãng Quán              │ BBQ         │ 2          │ Active
2  │ Ốc Oanh Vĩnh Khánh    │ SEAFOOD     │ 3          │ Active
3  │ Quán Dê Chung         │ BBQ         │ 4          │ Active
...
10 │ Cháo hải sản đêm       │ STREET_FOOD │ 11         │ Active
```

### **Stall Translations (Multilingual)**
```
Stall ID │ Language │ Name                  │ Audio Status │ URL
──────────┼──────────┼───────────────────────┼──────────────┼──────
2         │ vi       │ Ốc Oanh...           │ COMPLETED    │ Cloudinary
2         │ en-US    │ Oc Oanh...           │ COMPLETED    │ Cloudinary
2         │ zh       │ Oanh 螺店            │ COMPLETED    │ Cloudinary
3         │ vi       │ Quán Dê Chung        │ COMPLETED    │ Cloudinary
```

### **Foods (80+ items)**
```
Stall │ Name              │ Price      │ Status
──────┼───────────────────┼────────────┼────────
1     │ Ốc hương xào bơ   │ 80,000 VND │ Available
1     │ Càng ghẹ rang muối│ 120,000 VND│ Available
...
```

---

## 🛠️ VIII. KEY TECHNOLOGIES & LIBRARIES

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Spring Boot | 3.x |
| **ORM** | JPA/Hibernate | Latest |
| **Security** | Spring Security | 6.x |
| **JWT** | Nimbus JOSE + JWT | Latest |
| **Google APIs** | google-cloud-texttospeech, google-cloud-translate | Latest |
| **Cloudinary** | cloudinary-core | Latest |
| **Database** | MySQL 8 | UTF8MB4 |
| **Validation** | Jakarta Validation (JSR-380) | Latest |
| **Logging** | SLF4J + Logback | Latest |
| **Build** | Maven | 3.6+ |
| **Async** | @Async (ThreadPoolTaskExecutor) | Spring |

---

## 📋 IX. CONFIGURATION FILES

### **Key Properties**

```properties
# JWT
jwt.secret=YOUR_SECRET_KEY
jwt.valid-duration=3600000          # 1 hour (ms)
jwt.refreshable-duration=604800000  # 7 days (ms)

# Google Credentials
spring.cloud.gcp.credentials.location=classpath:tts.json

# Cloudinary
cloudinary.cloud-name=YOUR_CLOUD_NAME
cloudinary.api-key=YOUR_API_KEY
cloudinary.api-secret=YOUR_API_SECRET

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/smart_food_street
spring.datasource.username=root
spring.datasource.password=PASSWORD
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

---

## 🐛 X. ERROR HANDLING & EXCEPTIONS

### **Common Error Codes**

```
USER_ALREADY_EXISTS
UNAUTHENTICATED
USER_NOT_EXISTS
RESOURCE_ALREADY_EXISTS
STALL_TRANSLATION_NOT_FOUND
FILE_UPLOAD_FAILED
FILE_DELETE_FAILED
TTS_GENERATION_FAILED
TRANSLATION_FAILED
```

### **Response Format**

```json
{
  "code": 200,
  "message": "Success",
  "result": { ... },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## 📝 XI. SUMMARY

### **Core Features**
✅ Multi-language support (vi, en-US, ko, ja, zh)  
✅ Zero-latency audio delivery (client-side caching)  
✅ Async audio processing (TTS + Translation)  
✅ QR code scanning with event tracking  
✅ Vendor dashboard analytics  
✅ Role-based access control (RBAC)  
✅ JWT token management  
✅ Cloud storage (Cloudinary)  
✅ Geolocation-based triggers  

### **External Integrations**
🔹 Google Cloud Text-to-Speech  
🔹 Google Cloud Translation API  
🔹 Cloudinary CDN  
🔹 MySQL Database  

### **Performance Features**
⚡ Async @Async processing  
⚡ Audio hash-based caching  
⚡ Fallback language mechanism  
⚡ Indexed database queries  

---

**Document End**
