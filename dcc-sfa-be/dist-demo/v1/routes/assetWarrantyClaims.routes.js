"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const assetWarrantyClaims_controller_1 = require("../controllers/assetWarrantyClaims.controller");
const assetWarrantyClaims_validation_1 = require("../validations/assetWarrantyClaims.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/asset-warranty-claims', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('asset_warranty_claims'), (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'create' }]), assetWarrantyClaims_validation_1.createAssetWarrantyClaimsValidation, validation_middleware_1.validate, assetWarrantyClaims_controller_1.assetWarrantyClaimsController.createAssetWarrantyClaims);
router.get('/asset-warranty-claims/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'read' }]), assetWarrantyClaims_controller_1.assetWarrantyClaimsController.getAssetWarrantyClaimsById);
router.get('/asset-warranty-claims', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'read' }]), assetWarrantyClaims_controller_1.assetWarrantyClaimsController.getAllAssetWarrantyClaims);
router.put('/asset-warranty-claims/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('asset_warranty_claims'), (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'update' }]), assetWarrantyClaims_controller_1.assetWarrantyClaimsController.updateAssetWarrantyClaims);
router.delete('/asset-warranty-claims/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('asset_warranty_claims'), (0, auth_middleware_1.requirePermission)([{ module: 'maintenance', action: 'delete' }]), assetWarrantyClaims_controller_1.assetWarrantyClaimsController.deleteAssetWarrantyClaims);
exports.default = router;
//# sourceMappingURL=assetWarrantyClaims.routes.js.map