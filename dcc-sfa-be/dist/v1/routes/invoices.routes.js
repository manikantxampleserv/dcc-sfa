"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const invoices_controller_1 = require("../controllers/invoices.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const invoice_validation_1 = require("../validations/invoice.validation");
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticateToken);
// Invoice CRUD operations
router.post('/invoices', (0, audit_middleware_1.auditCreate)('invoices'), (0, auth_middleware_1.requirePermission)([{ module: 'invoice', action: 'create' }]), invoice_validation_1.createInvoiceValidation, invoices_controller_1.invoicesController.createInvoice);
router.get('/invoices', (0, auth_middleware_1.requirePermission)([{ module: 'invoice', action: 'read' }]), invoices_controller_1.invoicesController.getInvoices);
router.get('/invoices/:id', (0, auth_middleware_1.requirePermission)([{ module: 'invoice', action: 'read' }]), invoices_controller_1.invoicesController.getInvoiceById);
router.put('/invoices/:id', (0, audit_middleware_1.auditUpdate)('invoices'), (0, auth_middleware_1.requirePermission)([{ module: 'invoice', action: 'update' }]), invoice_validation_1.updateInvoiceValidation, invoices_controller_1.invoicesController.updateInvoice);
router.delete('/invoices/:id', (0, audit_middleware_1.auditDelete)('invoices'), (0, auth_middleware_1.requirePermission)([{ module: 'invoice', action: 'delete' }]), invoices_controller_1.invoicesController.deleteInvoice);
// Invoice Payment Lines Routes
router.post('/invoices/:invoiceId/payment-lines', (0, audit_middleware_1.auditCreate)('invoice_payment_lines'), (0, auth_middleware_1.requirePermission)([{ module: 'invoice', action: 'create' }]), invoices_controller_1.invoicesController.createInvoicePaymentLine);
router.get('/invoices/:invoiceId/payment-lines', (0, auth_middleware_1.requirePermission)([{ module: 'invoice', action: 'read' }]), invoices_controller_1.invoicesController.getInvoicePaymentLines);
router.put('/invoices/:invoiceId/payment-lines/:lineId', (0, audit_middleware_1.auditUpdate)('invoice_payment_lines'), (0, auth_middleware_1.requirePermission)([{ module: 'invoice', action: 'update' }]), invoices_controller_1.invoicesController.updateInvoicePaymentLine);
router.delete('/invoices/:invoiceId/payment-lines/:lineId', (0, audit_middleware_1.auditDelete)('invoice_payment_lines'), (0, auth_middleware_1.requirePermission)([{ module: 'invoice', action: 'delete' }]), invoices_controller_1.invoicesController.deleteInvoicePaymentLine);
router.put('/invoices/:invoiceId/payment-lines', (0, audit_middleware_1.auditUpdate)('invoice_payment_lines'), (0, auth_middleware_1.requirePermission)([{ module: 'invoice', action: 'update' }]), invoices_controller_1.invoicesController.bulkUpdateInvoicePaymentLines);
// Invoice Items Routes
router.post('/invoices/:invoiceId/items', (0, audit_middleware_1.auditCreate)('invoice_items'), (0, auth_middleware_1.requirePermission)([{ module: 'invoice', action: 'create' }]), invoices_controller_1.invoicesController.createInvoiceItem);
router.get('/invoices/:invoiceId/items', (0, auth_middleware_1.requirePermission)([{ module: 'invoice', action: 'read' }]), invoices_controller_1.invoicesController.getInvoiceItems);
router.put('/invoices/:invoiceId/items/:itemId', (0, audit_middleware_1.auditUpdate)('invoice_items'), (0, auth_middleware_1.requirePermission)([{ module: 'invoice', action: 'update' }]), invoices_controller_1.invoicesController.updateInvoiceItem);
router.delete('/invoices/:invoiceId/items/:itemId', (0, audit_middleware_1.auditDelete)('invoice_items'), (0, auth_middleware_1.requirePermission)([{ module: 'invoice', action: 'delete' }]), invoices_controller_1.invoicesController.deleteInvoiceItem);
router.put('/invoices/:invoiceId/items', (0, audit_middleware_1.auditUpdate)('invoice_items'), (0, auth_middleware_1.requirePermission)([{ module: 'invoice', action: 'update' }]), invoices_controller_1.invoicesController.bulkUpdateInvoiceItems);
exports.default = router;
//# sourceMappingURL=invoices.routes.js.map