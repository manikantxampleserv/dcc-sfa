import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { requestsController } from '../controllers/requests.controller';

const router = Router();

router.post(
  '/requests',
  authenticateToken,
  auditCreate('sfa_d_requests'),
  requirePermission([{ module: 'approval', action: 'create' }]),
  requestsController.createRequest
);

router.get(
  '/requests/:id',
  authenticateToken,
  requirePermission([{ module: 'approval', action: 'read' }]),
  requestsController.getRequestsById
);

router.get(
  '/requests',
  authenticateToken,
  requirePermission([{ module: 'approval', action: 'read' }]),
  requestsController.getAllRequests
);

router.put(
  '/requests/:id',
  authenticateToken,
  auditUpdate('sfa_d_requests'),
  requirePermission([{ module: 'approval', action: 'update' }]),
  requestsController.updateRequests
);

router.delete(
  '/requests/:id',
  authenticateToken,
  auditDelete('sfa_d_requests'),
  requirePermission([{ module: 'approval', action: 'delete' }]),
  requestsController.deleteRequests
);

router.post(
  '/requests/action',
  authenticateToken,
  requestsController.takeActionOnRequest
);

router.get(
  '/requests-by-users',
  authenticateToken,
  requirePermission([{ module: 'approval', action: 'read' }]),
  requestsController.getRequestsByUsers
);

router.get(
  '/requests-by-users-without-permission',
  authenticateToken,
  requestsController.getRequestsByUsers
);

router.get(
  '/request-by-type-reference',
  authenticateToken,
  requirePermission([{ module: 'approval', action: 'read' }]),
  requestsController.getRequestByTypeAndReference
);

router.get(
  '/approval-setup/request-types',
  authenticateToken,
  requirePermission([{ module: 'approval', action: 'read' }]),
  requestsController.getRequestTypes
);

export default router;
