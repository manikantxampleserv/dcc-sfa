import { Router } from 'express';
import {
  authenticateToken,
  requireAnyModulePermission,
} from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { MODULES, ACTIONS } from '../../configs/permissions.config';
import { userController } from '../controllers/user.controller';
import {
  createUserValidation,
  updateUserValidation,
} from '../validations/user.validation';

const router = Router();

router.post(
  '/users',
  authenticateToken,
  requireAnyModulePermission([
    { module: MODULES.USER, action: ACTIONS.CREATE },
  ]),
  createUserValidation,
  validate,
  userController.createUser
);

router.get(
  '/users',
  authenticateToken,
  requireAnyModulePermission([{ module: MODULES.USER, action: ACTIONS.LIST }]),
  userController.getUsers
);

router.get(
  '/users/:id',
  authenticateToken,
  requireAnyModulePermission([{ module: MODULES.USER, action: ACTIONS.READ }]),
  userController.getUserById
);

router.put(
  '/users/:id',
  authenticateToken,
  requireAnyModulePermission([
    { module: MODULES.USER, action: ACTIONS.UPDATE },
  ]),
  updateUserValidation,
  validate,
  userController.updateUser
);

router.delete(
  '/users/:id',
  authenticateToken,
  requireAnyModulePermission([
    { module: MODULES.USER, action: ACTIONS.DELETE },
  ]),
  userController.deleteUser
);

export default router;
