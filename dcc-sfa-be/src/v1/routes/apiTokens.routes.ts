import { Router } from 'express';
import { auditDelete, auditUpdate } from '../../middlewares/audit.middleware';
import {
  authenticateToken,
  requireAnyModulePermission,
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
import { MODULES, ACTIONS } from '../../configs/permissions.config';

const router = Router();

router.use(authenticateToken);

router.get('/api-tokens', getApiTokens);
router.get('/api-tokens/:id', getApiTokenById);
router.patch(
  '/api-tokens/:id/revoke',
  auditUpdate('api_tokens'),
  requireAnyModulePermission([
    { module: MODULES.API_TOKEN, action: ACTIONS.UPDATE },
  ]),
  revokeApiToken
);
router.patch(
  '/api-tokens/:id/activate',
  auditUpdate('api_tokens'),
  requireAnyModulePermission([
    { module: MODULES.API_TOKEN, action: ACTIONS.UPDATE },
  ]),
  activateApiToken
);
router.patch(
  '/api-tokens/:id/deactivate',
  auditUpdate('api_tokens'),
  requireAnyModulePermission([
    { module: MODULES.API_TOKEN, action: ACTIONS.UPDATE },
  ]),
  deactivateApiToken
);
router.delete('/api-tokens/:id', auditDelete('api_tokens'), deleteApiToken);
router.patch(
  '/api-tokens/user/:userId/revoke-all',
  auditUpdate('api_tokens'),
  revokeAllUserTokens
);

export default router;
