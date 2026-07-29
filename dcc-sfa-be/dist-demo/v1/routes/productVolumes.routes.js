"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const productVolumes_controller_1 = require("../controllers/productVolumes.controller");
const productVolumes_validation_1 = require("../validations/productVolumes.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/product-volumes', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('product_volumes'), (0, auth_middleware_1.requirePermission)([{ module: 'product-volume', action: 'create' }]), productVolumes_validation_1.createProductVolumeValidation, validation_middleware_1.validate, productVolumes_controller_1.productVolumesController.createProductVolume);
router.get('/product-volumes/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product-volume', action: 'read' }]), validation_middleware_1.validate, productVolumes_controller_1.productVolumesController.getProductVolumeById);
router.get('/product-volumes', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product-volume', action: 'read' }]), productVolumes_controller_1.productVolumesController.getProductVolumes);
router.put('/product-volumes/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('product_volumes'), (0, auth_middleware_1.requirePermission)([{ module: 'product-volume', action: 'update' }]), productVolumes_controller_1.productVolumesController.updateProductVolume);
router.delete('/product-volumes/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('product_volumes'), (0, auth_middleware_1.requirePermission)([{ module: 'product-volume', action: 'delete' }]), productVolumes_controller_1.productVolumesController.deleteProductVolume);
router.get('/product-volumes-dropdown', auth_middleware_1.authenticateToken, productVolumes_controller_1.productVolumesController.getProductVolumesDropdown);
exports.default = router;
//# sourceMappingURL=productVolumes.routes.js.map