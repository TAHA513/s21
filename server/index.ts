import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from 'http';
import { logger } from './db';
import session from 'express-session';
import { WebSocketHandler } from './websocket';
import { storage } from './storage';
import passport from 'passport';

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enhanced logging middleware
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
      const logData = {
        method: req.method,
        path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        response: capturedJsonResponse
      };

      if (res.statusCode >= 400) {
        logger.error(logData, 'API Request Failed');
      } else {
        logger.info(logData, 'API Request Completed');
      }
    }
  });

  next();
});

// Session configuration
const sessionOptions = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: storage.sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Initialize session middleware
app.use(session(sessionOptions));

// Initialize Passport after session middleware
app.use(passport.initialize());
app.use(passport.session());

// CORS middleware with specific origins
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:5000', 'https://localhost:5000'];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Ensure PORT is set and valid
const PORT = process.env.PORT || '5000';
process.env.PORT = PORT;

logger.info(`Server will run on port ${PORT}`);

// Initialize WebSocket handler
const wsHandler = new WebSocketHandler(server);

(async () => {
  try {
    // Clear all data on startup
    await storage.clearAllData();
    logger.info('All data cleared');

    await registerRoutes(app);

    // Enhanced error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      logger.error({
        error: err,
        stack: err.stack,
        message: err.message
      }, 'Server Error');

      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    server.listen(Number(PORT), "0.0.0.0", () => {
      logger.info(`Server running at http://0.0.0.0:${PORT}`);
      logger.info(`WebSocket server available at ws://0.0.0.0:${PORT}/ws`);
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