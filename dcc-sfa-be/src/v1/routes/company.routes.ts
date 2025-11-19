import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { companyController } from '../controllers/company.controller';
import { upload } from '../../utils/multer';
import {
  auditCreate,
  auditDelete,
  auditUpdate,
} from '../../middlewares/audit.middleware';

const router = Router();

router.post(
  '/company',
  upload.single('logo'),
  authenticateToken,
  auditCreate('companies'),
  requirePermission([{ module: 'company', action: 'create' }]),
  companyController.createCompany
);

router.get(
  '/company/:id',
  authenticateToken,
  requirePermission([{ module: 'company', action: 'read' }]),
  companyController.getCompanyById
);
router.get(
  '/company',
  authenticateToken,
  requirePermission([{ module: 'company', action: 'read' }]),
  companyController.getCompanies
);

router.put(
  '/company/:id',
  upload.single('logo'),
  authenticateToken,
  auditUpdate('companies'),
  requirePermission([{ module: 'company', action: 'update' }]),
  companyController.updateCompany
);

router.delete(
  '/company/:id',
  authenticateToken,
  auditDelete('companies'),
  requirePermission([{ module: 'company', action: 'delete' }]),
  companyController.deleteCompany
);

export default router;
