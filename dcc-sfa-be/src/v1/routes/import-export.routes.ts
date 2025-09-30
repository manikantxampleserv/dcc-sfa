import { Router } from 'express';
import { importExportController } from '../controllers/import-export.controller';

import {
  validateTemplate,
  validatePreview,
  validateImport,
  validateExport,
} from '../validations/import-export.validation';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { uploadExcel } from '../../utils/multer';

const router = Router();

router.get(
  '/import-export/tables',
  authenticateToken,
  importExportController.getSupportedTables
);

router.get(
  '/import-export/:table/template',
  authenticateToken,
  validateTemplate,
  importExportController.downloadTemplate
);

router.post(
  '/import-export/:table/preview',
  authenticateToken,
  uploadExcel.single('file'),
  validatePreview,
  importExportController.previewImport
);

router.post(
  '/import-export/:table/import',
  authenticateToken,
  uploadExcel.single('file'),
  validateImport,
  importExportController.importData
);

router.get(
  '/import-export/:table/export/excel',
  authenticateToken,
  validateExport,
  importExportController.exportToExcel
);

router.get(
  '/import-export/:table/export/pdf',
  authenticateToken,
  validateExport,
  importExportController.exportToPDF
);

export default router;
