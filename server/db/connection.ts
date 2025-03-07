
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../shared/schema';

// تحقق من وجود رابط قاعدة البيانات
if (!process.env.DATABASE_URL) {
  console.error('لم يتم تعيين DATABASE_URL في متغيرات البيئة');
  process.exit(1);
}

// إنشاء اتصال قاعدة البيانات
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

export default db;
