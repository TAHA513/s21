import express from "express";
import { setupRoutes } from "./routes.js";
import { setupAuth } from "./auth";
import { setupVite } from "./vite";
import { testConnection } from "./db";

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

    // معالج الأخطاء العام
    app.use((err, req, res, next) => {
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
    await setupRoutes(app);
    console.log("تم تسجيل جميع المسارات");

    // اختبار الاتصال بقاعدة البيانات
    const connected = await testConnection();
    if (!connected) {
      console.error("لم يتم الاتصال بقاعدة البيانات. التطبيق قد لا يعمل بشكل صحيح.");
    }

    // إعداد وتشغيل الخادم
    const port = process.env.PORT || 5001;

    // إعداد Vite للتطوير
    await setupVite(app);
    console.log("تم إعداد Vite للتطوير");

    app.listen(port, "0.0.0.0", () => {
      console.log(`تم تشغيل الخادم على المنفذ ${port}`);
      console.log(`الواجهة متاحة على https://workspace.asaad11asaad98.repl.co`);
    });
  } catch (error) {
    console.error("خطأ كارثي عند بدء التطبيق:", error);
    process.exit(1);
  }
}

main();