import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { taxMasterController } from '../controllers/taxMaster.controller';
import { createTaxMasterValidation } from '../validations/taxMaster.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/tax-masters',
  authenticateToken,
  auditCreate('tax_master'),
  createTaxMasterValidation,
  validate,
  taxMasterController.createTaxMaster
);

router.get(
  '/tax-masters/:id',
  authenticateToken,
  taxMasterController.getTaxMasterById
);

router.get(
  '/tax-masters',
  authenticateToken,
  taxMasterController.getTaxMasters
);

router.put(
  '/tax-masters/:id',
  authenticateToken,
  auditUpdate('tax_master'),
  taxMasterController.updateTaxMaster
);

router.delete(
  '/tax-masters/:id',
  authenticateToken,
  auditDelete('tax_master'),
  taxMasterController.deleteTaxMaster
);

export default router;
