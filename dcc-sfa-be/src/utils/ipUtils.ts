import { Request } from 'express';
/**
 * Extracts the client IP address from the request headers
 * Checks multiple headers in order of priority:
 * 1. X-Forwarded-For (used by proxies/load balancers)
 * 2. CF-Connecting-IP (Cloudflare)
 * 3. True-Client-IP (various proxies)
 * 4. X-Real-IP (nginx reverse proxy)
 * 5. req.ip (Express)
 * 6. req.connection.remoteAddress (direct connection)
 *
 * @param {Request} req - Express request object
 * @returns {string} The client IP address or 'Unknown' if not found
 */
export const getClientIP = (req: Request): string => {
  let ipAddress = 'Unknown';

  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    const forwardedIps = Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : xForwardedFor;
    ipAddress = forwardedIps.split(',')[0].trim();
  } else {
    const cfConnectingIp = req.headers['cf-connecting-ip'] as string;
    const trueClientIp = req.headers['true-client-ip'] as string;
    const xRealIp = req.headers['x-real-ip'] as string;

    ipAddress =
      cfConnectingIp ||
      trueClientIp ||
      xRealIp ||
      req.ip ||
      req.socket?.remoteAddress ||
      'Unknown';
  }

  if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
    ipAddress = '127.0.0.1';
  }

  if (ipAddress.startsWith('::ffff:')) {
    ipAddress = ipAddress.replace('::ffff:', '');
  }

  return ipAddress;
};
