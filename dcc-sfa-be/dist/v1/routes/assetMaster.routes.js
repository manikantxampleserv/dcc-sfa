"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const assetMaster_controller_1 = require("../controllers/assetMaster.controller");
const multer_1 = require("../../utils/multer");
const assetMaster_validation_1 = require("../validations/assetMaster.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/asset-master', auth_middleware_1.authenticateToken, multer_1.upload.array('assetImages', 10), (0, audit_middleware_1.auditCreate)('asset_master'), (0, auth_middleware_1.requirePermission)([{ module: 'asset-master', action: 'create' }]), assetMaster_validation_1.createAssetMasterValidation, validation_middleware_1.validate, assetMaster_controller_1.assetMasterController.createAssetMaster);
router.get('/asset-master/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'asset-master', action: 'read' }]), assetMaster_controller_1.assetMasterController.getAssetMasterById);
router.get('/asset-master', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'asset-master', action: 'read' }]), assetMaster_controller_1.assetMasterController.getAllAssetMaster);
router.put('/asset-master/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('asset_master'), (0, auth_middleware_1.requirePermission)([{ module: 'asset-master', action: 'update' }]), assetMaster_validation_1.updateAssetMasterValidation, validation_middleware_1.validate, assetMaster_controller_1.assetMasterController.updateAssetMaster);
router.delete('/asset-master/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('asset_master'), (0, auth_middleware_1.requirePermission)([{ module: 'asset-master', action: 'delete' }]), assetMaster_controller_1.assetMasterController.deleteAssetMaster);
exports.default = router;
//# sourceMappingURL=assetMaster.routes.js.map