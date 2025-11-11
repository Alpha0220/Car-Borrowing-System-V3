# 🏎️ Creatus Car Service

ระบบเบิกรถภายในองค์กร - Web Application สำหรับการจัดการการเบิกใช้รถ

## 🎯 Features

- ✅ **Authentication & Authorization**: JWT-based authentication with role-based access control
- ✅ **Vehicle Management**: จัดการข้อมูลรถและสถานะ (Available/In Use/Broken)
- ✅ **Borrowing System**: ระบบขอเบิกรถ, อนุมัติ, และคืนรถ
- ✅ **Notifications**: แจ้งเตือนผ่าน LINE Messaging API
- ✅ **Google Sheets Integration**: บันทึกข้อมูลการเบิกรถอัตโนมัติ
- ✅ **Reports**: ระบบรายงานพร้อมตัวกรอง
- ✅ **Real-time Updates**: แจ้งเตือนทันทีเมื่อมีการเปลี่ยนแปลง

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18** + **TypeScript**
- **TailwindCSS**

### Backend
- **Express.js** + **TypeScript**
- **Drizzle ORM** (แทน Prisma)
- **Supabase Postgres**
- **JWT** Authentication
- **bcrypt** สำหรับ hash password

### Integrations
- **LINE Messaging API** - แจ้งเตือน
- **Google Sheets API** - บันทึกข้อมูล

### Infrastructure
- **Docker** + **Docker Compose**

## 📁 Project Structure

```
creatus-car/
├── api/                    # Express backend
│   ├── src/
│   │   ├── config/         # Database, environment config
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Auth middleware
│   │   ├── repositories/   # Data access layer
│   │   ├── routes/         # API routes
│   │   ├── schemas/        # Zod validation schemas
│   │   ├── services/       # External services (LINE, Google Sheets)
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── drizzle/
│   │   ├── schema.ts       # Database schema
│   │   └── drizzle.config.ts
│   ├── Dockerfile
│   └── package.json
├── ui/                     # Next.js frontend
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── lib/                # Utilities, API client
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)

### Environment Variables

สร้างไฟล์ `.env` ใน root directory:

```env
# Database (Supabase)
SUPABASE_DB_URL=postgresql://postgres:postgres@localhost:5432/creatus_car
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# LINE Messaging API
LINE_CHANNEL_ACCESS_TOKEN=your-line-channel-access-token
LINE_CHANNEL_SECRET=your-line-channel-secret

# Google Sheets
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account",...}
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Running with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Local Development

#### Backend

```bash
cd api
npm install
npm run dev
```

#### Frontend

```bash
cd ui
npm install
npm run dev
```

### Database Migrations

```bash
cd api
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
```

## 👥 User Roles

### SUPER_ADMIN
- จัดการผู้ใช้ (เพิ่ม, แก้ไข)
- ดูรายงานทั้งหมด
- อนุมัติคำขอเบิกรถ
- จัดการรถ

### MANAGER
- อนุมัติคำขอเบิกรถ
- ดูรายงาน
- จัดการรถ

### EMPLOYEE
- ขอเบิกรถ
- คืนรถ
- ดูรายการเบิกรถของตัวเอง
- ดูสถานะรถ

## 🔄 Workflow

1. **Super Admin** เพิ่มข้อมูลพนักงาน (ชื่อ, รหัสพนักงาน, บทบาท)
2. **Employee** สมัครสมาชิกด้วยรหัสพนักงานที่ได้รับ
3. **Employee** ล็อกอินและขอเบิกรถ (กรอกทะเบียนรถ)
4. ระบบส่งแจ้งเตือนผ่าน LINE Messaging API ไปยัง Manager
5. **Manager** อนุมัติคำขอ (กรอกเลขไมล์เริ่มต้น, น้ำมัน)
6. **Employee** ใช้รถเสร็จ → คืนรถ (กรอกเลขไมล์คืน)
7. ระบบบันทึกข้อมูลลง Google Sheets และส่งแจ้งเตือน

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - สมัครสมาชิก
- `POST /api/auth/login` - เข้าสู่ระบบ

### Users (Admin only)
- `POST /api/users` - เพิ่มผู้ใช้
- `GET /api/users` - ดูรายการผู้ใช้
- `GET /api/users/me` - ดูข้อมูลตัวเอง

### Vehicles
- `GET /api/vehicles` - ดูรายการรถ
- `GET /api/vehicles/:id` - ดูข้อมูลรถ
- `GET /api/vehicles/:id/summary` - ดูสรุปข้อมูลล่าสุดของรถ
- `POST /api/vehicles` - เพิ่มรถ (Manager/Admin)
- `PATCH /api/vehicles/:id` - อัปเดตรถ (Manager/Admin)

### Borrows
- `POST /api/borrows` - สร้างคำขอเบิกรถ
- `GET /api/borrows/my` - ดูรายการเบิกรถของตัวเอง
- `GET /api/borrows/pending` - ดูคำขอที่รออนุมัติ (Manager/Admin)
- `PATCH /api/borrows/:id/approve` - อนุมัติคำขอ (Manager/Admin)
- `PATCH /api/borrows/:id/return` - คืนรถ
- `GET /api/borrows/reports` - ดูรายงาน (Manager/Admin)

### Notifications
- `GET /api/notifications` - ดูการแจ้งเตือน
- `PATCH /api/notifications/:id/read` - ทำเครื่องหมายว่าอ่านแล้ว
- `PATCH /api/notifications/read-all` - ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว

## 🔐 Security

- Passwords are hashed using bcrypt
- JWT tokens with expiration
- Role-based access control (RBAC)
- Input validation using Zod

## 📝 Notes

- ระบบใช้ Drizzle ORM แทน Prisma
- ต้องตั้งค่า LINE Messaging API channel access token ใน environment variables
- Google Sheets credentials ต้องเป็น service account JSON
- Database migrations ต้องรันก่อนใช้งานครั้งแรก

## 🐛 Troubleshooting

### Database connection error
- ตรวจสอบว่า PostgreSQL container ทำงานอยู่
- ตรวจสอบ DATABASE_URL ใน environment variables

### LINE Messaging API ไม่ทำงาน
- ตรวจสอบ LINE_CHANNEL_ACCESS_TOKEN และสิทธิ์การใช้งาน channel
- ระบบจะข้ามการส่งแจ้งเตือนถ้าไม่มี token (ไม่ error)

### Google Sheets ไม่บันทึก
- ตรวจสอบ GOOGLE_SHEETS_CREDENTIALS และ SPREADSHEET_ID
- ระบบจะข้ามการบันทึกถ้าไม่มี credentials (ไม่ error)

## 📄 License

MIT

