import * as dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/creatus_car',
  jwtSecret: process.env.JWT_SECRET || 'jwt-secret-key-999',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  lineNotifyToken: process.env.LINE_NOTIFY_TOKEN || '',
  googleSheetsCredentials: process.env.GOOGLE_SHEETS_CREDENTIALS || '',
  googleSheetsSpreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  saEmployeeId: process.env.SA_EMPLOYEE_ID || 'SA001',
  saPassword: process.env.SA_PASSWORD || 'Creatus@123',
};

