import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { deliverySchedulesController } from '../controllers/deliverySchedule.controller';
import { deliverySchedulesValidation } from '../validations/deliverySchedules.validation';
import { validate } from '../../middlewares/validation.middleware';
import { upload } from '../../utils/multer';

const router = Router();

router.post(
  '/delivery-schedules',
  upload.single('customer_signature'),
  authenticateToken,
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
  deliverySchedulesController.deleteDeliverySchedule
);

export default router;
