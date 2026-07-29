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
export declare const getClientIP: (req: Request) => string;
//# sourceMappingURL=ipUtils.d.ts.map