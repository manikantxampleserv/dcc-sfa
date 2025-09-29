import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { companyController } from '../controllers/company.controller';
import { upload } from '../../utils/multer';

const router = Router();

router.post(
  '/company',
  upload.single('logo'),
  authenticateToken,
  companyController.createCompany
);

router.get('/company/:id', authenticateToken, companyController.getCompanyById);
router.get('/company', authenticateToken, companyController.getCompanies);

router.put(
  '/company/:id',
  upload.single('logo'),
  authenticateToken,
  companyController.updateCompany
);

router.delete(
  '/company/:id',
  authenticateToken,
  companyController.deleteCompany
);

export default router;
