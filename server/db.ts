import pkg from 'pg';
const { Client } = pkg;
import * as schema from '../shared/schema';
import { drizzle } from 'drizzle-orm/node-postgres';

// تهيئة اتصال قاعدة البيانات
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// اتصال بقاعدة البيانات
await client.connect();

// تهيئة Drizzle ORM
export const db = drizzle(client, { schema });

// تصدير الاتصال بقاعدة البيانات للاستخدام في أجزاء أخرى من التطبيق
export { client as dbClient };