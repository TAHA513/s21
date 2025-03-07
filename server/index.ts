
import express from "express";
import session from "express-session";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { dirname } from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { users } from "../shared/schema.js";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { promisify } from "util";
import bcrypt from "bcryptjs";
import { createClient } from "@neondatabase/serverless";
import pino from "pino";

// إعداد المسجل (Logger)
const logger = pino({
  transport: {
    target: "pino-pretty",
  },
  level: process.env.LOG_LEVEL || "info",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// إعداد متغيرات البيئة
const PORT = process.env.PORT || 3005;
const NODE_ENV = process.env.NODE_ENV || "development";
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

// إنشاء تطبيق Express
const app = express();
const httpServer = createServer(app);

// إعداد قاعدة البيانات
const pool = NODE_ENV === "production" ? 
  createClient(DATABASE_URL) : 
  new Pool({ connectionString: DATABASE_URL });

const db = drizzle(pool);

// إعداد تكوينات وسيطة Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// إعداد الجلسة
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7, // أسبوع واحد
  }
};

app.use(session(sessionConfig));

// إعداد Passport للمصادقة
app.use(passport.initialize());
app.use(passport.session());

// استراتيجية المصادقة المحلية
passport.use(new LocalStrategy(
  { usernameField: "email" },
  async (email, password, done) => {
    try {
      const user = await db.select().from(users).where({ email }).limit(1);
      
      if (!user || user.length === 0) {
        return done(null, false, { message: "الايميل غير موجود" });
      }
      
      const isMatch = await bcrypt.compare(password, user[0].password);
      
      if (!isMatch) {
        return done(null, false, { message: "كلمة المرور غير صحيحة" });
      }
      
      return done(null, user[0]);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.select().from(users).where({ id }).limit(1);
    done(null, user[0] || null);
  } catch (error) {
    done(error, null);
  }
});

// إعداد وسيطة تطوير Vite في وضع التطوير
if (NODE_ENV === "development") {
  logger.info("Setting up Vite proxy middleware for development");
  
  const { createProxyMiddleware } = await import("http-proxy-middleware");
  
  // وسيطة لخادم Vite الذي يعمل في وضع التطوير
  app.use(
    "/",
    createProxyMiddleware({
      target: "http://localhost:5174",
      changeOrigin: true,
      ws: true,
    })
  );
}

// المسارات API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// مسار المستخدم
app.get("/api/user", (req, res) => {
  if (req.isAuthenticated()) {
    // ترجع بيانات المستخدم بدون كلمة المرور
    const { password, ...user } = req.user;
    return res.json(user);
  }
  res.status(401).json({ message: "غير مصرح" });
});

// مسار تسجيل الدخول
app.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message || "فشل تسجيل الدخول" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      const { password, ...userData } = user;
      return res.json(userData);
    });
  })(req, res, next);
});

// مسار تسجيل الخروج
app.post("/api/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الخروج" });
    }
    res.json({ message: "تم تسجيل الخروج بنجاح" });
  });
});

// مسار التسجيل
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // التحقق مما إذا كان البريد الإلكتروني موجود بالفعل
    const existingUser = await db.select().from(users).where({ email }).limit(1);
    
    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ message: "البريد الإلكتروني مسجل بالفعل" });
    }
    
    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // إنشاء مستخدم جديد
    const newUser = await db.insert(users).values({
      name,
      email,
      phone,
      password: hashedPassword,
    }).returning();
    
    // تسجيل دخول المستخدم تلقائيًا بعد التسجيل
    if (newUser && newUser.length > 0) {
      req.login(newUser[0], (err) => {
        if (err) {
          return res.status(500).json({ message: "خطأ في تسجيل الدخول بعد التسجيل" });
        }
        const { password, ...userData } = newUser[0];
        return res.status(201).json(userData);
      });
    } else {
      res.status(500).json({ message: "فشل في إنشاء مستخدم جديد" });
    }
  } catch (error) {
    logger.error(error, "خطأ في تسجيل مستخدم جديد");
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

// خدمة الملفات الثابتة في وضع الإنتاج
if (NODE_ENV === "production") {
  const clientPath = path.join(__dirname, "../dist");
  app.use(express.static(clientPath));
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

// بدء الخادم
httpServer.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server running on port ${PORT} in ${NODE_ENV} mode`);
});

// معالجة الإشارات لإغلاق الخادم بشكل صحيح
process.on("SIGINT", () => {
  logger.info("Server shutting down");
  httpServer.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

export { app, db };
