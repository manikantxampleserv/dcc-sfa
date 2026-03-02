"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const coolerTypes_controller_1 = require("../controllers/coolerTypes.controller");
const coolerTypes_validation_1 = require("../validations/coolerTypes.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/cooler-types', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('cooler_types'), (0, auth_middleware_1.requirePermission)([{ module: 'cooler-type', action: 'create' }]), coolerTypes_validation_1.createCoolerTypeValidation, validation_middleware_1.validate, coolerTypes_controller_1.coolerTypesController.createCoolerType);
router.get('/cooler-types/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'cooler-type', action: 'read' }]), validation_middleware_1.validate, coolerTypes_controller_1.coolerTypesController.getCoolerTypeById);
router.get('/cooler-types', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'cooler-type', action: 'read' }]), coolerTypes_controller_1.coolerTypesController.getCoolerTypes);
router.get('/cooler-types-dropdown', auth_middleware_1.authenticateToken, coolerTypes_controller_1.coolerTypesController.getCoolerTypesDropdown);
router.put('/cooler-types/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('cooler_types'), (0, auth_middleware_1.requirePermission)([{ module: 'cooler-type', action: 'update' }]), coolerTypes_controller_1.coolerTypesController.updateCoolerType);
router.delete('/cooler-types/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('cooler_types'), (0, auth_middleware_1.requirePermission)([{ module: 'cooler-type', action: 'delete' }]), coolerTypes_controller_1.coolerTypesController.deleteCoolerType);
exports.default = router;
//# sourceMappingURL=coolerTypes.routes.js.map