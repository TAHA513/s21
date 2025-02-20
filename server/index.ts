import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { ipFilter } from "./middleware/ipFilter";
import { pool } from "./db";

const app = express();

// Set trust proxy before any middleware
app.set("trust proxy", 1);

// Add IP Filter middleware before parsing to block unauthorized access early
app.use(ipFilter);

// Add parsing middleware after IP filter
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Add error logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  // Capture response for logging
  const originalSend = res.send;
  res.send = function (data) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${path} - Status: ${res.statusCode}`);
    return originalSend.call(this, data);
  };

  // Log errors
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400) {
      console.error(`[${new Date().toISOString()}] Error: ${req.method} ${path} - Status: ${res.statusCode} - Duration: ${duration}ms`);
    }
  });

  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});


(async () => {
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`Server running on port ${PORT} in ${app.get("env")} mode`);
  });
})();