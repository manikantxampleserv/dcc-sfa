"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const promotionalMaterials_controller_1 = require("../controllers/promotionalMaterials.controller");
const promotionalMaterials_validation_1 = require("../validations/promotionalMaterials.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/promotional-materials', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('promotional_materials'), (0, auth_middleware_1.requirePermission)([{ module: 'promotion-materials', action: 'create' }]), promotionalMaterials_validation_1.createPromotionalMaterialValidation, validation_middleware_1.validate, promotionalMaterials_controller_1.promotionalMaterialsController.createPromotionalMaterial);
router.get('/promotional-materials', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'promotion-materials', action: 'read' }]), promotionalMaterials_controller_1.promotionalMaterialsController.getPromotionalMaterials);
router.get('/promotional-materials/outlet/:outletId', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'promotion-materials', action: 'read' }]), promotionalMaterials_controller_1.promotionalMaterialsController.getOutletPromotionalMaterials);
router.get('/promotional-materials/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'promotion-materials', action: 'read' }]), promotionalMaterials_controller_1.promotionalMaterialsController.getPromotionalMaterialById);
router.put('/promotional-materials/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('promotional_materials'), (0, auth_middleware_1.requirePermission)([{ module: 'promotion-materials', action: 'update' }]), promotionalMaterials_validation_1.updatePromotionalMaterialValidation, validation_middleware_1.validate, promotionalMaterials_controller_1.promotionalMaterialsController.updatePromotionalMaterial);
router.delete('/promotional-materials/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('promotional_materials'), (0, auth_middleware_1.requirePermission)([{ module: 'promotion-materials', action: 'delete' }]), promotionalMaterials_controller_1.promotionalMaterialsController.deletePromotionalMaterial);
exports.default = router;
//# sourceMappingURL=promotionalMaterials.routes.js.map