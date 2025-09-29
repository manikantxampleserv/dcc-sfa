import { Request } from 'express';
import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: (err: Error | null, acceptFile?: boolean) => void
  ) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.mimetype))
      return cb(new Error('Invalid file type'));
    cb(null, true);
  },
});
