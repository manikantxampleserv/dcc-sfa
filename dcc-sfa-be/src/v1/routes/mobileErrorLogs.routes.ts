import { Router } from 'express';
import { mobileErrorLogsController } from '../controllers/mobileErrorLogs.controller';

const router = Router();

router.get(
  '/mobile-error-logs',

  mobileErrorLogsController.getMobileErrorLogs
);

router.post(
  '/mobile-error-logs/sync',
  mobileErrorLogsController.syncMobileErrorLogs
);

router.post(
  '/mobile-error-logs',
  mobileErrorLogsController.syncMobileErrorLogs
);

export default router;
