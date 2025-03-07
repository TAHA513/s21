
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';

// إعداد اتصال قاعدة البيانات
const connectionString = process.env.DATABASE_URL;
const pool = connectionString ? new Pool({ connectionString }) : null;
const db = pool ? drizzle(pool) : null;

export { db, pool };
