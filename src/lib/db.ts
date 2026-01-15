import { Pool } from '@neondatabase/serverless';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set. Please set it in your environment variables.');
    }
    pool = new Pool({ connectionString: databaseUrl });
  }
  return pool;
}

export async function query<T = unknown>(text: string, params: Array<unknown> = []) {
  try {
    const dbPool = getPool();
    const result = await dbPool.query(text, params);
    return result.rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    if (error instanceof Error && error.message.includes('DATABASE_URL')) {
      throw new Error('Database connection not configured. Please set DATABASE_URL in your environment variables.');
    }
    throw error;
  }
}

