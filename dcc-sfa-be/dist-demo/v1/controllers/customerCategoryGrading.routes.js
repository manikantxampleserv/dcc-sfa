"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const customerCategoryGrading_controller_1 = require("../controllers/customerCategoryGrading.controller");
const router = (0, express_1.Router)();
router.get('/customerCategoryGrading/:id', auth_middleware_1.authenticateToken, customerCategoryGrading_controller_1.customerCategoryGradingController.getGradingRequestById);
router.get('/customerCategoryGrading', auth_middleware_1.authenticateToken, customerCategoryGrading_controller_1.customerCategoryGradingController.getAllGradingRequests);
router.put('/customerCategoryGrading/:id/process', auth_middleware_1.authenticateToken, customerCategoryGrading_controller_1.customerCategoryGradingController.processGradingRequest);
router.put('/customerCategoryGrading/bulk-process', auth_middleware_1.authenticateToken, customerCategoryGrading_controller_1.customerCategoryGradingController.bulkProcessGradingRequests);
router.get('/customerCategoryGrading/stats/summary', auth_middleware_1.authenticateToken, customerCategoryGrading_controller_1.customerCategoryGradingController.getGradingStats);
exports.default = router;
//# sourceMappingURL=customerCategoryGrading.routes.js.map