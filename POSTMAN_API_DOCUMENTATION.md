# 📡 API Documentation for Postman Testing

Base URL: `http://localhost:4000` (หรือ URL ของ server)

## 🚀 Quick Start

### Import Postman Collection

1. เปิด Postman
2. คลิก **Import** (มุมซ้ายบน)
3. เลือกไฟล์ `Creatus_Car_API.postman_collection.json`
4. เลือกไฟล์ `Creatus_Car_API.postman_environment.json` (optional แต่แนะนำ)
5. เลือก Environment "Creatus Car API - Local" (มุมขวาบน)

### Setup Environment Variables

ใน Postman Environment:
- `baseUrl`: `http://localhost:4000` (หรือ URL ของ server)
- `token`: จะถูกตั้งค่าอัตโนมัติหลังจาก Login สำเร็จ

### Testing Workflow

1. **Login** → Token จะถูกเก็บอัตโนมัติใน environment variable
2. ใช้ token นี้สำหรับ requests อื่นๆ ที่ต้องการ authentication
3. ทุก request ที่ต้องการ auth จะใช้ `{{token}}` อัตโนมัติ

## 🔐 Authentication

### 1. Register (สมัครสมาชิก)
**POST** `/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "employeeId": "EMP001",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "Registration successful"
}
```

---

### 2. Login (เข้าสู่ระบบ)
**POST** `/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "employeeId": "EMP001",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "employeeId": "EMP001",
    "name": "John Doe",
    "role": "EMPLOYEE"
  }
}
```

**⚠️ เก็บ token ไว้ใช้ใน Authorization header สำหรับ endpoints อื่นๆ:**
```
Authorization: Bearer <token>
```

---

## 👥 Users

### 3. Create User (เพิ่มผู้ใช้) - SUPER_ADMIN only
**POST** `/api/users`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body (JSON):**
```json
{
  "name": "John Doe",
  "employeeId": "EMP001",
  "role": "EMPLOYEE"
}
```

**Role options:** `SUPER_ADMIN`, `MANAGER`, `EMPLOYEE`

**Response (201):**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "employeeId": "EMP001",
  "role": "EMPLOYEE",
  "password": null,
  "createdAt": "2025-11-09T00:00:00.000Z"
}
```

---

### 4. Get All Users - SUPER_ADMIN, MANAGER only
**GET** `/api/users`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "employeeId": "EMP001",
    "role": "EMPLOYEE",
    "createdAt": "2025-11-09T00:00:00.000Z"
  }
]
```

---

### 5. Get Current User (ดูข้อมูลตัวเอง)
**GET** `/api/users/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "employeeId": "EMP001",
  "role": "EMPLOYEE",
  "createdAt": "2025-11-09T00:00:00.000Z"
}
```

---

## 🚗 Vehicles

### 6. Get All Vehicles (ดูรายการรถ)
**GET** `/api/vehicles`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "licensePlate": "กก-1234",
    "status": "AVAILABLE",
    "easypassBalance": 500,
    "createdAt": "2025-11-09T00:00:00.000Z"
  }
]
```

---

### 7. Get Vehicle by ID (ดูข้อมูลรถ)
**GET** `/api/vehicles/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: Vehicle UUID

**Response (200):**
```json
{
  "id": "uuid",
  "licensePlate": "กก-1234",
  "status": "AVAILABLE",
  "easypassBalance": 500,
  "createdAt": "2025-11-09T00:00:00.000Z"
}
```

---

### 8. Create Vehicle (เพิ่มรถ) - SUPER_ADMIN, MANAGER only
**POST** `/api/vehicles`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body (JSON):**
```json
{
  "licensePlate": "กก-1234",
  "easypassBalance": 500
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "licensePlate": "กก-1234",
  "status": "AVAILABLE",
  "easypassBalance": 500,
  "createdAt": "2025-11-09T00:00:00.000Z"
}
```

---

### 9. Update Vehicle (อัปเดตรถ) - SUPER_ADMIN, MANAGER only
**PATCH** `/api/vehicles/:id`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: Vehicle UUID

**Body (JSON):**
```json
{
  "status": "BROKEN",
  "easypassBalance": 300
}
```

**Status options:** `AVAILABLE`, `IN_USE`, `BROKEN`

**Response (200):**
```json
{
  "id": "uuid",
  "licensePlate": "กก-1234",
  "status": "BROKEN",
  "easypassBalance": 300,
  "createdAt": "2025-11-09T00:00:00.000Z"
}
```

---

## 📋 Borrows

### 10. Create Borrow Request (สร้างคำขอเบิกรถ)
**POST** `/api/borrows`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body (JSON):**
```json
{
  "licensePlate": "กก-1234"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "vehicleId": "uuid",
  "borrowDate": "2025-11-09T00:00:00.000Z",
  "status": "PENDING",
  "startMileage": null,
  "endMileage": null,
  "fuelUsedLiters": null,
  "createdAt": "2025-11-09T00:00:00.000Z"
}
```

---

### 11. Get My Borrows (ดูรายการเบิกรถของตัวเอง)
**GET** `/api/borrows/my`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "vehicleId": "uuid",
    "borrowDate": "2025-11-09T00:00:00.000Z",
    "status": "PENDING",
    "startMileage": null,
    "endMileage": null,
    "fuelUsedLiters": null,
    "createdAt": "2025-11-09T00:00:00.000Z"
  }
]
```

---

### 12. Get Pending Borrows (ดูคำขอที่รออนุมัติ) - MANAGER, SUPER_ADMIN only
**GET** `/api/borrows/pending`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "vehicleId": "uuid",
    "borrowDate": "2025-11-09T00:00:00.000Z",
    "status": "PENDING",
    "startMileage": null,
    "endMileage": null,
    "fuelUsedLiters": null,
    "createdAt": "2025-11-09T00:00:00.000Z"
  }
]
```

---

### 13. Approve Borrow Request (อนุมัติคำขอ) - MANAGER, SUPER_ADMIN only
**PATCH** `/api/borrows/:id/approve`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: Borrow request UUID

**Body (JSON):**
```json
{
  "startMileage": 50000,
  "fuelUsedLiters": 20.5
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "vehicleId": "uuid",
  "borrowDate": "2025-11-09T00:00:00.000Z",
  "status": "APPROVED",
  "startMileage": 50000,
  "endMileage": null,
  "fuelUsedLiters": 20.5,
  "createdAt": "2025-11-09T00:00:00.000Z"
}
```

---

### 14. Return Vehicle (คืนรถ)
**PATCH** `/api/borrows/:id/return`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: Borrow request UUID

**Body (JSON):**
```json
{
  "endMileage": 50100
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "vehicleId": "uuid",
  "borrowDate": "2025-11-09T00:00:00.000Z",
  "status": "RETURNED",
  "startMileage": 50000,
  "endMileage": 50100,
  "fuelUsedLiters": 20.5,
  "createdAt": "2025-11-09T00:00:00.000Z"
}
```

---

### 15. Get Reports (ดูรายงาน) - MANAGER, SUPER_ADMIN only
**GET** `/api/borrows/reports`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (Optional):**
- `userId`: Filter by user ID
- `vehicleId`: Filter by vehicle ID
- `status`: Filter by status (`PENDING`, `APPROVED`, `RETURNED`)
- `borrowDateFrom`: Filter borrows from date (ISO format: `2025-11-01T00:00:00.000Z`)
- `borrowDateTo`: Filter borrows to date (ISO format: `2025-11-30T23:59:59.999Z`)
- `returnDateFrom`: Filter returns from date (ISO format)
- `returnDateTo`: Filter returns to date (ISO format)

**Example:**
```
GET /api/borrows/reports?status=RETURNED&borrowDateFrom=2025-11-01T00:00:00.000Z&borrowDateTo=2025-11-30T23:59:59.999Z
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "vehicleId": "uuid",
    "borrowDate": "2025-11-09T00:00:00.000Z",
    "status": "RETURNED",
    "startMileage": 50000,
    "endMileage": 50100,
    "fuelUsedLiters": 20.5,
    "createdAt": "2025-11-09T00:00:00.000Z"
  }
]
```

---

## 🔔 Notifications

### 16. Get My Notifications (ดูการแจ้งเตือน)
**GET** `/api/notifications`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "message": "คำขอเบิกรถ กก-1234 ถูกส่งแล้ว รอการอนุมัติ",
    "type": "INFO",
    "isRead": false,
    "createdAt": "2025-11-09T00:00:00.000Z"
  }
]
```

---

### 17. Mark Notification as Read (ทำเครื่องหมายว่าอ่านแล้ว)
**PATCH** `/api/notifications/:id/read`

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: Notification UUID

**Response (200):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "message": "คำขอเบิกรถ กก-1234 ถูกส่งแล้ว รอการอนุมัติ",
  "type": "INFO",
  "isRead": true,
  "createdAt": "2025-11-09T00:00:00.000Z"
}
```

---

### 18. Mark All Notifications as Read (ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว)
**PATCH** `/api/notifications/read-all`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "All notifications marked as read"
}
```

---

## 🏥 Health Check

### 19. Health Check
**GET** `/health`

**No authentication required**

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-11-09T00:00:00.000Z"
}
```

---

## 📝 Notes

### Role-Based Access Control:
- **SUPER_ADMIN**: เข้าถึงได้ทุก endpoint
- **MANAGER**: เข้าถึงได้ทุก endpoint ยกเว้นสร้าง/จัดการ users
- **EMPLOYEE**: เข้าถึงได้เฉพาะ endpoints ที่ไม่ต้องการ role พิเศษ

### Error Responses:
```json
{
  "error": "Error message"
}
```

### Common Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

### Testing Workflow:
1. สร้าง User (SUPER_ADMIN) → `POST /api/users`
2. Register → `POST /api/auth/register`
3. Login → `POST /api/auth/login` (เก็บ token)
4. สร้าง Vehicle → `POST /api/vehicles`
5. สร้าง Borrow Request → `POST /api/borrows`
6. Approve Borrow → `PATCH /api/borrows/:id/approve`
7. Return Vehicle → `PATCH /api/borrows/:id/return`

