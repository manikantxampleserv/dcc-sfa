import { Router } from 'express';
import { creditNotesController } from '../controllers/creditNotes.controller';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { createCreditNotesValidator } from '../validations/creditNotes.validator';
import { validate } from '../../middlewares/validation.middleware';
const router = Router();

router.post(
  '/transaction/credit-notes',
  authenticateToken,
  auditCreate('credit_notes'),
  requirePermission([{ module: 'credit-note', action: 'create' }]),
  createCreditNotesValidator,
  validate,
  creditNotesController.upsertCreditNote
);
router.get(
  '/transaction/credit-notes',
  authenticateToken,
  requirePermission([{ module: 'credit-note', action: 'read' }]),
  creditNotesController.getAllCreditNotes
);
router.get(
  '/transaction/credit-notes/:id',
  authenticateToken,
  requirePermission([{ module: 'credit-note', action: 'read' }]),
  creditNotesController.getCreditNoteById
);
router.delete(
  '/transaction/credit-notes/:id',
  authenticateToken,
  auditDelete('credit_notes'),
  requirePermission([{ module: 'credit-note', action: 'delete' }]),
  creditNotesController.deleteCreditNotes
);

export default router;
