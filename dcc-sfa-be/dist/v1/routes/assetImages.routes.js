"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const assetImages_controller_1 = require("../controllers/assetImages.controller");
const multer_1 = require("../../utils/multer");
const router = (0, express_1.Router)();
router.post('/asset-images', multer_1.upload.single('file'), auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('asset_images'), (0, auth_middleware_1.requirePermission)([{ module: 'asset-master', action: 'create' }]), assetImages_controller_1.assetImagesController.createAssetImages);
router.get('/asset-images/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'asset-master', action: 'read' }]), assetImages_controller_1.assetImagesController.getAssetImagesById);
router.get('/asset-images', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'asset-master', action: 'read' }]), assetImages_controller_1.assetImagesController.getAllAssetImages);
router.put('/asset-images/:id', multer_1.upload.single('file'), auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('asset_images'), (0, auth_middleware_1.requirePermission)([{ module: 'asset-master', action: 'update' }]), assetImages_controller_1.assetImagesController.updateAssetImages);
router.delete('/asset-images/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('asset_images'), (0, auth_middleware_1.requirePermission)([{ module: 'asset-master', action: 'delete' }]), assetImages_controller_1.assetImagesController.deleteAssetImages);
exports.default = router;
//# sourceMappingURL=assetImages.routes.js.map