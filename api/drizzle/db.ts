import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../src/config/env';

// Create a new connection for running seeds
const client = postgres(env.databaseUrl);
export const db = drizzle(client);