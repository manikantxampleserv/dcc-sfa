import { Request, Response } from 'express';
/**
 * GPS Tracking Controller
 * Handles real-time and historical GPS tracking data for sales representatives
 */
export declare const gpsTrackingController: {
    /**
     * Create GPS Log
     * POST /api/v1/tracking/gps
     * Creates a new GPS log entry (typically from mobile app)
     */
    createGPSLog(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get GPS Tracking Data
     * GET /api/v1/tracking/gps
     */
    getGPSTrackingData(req: Request, res: Response): Promise<void>;
    /**
     * Get Real-Time GPS Tracking
     * GET /api/v1/tracking/gps/realtime
     * Returns the latest GPS log for each active user
     */
    getRealTimeGPSTracking(req: Request, res: Response): Promise<void>;
    /**
     * Get User GPS Path
     * GET /api/v1/tracking/gps/path/:user_id
     * Returns the GPS path for a specific user within a date range
     */
    getUserGPSPath(req: Request, res: Response): Promise<void>;
    /**
     * Get Route Effectiveness
     * GET /api/v1/tracking/route-effectiveness
     * Returns route performance metrics comparing planned vs actual routes
     */
    getRouteEffectiveness(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=gpsTracking.controller.d.ts.map