import { Router } from 'express';
import { importExportController } from '../controllers/import-export.controller';

import {
  validateTemplate,
  validateImport,
  validateExport,
} from '../validations/import-export.validation';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { uploadExcel } from '../../utils/multer';

const router = Router();

router.get(
  '/import-export/tables',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  importExportController.getSupportedTables
);

router.get(
  '/import-export/:table/template',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  validateTemplate,
  importExportController.downloadTemplate
);

router.post(
  '/import-export/:table/import',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'create' }]),
  uploadExcel.single('file'),
  validateImport,
  importExportController.importData
);

router.get(
  '/import-export/:table/export/excel',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  validateExport,
  importExportController.exportToExcel
);

router.get(
  '/import-export/:table/export/pdf',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  validateExport,
  importExportController.exportToPDF
);

export default router;
