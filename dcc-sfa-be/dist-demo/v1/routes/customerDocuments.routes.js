"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const customerDocuments_controller_1 = require("../controllers/customerDocuments.controller");
const multer_1 = require("../../utils/multer");
const router = (0, express_1.Router)();
router.post('/customer-documents', multer_1.upload.single('file'), auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('customer_documents'), (0, auth_middleware_1.requirePermission)([{ module: 'outlet', action: 'create' }]), customerDocuments_controller_1.customerDocumentsController.createCustomerDocuments);
router.get('/customer-documents/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'outlet', action: 'read' }]), customerDocuments_controller_1.customerDocumentsController.getCustomerDocumentsById);
router.get('/customer-documents', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'outlet', action: 'read' }]), customerDocuments_controller_1.customerDocumentsController.getAllCustomerDocuments);
router.put('/customer-documents/:id', multer_1.upload.single('file'), auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('customer_documents'), (0, auth_middleware_1.requirePermission)([{ module: 'outlet', action: 'update' }]), customerDocuments_controller_1.customerDocumentsController.updateCustomerDocuments);
router.delete('/customer-documents/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('customer_documents'), (0, auth_middleware_1.requirePermission)([{ module: 'outlet', action: 'delete' }]), customerDocuments_controller_1.customerDocumentsController.deleteCustomerDocuments);
exports.default = router;
//# sourceMappingURL=customerDocuments.routes.js.map