// import { Router } from 'express';
// import {
//   authenticateToken,
//   requirePermission,
// } from '../../middlewares/auth.middleware';
// import {
//   auditCreate,
//   auditUpdate,
//   auditDelete,
// } from '../../middlewares/audit.middleware';
// // import { districtsController } from '../controllers/regions.controller';

// const router = Router();

// router.post('/districts', authenticateToken, districtsController.createRegions);

// router.get(
//   '/districts/:id',
//   authenticateToken,
//   districtsController.getRegionsById
// );

// router.get('/districts', authenticateToken, districtsController.getAllRegions);

// router.put(
//   '/districts/:id',
//   authenticateToken,
//   auditUpdate('districts'),
//   requirePermission([{ module: 'role', action: 'update' }]),
//   districtsController.updateRegions
// );

// router.delete(
//   '/districts/:id',
//   authenticateToken,
//   auditDelete('districts'),
//   requirePermission([{ module: 'role', action: 'delete' }]),
//   districtsController.deleteRegions
// );

// export default router;
