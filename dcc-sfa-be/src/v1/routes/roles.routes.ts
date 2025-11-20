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
import { rolesController } from '../../v1/controllers/role.controller';
import { validateRole } from '../validations/role.validation';

const router = Router();

router.get(
  '/roles',
  authenticateToken,
  requirePermission([{ module: 'role', action: 'read' }]),
  rolesController.getAllRoles
);

router.get(
  '/roles/:id',
  authenticateToken,
  requirePermission([{ module: 'role', action: 'read' }]),
  rolesController.getRoleById
);

router.post(
  '/roles',
  authenticateToken,
  auditCreate('roles'),
  requirePermission([{ module: 'role', action: 'create' }]),
  validateRole,
  rolesController.createRole
);

router.put(
  '/roles/:id',
  authenticateToken,
  auditUpdate('roles'),
  requirePermission([{ module: 'role', action: 'update' }]),
  validateRole,
  rolesController.updateRole
);

router.delete(
  '/roles/:id',
  authenticateToken,
  auditDelete('roles'),
  requirePermission([{ module: 'role', action: 'delete' }]),
  rolesController.deleteRole
);

router.post(
  '/roles/:id/permissions',
  authenticateToken,
  requirePermission([{ module: 'role', action: 'update' }]),
  rolesController.assignPermissions
);

router.get(
  '/roles/:id/permissions',
  authenticateToken,
  requirePermission([{ module: 'role', action: 'read' }]),
  rolesController.getRolePermissions
);

router.get(
  '/roles-dropdown',
  authenticateToken,
  rolesController.getRolesDropdown
);

export default router;
