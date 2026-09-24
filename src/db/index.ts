import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import dotenv from 'dotenv';
import * as schema from './schema.js';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/makina',
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool, { schema });

// Connection test helper
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('[Database] Connected successfully to PostgreSQL');
    return true;
  } catch (error) {
    console.warn('[Database] Warning: Could not connect to PostgreSQL:', (error as Error).message);
    return false;
  }
}
