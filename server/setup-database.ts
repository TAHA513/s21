
import { pool } from './db';
import * as fs from 'fs';
import * as path from 'path';

async function setupDatabase() {
  console.log('بدء إعداد قاعدة البيانات...');
  
  try {
    // قراءة ملف schema.sql
    const schemaPath = path.join(process.cwd(), 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // الاتصال بقاعدة البيانات وتنفيذ الاستعلام
    const client = await pool.connect();
    
    try {
      console.log('تنفيذ استعلامات إنشاء الجداول...');
      await client.query(schemaSQL);
      console.log('تم إنشاء الجداول بنجاح!');
    } finally {
      client.release();
    }
    
    console.log('اكتمل إعداد قاعدة البيانات.');
  } catch (error) {
    console.error('خطأ في إعداد قاعدة البيانات:', error);
  } finally {
    // إغلاق اتصال المجمع
    await pool.end();
  }
}

// تنفيذ الوظيفة
setupDatabase();
