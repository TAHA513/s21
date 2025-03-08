import express from "express";
import { setupRoutes } from "./routes.js";
import { setupAuth } from "./auth.js";
import { setupVite } from "./vite.js";
import { testConnection } from "./db.js";
import type { Request, Response, NextFunction } from "express";

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

    // إعداد Vite للتطوير
    await setupVite(app, server);
    console.log("تم إعداد Vite للتطوير");

    // استخدام المنفذ من متغيرات البيئة مع دعم منصات مختلفة
    // بعض المنصات تستخدم أسماء مختلفة لمتغير المنفذ أو قيمًا افتراضية مختلفة
    const port = process.env.PORT || process.env.SERVER_PORT || process.env.HTTP_PORT || process.env.APP_PORT || 5000;
    
    // محاولة الاستماع على المنفذ المحدد، وإذا فشل، جرِّب منافذ بديلة
    const startServer = (currentPort: number, attempts = 0) => {
      const maxAttempts = 5; // عدد المحاولات القصوى
      const alternativePorts = [1000, 3000, 8080, 8000, 4000]; // منافذ بديلة شائعة
      
      server.listen(currentPort, "0.0.0.0")
        .on("listening", () => {
          console.log(`تم تشغيل الخادم على المنفذ ${currentPort}`);
          
          // عرض عنوان URL المختلف حسب بيئة التشغيل
          if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
            console.log(`الواجهة متاحة على https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
          } else {
            console.log(`الواجهة متاحة على http://localhost:${currentPort}`);
          }
        })
        .on("error", (err: any) => {
          if (err.code === "EADDRINUSE" && attempts < maxAttempts) {
            console.log(`المنفذ ${currentPort} قيد الاستخدام بالفعل، جارٍ المحاولة بمنفذ آخر...`);
            // اختيار منفذ بديل من القائمة أو إضافة 1 للمنفذ الحالي
            const nextPort = attempts < alternativePorts.length 
              ? alternativePorts[attempts] 
              : currentPort + 1;
            
            // محاولة أخرى بالمنفذ الجديد
            startServer(nextPort, attempts + 1);
          } else {
            console.error(`خطأ في بدء الخادم:`, err);
            process.exit(1);
          }
        });
    };

    // بدء الخادم بالمنفذ الأساسي
    startServer(Number(port));
  } catch (error) {
    console.error("خطأ كارثي عند بدء التطبيق:", error);
    process.exit(1);
  }
}

main();