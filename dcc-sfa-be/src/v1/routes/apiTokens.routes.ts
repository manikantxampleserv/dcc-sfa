import { Router } from 'express';
import {
  getApiTokens,
  getApiTokenById,
  revokeApiToken,
  activateApiToken,
  deactivateApiToken,
  deleteApiToken,
  revokeAllUserTokens,
} from '../controllers/apiTokens.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/api-tokens', getApiTokens);
router.get('/api-tokens/:id', getApiTokenById);
router.patch('/api-tokens/:id/revoke', revokeApiToken);
router.patch('/api-tokens/:id/activate', activateApiToken);
router.patch('/api-tokens/:id/deactivate', deactivateApiToken);
router.delete('/api-tokens/:id', deleteApiToken);
router.patch('/api-tokens/user/:userId/revoke-all', revokeAllUserTokens);

export default router;
