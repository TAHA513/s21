
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

// قاعدة البيانات المحلية
let _db: Database | null = null;

// دالة للحصول على اتصال قاعدة البيانات
export async function getDb() {
  if (!_db) {
    _db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });
  }
  return _db;
}

// محاكاة واجهة تجمع الاتصالات للتوافق مع الكود الحالي
export const pool = {
  query: async (text: string, params: any[] = []) => {
    const db = await getDb();
    // استبدال $1, $2, الخ بـ ?, ?, للتوافق مع SQLite
    const sqliteText = text.replace(/\$\d+/g, '?');
    try {
      if (sqliteText.trim().toLowerCase().startsWith('select')) {
        return { rows: await db.all(sqliteText, params) };
      } else {
        const result = await db.run(sqliteText, params);
        return { rowCount: result.changes, rows: [] };
      }
    } catch (error) {
      console.error('خطأ في تنفيذ الاستعلام:', error);
      throw error;
    }
  },
  end: async () => {
    if (_db) {
      await _db.close();
      _db = null;
    }
  }
};

// اختبار الاتصال بقاعدة البيانات
export async function testConnection() {
  try {
    console.log('جاري اختبار الاتصال بقاعدة البيانات...');
    const db = await getDb();
    await db.exec(`
      CREATE TABLE IF NOT EXISTS connection_test (
        id INTEGER PRIMARY KEY,
        test_date TEXT
      )
    `);
    const result = await db.get('SELECT datetime("now") as now');
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح. الوقت الحالي:', result?.now);
    return true;
  } catch (error) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', error);
    return false;
  }
}

// إغلاق الاتصال عند إيقاف التطبيق
process.on('SIGINT', async () => {
  await pool.end();
  console.log('تم إغلاق اتصال قاعدة البيانات');
  process.exit(0);
});
