import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../drizzle/schema';
import { env } from './env';

const pool = new Pool({
  connectionString: env.databaseUrl,
});

export const db = drizzle(pool, { schema });

