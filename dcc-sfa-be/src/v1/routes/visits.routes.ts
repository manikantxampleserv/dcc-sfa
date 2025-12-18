// import { Router } from 'express';
// import { visitsController } from '../controllers/visits.controller';
// import {
//   authenticateToken,
//   requirePermission,
// } from '../../middlewares/auth.middleware';
// import {
//   auditCreate,
//   auditUpdate,
//   auditDelete,
// } from '../../middlewares/audit.middleware';

// const router = Router();

// router.post(
//   '/visits',
//   authenticateToken,
//   auditCreate('visits'),
//   requirePermission([{ module: 'visit', action: 'create' }]),
//   visitsController.createVisits
// );

// router.post(
//   '/reports/visits',
//   authenticateToken,
//   auditCreate('visits'),
//   requirePermission([{ module: 'visit', action: 'create' }]),
//   visitsController.bulkUpsertVisits
// );
// router.get(
//   '/reports/visits',
//   authenticateToken,
//   requirePermission([{ module: 'visit', action: 'read' }]),
//   visitsController.getAllVisits
// );
// router.get(
//   '/reports/visits/:id',
//   authenticateToken,
//   requirePermission([{ module: 'visit', action: 'read' }]),
//   visitsController.getVisitsById
// );
// router.put(
//   '/reports/visits/:id',
//   authenticateToken,
//   auditUpdate('visits'),
//   requirePermission([{ module: 'visit', action: 'update' }]),
//   visitsController.updateVisits
// );
// router.delete(
//   '/reports/visits/:id',
//   authenticateToken,
//   auditDelete('visits'),
//   requirePermission([{ module: 'visit', action: 'delete' }]),
//   visitsController.deleteVisits
// );

// // router.get(
// //   '/reports/customer-visits',
// //   authenticateToken,
// //   visitsController.getVisitsBySalesperson
// // );

// router.get(
//   '/reports/customer-visits',
//   authenticateToken,
//   visitsController.getCustomerVisitsBySalesperson
// );

// router.get(
//   '/reports/cooler-visits',
//   authenticateToken,
//   visitsController.getCoolerInspectionsForVisitedCustomers
// );
// export default router;

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
import { dynamicVisitUpload } from '../../middlewares/dynamicUpload.middleware';
import { visitsController } from '../controllers/visits.controller';

const router = Router();

router.post(
  '/visits',
  authenticateToken,
  dynamicVisitUpload,
  auditCreate('visits'),
  requirePermission([{ module: 'visit', action: 'create' }]),
  visitsController.createVisits
);

router.post(
  '/reports/visits',
  authenticateToken,
  dynamicVisitUpload,
  auditCreate('visits'),
  requirePermission([{ module: 'visit', action: 'create' }]),
  visitsController.bulkUpsertVisits
);

router.get(
  '/reports/visits',
  authenticateToken,
  requirePermission([{ module: 'visit', action: 'read' }]),
  visitsController.getAllVisits
);

router.get(
  '/reports/visits/:id',
  authenticateToken,
  requirePermission([{ module: 'visit', action: 'read' }]),
  visitsController.getVisitsById
);

router.put(
  '/reports/visits/:id',
  authenticateToken,
  dynamicVisitUpload,
  auditUpdate('visits'),
  requirePermission([{ module: 'visit', action: 'update' }]),
  visitsController.updateVisits
);

router.delete(
  '/reports/visits/:id',
  authenticateToken,
  auditDelete('visits'),
  requirePermission([{ module: 'visit', action: 'delete' }]),
  visitsController.deleteVisits
);

router.get(
  '/reports/customer-visits',
  authenticateToken,
  visitsController.getCustomerVisitsBySalesperson
);

router.get(
  '/reports/cooler-visits',
  authenticateToken,
  visitsController.getCoolerInspectionsForVisitedCustomers
);

// Add to your routes
router.get('/debug/env-check', (req, res) => {
  const keyId = process.env.BACKBLAZE_B2_KEY_ID;
  const appKey = process.env.BACKBLAZE_B2_APPLICATION_KEY;

  res.json({
    keyId: {
      exists: !!keyId,
      length: keyId?.length || 0,
      value: keyId,
      expected: '005bd4eb5f41c01000000000d',
      matches: keyId === '005bd4eb5f41c01000000000d',
    },
    appKey: {
      exists: !!appKey,
      length: appKey?.length || 0,
      firstChars: appKey?.substring(0, 10),
      lastChars: appKey?.substring(appKey.length - 5),
      expected: 'K005lV2sH9HGTzI2h+575V2gtYQu5hk',
      matches: appKey === 'K005lV2sH9HGTzI2h+575V2gtYQu5hk',
      hasQuotes: appKey?.startsWith('"') || appKey?.endsWith('"'),
      actualValue: appKey, // Remove this in production!
    },
    bucket: {
      name: process.env.BACKBLAZE_B2_BUCKET_NAME,
      id: process.env.BACKBLAZE_B2_BUCKET_ID,
    },
  });
});
export default router;
