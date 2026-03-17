"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const coolerInstallations_controller_1 = require("../controllers/coolerInstallations.controller");
const coolerInstallations_validation_1 = require("../validations/coolerInstallations.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/cooler-installations', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('cooler_installations'), (0, auth_middleware_1.requirePermission)([{ module: 'installation', action: 'create' }]), coolerInstallations_validation_1.createCoolerInstallationValidation, validation_middleware_1.validate, coolerInstallations_controller_1.coolerInstallationsController.createCoolerInstallation);
router.get('/cooler-installations/status-options', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'installation', action: 'read' }]), coolerInstallations_controller_1.coolerInstallationsController.getCoolerStatusOptions);
router.get('/cooler-installations', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'installation', action: 'read' }]), coolerInstallations_controller_1.coolerInstallationsController.getCoolerInstallations);
router.get('/cooler-installations/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'installation', action: 'read' }]), validation_middleware_1.validate, coolerInstallations_controller_1.coolerInstallationsController.getCoolerInstallationById);
router.put('/cooler-installations/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('cooler_installations'), (0, auth_middleware_1.requirePermission)([{ module: 'installation', action: 'update' }]), coolerInstallations_controller_1.coolerInstallationsController.updateCoolerInstallation);
router.delete('/cooler-installations/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('cooler_installations'), (0, auth_middleware_1.requirePermission)([{ module: 'installation', action: 'delete' }]), coolerInstallations_controller_1.coolerInstallationsController.deleteCoolerInstallation);
router.patch('/cooler-installations/:id/status', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'installation', action: 'update' }]), coolerInstallations_controller_1.coolerInstallationsController.updateCoolerStatus);
exports.default = router;
//# sourceMappingURL=coolerInstallations.routes.js.map