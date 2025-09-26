import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { rolePermissionsController } from '../controllers/rolePermissions.controller';
const router = Router();

router.post(
  '/role-permissions',
  authenticateToken,
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
  rolePermissionsController.deleteRolePermissions
);

router.put(
  '/role-permissions/:id',
  authenticateToken,
  rolePermissionsController.updateRolePermission
);
export default router;
