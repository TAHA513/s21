import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import pino from "pino";

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty'
  }
});

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
  // Clear existing data
  storage.clearAllData().catch(error => {
    logger.error('Failed to clear data:', error);
  });

  // Configure session
  const sessionConfig: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "default-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.use(session(sessionConfig));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport strategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);

      if (!user || !(await comparePasswords(password, user.password))) {
        logger.info({ username }, 'Login failed: Invalid credentials');
        return done(null, false, { message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      logger.info({ userId: user.id }, 'Login successful');
      return done(null, user);
    } catch (error) {
      logger.error({ error }, 'Login error');
      return done(error);
    }
  }));

  passport.serializeUser((user: User, done) => {
    logger.info({ userId: user.id }, 'Serializing user');
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      logger.info({ userId: id, found: !!user }, 'Deserializing user');
      done(null, user);
    } catch (error) {
      logger.error({ userId: id, error }, 'Deserialization error');
      done(error);
    }
  });

  // Register route
  app.post("/api/register", async (req, res) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        logger.info({ username: req.body.username }, 'Registration failed: Username exists');
        return res.status(400).json({ message: "اسم المستخدم موجود بالفعل" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      logger.info({ userId: user.id }, 'User registered successfully');

      req.login(user, (err) => {
        if (err) {
          logger.error({ error: err }, 'Auto-login after registration failed');
          return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
        }
        res.status(201).json(user);
      });
    } catch (error) {
      logger.error({ error }, 'Registration error');
      res.status(500).json({ message: "حدث خطأ أثناء إنشاء الحساب" });
    }
  });

  // Login route
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        logger.info({ userId: user.id }, 'User logged in successfully');
        return res.json(user);
      });
    })(req, res, next);
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    const userId = req.user?.id;
    req.logout((err) => {
      if (err) {
        logger.error({ userId, error: err }, 'Logout error');
        return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الخروج" });
      }
      req.session.destroy((err) => {
        if (err) {
          logger.error({ userId, error: err }, 'Session destruction error');
          return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الخروج" });
        }
        logger.info({ userId }, 'User logged out successfully');
        res.json({ message: "تم تسجيل الخروج بنجاح" });
      });
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