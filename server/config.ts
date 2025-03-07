
// تكوينات التطبيق
export const config = {
  port: process.env.PORT || 3005,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres",
  sessionSecret: process.env.SESSION_SECRET || "your-secret-key",
  sessionExpiry: 1000 * 60 * 60 * 24 * 7, // أسبوع واحد
  bcryptSaltRounds: 10,
  corsOrigins: process.env.CORS_ORIGINS || "*",
};

// تقديم التكوينات حسب البيئة
export function getConfig() {
  return {
    ...config,
    isDevelopment: config.nodeEnv === "development",
    isProduction: config.nodeEnv === "production",
  };
}
