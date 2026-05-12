"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const stockTransferLines_controller_1 = require("../controllers/stockTransferLines.controller");
const router = express_1.default.Router();
router.get('/stock-transfer-lines/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'stock-transfer', action: 'read' }]), stockTransferLines_controller_1.stockTransferLinesController.getStockTransferLineById);
router.get('/stock-transfer-lines', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'stock-transfer', action: 'read' }]), stockTransferLines_controller_1.stockTransferLinesController.getAllStockTransferLines);
router.delete('/stock-transfer-lines/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('stock_transfer_lines'), (0, auth_middleware_1.requirePermission)([{ module: 'stock-transfer', action: 'delete' }]), stockTransferLines_controller_1.stockTransferLinesController.deleteStockTransferLine);
exports.default = router;
//# sourceMappingURL=stockTransferLines.routes.js.map