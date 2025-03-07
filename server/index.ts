import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log } from "./vite";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Middleware for logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  try {
    log('بدء تشغيل الخادم...');

    // تسجيل مسارات API
    const server = await registerRoutes(app);
    log('تم تسجيل مسارات API');

    // معالجة الأخطاء
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error(err);
    });

    const PORT = Number(process.env.PORT) || 5000;
    server.listen(PORT, "0.0.0.0", () => {
      log(`تم تشغيل الخادم على المنفذ ${PORT}`);
      log(`الواجهة متاحة على https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
    });

  } catch (error) {
    console.error('فشل في بدء التشغيل:', error);
    process.exit(1);
  }
})();