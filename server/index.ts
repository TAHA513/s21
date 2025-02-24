import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { createServer } from 'http';
import { logger } from './db';
import session from 'express-session';
import { storage } from './storage';
import passport from 'passport';
import { setupAuth } from "./auth";

const app = express();
const server = createServer(app);

// مسح البيانات المؤقتة وتخزين الجلسة
storage.clearAllData().catch(error => {
  logger.error('Failed to clear data:', error);
});

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration with proper settings
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: storage.sessionStore,
  cookie: {
    secure: false, // Set to true in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Proper CORS configuration for handling credentials
app.use((req, res, next) => {
  const origin = req.get('origin') || 'http://localhost:5000';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Setup authentication first
setupAuth(app);

// Register routes
(async () => {
  try {
    await registerRoutes(app);

    // Error handling
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      logger.error('Server Error:', err);
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const PORT = process.env.PORT || '5000';
    server.listen(Number(PORT), "0.0.0.0", () => {
      logger.info(`Server running at http://0.0.0.0:${PORT}`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
})();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});