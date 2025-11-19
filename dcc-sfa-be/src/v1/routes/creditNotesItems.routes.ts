import { Router } from 'express';
import { creditNoteItemsController } from '../controllers/creditNotesItems.controller';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { createCreditNoteItemsValidator } from '../validations/creditNotesItems.validator';
import { validate } from '../../middlewares/validation.middleware';
const router = Router();

router.post(
  '/transaction/credit-note-items',
  authenticateToken,
  auditCreate('credit_note_items'),
  requirePermission([{ module: 'credit-note', action: 'create' }]),
  createCreditNoteItemsValidator,
  validate,
  creditNoteItemsController.createCreditNoteItems
);
router.get(
  '/transaction/credit-note-items',
  authenticateToken,
  requirePermission([{ module: 'credit-note', action: 'read' }]),
  creditNoteItemsController.getAllCreditNoteItems
);
router.get(
  '/transaction/credit-note-items/:id',
  authenticateToken,
  requirePermission([{ module: 'credit-note', action: 'read' }]),
  creditNoteItemsController.getCreditNoteItemById
);
router.put(
  '/transaction/credit-note-items/:id',
  authenticateToken,
  auditUpdate('credit_note_items'),
  requirePermission([{ module: 'credit-note', action: 'update' }]),
  creditNoteItemsController.updateCreditNoteItem
);
router.delete(
  '/transaction/credit-note-items/:id',
  authenticateToken,
  auditDelete('credit_note_items'),
  requirePermission([{ module: 'credit-note', action: 'delete' }]),
  creditNoteItemsController.deleteCreditNoteItem
);

export default router;
