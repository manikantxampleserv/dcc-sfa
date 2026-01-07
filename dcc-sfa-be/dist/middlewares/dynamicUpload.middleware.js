"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseVisitImageField = exports.validateVisitImageFields = exports.unlimitedVisitUpload = exports.dynamicVisitUpload = void 0;
const multer_1 = __importDefault(require("multer"));
// Configure multer storage
const storage = multer_1.default.memoryStorage();
// File filter - only allow images
const fileFilter = (req, file, cb) => {
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
        return cb(new Error('Invalid image format. Allowed: JPEG, PNG, GIF, WebP, HEIC'));
    }
    cb(null, true);
};
// Create multer instance with flexible limits
const upload = (0, multer_1.default)({
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
const dynamicVisitUpload = (req, res, next) => {
    // Use multer's any() to accept unlimited field names
    const uploadAny = upload.any();
    uploadAny(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
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
        }
        else if (err) {
            // Other errors (like file filter errors)
            return res.status(400).json({
                success: false,
                message: 'File upload error',
                error: err.message,
            });
        }
        // Organize uploaded files by field name
        const files = req.files;
        const organizedFiles = {};
        const visitStats = {};
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
                const match = fieldName.match(/visit_(\d+)_(self|customer|cooler)_images/);
                if (match) {
                    const visitIndex = parseInt(match[1], 10);
                    const imageType = match[2];
                    if (!visitStats[visitIndex]) {
                        visitStats[visitIndex] = { self: 0, customer: 0, cooler: 0 };
                    }
                    visitStats[visitIndex][imageType]++;
                }
                console.log(`${fieldName}: ${file.originalname} (${(file.size / 1024).toFixed(2)}KB, ${file.mimetype})`);
            });
            req.organizedFiles = organizedFiles;
            console.log(`\n Organized into ${Object.keys(organizedFiles).length} field(s)`);
            console.log(' Files per visit:');
            Object.keys(visitStats)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .forEach(visitIndex => {
                const stats = visitStats[parseInt(visitIndex)];
                console.log(`  Visit ${visitIndex}: Self(${stats.self}) Customer(${stats.customer}) Cooler(${stats.cooler})`);
            });
        }
        else {
            console.log('📭 No files uploaded');
            req.organizedFiles = {};
        }
        next();
    });
};
exports.dynamicVisitUpload = dynamicVisitUpload;
/**
 * Alternative: Upload middleware with no file count limit
 * Use for very large bulk operations
 */
const unlimitedVisitUpload = (req, res, next) => {
    const uploadUnlimited = (0, multer_1.default)({
        storage: multer_1.default.memoryStorage(),
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB per file
            // No files limit
        },
        fileFilter,
    }).any();
    uploadUnlimited(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: 'File upload error',
                error: err.message,
            });
        }
        // Same organization logic
        const files = req.files;
        const organizedFiles = {};
        if (files && files.length > 0) {
            files.forEach(file => {
                const fieldName = file.fieldname;
                if (!organizedFiles[fieldName]) {
                    organizedFiles[fieldName] = [];
                }
                organizedFiles[fieldName].push(file);
            });
            req.organizedFiles = organizedFiles;
        }
        else {
            req.organizedFiles = {};
        }
        next();
    });
};
exports.unlimitedVisitUpload = unlimitedVisitUpload;
/**
 * Helper function to validate field names (optional)
 * Can be used in controller to ensure proper naming convention
 */
const validateVisitImageFields = (fieldName) => {
    // Valid patterns:
    // - visit_0_self_images
    // - visit_1_customer_images
    // - visit_2_cooler_images
    const pattern = /^visit_\d+_(self|customer|cooler)_images$/;
    return pattern.test(fieldName);
};
exports.validateVisitImageFields = validateVisitImageFields;
/**
 * Helper function to extract visit index and image type from field name
 */
const parseVisitImageField = (fieldName) => {
    const match = fieldName.match(/^visit_(\d+)_(self|customer|cooler)_images$/);
    if (!match) {
        return null;
    }
    return {
        visitIndex: parseInt(match[1], 10),
        imageType: match[2],
    };
};
exports.parseVisitImageField = parseVisitImageField;
//# sourceMappingURL=dynamicUpload.middleware.js.map