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
  requirePermission([{ module: 'tax-master', action: 'create' }]),
  createTaxMasterValidation,
  validate,
  taxMasterController.createTaxMaster
);

router.get(
  '/tax-masters/:id',
  authenticateToken,
  requirePermission([{ module: 'tax-master', action: 'read' }]),
  taxMasterController.getTaxMasterById
);

router.get(
  '/tax-masters',
  authenticateToken,
  requirePermission([{ module: 'tax-master', action: 'read' }]),
  taxMasterController.getTaxMasters
);

router.put(
  '/tax-masters/:id',
  authenticateToken,
  auditUpdate('tax_master'),
  requirePermission([{ module: 'tax-master', action: 'update' }]),
  taxMasterController.updateTaxMaster
);

router.delete(
  '/tax-masters/:id',
  authenticateToken,
  auditDelete('tax_master'),
  requirePermission([{ module: 'tax-master', action: 'delete' }]),
  taxMasterController.deleteTaxMaster
);

export default router;

