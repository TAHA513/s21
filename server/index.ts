import express from "express";
import http from "http";
import { setupRoutes } from "./routes.js";
import { setupAuth } from "./auth.js";
import { setupVite } from "./vite.js";
import { testConnection } from "./db.js";
import type { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";

async function main() {
  try {
    const app = express();

    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // إضافة middleware لتسجيل الطلبات
    app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        if (req.path.startsWith('/api')) {
          console.log(`${req.method} ${req.path} ${res.statusCode} في ${duration}ms`);
        }
      });
      next();
    });

    // إضافة middleware لمنع التخزين المؤقت لطلبات API
    app.use('/api', (req, res, next) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      next();
    });

    // معالج الأخطاء العام
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error('خطأ عام في التطبيق:', err);
      res.status(500).json({
        error: "حدث خطأ في الخادم",
        message: err.message || "خطأ غير معروف"
      });
    });

    // إعداد نظام المصادقة
    await setupAuth(app);
    console.log("تم إعداد نظام المصادقة");

    // تسجيل المسارات
    const server = await setupRoutes(app);
    console.log("تم تسجيل جميع المسارات");

    // اختبار الاتصال بقاعدة البيانات
    const connected = await testConnection();
    if (!connected) {
      console.error("لم يتم الاتصال بقاعدة البيانات. التطبيق قد لا يعمل بشكل صحيح.");
    }

    // تحديد ما إذا كنا في وضع الإنتاج أم التطوير
    const isProduction = process.env.NODE_ENV === 'production';
    console.log(`وضع التشغيل: ${isProduction ? 'إنتاج' : 'تطوير'}`);

    if (isProduction) {
      // في وضع الإنتاج، استخدم الملفات المبنية مسبقًا
      const distPath = path.resolve(process.cwd(), 'dist/public');

      if (fs.existsSync(distPath)) {
        console.log(`خدمة الملفات الثابتة من ${distPath}`);
        app.use(express.static(distPath));

        // التوجيه لـ index.html لدعم تطبيق الصفحة الواحدة (SPA)
        app.get('*', (req, res, next) => {
          // تخطي مسارات API
          if (req.path.startsWith('/api')) {
            return next();
          }

          // إرسال index.html لجميع الطلبات الأخرى
          res.sendFile(path.join(distPath, 'index.html'));
        });
      } else {
        console.error(`لم يتم العثور على مجلد البناء: ${distPath}. تأكد من بناء التطبيق أولاً.`);
      }
    } else {
      // في وضع التطوير، استخدم Vite
      await setupVite(app, server);
      console.log("تم إعداد Vite للتطوير");
    }

    // استخدم المنفذ من متغيرات البيئة أو المنفذ الافتراضي
    const port = process.env.PORT || 5000;
    server.listen(port, "0.0.0.0", () => {
      console.log(`تم تشغيل الخادم على المنفذ ${port}`);
      if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
        console.log(`الواجهة متاحة على https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
      }
    });
  } catch (error) {
    console.error("خطأ كارثي عند بدء التطبيق:", error);
    process.exit(1);
  }
}

main();