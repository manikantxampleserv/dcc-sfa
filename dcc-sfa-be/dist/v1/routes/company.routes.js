"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const company_controller_1 = require("../controllers/company.controller");
const multer_1 = require("../../utils/multer");
const audit_middleware_1 = require("../../middlewares/audit.middleware");
const router = (0, express_1.Router)();
router.post('/company', multer_1.upload.single('logo'), auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditCreate)('companies'), (0, auth_middleware_1.requirePermission)([{ module: 'company', action: 'create' }]), company_controller_1.companyController.createCompany);
router.get('/company/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'company', action: 'read' }]), company_controller_1.companyController.getCompanyById);
router.get('/company', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'company', action: 'read' }]), company_controller_1.companyController.getCompanies);
router.put('/company/:id', multer_1.upload.single('logo'), auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditUpdate)('companies'), (0, auth_middleware_1.requirePermission)([{ module: 'company', action: 'update' }]), company_controller_1.companyController.updateCompany);
router.delete('/company/:id', auth_middleware_1.authenticateToken, (0, audit_middleware_1.auditDelete)('companies'), (0, auth_middleware_1.requirePermission)([{ module: 'company', action: 'delete' }]), company_controller_1.companyController.deleteCompany);
exports.default = router;
//# sourceMappingURL=company.routes.js.map