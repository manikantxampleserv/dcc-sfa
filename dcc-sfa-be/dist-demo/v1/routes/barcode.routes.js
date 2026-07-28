"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const barcode_controller_1 = require("../controllers/barcode.controller");
const router = (0, express_1.Router)();
// Public route for generating barcodes dynamically
router.get('/barcode', barcode_controller_1.barcodeController.generateBarcode);
exports.default = router;
//# sourceMappingURL=barcode.routes.js.map