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
import { rolePermissionsController } from '../controllers/rolePermissions.controller';
const router = Router();

router.post(
  '/role-permissions',
  authenticateToken,
  auditCreate('role_permissions'),
  requirePermission([{ module: 'role', action: 'create' }]),
  rolePermissionsController.createRolePermissions
);

router.get(
  '/role-permissions/:id',
  authenticateToken,
  requirePermission([{ module: 'role', action: 'read' }]),
  rolePermissionsController.getRolePermissionsById
);
router.get(
  '/all/role-permissions',
  authenticateToken,
  requirePermission([{ module: 'role', action: 'read' }]),
  rolePermissionsController.getAllRolePermissions
);

router.delete(
  '/role-permissions/:id',
  authenticateToken,
  auditDelete('role_permissions'),
  requirePermission([{ module: 'role', action: 'delete' }]),
  rolePermissionsController.deleteRolePermissions
);

router.put(
  '/role-permissions/:id',
  authenticateToken,
  auditUpdate('role_permissions'),
  requirePermission([{ module: 'role', action: 'update' }]),
  rolePermissionsController.updateRolePermission
);
export default router;
