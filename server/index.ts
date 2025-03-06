import express from 'express';
import { json } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { db } from './db';
import { storage } from './storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const isDevelopment = process.env.NODE_ENV !== 'production';

// Basic middleware
app.use(json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: !isDevelopment,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Configure helmet with appropriate CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
      },
    },
  })
);

// Serve static files
app.use(express.static(path.join(__dirname, '../client/public')));

// API Routes
app.get('/api/store-settings', async (req, res) => {
  try {
    const settings = await storage.getStoreSettings();
    console.log('Fetched settings:', settings); // Add logging
    res.json(settings || {});
  } catch (error) {
    console.error('Error fetching store settings:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب إعدادات المتجر' });
  }
});

app.post('/api/store-settings', async (req, res) => {
  try {
    const settings = await storage.updateStoreSettings(req.body);
    res.json(settings);
  } catch (error) {
    console.error('Error updating store settings:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث إعدادات المتجر' });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

const PORT = parseInt(process.env.PORT || '5000', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${isDevelopment ? 'development' : 'production'} mode`);
});
