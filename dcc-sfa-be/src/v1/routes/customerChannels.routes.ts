import { Router } from 'express';
import { customerChannelsController } from '../controllers/customerChannels.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';

const router = Router();

router.post(
  '/customer-channels',
  authenticateToken,
  auditCreate('customer_channel'),
  customerChannelsController.createCustomerChannels
);
router.get(
  '/customer-channels',
  authenticateToken,
  customerChannelsController.getAllCustomerChannels
);

router.get(
  '/customer-channels/:id',
  authenticateToken,
  customerChannelsController.getCustomerChannelsById
);
router.put(
  '/customer-channels/:id',
  authenticateToken,
  auditUpdate('customer_channel'),
  customerChannelsController.updateCustomerChannels
);
router.delete(
  '/customer-channels/:id',
  authenticateToken,
  auditDelete('customer_channel'),
  customerChannelsController.deleteCustomerChannels
);

export default router;
