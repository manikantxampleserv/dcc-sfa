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

router.get('/', getApiTokens);
router.get('/:id', getApiTokenById);
router.patch('/:id/revoke', revokeApiToken);
router.patch('/:id/activate', activateApiToken);
router.patch('/:id/deactivate', deactivateApiToken);
router.delete('/:id', deleteApiToken);
router.patch('/user/:userId/revoke-all', revokeAllUserTokens);

export default router;
