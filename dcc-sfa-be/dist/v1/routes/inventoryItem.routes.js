"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vanInventory_controller_1 = require("../controllers/vanInventory.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = express_1.default.Router();
router.get('/inventory-item-salesperson', auth_middleware_1.authenticateToken, vanInventory_controller_1.vanInventoryController.getSalespersonInventory);
router.get('/inventory-item-salesperson/:salesperson_id', auth_middleware_1.authenticateToken, vanInventory_controller_1.vanInventoryController.getSalespersonInventory);
router.get('/inventory-items-dropdown/:salesperson_id', auth_middleware_1.authenticateToken, vanInventory_controller_1.vanInventoryController.getSalespersonInventoryItemsDropdown);
router.get('/inventory-item-salesperson-items/:salesperson_id', auth_middleware_1.authenticateToken, vanInventory_controller_1.vanInventoryController.getSalespersonInventoryItems);
exports.default = router;
//# sourceMappingURL=inventoryItem.routes.js.map