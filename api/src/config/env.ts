import * as dotenv from 'dotenv';

dotenv.config();

const resolveDatabaseUrl = (): string => {
  const url =
    process.env.SUPABASE_DB_URL ||
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/creatus_car';

  if (!url) {
    throw new Error('Database connection string is not configured');
  }

  return url;
};

export const env = {
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: resolveDatabaseUrl(),
  supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  jwtSecret: process.env.JWT_SECRET || 'jwt-secret-key-999',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  lineChannelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  lineChannelSecret: process.env.LINE_CHANNEL_SECRET || '',
  lineGroupId: process.env.LINE_GROUP_ID || '',
  approvalsUrl: process.env.APPROVALS_URL || '',
  googleSheetsCredentials: process.env.GOOGLE_SHEETS_CREDENTIALS || '',
  googleSheetsSpreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  saEmployeeId: process.env.SA_EMPLOYEE_ID || 'SA001',
  saPassword: process.env.SA_PASSWORD || 'Creatus@123',
};

