"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const brands_controller_1 = require("../controllers/brands.controller");
const brands_validation_1 = require("../validations/brands.validation");
const multer_1 = require("../../utils/multer");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const router = express_1.default.Router();
router.post('/brands', multer_1.upload.single('logo'), auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('brands'), (0, auth_middleware_1.requirePermission)([{ module: 'brand', action: 'create' }]), brands_validation_1.createBrandValidation, validation_middleware_1.validate, brands_controller_1.brandsController.createBrand);
router.get('/brands', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'brand', action: 'read' }]), brands_controller_1.brandsController.getAllBrands);
router.get('/brands/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'brand', action: 'read' }]), brands_controller_1.brandsController.getBrandById);
router.put('/brands/:id', multer_1.upload.single('logo'), auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('brands'), (0, auth_middleware_1.requirePermission)([{ module: 'brand', action: 'update' }]), brands_validation_1.updateBrandValidation, validation_middleware_1.validate, brands_controller_1.brandsController.updateBrand);
router.delete('/brands/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('brands'), (0, auth_middleware_1.requirePermission)([{ module: 'brand', action: 'delete' }]), brands_controller_1.brandsController.deleteBrand);
exports.default = router;
//# sourceMappingURL=brands.routes.js.map