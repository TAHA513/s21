
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { setupViteServer } from './vite.js';
import { setupRoutes } from './routes.js';
import { testConnection } from './db.js';
import { storage } from './storage.js';

async function main() {
  // تجهيز تطبيق Express
  const app = express();
  
  // تكوين CORS وإعدادات JSON
  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  console.log("🚀 بدء تشغيل الخادم...");
  
  // اختبار الاتصال بقاعدة البيانات
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error("❌ فشل الاتصال بقاعدة البيانات، سيتم محاولة إنشاء الجداول عند الطلب لاحقًا");
  }
  
  // إعداد طرق API
  await setupRoutes(app);
  console.log("✅ تم تسجيل طرق API بنجاح");
  
  // إنشاء وضمان وجود جداول قاعدة البيانات
  await storage.ensureTablesExist()
    .then(success => {
      if (success) {
        console.log("✅ تم التحقق من الجداول وإنشائها بنجاح");
      } else {
        console.error("❌ حدث خطأ أثناء إنشاء الجداول");
      }
    });
  
  // استخدام منفذ 5000 بدلاً من 3000 أو 4000 لتجنب التعارض
  const port = process.env.PORT || 5000;
  
  // إنشاء خادم HTTP
  const server = createServer(app);
  
  // إعداد خادم Vite للواجهة الأمامية
  try {
    await setupViteServer(app, server);
    console.log("✅ تم إعداد خادم Vite بنجاح");
  } catch (error) {
    console.error("❌ فشل في إعداد خادم Vite:", error);
  }
  
  // إيقاف أي عمليات سابقة على نفس المنفذ (إجراء بديل)
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ المنفذ ${port} قيد الاستخدام بالفعل، جاري المحاولة على منفذ آخر...`);
      setTimeout(() => {
        server.close();
        server.listen(port + 1, '0.0.0.0');
      }, 1000);
    } else {
      console.error(`❌ خطأ في الخادم:`, error);
    }
  });
  
  // بدء الاستماع على المنفذ
  server.listen(port, '0.0.0.0', () => {
    console.log(`✅ الخادم يعمل على المنفذ ${port}`);
    console.log(`📱 يمكنك الوصول إلى التطبيق من خلال: http://0.0.0.0:${port}/`);
  });
  
  // معالجة الأخطاء غير المتوقعة
  process.on('uncaughtException', (error) => {
    console.error('❌ خطأ غير متوقع:', error);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ وعد غير معالج:', reason);
  });
}

// تشغيل الخادم
main().catch((error) => {
  console.error("❌ خطأ أثناء بدء تشغيل الخادم:", error);
  process.exit(1);
});
