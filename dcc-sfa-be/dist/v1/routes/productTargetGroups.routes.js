"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const productTargetGroups_controller_1 = require("../controllers/productTargetGroups.controller");
const productTargetGroups_validation_1 = require("../validations/productTargetGroups.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/product-target-groups', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('product_target_group'), (0, auth_middleware_1.requirePermission)([{ module: 'product-target-group', action: 'create' }]), productTargetGroups_validation_1.createProductTargetGroupValidation, validation_middleware_1.validate, productTargetGroups_controller_1.productTargetGroupsController.createProductTargetGroup);
router.get('/product-target-groups/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product-target-group', action: 'read' }]), validation_middleware_1.validate, productTargetGroups_controller_1.productTargetGroupsController.getProductTargetGroupById);
router.get('/product-target-groups', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'product-target-group', action: 'read' }]), productTargetGroups_controller_1.productTargetGroupsController.getProductTargetGroups);
router.put('/product-target-groups/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('product_target_group'), (0, auth_middleware_1.requirePermission)([{ module: 'product-target-group', action: 'update' }]), productTargetGroups_controller_1.productTargetGroupsController.updateProductTargetGroup);
router.delete('/product-target-groups/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('product_target_group'), (0, auth_middleware_1.requirePermission)([{ module: 'product-target-group', action: 'delete' }]), productTargetGroups_controller_1.productTargetGroupsController.deleteProductTargetGroup);
router.get('/product-target-groups-dropdown', auth_middleware_1.authenticateToken, productTargetGroups_controller_1.productTargetGroupsController.getProductTargetGroupsDropdown);
exports.default = router;
//# sourceMappingURL=productTargetGroups.routes.js.map