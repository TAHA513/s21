import { Request, Response, NextFunction } from 'express';

const ALLOWED_IPS = process.env.ALLOWED_IPS?.split(',').filter(Boolean) || [];

export const ipFilter = (req: Request, res: Response, next: NextFunction) => {
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

  console.log('Debug - Client IP:', clientIp);
  console.log('Debug - Allowed IPs:', ALLOWED_IPS);

  if (ALLOWED_IPS.length === 0) {
    return res.status(403).json({ 
      message: "لم يتم تكوين قائمة IP المسموح بها. يرجى تكوين ALLOWED_IPS في الإعدادات." 
    });
  }

  if (!ALLOWED_IPS.includes(clientIp)) {
    console.log('Debug - Access denied for IP:', clientIp);
    return res.status(403).json({ 
      message: "غير مصرح لك بالوصول إلى هذا التطبيق" 
    });
  }

  next();
};