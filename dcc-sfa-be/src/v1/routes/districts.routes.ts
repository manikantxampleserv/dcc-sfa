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
import { districtsController } from '../controllers/districts.controller';

const router = Router();

router.post(
  '/districts',
  authenticateToken,
  auditCreate('districts'),
  districtsController.createDistricts
);

router.get(
  '/districts/:id',
  authenticateToken,
  districtsController.getDistrictsById
);

router.get(
  '/districts',
  authenticateToken,
  districtsController.getAllDistricts
);

router.put(
  '/districts/:id',
  authenticateToken,
  auditUpdate('districts'),
  requirePermission([{ module: 'role', action: 'update' }]),
  districtsController.updateDistricts
);

router.delete(
  '/districts/:id',
  authenticateToken,
  auditDelete('districts'),
  requirePermission([{ module: 'role', action: 'delete' }]),
  districtsController.deleteDistricts
);

export default router;
