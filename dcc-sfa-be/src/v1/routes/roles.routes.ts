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

router.post(
  '/roles',
  authenticateToken,
  // checkPermission('Role Management', 'create'),
  // requireMinLevel(4),
  rolesController.createRole
);

router.put(
  '/roles/:id',
  authenticateToken,
  // checkPermission('Role Management', 'edit'),
  // requireMinLevel(4),
  rolesController.updateRole
);

router.delete(
  '/roles/:id',
  authenticateToken,
  // checkPermission('Role Management', 'delete'),
  // requireMinLevel(5),
  rolesController.deleteRole
);

export default router;
