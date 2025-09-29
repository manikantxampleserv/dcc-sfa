import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { companyController } from '../controllers/company.controller';
import { upload } from '../../utils/multer';

const router = Router();

router.post(
  '/company',
  upload.single('logo'),
  authenticateToken,
  validate,
  companyController.createCompany
);

router.get('/company', authenticateToken, companyController.getCompanies);

router.get('/company/:id', authenticateToken, companyController.getCompanyById);

router.put(
  '/company/:id',
  upload.single('logo'),
  authenticateToken,
  validate,
  companyController.updateCompany
);

router.delete(
  '/company/:id',
  authenticateToken,
  companyController.deleteCompany
);

export default router;
