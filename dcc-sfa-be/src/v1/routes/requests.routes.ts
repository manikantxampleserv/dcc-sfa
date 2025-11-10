// import { Router } from 'express';
// import { authenticateToken } from '../../middlewares/auth.middleware';
// import {
//   auditCreate,
//   auditUpdate,
//   auditDelete,
// } from '../../middlewares/audit.middleware';
// import { requestsController } from '../controllers/requests.controller';

// const router = Router();

// router.post(
//   '/requests',
//   authenticateToken,
//   auditCreate('sfa_d_requests'),
//   requestsController.createRequest
// );

// router.get(
//   '/requests/:id',
//   authenticateToken,
//   requestsController.getRequestsById
// );

// router.get('/requests', authenticateToken, requestsController.getAllRequests);

// router.put(
//   '/requests/:id',
//   authenticateToken,
//   auditUpdate('sfa_d_requests'),
//   requestsController.updateRequests
// );

// router.delete(
//   '/requests/:id',
//   authenticateToken,
//   auditDelete('sfa_d_requests'),
//   requestsController.deleteRequests
// );

// router.post(
//   '/requests/action',
//   authenticateToken,
//   requestsController.takeActionOnRequest
// );

// router.get(
//   '/requests-by-users',
//   authenticateToken,
//   requestsController.getRequestsByUsers
// );

// router.get(
//   '/request-by-type-reference',
//   authenticateToken,
//   requestsController.getRequestByTypeAndReference
// );

// export default router;
