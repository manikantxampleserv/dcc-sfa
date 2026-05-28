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
  requirePermission([{ module: 'district', action: 'create' }]),
  districtsController.createDistricts
);

router.get(
  '/districts/:id',
  authenticateToken,
  requirePermission([{ module: 'district', action: 'read' }]),
  districtsController.getDistrictsById
);

router.get(
  '/districts',
  authenticateToken,
  requirePermission([{ module: 'district', action: 'read' }]),
  districtsController.getAllDistricts
);

router.put(
  '/districts/:id',
  authenticateToken,
  auditUpdate('districts'),
  requirePermission([{ module: 'district', action: 'update' }]),
  districtsController.updateDistricts
);

router.delete(
  '/districts/:id',
  authenticateToken,
  auditDelete('districts'),
  requirePermission([{ module: 'district', action: 'delete' }]),
  districtsController.deleteDistricts
);

export default router;
