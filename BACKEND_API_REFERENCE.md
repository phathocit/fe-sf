# SmartFoodStreet Backend - API Reference & Testing Guide

## 🔗 API Base URL
```
http://localhost:8080/api
```

---

## 🔐 AUTHENTICATION ENDPOINTS

### 1. User Registration (Customer)
```http
POST /auth/register
Content-Type: application/json

{
  "userName": "customer1",
  "password": "Password@123",
  "fullName": "Nguyễn Văn A",
  "email": "customer1@gmail.com"
}

Response (200):
{
  "code": 200,
  "message": "Success",
  "result": {
    "accountId": 12,
    "userName": "customer1"
  }
}
```

### 2. Vendor Registration
```http
POST /auth/register-vendor
Content-Type: application/json

{
  "ownerName": "Phạm Văn B",
  "email": "vendor.new@gmail.com",
  "password": "Password@123",
  "stallName": "Quán Bún Đậu Mắm Tôm"
}

Response (200):
{
  "code": 200,
  "result": {
    "accountId": 13,
    "userName": "vendor.new@gmail.com"
  }
}
```

### 3. Login (Username)
```http
POST /auth/login
Content-Type: application/json

{
  "userName": "admin",
  "password": "admin123"
}

Response (200):
{
  "code": 200,
  "result": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "authenticated": true,
    "account": {
      "id": 1,
      "userName": "admin",
      "fullName": "Quản trị viên",
      "email": "admin@system.com",
      "roles": [{ "id": 1, "name": "ADMIN" }]
    }
  }
}
```

### 4. Login by Email (Vendor)
```http
POST /auth/login-email
Content-Type: application/json

{
  "email": "vendor@system.com",
  "password": "vendor123"
}

Response (200): Same as above
```

### 5. Introspect Token (Validate)
```http
POST /auth/introspect
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}

Response (200):
{
  "code": 200,
  "result": {
    "valid": true
  }
}
```

### 6. Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiJ9..." // old token
}

Response (200):
{
  "code": 200,
  "result": {
    "token": "eyJhbGciOiJIUzI1NiJ9..." // new token
  }
}
```

### 7. Logout
```http
POST /auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}

Response (200):
{
  "code": 200,
  "message": "Logout successfully"
}
```

---

## 👤 ACCOUNT ENDPOINTS

### 1. Get All Accounts (Admin)
```http
GET /accounts
Authorization: Bearer {token}

Response (200):
{
  "code": 200,
  "result": [
    {
      "id": 1,
      "userName": "admin",
      "fullName": "Quản trị viên",
      "email": "admin@system.com",
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00Z",
      "roles": [...]
    },
    { ... }
  ]
}
```

### 2. Get Account by ID
```http
GET /accounts/{accountId}
Authorization: Bearer {token}

Example: GET /accounts/2

Response (200):
{
  "code": 200,
  "result": { /* account object */ }
}
```

### 3. Get My Info
```http
GET /accounts/getMyInfo
Authorization: Bearer {token}

Response (200):
{
  "code": 200,
  "result": { /* current account info */ }
}
```

### 4. Create Account (Admin)
```http
POST /accounts
Authorization: Bearer {token}
Content-Type: application/json

{
  "userName": "newuser",
  "password": "Password@123",
  "fullName": "Người dùng mới",
  "email": "newuser@gmail.com"
}

Response (201):
{
  "code": 200,
  "result": {
    "id": 14,
    "userName": "newuser",
    ...
  }
}
```

### 5. Update Account
```http
PUT /accounts/{accountId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "Tên mới",
  "email": "new.email@gmail.com"
}

Response (200):
{
  "code": 200,
  "result": { /* updated account */ }
}
```

### 6. Delete Account (Admin)
```http
DELETE /accounts/{accountId}
Authorization: Bearer {token}

Response (200):
{
  "code": 200,
  "message": "Delete successfully"
}
```

---

## 🏬 FOOD STREET ENDPOINTS

### 1. Get All Food Streets (Public - Active Only)
```http
GET /streets

Response (200):
{
  "code": 200,
  "result": [
    {
      "id": 1,
      "name": "Phố ẩm thực Vĩnh Khánh",
      "description": "Khu phố ẩm thực nổi tiếng...",
      "address": "Đường Vĩnh Khánh, Q4",
      "city": "Hồ Chí Minh",
      "latitude": 10.757622,
      "longitude": 106.704018,
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### 2. Get Food Street by ID
```http
GET /streets/{streetId}

Example: GET /streets/1

Response (200):
{
  "code": 200,
  "result": { /* street object */ }
}
```

### 3. Get All Streets (Admin)
```http
GET /streets/admin
Authorization: Bearer {admin_token}

Response (200):
{
  "code": 200,
  "result": [ /* all streets including inactive */ ]
}
```

### 4. Create Food Street (Admin)
```http
POST /streets
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Phố ẩm thực Nguyễn Huệ",
  "description": "Phố ẩm thực mới tại Q1",
  "address": "Đường Nguyễn Huệ, Q1",
  "city": "Hồ Chí Minh",
  "latitude": 10.776580,
  "longitude": 106.704638,
  "isActive": true
}

Response (201):
{
  "code": 200,
  "result": {
    "id": 2,
    "name": "Phố ẩm thực Nguyễn Huệ",
    ...
  }
}
```

### 5. Update Food Street (Admin)
```http
PUT /streets/{streetId}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Phố ẩm thực Vĩnh Khánh (Updated)",
  "isActive": true
}

Response (200):
{
  "code": 200,
  "result": { /* updated street */ }
}
```

### 6. Delete Food Street (Admin)
```http
DELETE /streets/{streetId}
Authorization: Bearer {admin_token}

Response (200):
{
  "code": 200,
  "message": "Deleted successfully"
}
```

---

## 🍽️ STALL ENDPOINTS

### 1. Get All Active Stalls (Public)
```http
GET /stalls

Response (200):
{
  "code": 200,
  "result": [
    {
      "id": 1,
      "streetId": 1,
      "vendorId": 2,
      "name": "Lãng Quán",
      "category": "BBQ",
      "description": "...",
      "latitude": "10.757900",
      "longitude": "106.704250",
      "image": "https://...",
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00Z"
    },
    { ... }
  ]
}
```

### 2. Get All Stalls (Admin - including inactive)
```http
GET /stalls/all
Authorization: Bearer {admin_token}

Response (200):
{
  "code": 200,
  "result": [ /* all stalls */ ]
}
```

### 3. Get Stall by ID
```http
GET /stalls/{stallId}

Example: GET /stalls/2

Response (200):
{
  "code": 200,
  "result": { /* stall object */ }
}
```

### 4. Get Stalls by Street
```http
GET /stalls/street/{streetId}

Example: GET /stalls/street/1

Response (200):
{
  "code": 200,
  "result": [ /* stalls in this street */ ]
}
```

### 5. Get Stall by Vendor
```http
GET /stalls/vendor/{vendorId}

Example: GET /stalls/vendor/3

Response (200):
{
  "code": 200,
  "result": { /* vendor's stall */ }
}
```

### 6. Create Stall (Vendor/Admin)
```http
POST /stalls
Authorization: Bearer {token}
Content-Type: application/json

{
  "streetId": 1,
  "vendorId": 3,
  "name": "Ốc Oanh Mới",
  "category": "SEAFOOD",
  "description": "Ốc tươi sống, chất lượng cao",
  "latitude": "10.757600",
  "longitude": "106.704000",
  "image": "https://cloudinary.com/.../oc-oanh.jpg",
  "isActive": true
}

Response (201):
{
  "code": 200,
  "result": {
    "id": 11,
    "name": "Ốc Oanh Mới",
    ...
  }
}
```

### 7. Update Stall
```http
PUT /stalls/{stallId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Ốc Oanh Updated",
  "category": "SEAFOOD",
  "isActive": true,
  ...
}

Response (200):
{
  "code": 200,
  "result": { /* updated stall */ }
}
```

### 8. Delete Stall
```http
DELETE /stalls/{stallId}
Authorization: Bearer {token}

Response (200):
{
  "code": 200,
  "message": "Successfully"
}
```

### 9. Scan QR Code (Redirect)
```http
GET /stalls/scan/{qrCode}?sessionId={sessionId}

Example: GET /stalls/scan/STREET_GATEWAY?sessionId=abc123

Response: 302 Redirect
Location: https://frontend.com/stall/1
```

---

## 🍜 FOOD ENDPOINTS

### 1. Get All Foods
```http
GET /foods

Response (200):
{
  "code": 200,
  "result": [
    {
      "id": 1,
      "stallId": 1,
      "name": "Ốc hương xào bơ tỏi",
      "price": 80000,
      "description": "Ốc hương giòn sần sật quyện sốt bơ tỏi",
      "image": "https://...",
      "isAvailable": true,
      "createdAt": "2024-01-01T10:00:00Z"
    },
    { ... }
  ]
}
```

### 2. Get Foods by Stall
```http
GET /foods/stall/{stallId}

Example: GET /foods/stall/1

Response (200):
{
  "code": 200,
  "result": [ /* foods from this stall */ ]
}
```

### 3. Create Food
```http
POST /foods
Authorization: Bearer {token}
Content-Type: application/json

{
  "stallId": 1,
  "name": "Ốc bươu nướng tiêu",
  "price": 60000,
  "description": "Ốc bươu giòn dai, sốt tiêu đen cay nồng",
  "image": "https://..."
}

Response (201):
{
  "code": 200,
  "result": {
    "id": 81,
    "stallId": 1,
    "name": "Ốc bươu nướng tiêu",
    ...
  }
}
```

### 4. Update Food
```http
PUT /foods/{foodId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "price": 65000,
  "isAvailable": true,
  "description": "Ốc bươu giòn dai, sốt tiêu đen cay nồng"
}

Response (200):
{
  "code": 200,
  "result": { /* updated food */ }
}
```

### 5. Delete Food
```http
DELETE /foods/{foodId}
Authorization: Bearer {token}

Response (200):
{
  "code": 200,
  "message": ""
}
```

---

## 🌐 STALL TRANSLATION ENDPOINTS

### 1. Get All Translations for a Stall
```http
GET /stall-translations/stall/{stallId}

Example: GET /stall-translations/stall/2

Response (200):
{
  "code": 200,
  "result": [
    {
      "id": 1,
      "stallId": 2,
      "languageCode": "vi",
      "name": "Ốc Oanh Vĩnh Khánh",
      "ttsScript": "Chào mừng bạn đến với...",
      "audioUrl": "https://res.cloudinary.com/.../ocoanhvinhkhanh_vi.mp3",
      "fileSize": 120000,
      "audioHash": "abc123def456",
      "audioStatus": "COMPLETED"
    },
    {
      "languageCode": "en-US",
      "audioStatus": "COMPLETED",
      ...
    },
    {
      "languageCode": "zh",
      "audioStatus": "COMPLETED",
      ...
    }
  ]
}
```

### 2. Get Translation by ID
```http
GET /stall-translations/{translationId}

Example: GET /stall-translations/1

Response (200):
{
  "code": 200,
  "result": { /* translation object */ }
}
```

### 3. Create Translation (Auto-trigger TTS)
```http
POST /stall-translations
Authorization: Bearer {token}
Content-Type: application/json

{
  "stallId": 2,
  "languageCode": "ja",
  "ttsScript": "Oanh貝店へようこそ。新鮮な貝類...最高の味を..."
}

Response (201):
{
  "code": 200,
  "result": {
    "id": 50,
    "stallId": 2,
    "languageCode": "ja",
    "audioStatus": "PENDING"
  }
}
// Note: Audio generation happens async in background
```

### 4. Update Translation
```http
PUT /stall-translations/{translationId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "ttsScript": "Oanh 貝店へようこそ (UPDATED)..."
}

Response (200):
{
  "code": 200,
  "result": {
    "id": 50,
    "audioStatus": "PENDING" // Reset to regenerate
  }
}
```

### 5. Delete Translation
```http
DELETE /stall-translations/{translationId}
Authorization: Bearer {token}

Response (200):
{
  "code": 200,
  "message": "Delete Stall Translation By ID Successfully"
}
```

### 6. ⭐ GET AUDIO (Zero-Latency Flow)
```http
GET /stall-translations/audio?stallId={stallId}&language={lang}&clientHash={hash}

Example 1 - First time (no cache):
GET /stall-translations/audio?stallId=2&language=ko

Response (200):
{
  "code": 200,
  "message": "Get Audio Successfully",
  "result": {
    "needDownload": true,
    "audioUrl": "https://res.cloudinary.com/.../stall_2_ko.mp3",
    "audioHash": "md5hash123",
    "fileSize": 125000,
    "status": "COMPLETED",
    "message": "Audio generated successfully. Need download."
  }
}

Example 2 - Cached (hash match):
GET /stall-translations/audio?stallId=2&language=ko&clientHash=md5hash123

Response (200):
{
  "result": {
    "needDownload": false,
    "status": "COMPLETED",
    "message": "Use local audio. Hash matched."
  }
}
// Client doesn't download, uses local cached file

Example 3 - Language generating, fallback to English:
GET /stall-translations/audio?stallId=2&language=ja

Response (200):
{
  "result": {
    "needDownload": true,
    "audioUrl": "https://res.cloudinary.com/.../stall_2_en.mp3",
    "audioHash": "en_hash",
    "status": "COMPLETED",
    "message": "Requested language is generating. Using fallback language (en)."
  }
}
// Returns English while Japanese is being processed in background
```

---

## 🔗 QR CODE ENDPOINTS

### 1. Get All QR Codes
```http
GET /qr

Response (200):
{
  "code": 200,
  "result": [
    {
      "id": 1,
      "code": "STREET_GATEWAY",
      "name": "Cổng Chào Dự Án",
      "stallId": null,
      "isActive": true,
      "scanCount": 150,
      "createdAt": "2024-01-01T10:00:00Z"
    },
    { ... }
  ]
}
```

### 2. Get QR Code by ID
```http
GET /qr/{qrId}

Response (200):
{
  "code": 200,
  "result": { /* qr object */ }
}
```

### 3. Get Gateway QR
```http
GET /qr/gateway

Response (200):
{
  "code": 200,
  "result": {
    "id": 1,
    "code": "STREET_GATEWAY",
    "stallId": null,
    ...
  }
}
```

### 4. Get QR by Stall
```http
GET /qr/stall/{stallId}

Example: GET /qr/stall/2

Response (200):
{
  "code": 200,
  "result": { /* qr for this stall */ }
}
```

### 5. Create QR Code
```http
POST /qr
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "STALL_2_OANH",
  "name": "QR Ốc Oanh",
  "stallId": 2,
  "isActive": true
}

Response (201):
{
  "code": 200,
  "result": {
    "id": 50,
    "code": "STALL_2_OANH",
    "stallId": 2,
    "scanCount": 0,
    ...
  }
}
```

### 6. Update QR Code
```http
PUT /qr/{qrId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "QR Ốc Oanh Updated",
  "isActive": true
}

Response (200):
{
  "code": 200,
  "result": { /* updated qr */ }
}
```

### 7. Toggle QR Active/Inactive
```http
PATCH /qr/{qrId}/toggle
Authorization: Bearer {token}

Response (200):
{
  "code": 200,
  "result": {
    "id": 50,
    "isActive": false
  }
}
```

### 8. Regenerate QR Code
```http
PATCH /qr/{qrId}/regenerate
Authorization: Bearer {token}

Response (200):
{
  "code": 200,
  "result": {
    "id": 50,
    "code": "UUID_NEW_CODE",
    ...
  }
}
```

### 9. Delete QR Code
```http
DELETE /qr/{qrId}
Authorization: Bearer {token}

Response (200):
{
  "code": 200,
  "message": "Successfully deleted QR code"
}
```

### 10. Scan QR Code (Redirect)
```http
GET /qr/scan/{code}?sessionId={sessionId}

Example: GET /qr/scan/STREET_GATEWAY?sessionId=xyz123

Response: 302 Redirect
Location: https://frontend.com/home
Header: X-Session: xyz123

// Analytics logged:
// - event_type: QR_SCAN
// - scan_count: incremented
// - ip_address, user_agent, timestamp
```

---

## 📸 CLOUDINARY ENDPOINTS

### 1. Upload Image
```http
POST /cloudinary/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- file: <image_file>
- folder: stalls (optional)
- publicId: stall_1_image (optional)

Response (200):
{
  "code": 200,
  "result": {
    "publicId": "stalls/stall_1_image",
    "url": "https://res.cloudinary.com/.../stall_1_image.jpg",
    "resourceType": "image",
    "bytes": 245000
  }
}
```

### 2. Delete File
```http
DELETE /cloudinary/delete?publicId={publicId}&resourceType={type}
Authorization: Bearer {token}

Example: DELETE /cloudinary/delete?publicId=stalls/stall_1_image&resourceType=image

Response (200):
{
  "code": 200,
  "result": true
}
```

---

## 📊 DASHBOARD ENDPOINTS

### 1. Admin Dashboard Stats
```http
GET /admin/dashboard/stats
Authorization: Bearer {admin_token}

Response (200):
{
  "code": 200,
  "result": {
    "totalVisits": 2150,
    "uniqueVisitors": 890
  }
}
```

### 2. Vendor Dashboard Stats
```http
GET /vendor/dashboard/stats/{stallId}?days=7
Authorization: Bearer {vendor_token}

Example: GET /vendor/dashboard/stats/2?days=7

Response (200):
{
  "code": 200,
  "result": {
    "totalVisits": 180,
    "audioCompletes": 150,
    "qrScans": 45,
    "dailyVisits": [
      { "day": "2024-01-15", "count": 20 },
      { "day": "2024-01-16", "count": 25 },
      { "day": "2024-01-17", "count": 30 },
      { "day": "2024-01-18", "count": 28 },
      { "day": "2024-01-19", "count": 35 },
      { "day": "2024-01-20", "count": 22 },
      { "day": "2024-01-21", "count": 20 }
    ]
  }
}
```

---

## ⚠️ ERROR RESPONSES

### 400 Bad Request
```json
{
  "code": 400,
  "message": "Invalid input",
  "result": null
}
```

### 401 Unauthorized (Invalid Token)
```json
{
  "code": 401,
  "message": "Unauthenticated",
  "result": null
}
```

### 403 Forbidden (Insufficient Permission)
```json
{
  "code": 403,
  "message": "You do not have permission",
  "result": null
}
```

### 404 Not Found
```json
{
  "code": 404,
  "message": "Resource not found",
  "result": null
}
```

### 409 Conflict (Resource Already Exists)
```json
{
  "code": 409,
  "message": "User already exists",
  "result": null
}
```

### 500 Internal Server Error
```json
{
  "code": 500,
  "message": "Internal server error",
  "result": null
}
```

---

## 📝 TESTING WORKFLOW

### Step 1: Register & Login
```bash
1. POST /auth/register-vendor
   └─ Get accountId

2. POST /auth/login-email
   └─ Get JWT token

3. Store token for subsequent requests
   └─ Use in Authorization: Bearer {token}
```

### Step 2: Manage Stall
```bash
1. GET /stalls/vendor/{vendorId}
   └─ Get your stall

2. POST /stall-translations
   └─ Add Vietnamese translation (required for fallback)

3. POST /stall-translations
   └─ Add other language translations (optional)

4. Wait 5-10 seconds for async audio generation
```

### Step 3: Test Audio Delivery
```bash
1. GET /stall-translations/audio?stallId={id}&language=vi
   └─ First request: Returns audio URL + hash

2. GET /stall-translations/audio?stallId={id}&language=vi&clientHash={hash}
   └─ Second request: Returns needDownload=false (cache hit!)
```

### Step 4: Test QR Scanning
```bash
1. GET /qr/scan/STREET_GATEWAY?sessionId=abc123
   └─ Analytics logged, 302 redirect
```

### Step 5: View Analytics
```bash
1. GET /vendor/dashboard/stats/{stallId}?days=7
   └─ See your engagement metrics
```

---

**API Reference End**
