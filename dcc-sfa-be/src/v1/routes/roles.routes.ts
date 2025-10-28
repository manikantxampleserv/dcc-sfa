import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { rolesController } from '../../v1/controllers/role.controller';
import { validateRole } from '../validations/role.validation';

const router = Router();

router.get('/roles', authenticateToken, rolesController.getAllRoles);

router.get('/roles/:id', authenticateToken, rolesController.getRoleById);

router.post(
  '/roles',
  authenticateToken,
  auditCreate('roles'),
  validateRole,
  rolesController.createRole
);

router.put(
  '/roles/:id',
  authenticateToken,
  auditUpdate('roles'),
  validateRole,
  rolesController.updateRole
);

router.delete(
  '/roles/:id',
  authenticateToken,
  auditDelete('roles'),
  rolesController.deleteRole
);

router.post(
  '/roles/:id/permissions',
  authenticateToken,
  rolesController.assignPermissions
);

router.get(
  '/roles/:id/permissions',
  authenticateToken,
  rolesController.getRolePermissions
);

export default router;
