
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import { testDatabaseConnection } from "./db";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// تحميل متغيرات البيئة
dotenv.config();

// إنشاء تطبيق Express
const app = express();

// إعداد الوسائط
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// سجل الطلبات
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// إعداد المصادقة
setupAuth(app);

(async () => {
  // اختبار الاتصال بقاعدة البيانات
  try {
    await testDatabaseConnection();
    console.log('تم الاتصال بقاعدة البيانات بنجاح!');
  } catch (error) {
    console.error('فشل الاتصال بقاعدة البيانات:', error);
    console.warn('تأكد من ضبط DATABASE_URL في ملف .env بشكل صحيح');
  }

  // تسجيل المسارات وإنشاء السيرفر
  const server = await registerRoutes(app);

  // معالج الأخطاء
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "خطأ في الخادم";

    console.error(`خطأ [${status}]:`, err);
    res.status(status).json({ error: message });
  });

  // تقديم الملفات الثابتة في وضع الإنتاج
  if (process.env.NODE_ENV === 'production') {
    const clientPath = path.join(process.cwd(), 'public');
    
    // التحقق من وجود مجلد public
    if (fs.existsSync(clientPath)) {
      app.use(express.static(clientPath));
      
      // توجيه جميع الطلبات غير API إلى index.html
      app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
          res.sendFile(path.join(clientPath, 'index.html'));
        }
      });
    }
  }

  // بدء الاستماع
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`تم تشغيل الخادم على المنفذ ${PORT}`);
    
    const url = process.env.NODE_ENV === 'production'
      ? `منشور على عنوان الاستضافة الخاص بك`
      : `الواجهة متاحة على https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
    
    console.log(url);
  });
})();
