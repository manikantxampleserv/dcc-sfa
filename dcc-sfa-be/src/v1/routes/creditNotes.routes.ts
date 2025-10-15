import { Router } from 'express';
import { creditNotesController } from '../controllers/creditNotes.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { createCreditNotesValidator } from '../validations/creditNotes.validator';
import { validate } from '../../middlewares/validation.middleware';
const router = Router();

router.post(
  '/transaction/credit-notes',
  authenticateToken,
  creditNotesController.upsertCreditNote
);
// router.post(
//   '/transaction/credit-notes',
//   authenticateToken,
//   createCreditNotesValidator,
//   validate,
//   creditNotesController.createCreditNotes
// );
router.get(
  '/transaction/credit-notes',
  authenticateToken,
  creditNotesController.getAllCreditNotes
);
router.get(
  '/transaction/credit-notes/:id',
  authenticateToken,
  creditNotesController.getCreditNoteById
);
router.put(
  '/transaction/credit-notes/:id',
  authenticateToken,
  creditNotesController.updateCreditNotes
);
router.delete(
  '/transaction/credit-notes/:id',
  authenticateToken,
  creditNotesController.deleteCreditNotes
);

export default router;
