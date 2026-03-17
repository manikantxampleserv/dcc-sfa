"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const assetSubTypes_controller_1 = require("../controllers/assetSubTypes.controller");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const router = (0, express_1.Router)();
router.post('/asset-sub-types', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('asset_sub_types'), validation_middleware_1.validate, assetSubTypes_controller_1.assetSubTypesController.createAssetSubType);
router.get('/asset-sub-types/:id', auth_middleware_1.authenticateToken, 
// requirePermission([{ module: 'asset-sub-type', action: 'read' }]),
validation_middleware_1.validate, assetSubTypes_controller_1.assetSubTypesController.getAssetSubTypeById);
router.get('/asset-sub-types', auth_middleware_1.authenticateToken, 
// requirePermission([{ module: 'asset-sub-type', action: 'read' }]),
assetSubTypes_controller_1.assetSubTypesController.getAssetSubTypes);
router.get('/asset-sub-types-dropdown', auth_middleware_1.authenticateToken, assetSubTypes_controller_1.assetSubTypesController.getAssetSubTypesDropdown);
router.put('/asset-sub-types/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('asset_sub_types'), 
// requirePermission([{ module: 'asset-sub-type', action: 'update' }]),
assetSubTypes_controller_1.assetSubTypesController.updateAssetSubType);
router.delete('/asset-sub-types/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('asset_sub_types'), 
// requirePermission([{ module: 'asset-sub-type', action: 'delete' }]),
assetSubTypes_controller_1.assetSubTypesController.deleteAssetSubType);
exports.default = router;
//# sourceMappingURL=assetSubTypes.routes.js.map