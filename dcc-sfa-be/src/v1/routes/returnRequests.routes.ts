import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { returnRequestsController } from '../controllers/returnRequests.controller';
import { returnRequestsValidation } from '../validations/returnRequests.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/return-requests',
  authenticateToken,
  returnRequestsValidation,
  validate,
  returnRequestsController.createReturnRequest
);

router.get(
  '/return-requests',
  authenticateToken,
  returnRequestsController.getAllReturnRequests
);

router.put(
  '/return-requests/:id',
  authenticateToken,
  returnRequestsController.updateReturnRequest
);
router.get(
  '/return-requests/:id',
  authenticateToken,
  returnRequestsController.getReturnRequestById
);

router.delete(
  '/return-requests/:id',
  authenticateToken,
  returnRequestsController.deleteReturnRequest
);

export default router;
