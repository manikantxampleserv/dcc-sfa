"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assetBrands_controller_1 = require("../controllers/assetBrands.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const router = (0, express_1.Router)();
router.post('/asset-master-brands', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('asset_master_brands'), assetBrands_controller_1.assetBrandsController.createAssetBrand);
router.get('/asset-master-brands', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'asset-brand', action: 'read' }]), assetBrands_controller_1.assetBrandsController.getAssetBrands);
router.get('/asset-master-brands/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'asset-brand', action: 'read' }]), assetBrands_controller_1.assetBrandsController.getAssetBrandById);
router.put('/asset-master-brands/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('asset_master_brands'), (0, auth_middleware_1.requirePermission)([{ module: 'asset-brand', action: 'update' }]), assetBrands_controller_1.assetBrandsController.updateAssetBrand);
router.delete('/asset-master-brands/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'asset-brand', action: 'delete' }]), assetBrands_controller_1.assetBrandsController.deleteAssetBrand);
exports.default = router;
//# sourceMappingURL=assetMaterBrands.routes.js.map