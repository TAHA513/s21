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
    
    // إعداد الاستماع على المنفذ بشكل مناسب للاستضافة السحابية
    const startServer = (currentPort: number) => {
      // في بيئة الإنتاج، نستخدم المنفذ المحدد فقط بدون محاولات بديلة
      // لأن خدمات الاستضافة السحابية عادة ما تحدد منفذًا معينًا يجب استخدامه
      const isProduction = process.env.NODE_ENV === 'production';
      
      server.listen(currentPort, "0.0.0.0")
        .on("listening", () => {
          console.log(`تم تشغيل الخادم على المنفذ ${currentPort}`);
          
          // عرض عنوان URL المناسب للبيئة
          if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
            // بيئة Replit
            console.log(`الواجهة متاحة على https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
          } else if (isProduction) {
            // بيئة الإنتاج في الاستضافة السحابية
            console.log(`التطبيق متاح على عنوان الاستضافة السحابية`);
          } else {
            // بيئة التطوير المحلية
            console.log(`الواجهة متاحة على http://0.0.0.0:${currentPort}`);
          }
        })
        .on("error", (err: any) => {
          if (isProduction) {
            // في حالة الإنتاج، أي خطأ يعتبر حرج
            console.error(`خطأ في بدء الخادم:`, err);
            process.exit(1);
          } else {
            // في بيئة التطوير، يمكننا محاولة منافذ أخرى
            const alternativePorts = [1000, 3000, 8080, 8000, 4000];
            const maxAttempts = alternativePorts.length;
            
            const tryAlternativePort = (attempts = 0) => {
              if (attempts >= maxAttempts) {
                console.error(`خطأ في بدء الخادم بعد محاولات متعددة:`, err);
                process.exit(1);
                return;
              }
              
              const nextPort = alternativePorts[attempts];
              console.log(`المنفذ ${currentPort} قيد الاستخدام بالفعل، جارٍ المحاولة بالمنفذ ${nextPort}...`);
              
              server.listen(nextPort, "0.0.0.0")
                .on("listening", () => {
                  console.log(`تم تشغيل الخادم على المنفذ ${nextPort}`);
                  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
                    console.log(`الواجهة متاحة على https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
                  } else {
                    console.log(`الواجهة متاحة على http://0.0.0.0:${nextPort}`);
                  }
                })
                .on("error", () => {
                  tryAlternativePort(attempts + 1);
                });
            };
            
            if (err.code === "EADDRINUSE") {
              tryAlternativePort();
            } else {
              console.error(`خطأ في بدء الخادم:`, err);
              process.exit(1);
            }
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