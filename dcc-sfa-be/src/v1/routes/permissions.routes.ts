import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { permissionsController } from '../controllers/permissions.controller';

const router = Router();

// Get all permissions with pagination and filters
router.get('/permissions', authenticateToken, permissionsController.getAllPermissions);

// Get permissions grouped by module
router.get('/permissions/by-module', authenticateToken, permissionsController.getPermissionsByModule);

// Get permission by ID
router.get('/permissions/:id', authenticateToken, permissionsController.getPermissionById);

// Create new permission
router.post('/permissions', authenticateToken, permissionsController.createPermission);

// Update permission
router.put('/permissions/:id', authenticateToken, permissionsController.updatePermission);

// Delete permission (soft delete)
router.delete('/permissions/:id', authenticateToken, permissionsController.deletePermission);

export default router;
