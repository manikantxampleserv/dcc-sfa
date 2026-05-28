import { Router } from 'express';
import {
  auditCreate,
  auditDelete,
  auditUpdate,
} from '../../middlewares/audit.middleware';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { upload } from '../../utils/multer';
import { deliverySchedulesController } from '../controllers/deliverySchedule.controller';
import { deliverySchedulesValidation } from '../validations/deliverySchedules.validation';

const router = Router();

router.post(
  '/delivery-schedules',
  upload.single('customer_signature'),
  authenticateToken,
  auditCreate('delivery_schedules'),
  deliverySchedulesValidation,
  validate,
  deliverySchedulesController.createDeliverySchedule
);

router.get(
  '/delivery-schedules',
  authenticateToken,
  deliverySchedulesController.getAllDeliverySchedules
);

router.put(
  '/delivery-schedules/:id',
  upload.single('customer_signature'),
  authenticateToken,
  auditUpdate('delivery_schedules'),
  deliverySchedulesController.updateDeliverySchedule
);
router.get(
  '/delivery-schedules/:id',
  authenticateToken,
  deliverySchedulesController.getDeliveryScheduleById
);

router.delete(
  '/delivery-schedules/:id',
  authenticateToken,
  auditDelete('delivery_schedules'),
  deliverySchedulesController.deleteDeliverySchedule
);

export default router;
