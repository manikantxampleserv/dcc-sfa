"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const batchLots_controller_1 = require("../controllers/batchLots.controller");
const batchLots_validation_1 = require("../validations/batchLots.validation");
const router = (0, express_1.Router)();
// router.post(
//   '/batch-lots',
//   authenticateToken,
//   auditCreate('batch_lots'),
//   requirePermission([{ module: 'batch-lots', action: 'create' }]),
//   createBatchLotValidation,
//   batchLotsController.createBatchLot
// );
router.post('/batch-lots', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('batch_lots'), (0, auth_middleware_1.requirePermission)([{ module: 'batch-lots', action: 'create' }]), 
// createBatchLotValidation,
batchLots_controller_1.batchLotsController.createBatchLot);
router.post('/product-batch-lots', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('batch_lots'), (0, auth_middleware_1.requirePermission)([{ module: 'batch-lots', action: 'create' }]), 
// createBatchLotValidation,
batchLots_controller_1.batchLotsController.createMultipleBatchLotsForProduct);
router.get('/batch-lots-dropdown', auth_middleware_1.authenticateToken, batchLots_controller_1.batchLotsController.getBatchLotsDropdown);
router.get('/batch-lots', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'batch-lots', action: 'read' }]), batchLots_controller_1.batchLotsController.getAllBatchLots);
router.get('/batch-lots/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'batch-lots', action: 'read' }]), batchLots_controller_1.batchLotsController.getBatchLotById);
router.put('/batch-lots/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('batch_lots'), (0, auth_middleware_1.requirePermission)([{ module: 'batch-lots', action: 'update' }]), batchLots_validation_1.updateBatchLotValidation, batchLots_controller_1.batchLotsController.updateBatchLot);
router.delete('/batch-lots/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('batch_lots'), (0, auth_middleware_1.requirePermission)([{ module: 'batch-lots', action: 'delete' }]), batchLots_controller_1.batchLotsController.deleteBatchLot);
exports.default = router;
//# sourceMappingURL=batchLots.routes.js.map