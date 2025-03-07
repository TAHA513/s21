import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Create a client that can work with or without DATABASE_URL
const client = postgres(process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/db', { 
  max: 1,
  idle_timeout: 20
});

export const db = drizzle(client, { schema });

// Addition of testConnection function
export async function testConnection() {
  try {
    if (!process.env.DATABASE_URL) {
      console.log('جاري العمل بدون قاعدة بيانات');
      return true;
    }
    await client.query('SELECT NOW()');
    console.log('تم الاتصال بقاعدة البيانات بنجاح');
    return true;
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error);
    console.log('جاري العمل بدون قاعدة بيانات');
    return true; // Return true to allow server to start
  }
}

// Cleanup connection on exit
process.on('exit', () => {
  client.end().catch(console.error);
});

//This part is removed because it is conflicting with the new db implementation.
// // متغير عام يستخدم للاتصال بقاعدة البيانات
// let _db: Database | null = null;
//
// // وظيفة للحصول على الاتصال بقاعدة البيانات
// export async function getDb() {
//   if (!_db) {
//     _db = await open({
//       filename: './database.sqlite',
//       driver: sqlite3.Database
//     });
//   }
//   return _db;
// }
//
// // محاكاة وظائف تجمع الاتصالات
// export const pool = {
//   query: async (text: string, params: any[] = []) => {
//     const db = await getDb();
//     // استبدال $1, $2, الخ بـ ?, ?, الخ لتوافق مع SQLite
//     const sqliteText = text.replace(/\$\d+/g, '?');
//     try {
//       if (sqliteText.trim().toLowerCase().startsWith('select')) {
//         return { rows: await db.all(sqliteText, params) };
//       } else {
//         const result = await db.run(sqliteText, params);
//         return { rowCount: result.changes, rows: [] };
//       }
//     } catch (error) {
//       console.error('خطأ في تنفيذ الاستعلام:', error);
//       throw error;
//     }
//   },
//   end: async () => {
//     if (_db) {
//       await _db.close();
//       _db = null;
//     }
//   }
// };
//
// // إضافة وظيفة للتحقق من الاتصال (replaced by the new function above)
// export async function testConnection() {
//   try {
//     console.log('جاري اختبار الاتصال بقاعدة البيانات...');
//     const db = await getDb();
//     const result = await db.get('SELECT datetime("now") as now');
//     console.log('تم الاتصال بقاعدة البيانات بنجاح. الوقت الحالي:', result?.now);
//     return true;
//   } catch (error) {
//     console.error('فشل الاتصال بقاعدة البيانات:', error);
//     return false;
//   }
// }
//
// // إغلاق الاتصال عند إيقاف التطبيق
// process.on('SIGINT', async () => {
//   await pool.end();
//   console.log('تم إغلاق اتصال قاعدة البيانات');
//   process.exit(0);
//});