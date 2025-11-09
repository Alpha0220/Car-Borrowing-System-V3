<!-- # 🚀 Setup Guide

## Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd car-server-v3
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start services**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec api npm run db:migrate
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - Database: localhost:5432

## Initial Setup Steps

### 1. Create Super Admin User

After starting the database, you need to manually create a Super Admin user in the database:

```sql
INSERT INTO users (id, name, employee_id, password, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Admin User',
  'ADMIN001',
  '$2b$10$Creatus777', -- Use bcrypt to hash a password
  'SUPER_ADMIN',
  NOW(),
  NOW()
);
```

Or use the API after creating the first user manually:

```bash
# First, create user without password (via direct DB insert or API if you have admin)
# Then register with employee ID
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"employeeId": "ADMIN001", "password": "yourpassword"}'
```

### 2. Configure LINE Notify

1. Go to https://notify-bot.line.me/
2. Create a LINE Notify account
3. Generate a token
4. Add token to `.env`:
   ```
   LINE_NOTIFY_TOKEN=your-token-here
   ```

### 3. Configure Google Sheets

1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create a Service Account
4. Download JSON credentials
5. Add to `.env`:
   ```
   GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account",...}'
   GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
   ```
6. Share the Google Sheet with the service account email

### 4. Create Initial Data

After logging in as Super Admin:

1. Create users (via `/users` page)
2. Create vehicles (via API or direct DB insert)
3. Start using the system!

## Development Mode

### Backend Development

```bash
cd api
npm install
npm run dev  # Runs on port 4000 with hot reload
```

### Frontend Development

```bash
cd ui
npm install
npm run dev  # Runs on port 3000
```

### Database Migrations

```bash
cd api
npm run db:generate  # Generate migration from schema changes
npm run db:migrate   # Apply migrations
npm run db:studio    # Open Drizzle Studio (DB GUI)
```

## Troubleshooting

### Port already in use
- Change ports in `docker-compose.yml` or stop conflicting services

### Database connection failed
- Ensure PostgreSQL container is running: `docker-compose ps`
- Check DATABASE_URL in `.env`

### Migration errors
- Ensure database is running
- Check migration files exist in `api/drizzle/migrations/`
- Try resetting: `docker-compose down -v` (⚠️ deletes data)

### LINE Notify not working
- Check token is valid
- System will skip notifications if token is missing (won't error)

### Google Sheets not saving
- Verify service account has access to spreadsheet
- Check credentials JSON format
- System will skip saving if credentials are missing (won't error)
 -->
