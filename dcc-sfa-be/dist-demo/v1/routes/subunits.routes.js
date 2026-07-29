"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const subunits_controller_1 = require("../controllers/subunits.controller");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const subunits_validation_1 = require("../validations/subunits.validation");
const router = (0, express_1.Router)();
router.post('/subunits', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('subunits'), subunits_validation_1.createSubunitValidation, validation_middleware_1.validate, subunits_controller_1.subunitsController.createSubunit);
router.get('/subunits/:id', auth_middleware_1.authenticateToken, subunits_controller_1.subunitsController.getSubunitById);
router.get('/subunits', auth_middleware_1.authenticateToken, subunits_controller_1.subunitsController.getSubunits);
router.put('/subunits/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('subunits'), subunits_validation_1.updateSubunitValidation, validation_middleware_1.validate, subunits_controller_1.subunitsController.updateSubunit);
router.delete('/subunits/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('subunits'), subunits_controller_1.subunitsController.deleteSubunit);
router.get('/subunits/lookup/units-of-measurement', auth_middleware_1.authenticateToken, subunits_controller_1.subunitsController.getUnitsOfMeasurement);
router.get('/subunits/lookup/products', auth_middleware_1.authenticateToken, subunits_controller_1.subunitsController.getProducts);
exports.default = router;
//# sourceMappingURL=subunits.routes.js.map