import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { rolesController } from '../../v1/controllers/role.controller';
import { validateRole } from '../validations/role.validation';

const router = Router();

router.get('/', authenticateToken, rolesController.getAllRoles);

router.get('/:id', authenticateToken, rolesController.getRoleById);

router.post('/role', validateRole, rolesController.createRole);

router.put('/:id', authenticateToken, validateRole, rolesController.updateRole);

router.delete('/:id', authenticateToken, rolesController.deleteRole);

router.post(
  '/:id/permissions',
  authenticateToken,
  rolesController.assignPermissions
);

router.get(
  '/:id/permissions',
  authenticateToken,
  rolesController.getRolePermissions
);

export default router;
