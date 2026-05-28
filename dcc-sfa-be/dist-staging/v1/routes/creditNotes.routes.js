"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const creditNotes_controller_1 = require("../controllers/creditNotes.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const creditNotes_validator_1 = require("../validations/creditNotes.validator");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/transaction/credit-notes', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('credit_notes'), creditNotes_validator_1.createCreditNotesValidator, validation_middleware_1.validate, creditNotes_controller_1.creditNotesController.upsertCreditNote);
router.get('/transaction/credit-notes', auth_middleware_1.authenticateToken, creditNotes_controller_1.creditNotesController.getAllCreditNotes);
router.get('/transaction/credit-notes/:id', auth_middleware_1.authenticateToken, creditNotes_controller_1.creditNotesController.getCreditNoteById);
router.delete('/transaction/credit-notes/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('credit_notes'), creditNotes_controller_1.creditNotesController.deleteCreditNotes);
exports.default = router;
//# sourceMappingURL=creditNotes.routes.js.map