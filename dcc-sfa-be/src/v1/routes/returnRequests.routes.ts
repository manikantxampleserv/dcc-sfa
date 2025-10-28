import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { returnRequestsController } from '../controllers/returnRequests.controller';
import { returnRequestsValidation } from '../validations/returnRequests.validation';
import { validate } from '../../middlewares/validation.middleware';

const router = Router();

router.post(
  '/return-requests',
  authenticateToken,
  auditCreate('return_requests'),
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
  auditUpdate('return_requests'),
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
  auditDelete('return_requests'),
  returnRequestsController.deleteReturnRequest
);

export default router;
