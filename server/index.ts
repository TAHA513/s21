
import express from 'express';
import path from 'path';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import pino from 'pino';

// إعداد المسجل
const logger = pino({
  transport: {
    target: 'pino-pretty'
  }
});

// إنشاء تطبيق Express
const app = express();
const port = process.env.PORT || 3004;

// إعداد المتوسطات الأساسية
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// إعداد الجلسة
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 ساعة
  }
}));

// إعداد Passport
app.use(passport.initialize());
app.use(passport.session());

// إعداد Vite في بيئة التطوير
if (process.env.NODE_ENV !== 'production') {
  setupViteDevServer();
}

// في بيئة الإنتاج، قم بتقديم الملفات الثابتة
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(process.cwd(), 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  });
}

// طريق API للتحقق من حالة الخدمة
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// إظهار رسالة الخطأ عند حدوث أخطاء غير معالجة
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({ message: 'حدث خطأ في الخادم' });
});

// بدء تشغيل الخادم
app.listen(port, '0.0.0.0', () => {
  logger.info(`الخادم يعمل على المنفذ ${port}`);
});

// دالة لإعداد Vite في بيئة التطوير
async function setupViteDevServer() {
  try {
    logger.info('Setting up Vite proxy middleware for development');
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: path.join(process.cwd(), 'client')
    });
    
    app.use(vite.middlewares);
  } catch (error) {
    logger.error('Error setting up Vite middleware:', error);
  }
}

export default app;
