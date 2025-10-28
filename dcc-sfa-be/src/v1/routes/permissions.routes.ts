import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { permissionsController } from '../controllers/permissions.controller';

const router = Router();

// Get all permissions with pagination and filters
router.get(
  '/permissions',
  authenticateToken,
  permissionsController.getAllPermissions
);

// Get permissions grouped by module
router.get(
  '/permissions/by-module',
  authenticateToken,
  permissionsController.getPermissionsByModule
);

// Get permission by ID
router.get(
  '/permissions/:id',
  authenticateToken,
  permissionsController.getPermissionById
);

// Create new permission
router.post(
  '/permissions',
  authenticateToken,
  auditCreate('permissions'),
  permissionsController.createPermission
);

// Update permission
router.put(
  '/permissions/:id',
  authenticateToken,
  auditUpdate('permissions'),
  permissionsController.updatePermission
);

// Delete permission (soft delete)
router.delete(
  '/permissions/:id',
  authenticateToken,
  auditDelete('permissions'),
  permissionsController.deletePermission
);

export default router;
