import express from 'express';
import next from 'next';
import { json } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import { db } from './db';
import { storage } from './storage';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: './client' });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Basic middleware
  server.use(json());
  server.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: !dev,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Configure helmet with appropriate CSP for Next.js
  server.use(
    helmet({
      contentSecurityPolicy: dev ? false : {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https:", "data:"],
          imgSrc: ["'self'", "data:", "blob:"],
          fontSrc: ["'self'", "https:", "data:"],
          connectSrc: ["'self'", "ws:", "wss:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // API Routes
  server.get('/api/store-settings', async (req, res) => {
    try {
      const settings = await storage.getStoreSettings();
      res.json(settings || {});
    } catch (error) {
      console.error('Error fetching store settings:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء جلب إعدادات المتجر' });
    }
  });

  server.post('/api/store-settings', async (req, res) => {
    try {
      const settings = await storage.updateStoreSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error('Error updating store settings:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء تحديث إعدادات المتجر' });
    }
  });

  // Let Next.js handle all other routes
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = parseInt(process.env.PORT || '5000', 10);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});