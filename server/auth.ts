import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import pino from "pino";

const logger = pino({ level: 'info' });
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Configure Passport
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      logger.info('محاولة تسجيل الدخول للمستخدم:', username);
      const user = await storage.getUserByUsername(username);

      if (!user) {
        logger.info('المستخدم غير موجود:', username);
        return done(null, false, { message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      const isValid = await comparePasswords(password, user.password);
      if (!isValid) {
        logger.info('كلمة المرور غير صحيحة للمستخدم:', username);
        return done(null, false, { message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      logger.info('تم تسجيل الدخول بنجاح للمستخدم:', username);
      // إرجاع بيانات المستخدم بدون كلمة المرور
      const { password: _, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } catch (error) {
      logger.error('خطأ في تسجيل الدخول:', error);
      return done(error);
    }
  }));

  passport.serializeUser((user, done) => {
    logger.info('حفظ بيانات المستخدم في الجلسة:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        logger.error('المستخدم غير موجود أثناء استعادة الجلسة:', id);
        return done(null, false);
      }
      // إرجاع بيانات المستخدم بدون كلمة المرور
      const { password: _, ...userWithoutPassword } = user;
      logger.info('تم استعادة بيانات المستخدم:', id);
      done(null, userWithoutPassword);
    } catch (error) {
      logger.error('خطأ في استعادة بيانات المستخدم:', error);
      done(error);
    }
  });

  // مسار التسجيل
  app.post("/api/register", async (req, res) => {
    try {
      logger.info('محاولة إنشاء حساب جديد للمستخدم:', req.body.username);
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        logger.info('اسم المستخدم موجود بالفعل:', req.body.username);
        return res.status(400).json({ message: "اسم المستخدم موجود بالفعل" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      // إرجاع بيانات المستخدم بدون كلمة المرور
      const { password: _, ...userWithoutPassword } = user;

      req.login(userWithoutPassword, (err) => {
        if (err) {
          logger.error('خطأ أثناء تسجيل الدخول بعد التسجيل:', err);
          return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
        }
        logger.info('تم إنشاء الحساب وتسجيل الدخول بنجاح:', user.username);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      logger.error('خطأ في إنشاء الحساب:', error);
      res.status(500).json({ message: "حدث خطأ أثناء إنشاء الحساب" });
    }
  });

  // مسار تسجيل الدخول
  app.post("/api/login", (req, res, next) => {
    logger.info('محاولة تسجيل دخول المستخدم:', req.body.username);
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        logger.error('خطأ في المصادقة:', err);
        return next(err);
      }
      if (!user) {
        logger.info('فشل تسجيل الدخول:', info?.message);
        return res.status(401).json({ message: info?.message || "فشل تسجيل الدخول" });
      }
      req.login(user, (err) => {
        if (err) {
          logger.error('خطأ في إنشاء الجلسة:', err);
          return next(err);
        }
        logger.info('تم تسجيل الدخول بنجاح:', user.username);
        return res.json(user);
      });
    })(req, res, next);
  });

  // مسار تسجيل الخروج
  app.post("/api/logout", (req, res) => {
    const username = (req.user as User)?.username;
    req.logout((err) => {
      if (err) {
        logger.error('خطأ في تسجيل الخروج:', err);
        return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الخروج" });
      }
      logger.info('تم تسجيل الخروج بنجاح:', username);
      res.json({ message: "تم تسجيل الخروج بنجاح" });
    });
  });

  // مسار معلومات المستخدم
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      logger.info('محاولة الوصول غير مصرح بها');
      return res.status(401).json({ message: "غير مصرح" });
    }
    logger.info('تم طلب معلومات المستخدم:', (req.user as User).username);
    res.json(req.user);
  });
}