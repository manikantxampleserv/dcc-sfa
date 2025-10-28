import { Router } from 'express';
import { auditDelete, auditUpdate } from '../../middlewares/audit.middleware';
import { authenticateToken } from '../../middlewares/auth.middleware';
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

router.get('/api-tokens', getApiTokens);
router.get('/api-tokens/:id', getApiTokenById);
router.patch(
  '/api-tokens/:id/revoke',
  auditUpdate('api_tokens'),
  revokeApiToken
);
router.patch(
  '/api-tokens/:id/activate',
  auditUpdate('api_tokens'),
  activateApiToken
);
router.patch(
  '/api-tokens/:id/deactivate',
  auditUpdate('api_tokens'),
  deactivateApiToken
);
router.delete('/api-tokens/:id', auditDelete('api_tokens'), deleteApiToken);
router.patch(
  '/api-tokens/user/:userId/revoke-all',
  auditUpdate('api_tokens'),
  revokeAllUserTokens
);

export default router;
