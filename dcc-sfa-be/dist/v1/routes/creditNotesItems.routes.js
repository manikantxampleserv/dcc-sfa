"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const creditNotesItems_controller_1 = require("../controllers/creditNotesItems.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const creditNotesItems_validator_1 = require("../validations/creditNotesItems.validator");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/transaction/credit-note-items', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('credit_note_items'), (0, auth_middleware_1.requirePermission)([{ module: 'credit-note', action: 'create' }]), creditNotesItems_validator_1.createCreditNoteItemsValidator, validation_middleware_1.validate, creditNotesItems_controller_1.creditNoteItemsController.createCreditNoteItems);
router.get('/transaction/credit-note-items', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'credit-note', action: 'read' }]), creditNotesItems_controller_1.creditNoteItemsController.getAllCreditNoteItems);
router.get('/transaction/credit-note-items/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'credit-note', action: 'read' }]), creditNotesItems_controller_1.creditNoteItemsController.getCreditNoteItemById);
router.put('/transaction/credit-note-items/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('credit_note_items'), (0, auth_middleware_1.requirePermission)([{ module: 'credit-note', action: 'update' }]), creditNotesItems_controller_1.creditNoteItemsController.updateCreditNoteItem);
router.delete('/transaction/credit-note-items/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('credit_note_items'), (0, auth_middleware_1.requirePermission)([{ module: 'credit-note', action: 'delete' }]), creditNotesItems_controller_1.creditNoteItemsController.deleteCreditNoteItem);
exports.default = router;
//# sourceMappingURL=creditNotesItems.routes.js.map