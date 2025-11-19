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
import { permissionsController } from '../controllers/permissions.controller';

const router = Router();

// Get all permissions with pagination and filters
router.get(
  '/permissions',
  authenticateToken,
  requirePermission([{ module: 'role', action: 'read' }]),
  permissionsController.getAllPermissions
);

// Get permissions grouped by module
router.get(
  '/permissions/by-module',
  authenticateToken,
  requirePermission([{ module: 'role', action: 'read' }]),
  permissionsController.getPermissionsByModule
);

// Get permission by ID
router.get(
  '/permissions/:id',
  authenticateToken,
  requirePermission([{ module: 'role', action: 'read' }]),
  permissionsController.getPermissionById
);

// Create new permission
router.post(
  '/permissions',
  authenticateToken,
  auditCreate('permissions'),
  requirePermission([{ module: 'role', action: 'create' }]),
  permissionsController.createPermission
);

// Update permission
router.put(
  '/permissions/:id',
  authenticateToken,
  auditUpdate('permissions'),
  requirePermission([{ module: 'role', action: 'update' }]),
  permissionsController.updatePermission
);

// Delete permission (soft delete)
router.delete(
  '/permissions/:id',
  authenticateToken,
  auditDelete('permissions'),
  requirePermission([{ module: 'role', action: 'delete' }]),
  permissionsController.deletePermission
);

export default router;
