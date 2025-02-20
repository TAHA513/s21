import { Request, Response, NextFunction } from 'express';

const ALLOWED_IPS = process.env.ALLOWED_IPS?.split(',').filter(Boolean) || [];

export const ipFilter = (req: Request, res: Response, next: NextFunction) => {
  // Skip IP filtering in development or if no IPs are configured
  if (process.env.NODE_ENV === 'development' || ALLOWED_IPS.length === 0) {
    return next();
  }

  // Get the real IP address from various headers that might be set by proxies
  let clientIp = req.headers['x-forwarded-for'] || 
                 req.headers['x-real-ip'] ||
                 req.ip || 
                 req.socket.remoteAddress || '';

  // Parse the IP address if it's a comma-separated list
  if (typeof clientIp === 'string') {
    clientIp = clientIp.split(',')[0].trim();
  } else if (Array.isArray(clientIp)) {
    clientIp = clientIp[0];
  }

  // Check if the IP is allowed
  if (!clientIp || !ALLOWED_IPS.includes(clientIp)) {
    console.error('Access denied for IP:', clientIp);
    return res.status(403).json({ 
      message: "غير مصرح لك بالوصول إلى هذا التطبيق" 
    });
  }

  next();
};