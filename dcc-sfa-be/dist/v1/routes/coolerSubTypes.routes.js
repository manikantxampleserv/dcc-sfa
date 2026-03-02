"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const coolerSubTypes_controller_1 = require("../controllers/coolerSubTypes.controller");
const coolerSubTypes_validation_1 = require("../validations/coolerSubTypes.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/cooler-sub-types', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('cooler_sub_types'), (0, auth_middleware_1.requirePermission)([{ module: 'cooler-sub-type', action: 'create' }]), coolerSubTypes_validation_1.createCoolerSubTypeValidation, validation_middleware_1.validate, coolerSubTypes_controller_1.coolerSubTypesController.createCoolerSubType);
router.get('/cooler-sub-types/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'cooler-sub-type', action: 'read' }]), validation_middleware_1.validate, coolerSubTypes_controller_1.coolerSubTypesController.getCoolerSubTypeById);
router.get('/cooler-sub-types', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'cooler-sub-type', action: 'read' }]), coolerSubTypes_controller_1.coolerSubTypesController.getCoolerSubTypes);
router.get('/cooler-sub-types-dropdown', auth_middleware_1.authenticateToken, coolerSubTypes_controller_1.coolerSubTypesController.getCoolerSubTypesDropdown);
router.put('/cooler-sub-types/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('cooler_sub_types'), (0, auth_middleware_1.requirePermission)([{ module: 'cooler-sub-type', action: 'update' }]), coolerSubTypes_controller_1.coolerSubTypesController.updateCoolerSubType);
router.delete('/cooler-sub-types/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('cooler_sub_types'), (0, auth_middleware_1.requirePermission)([{ module: 'cooler-sub-type', action: 'delete' }]), coolerSubTypes_controller_1.coolerSubTypesController.deleteCoolerSubType);
exports.default = router;
//# sourceMappingURL=coolerSubTypes.routes.js.map