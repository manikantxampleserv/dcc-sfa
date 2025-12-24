import { Request, Response, NextFunction } from 'express';
/**
 * Dynamic upload middleware for visit images
 * Accepts any field names and organizes files by visit index and type
 *
 * Expected field naming convention:
 * - visit_0_self_images
 * - visit_0_customer_images
 * - visit_0_cooler_images
 * - visit_1_self_images
 * - visit_1_customer_images
 * - visit_1_cooler_images
 * etc.
 */
export declare const dynamicVisitUpload: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Alternative: Upload middleware with no file count limit
 * Use for very large bulk operations
 */
export declare const unlimitedVisitUpload: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Helper function to validate field names (optional)
 * Can be used in controller to ensure proper naming convention
 */
export declare const validateVisitImageFields: (fieldName: string) => boolean;
/**
 * Helper function to extract visit index and image type from field name
 */
export declare const parseVisitImageField: (fieldName: string) => {
    visitIndex: number;
    imageType: "self" | "customer" | "cooler";
} | null;
//# sourceMappingURL=dynamicUpload.middleware.d.ts.map