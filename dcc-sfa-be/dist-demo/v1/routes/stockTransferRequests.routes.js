"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const stockTransferRequests_controller_1 = require("../controllers/stockTransferRequests.controller");
const stockTransferRequests_validation_1 = require("../validations/stockTransferRequests.validation");
const router = express_1.default.Router();
router.post('/stock-transfer-requests', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('stock_transfer_requests'), stockTransferRequests_validation_1.createStockTransferRequestValidation, validation_middleware_1.validate, stockTransferRequests_controller_1.stockTransferRequestsController.upsertStockTransferRequest);
router.get('/stock-transfer-requests', auth_middleware_1.authenticateToken, stockTransferRequests_controller_1.stockTransferRequestsController.getAllStockTransferRequests);
router.get('/stock-transfer-requests/:id', auth_middleware_1.authenticateToken, stockTransferRequests_controller_1.stockTransferRequestsController.getStockTransferRequestById);
router.delete('/stock-transfer-requests/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('stock_transfer_requests'), stockTransferRequests_controller_1.stockTransferRequestsController.deleteStockTransferRequest);
exports.default = router;
//# sourceMappingURL=stockTransferRequests.routes.js.map