"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const import_export_controller_1 = require("../controllers/import-export.controller");
const import_export_validation_1 = require("../validations/import-export.validation");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const multer_1 = require("../../utils/multer");
const router = (0, express_1.Router)();
router.get('/import-export/tables', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'report', action: 'read' }]), import_export_controller_1.importExportController.getSupportedTables);
router.get('/import-export/:table/template', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'report', action: 'read' }]), import_export_validation_1.validateTemplate, import_export_controller_1.importExportController.downloadTemplate);
router.post('/import-export/:table/import', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'report', action: 'create' }]), multer_1.uploadExcel.single('file'), import_export_validation_1.validateImport, import_export_controller_1.importExportController.importData);
router.get('/import-export/:table/export/excel', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'report', action: 'read' }]), import_export_validation_1.validateExport, import_export_controller_1.importExportController.exportToExcel);
router.get('/import-export/:table/export/pdf', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requirePermission)([{ module: 'report', action: 'read' }]), import_export_validation_1.validateExport, import_export_controller_1.importExportController.exportToPDF);
exports.default = router;
//# sourceMappingURL=import-export.routes.js.map