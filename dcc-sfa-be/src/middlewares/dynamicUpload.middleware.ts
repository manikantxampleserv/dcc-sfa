import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

/**
 * Multer storage configuration using memory storage
 */
const storage = multer.memoryStorage();

/**
 * File filter callback type for multer
 * @callback multer.FileFilterCallback
 */

/**
 * File filter to only allow specific image types
 * @param {any} req - Express request object
 * @param {Express.Multer.File} file - Uploaded file object
 * @param {multer.FileFilterCallback} cb - Callback to accept or reject file
 */
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed!'));
  }

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

/**
 * Multer instance with configured storage, limits and file filter
 * Limits: 10MB per file, maximum 200 files total
 */
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 200,
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
  const uploadAny = upload.any();

  uploadAny(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
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
      return res.status(400).json({
        success: false,
        message: 'File upload error',
        error: err.message,
      });
    }

    const files = (req as any).files as Express.Multer.File[];
    const organizedFiles: { [key: string]: Express.Multer.File[] } = {};
    const visitStats: {
      [visitIndex: number]: { self: number; customer: number; cooler: number };
    } = {};

    if (files && files.length > 0) {
      console.log(`\n📤 Received ${files.length} file(s)`);

      files.forEach(file => {
        const fieldName = file.fieldname;

        if (!organizedFiles[fieldName]) {
          organizedFiles[fieldName] = [];
        }

        organizedFiles[fieldName].push(file);

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
 * Alternative upload middleware with no file count limit
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
      fileSize: 10 * 1024 * 1024,
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
 * Helper function to validate field names
 * Ensures proper naming convention for visit image fields
 * @param {string} fieldName - Field name to validate
 * @returns {boolean} True if field name matches expected pattern
 */
export const validateVisitImageFields = (fieldName: string): boolean => {
  const pattern = /^visit_\d+_(self|customer|cooler)_images$/;
  return pattern.test(fieldName);
};

/**
 * Helper function to extract visit index and image type from field name
 * @param {string} fieldName - Field name to parse
 * @returns {Object|null} Object with visitIndex and imageType, or null if no match
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
