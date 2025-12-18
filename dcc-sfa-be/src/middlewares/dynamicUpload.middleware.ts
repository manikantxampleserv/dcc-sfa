import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// Configure multer storage
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept images only
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed!'));
  }

  // Optional: Check specific image types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif',
  ];

  if (!allowedMimes.includes(file.mimetype)) {
    return cb(
      new Error('Invalid image format. Allowed: JPEG, PNG, GIF, WebP, HEIC')
    );
  }

  cb(null, true);
};

// Create multer instance with flexible limits
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 200, // Maximum 200 files total (increased for bulk operations)
  },
  fileFilter,
});

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
export const dynamicVisitUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Use multer's any() to accept unlimited field names
  const uploadAny = upload.any();

  uploadAny(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large',
          error: 'Maximum file size is 10MB per file',
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files',
          error: 'Maximum 200 files allowed in total',
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field',
          error: err.message,
        });
      }
      return res.status(400).json({
        success: false,
        message: 'File upload error',
        error: err.message,
      });
    } else if (err) {
      // Other errors (like file filter errors)
      return res.status(400).json({
        success: false,
        message: 'File upload error',
        error: err.message,
      });
    }

    // Organize uploaded files by field name
    const files = (req as any).files as Express.Multer.File[];
    const organizedFiles: { [key: string]: Express.Multer.File[] } = {};
    const visitStats: {
      [visitIndex: number]: { self: number; customer: number; cooler: number };
    } = {};

    if (files && files.length > 0) {
      console.log(`\n📤 Received ${files.length} file(s)`);

      files.forEach(file => {
        const fieldName = file.fieldname;

        // Initialize array for this field name if it doesn't exist
        if (!organizedFiles[fieldName]) {
          organizedFiles[fieldName] = [];
        }

        organizedFiles[fieldName].push(file);

        // Parse visit index and type from field name (e.g., visit_0_self_images)
        const match = fieldName.match(
          /visit_(\d+)_(self|customer|cooler)_images/
        );
        if (match) {
          const visitIndex = parseInt(match[1], 10);
          const imageType = match[2] as 'self' | 'customer' | 'cooler';

          if (!visitStats[visitIndex]) {
            visitStats[visitIndex] = { self: 0, customer: 0, cooler: 0 };
          }
          visitStats[visitIndex][imageType]++;
        }

        console.log(
          `${fieldName}: ${file.originalname} (${(file.size / 1024).toFixed(2)}KB, ${file.mimetype})`
        );
      });

      (req as any).organizedFiles = organizedFiles;

      console.log(
        `\n Organized into ${Object.keys(organizedFiles).length} field(s)`
      );

      console.log(' Files per visit:');
      Object.keys(visitStats)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .forEach(visitIndex => {
          const stats = visitStats[parseInt(visitIndex)];
          console.log(
            `  Visit ${visitIndex}: Self(${stats.self}) Customer(${stats.customer}) Cooler(${stats.cooler})`
          );
        });
    } else {
      console.log('📭 No files uploaded');
      (req as any).organizedFiles = {};
    }

    next();
  });
};

/**
 * Alternative: Upload middleware with no file count limit
 * Use for very large bulk operations
 */
export const unlimitedVisitUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const uploadUnlimited = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB per file
      // No files limit
    },
    fileFilter,
  }).any();

  uploadUnlimited(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: 'File upload error',
        error: err.message,
      });
    }

    // Same organization logic
    const files = (req as any).files as Express.Multer.File[];
    const organizedFiles: { [key: string]: Express.Multer.File[] } = {};

    if (files && files.length > 0) {
      files.forEach(file => {
        const fieldName = file.fieldname;
        if (!organizedFiles[fieldName]) {
          organizedFiles[fieldName] = [];
        }
        organizedFiles[fieldName].push(file);
      });

      (req as any).organizedFiles = organizedFiles;
    } else {
      (req as any).organizedFiles = {};
    }

    next();
  });
};

/**
 * Helper function to validate field names (optional)
 * Can be used in controller to ensure proper naming convention
 */
export const validateVisitImageFields = (fieldName: string): boolean => {
  // Valid patterns:
  // - visit_0_self_images
  // - visit_1_customer_images
  // - visit_2_cooler_images
  const pattern = /^visit_\d+_(self|customer|cooler)_images$/;
  return pattern.test(fieldName);
};

/**
 * Helper function to extract visit index and image type from field name
 */
export const parseVisitImageField = (
  fieldName: string
): { visitIndex: number; imageType: 'self' | 'customer' | 'cooler' } | null => {
  const match = fieldName.match(/^visit_(\d+)_(self|customer|cooler)_images$/);

  if (!match) {
    return null;
  }

  return {
    visitIndex: parseInt(match[1], 10),
    imageType: match[2] as 'self' | 'customer' | 'cooler',
  };
};
