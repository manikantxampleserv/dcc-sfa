import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  companyController.createCompany
);

router.get('/company/:id', authenticateToken, companyController.getCompanyById);
router.get('/company', authenticateToken, companyController.getCompanies);

router.put(
  '/company/:id',
  upload.single('logo'),
  authenticateToken,
  auditUpdate('companies'),
  companyController.updateCompany
);

router.delete(
  '/company/:id',
  authenticateToken,
  auditDelete('companies'),
  companyController.deleteCompany
);

export default router;
