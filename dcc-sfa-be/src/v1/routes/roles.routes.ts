import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { rolesController } from '../../v1/controllers/role.controller';
import {
  checkPermission,
  requireMinLevel,
} from '../../middlewares/checkPermission';

const router = Router();

router.get(
  '/roles',
  authenticateToken,

  rolesController.getAllRoles
);

router.get(
  '/roles/:id',
  authenticateToken,

  rolesController.getRoleById
);

router.post('/roles', authenticateToken, rolesController.createRole);

router.put('/roles/:id', authenticateToken, rolesController.updateRole);

router.delete('/roles/:id', authenticateToken, rolesController.deleteRole);

export default router;
