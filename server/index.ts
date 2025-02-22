import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { 
  DatabaseError, 
  AuthenticationError, 
  ValidationError, 
  NotFoundError,
  AuthorizationError 
} from "./errors";

const app = express();

// تحسين حدود حجم الطلبات
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// تحسين الأمان
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// تسجيل الأحداث المحسن
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

      if (res.statusCode >= 400) {
        logLine += ` Error: ${capturedJsonResponse?.message || 'Unknown error'}`;
      }

      if (capturedJsonResponse && res.statusCode < 400) {
        const sanitizedResponse = { ...capturedJsonResponse };
        delete sanitizedResponse.password;
        delete sanitizedResponse.token;
        logLine += ` :: ${JSON.stringify(sanitizedResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// معالجة الأخطاء المحسنة
const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  if (err instanceof ValidationError) {
    return res.status(400).json({ 
      message: err.message,
      type: 'ValidationError'
    });
  }

  if (err instanceof AuthenticationError) {
    return res.status(401).json({ 
      message: err.message,
      type: 'AuthenticationError'
    });
  }

  if (err instanceof AuthorizationError) {
    return res.status(403).json({ 
      message: err.message,
      type: 'AuthorizationError'
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({ 
      message: err.message,
      type: 'NotFoundError'
    });
  }

  if (err instanceof DatabaseError) {
    return res.status(500).json({ 
      message: 'حدث خطأ في قاعدة البيانات',
      type: 'DatabaseError'
    });
  }

  // Default error
  res.status(500).json({ 
    message: 'حدث خطأ في الخادم',
    type: 'InternalServerError'
  });
};

(async () => {
  const server = await registerRoutes(app);

  app.use(errorHandler);

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`خادم يعمل على المنفذ ${PORT}`);
  });
})();