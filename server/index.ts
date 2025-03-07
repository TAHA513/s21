import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "../attached_assets/vite";
import { setupAuth } from "./auth";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Middleware for logging
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

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // تجاهل التحقق من اتصال قاعدة البيانات
    log('تم تعطيل الاتصال بقاعدة البيانات بشكل دائم');
    
    // إعداد المصادقة
    setupAuth(app);
    log('تم إعداد نظام المصادقة');

    const server = await registerRoutes(app);
    log('تم تسجيل جميع المسارات');

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // تسجيل تفاصيل الخطأ
      console.error('خطأ في التطبيق:', {
        status,
        message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });

      res.status(status).json({ message });
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
      log('تم إعداد Vite للتطوير');
    } else {
      serveStatic(app);
      log('تم إعداد الملفات الثابتة للإنتاج');
    }

    const PORT = Number(process.env.PORT) || 5000;
    server.listen(PORT, "0.0.0.0", () => {
      log(`تم تشغيل الخادم على المنفذ ${PORT}`);
      log(`الواجهة متاحة على https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
    });
  } catch (error) {
    console.error('فشل في بدء التشغيل:', error);
    console.error('تفاصيل الخطأ:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    process.exit(1);
  }
})();