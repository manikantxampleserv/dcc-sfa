import { application, Request } from 'express';
import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

export const uploadExcel = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: (err: Error | null, acceptFile?: boolean) => void
  ) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/csv',
    ];
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (
      !allowedTypes.includes(file.mimetype) &&
      !allowedExtensions.includes(ext)
    ) {
      return cb(
        new Error('Invalid file type. Only Excel and CSV files are allowed.')
      );
    }
    cb(null, true);
  },
});

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
