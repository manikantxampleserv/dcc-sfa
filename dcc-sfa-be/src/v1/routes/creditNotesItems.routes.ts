import { Router } from 'express';
import { creditNoteItemsController } from '../controllers/creditNotesItems.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { createCreditNoteItemsValidator } from '../validations/creditNotesItems.validator';
import { validate } from '../../middlewares/validation.middleware';
const router = Router();

router.post(
  '/transaction/credit-note-items',
  authenticateToken,
  createCreditNoteItemsValidator,
  validate,
  creditNoteItemsController.createCreditNoteItems
);
router.get(
  '/transaction/credit-note-items',
  authenticateToken,
  creditNoteItemsController.getAllCreditNoteItems
);
router.get(
  '/transaction/credit-note-items/:id',
  authenticateToken,
  creditNoteItemsController.getCreditNoteItemById
);
router.put(
  '/transaction/credit-note-items/:id',
  authenticateToken,
  creditNoteItemsController.updateCreditNoteItem
);
router.delete(
  '/transaction/credit-note-items/:id',
  authenticateToken,
  creditNoteItemsController.deleteCreditNoteItem
);

export default router;
