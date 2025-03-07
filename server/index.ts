
import express, { json, urlencoded } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { setupViteServer } from './vite.js';
import { setupRoutes } from './routes.js';
import { testConnection } from './db.js';
import { storage } from './storage.js';

async function main() {
  console.log("بدء تشغيل الخادم...");
  
  // اختبار الاتصال بقاعدة البيانات
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error("فشل الاتصال بقاعدة البيانات، سيتم محاولة إنشاء الجداول عند الطلب");
  } else {
    console.log("تم الاتصال بقاعدة البيانات بنجاح");
  }

  // إنشاء تطبيق Express
  const app = express();
  
  // تكوين التطبيق
  app.use(json());
  app.use(urlencoded({ extended: true }));
  
  // إعداد CORS - السماح بالوصول من أي مصدر عندما نكون في بيئة التطوير
  app.use(cors({
    origin: true,
    credentials: true
  }));
  
  // إعداد طرق API
  await setupRoutes(app);
  
  // تأكد من وجود الجداول وإنشائها إذا لم تكن موجودة
  await storage.ensureTablesExist();
  
  // إعداد وتشغيل الخادم
  const port = process.env.PORT || 4000;
  
  // إنشاء خادم HTTP
  const server = createServer(app);
  
  // إعداد خادم Vite للواجهة الأمامية
  await setupViteServer(app, server);
  
  // استماع إلى الطلبات
  server.listen(port, '0.0.0.0', () => {
    console.log(`الخادم يعمل على المنفذ ${port} 🚀`);
    console.log(`يمكنك الوصول إلى التطبيق من خلال: http://localhost:${port}/`);
  });

  // إضافة معالجة للأخطاء غير المتوقعة
  process.on('uncaughtException', (error) => {
    console.error('خطأ غير متوقع:', error);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('وعد غير معالج:', reason);
  });
}

main().catch((error) => {
  console.error("خطأ أثناء بدء تشغيل الخادم:", error);
  process.exit(1);
});
