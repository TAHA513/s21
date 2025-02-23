import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { logger, checkDatabaseConnection } from './db';
import session from 'express-session';

const app = express();
const server = createServer(app);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// CORS middleware with specific origins
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:5000', 'https://localhost:5000'];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

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

// Ensure PORT is set and valid
const PORT = process.env.PORT || '5000';
process.env.PORT = PORT;

logger.info(`Server will run on port ${PORT}`);

// WebSocket server setup with enhanced error handling
const wss = new WebSocketServer({ 
  server,
  path: '/ws',
  perMessageDeflate: false,
  clientTracking: true // Enable client tracking
});

// Track active connections
const connections = new Set();

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  logger.info(`WebSocket client connected from ${clientIp}`);

  // Add to active connections
  connections.add(ws);
  logger.info(`Active WebSocket connections: ${connections.size}`);

  ws.on('message', (message) => {
    logger.debug('Received:', message.toString());
    try {
      ws.send(`Server received: ${message}`);
    } catch (error) {
      logger.error('Error sending message:', error);
    }
  });

  ws.on('error', (error) => {
    logger.error('WebSocket error:', error);
    try {
      ws.close();
    } catch (closeError) {
      logger.error('Error closing WebSocket after error:', closeError);
    }
  });

  ws.on('close', (code, reason) => {
    connections.delete(ws);
    logger.info(`Client disconnected. Code: ${code}, Reason: ${reason}, Active connections: ${connections.size}`);
  });

  // Send initial connection confirmation
  try {
    ws.send('تم الاتصال بنجاح بخادم WebSocket');
  } catch (error) {
    logger.error('Error sending welcome message:', error);
  }
});

// Handle WebSocket server errors
wss.on('error', (error) => {
  logger.error('WebSocket server error:', error);
});

(async () => {
  try {
    // Check database connection before starting the server
    const isDbConnected = await checkDatabaseConnection();
    if (!isDbConnected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

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

    // Start server with enhanced error handling
    server.listen(Number(PORT), "0.0.0.0", () => {
      logger.info(`Server running at http://0.0.0.0:${PORT}`);
      logger.info(`WebSocket server available at ws://0.0.0.0:${PORT}/ws`);
    }).on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use. Please choose a different port.`);
        process.exit(1);
      } else {
        logger.error('Server failed to start:', error);
        process.exit(1);
      }
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