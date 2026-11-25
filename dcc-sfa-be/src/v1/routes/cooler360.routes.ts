import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { cooler360Controller } from '../controllers/cooler360.controller';

const router = Router();

/**
 * Route: Cooler 360 overview payload for default/first asset.
 */
router.get(
  '/cooler-360',
  authenticateToken,
  requirePermission([{ module: 'asset-master', action: 'read' }]),
  cooler360Controller.getCooler360Data
);

/**
 * Route: Cooler 360 overview payload by identifier (id, serial number, barcode, asset code).
 */
router.get(
  '/cooler-360/:identifier',
  authenticateToken,
  requirePermission([{ module: 'asset-master', action: 'read' }]),
  cooler360Controller.getCooler360Data
);

export default router;
