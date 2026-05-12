"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payments_controller_1 = require("../controllers/payments.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const router = express_1.default.Router();
router.post('/payments', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('payments'), (0, auth_middleware_1.requirePermission)([{ module: 'payment', action: 'create' }]), payments_controller_1.paymentsController.createPayment);
router.get('/payments', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'payment', action: 'read' }]), payments_controller_1.paymentsController.getPayments);
router.get('/payments/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'payment', action: 'read' }]), payments_controller_1.paymentsController.getPaymentById);
router.put('/payments/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('payments'), (0, auth_middleware_1.requirePermission)([{ module: 'payment', action: 'update' }]), payments_controller_1.paymentsController.updatePayment);
router.delete('/payments/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('payments'), (0, auth_middleware_1.requirePermission)([{ module: 'payment', action: 'delete' }]), payments_controller_1.paymentsController.deletePayment);
// Payment Lines Routes
router.post('/payments/:paymentId/lines', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('payment_lines'), (0, auth_middleware_1.requirePermission)([{ module: 'payment', action: 'create' }]), payments_controller_1.paymentsController.createPaymentLine);
router.get('/payments/:paymentId/lines', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'payment', action: 'read' }]), payments_controller_1.paymentsController.getPaymentLines);
router.delete('/payments/:paymentId/lines/:lineId', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('payment_lines'), (0, auth_middleware_1.requirePermission)([{ module: 'payment', action: 'delete' }]), payments_controller_1.paymentsController.deletePaymentLine);
// Payment Refunds Routes
router.post('/payments/:paymentId/refunds', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('payment_refunds'), (0, auth_middleware_1.requirePermission)([{ module: 'payment', action: 'create' }]), payments_controller_1.paymentsController.createPaymentRefund);
router.get('/payments/:paymentId/refunds', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'payment', action: 'read' }]), payments_controller_1.paymentsController.getPaymentRefunds);
router.put('/payments/:paymentId/refunds/:refundId', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('payment_refunds'), (0, auth_middleware_1.requirePermission)([{ module: 'payment', action: 'update' }]), payments_controller_1.paymentsController.updatePaymentRefund);
router.delete('/payments/:paymentId/refunds/:refundId', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('payment_refunds'), (0, auth_middleware_1.requirePermission)([{ module: 'payment', action: 'delete' }]), payments_controller_1.paymentsController.deletePaymentRefund);
exports.default = router;
//# sourceMappingURL=payments.routes.js.map