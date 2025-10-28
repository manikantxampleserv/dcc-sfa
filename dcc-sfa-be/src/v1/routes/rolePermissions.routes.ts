import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
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
  rolePermissionsController.createRolePermissions
);

router.get(
  '/role-permissions/:id',
  authenticateToken,
  rolePermissionsController.getRolePermissionsById
);
router.get(
  '/all/role-permissions',
  authenticateToken,
  rolePermissionsController.getAllRolePermissions
);

router.delete(
  '/role-permissions/:id',
  authenticateToken,
  auditDelete('role_permissions'),
  rolePermissionsController.deleteRolePermissions
);

router.put(
  '/role-permissions/:id',
  authenticateToken,
  auditUpdate('role_permissions'),
  rolePermissionsController.updateRolePermission
);
export default router;
