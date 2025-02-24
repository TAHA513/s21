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
      logger.info('Attempting login for username:', username);
      const user = await storage.getUserByUsername(username);

      if (!user) {
        logger.info('User not found:', username);
        return done(null, false, { message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      const isValid = await comparePasswords(password, user.password);
      if (!isValid) {
        logger.info('Invalid password for user:', username);
        return done(null, false, { message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      logger.info('Login successful for user:', username);
      return done(null, user);
    } catch (error) {
      logger.error('Login error:', error);
      return done(error);
    }
  }));

  passport.serializeUser((user: User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register route
  app.post("/api/register", async (req, res) => {
    try {
      logger.info('Registration attempt for username:', req.body.username);
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        logger.info('Username already exists:', req.body.username);
        return res.status(400).json({ message: "اسم المستخدم موجود بالفعل" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) {
          logger.error('Error during login after registration:', err);
          return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
        }
        logger.info('User registered and logged in successfully:', user.username);
        res.status(201).json(user);
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ message: "حدث خطأ أثناء إنشاء الحساب" });
    }
  });

  // Login route
  app.post("/api/login", (req, res, next) => {
    logger.info('Login attempt received for:', req.body.username);
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        logger.error('Authentication error:', err);
        return next(err);
      }
      if (!user) {
        logger.info('Authentication failed:', info?.message);
        return res.status(401).json({ message: info?.message || "فشل تسجيل الدخول" });
      }
      req.login(user, (err) => {
        if (err) {
          logger.error('Session creation error:', err);
          return next(err);
        }
        logger.info('User logged in successfully:', user.username);
        return res.json(user);
      });
    })(req, res, next);
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    const username = (req.user as User)?.username;
    req.logout((err) => {
      if (err) {
        logger.error('Logout error:', err);
        return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الخروج" });
      }
      logger.info('User logged out successfully:', username);
      res.json({ message: "تم تسجيل الخروج بنجاح" });
    });
  });

  // User info route
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "غير مصرح" });
    }
    res.json(req.user);
  });
}