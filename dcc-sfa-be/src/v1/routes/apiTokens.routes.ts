import { Router } from 'express';
import { auditDelete, auditUpdate } from '../../middlewares/audit.middleware';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import {
  activateApiToken,
  deactivateApiToken,
  deleteApiToken,
  getApiTokenById,
  getApiTokens,
  revokeAllUserTokens,
  revokeApiToken,
} from '../controllers/apiTokens.controller';

const router = Router();

router.use(authenticateToken);

router.get(
  '/api-tokens',
  requirePermission([{ module: 'token', action: 'read' }]),
  getApiTokens
);
router.get(
  '/api-tokens/:id',
  requirePermission([{ module: 'token', action: 'read' }]),
  getApiTokenById
);
router.patch(
  '/api-tokens/:id/revoke',
  auditUpdate('api_tokens'),
  requirePermission([{ module: 'token', action: 'update' }]),
  revokeApiToken
);
router.patch(
  '/api-tokens/:id/activate',
  auditUpdate('api_tokens'),
  requirePermission([{ module: 'token', action: 'update' }]),
  activateApiToken
);
router.patch(
  '/api-tokens/:id/deactivate',
  auditUpdate('api_tokens'),
  requirePermission([{ module: 'token', action: 'update' }]),
  deactivateApiToken
);
router.delete(
  '/api-tokens/:id',
  auditDelete('api_tokens'),
  requirePermission([{ module: 'token', action: 'delete' }]),
  deleteApiToken
);
router.patch(
  '/api-tokens/user/:userId/revoke-all',
  auditUpdate('api_tokens'),
  requirePermission([{ module: 'token', action: 'update' }]),
  revokeAllUserTokens
);

export default router;
