"use strict";
// import { Request, Response, NextFunction } from 'express';
// import { ImportExportFactory } from '../services/import-export-factory.service';
Object.defineProperty(exports, "__esModule", { value: true });
exports.importExportController = void 0;
const import_export_factory_service_1 = require("../services/import-export-factory.service");
exports.importExportController = {
    async getSupportedTables(req, res, next) {
        try {
            const tables = import_export_factory_service_1.ImportExportFactory.getSupportedTables();
            const tableDetails = await Promise.all(tables.map(async (table) => {
                const service = import_export_factory_service_1.ImportExportFactory.getService(table);
                if (service) {
                    const count = await service.getCount();
                    return {
                        name: table,
                        displayName: service.getDisplayName(),
                        count,
                        columns: service.getColumns().length,
                    };
                }
                return { name: table, count: 0, columns: 0 };
            }));
            res.json({
                success: true,
                message: 'Supported tables retrieved successfully',
                data: {
                    tables,
                    details: tableDetails,
                },
            });
        }
        catch (error) {
            next(error);
        }
    },
    async downloadTemplate(req, res, next) {
        try {
            const { table } = req.params;
            const service = import_export_factory_service_1.ImportExportFactory.getService(table);
            if (!service) {
                return res.status(400).json({
                    success: false,
                    message: `Table '${table}' is not supported`,
                    errors: [{ msg: 'Unsupported table', param: 'table' }],
                });
            }
            const buffer = await service.generateTemplate();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${table}_template_${Date.now()}.xlsx`);
            res.setHeader('Content-Length', buffer.length.toString());
            res.send(buffer);
        }
        catch (error) {
            next(error);
        }
    },
    async importData(req, res, next) {
        try {
            const { table } = req.params;
            const { batchSize = 100, skipDuplicates = false, updateExisting = false, } = req.body;
            const service = import_export_factory_service_1.ImportExportFactory.getService(table);
            if (!service) {
                return res.status(400).json({
                    success: false,
                    message: `Table '${table}' is not supported`,
                    errors: [{ msg: 'Unsupported table', param: 'table' }],
                });
            }
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded',
                    errors: [{ msg: 'File is required', param: 'file' }],
                });
            }
            const userId = req.user?.id || 1;
            const preview = await service.parseExcelFile(req.file.buffer);
            if (preview.hasErrors && !skipDuplicates) {
                const validationErrors = [];
                if (preview.errors?.errors?.file) {
                    preview.errors.errors.file.forEach(err => {
                        validationErrors.push(`File Error: ${err.message}`);
                    });
                }
                if (preview.errors?.errors?.headers) {
                    preview.errors.errors.headers.forEach(err => {
                        validationErrors.push(`Header Error: ${err.message}`);
                    });
                }
                if (preview.errors?.errors?.rows) {
                    preview.errors.errors.rows.forEach(rowError => {
                        rowError.errors.forEach(err => {
                            if (err.type === 'missing') {
                                validationErrors.push(`Row ${rowError.row}: ${err.field} is required and cannot be empty`);
                            }
                            else if (err.type === 'validation') {
                                validationErrors.push(`Row ${rowError.row}: ${err.field} - ${err.message}`);
                            }
                            else if (err.type === 'foreign_key') {
                                validationErrors.push(`Row ${rowError.row}: ${err.message}`);
                            }
                            else {
                                validationErrors.push(`Row ${rowError.row}: ${err.message}`);
                            }
                        });
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: 'Import failed: Validation errors found',
                    data: {
                        success: 0,
                        failed: preview.totalCount - preview.validCount,
                        errors: validationErrors,
                        data: [],
                        totalProcessed: preview.totalCount,
                        fileInfo: {
                            originalName: req.file.originalname,
                            rows: preview.totalCount,
                        },
                    },
                });
            }
            const importOptions = {
                skipDuplicates,
                updateExisting,
            };
            let result;
            if (preview.data.length > 500) {
                result = await service.batchImport(preview.data, userId, batchSize, importOptions);
            }
            else {
                result = await service.importData(preview.data, userId, importOptions);
            }
            const totalProcessed = result.success + result.failed;
            if (result.success > 0) {
                return res.json({
                    success: true,
                    message: result.failed > 0
                        ? `Import completed with partial success: ${result.success} succeeded, ${result.failed} failed`
                        : `Import completed successfully: ${result.success} record(s) imported`,
                    data: {
                        success: result.success,
                        failed: result.failed,
                        errors: result.errors || [],
                        data: result.data || [],
                        totalProcessed,
                        fileInfo: {
                            originalName: req.file.originalname,
                            rows: preview.totalCount,
                        },
                    },
                });
            }
            else {
                return res.status(200).json({
                    success: false,
                    message: 'Import failed: No records were imported',
                    data: {
                        success: 0,
                        failed: result.failed,
                        errors: result.errors || [],
                        data: [],
                        totalProcessed: result.failed,
                        fileInfo: {
                            originalName: req.file.originalname,
                            rows: preview.totalCount,
                        },
                    },
                });
            }
        }
        catch (error) {
            next(error);
        }
    },
    async previewImport(req, res, next) {
        try {
            const { table } = req.params;
            const service = import_export_factory_service_1.ImportExportFactory.getService(table);
            if (!service) {
                return res.status(400).json({
                    success: false,
                    message: `Table '${table}' is not supported`,
                    errors: [{ msg: 'Unsupported table', param: 'table' }],
                });
            }
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded',
                    errors: [{ msg: 'File is required', param: 'file' }],
                });
            }
            const preview = await service.parseExcelFile(req.file.buffer);
            const fileInfo = {
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
            };
            if (preview.hasErrors) {
                const formattedErrors = [];
                if (preview.errors?.errors?.file) {
                    preview.errors.errors.file.forEach(err => {
                        formattedErrors.push(`File Error: ${err.message}`);
                    });
                }
                if (preview.errors?.errors?.headers) {
                    preview.errors.errors.headers.forEach(err => {
                        formattedErrors.push(`Header Error: ${err.message}`);
                    });
                }
                if (preview.errors?.errors?.rows) {
                    preview.errors.errors.rows.forEach(rowError => {
                        rowError.errors.forEach(err => {
                            if (err.type === 'missing') {
                                formattedErrors.push(`Row ${rowError.row}: ${err.field} is required and cannot be empty`);
                            }
                            else if (err.type === 'validation') {
                                formattedErrors.push(`Row ${rowError.row}: ${err.field} - ${err.message}`);
                            }
                            else if (err.type === 'foreign_key') {
                                formattedErrors.push(`Row ${rowError.row}: ${err.message}`);
                            }
                            else {
                                formattedErrors.push(`Row ${rowError.row}: ${err.message}`);
                            }
                        });
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: 'Preview failed: Validation errors found',
                    data: {
                        success: 0,
                        failed: preview.totalCount - preview.validCount,
                        errors: formattedErrors,
                        data: preview.data.slice(0, 10),
                        totalProcessed: preview.totalCount,
                        fileInfo: {
                            originalName: req.file.originalname,
                            rows: preview.totalCount,
                        },
                        columns: service.getColumns(),
                        validCount: preview.validCount,
                    },
                });
            }
            res.json({
                success: true,
                message: 'File parsed successfully',
                data: {
                    success: preview.validCount,
                    failed: 0,
                    errors: [],
                    data: preview.data,
                    totalProcessed: preview.totalCount,
                    fileInfo: {
                        originalName: req.file.originalname,
                        rows: preview.totalCount,
                    },
                    columns: service.getColumns(),
                    validCount: preview.validCount,
                },
            });
        }
        catch (error) {
            next(error);
        }
    },
    async exportToExcel(req, res, next) {
        try {
            const { table } = req.params;
            const service = import_export_factory_service_1.ImportExportFactory.getService(table);
            if (!service) {
                return res.status(400).json({
                    success: false,
                    message: `Table '${table}' is not supported`,
                    errors: [{ msg: 'Unsupported table', param: 'table' }],
                });
            }
            const { search, limit, page, sortField = 'id', sortOrder = 'desc', ...filters } = req.query;
            const options = {
                filters: search
                    ? {
                        OR: service.getSearchFields().map(field => ({
                            [field]: { contains: search },
                        })),
                    }
                    : Object.keys(filters).length > 0
                        ? filters
                        : undefined,
                limit: limit ? parseInt(limit) : undefined,
                orderBy: { [sortField]: sortOrder },
            };
            const buffer = await service.exportToExcel(options);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${table}_export_${Date.now()}.xlsx`);
            res.setHeader('Content-Length', buffer.length.toString());
            res.send(buffer);
        }
        catch (error) {
            next(error);
        }
    },
    async exportToPDF(req, res, next) {
        try {
            const { table } = req.params;
            const service = import_export_factory_service_1.ImportExportFactory.getService(table);
            if (!service) {
                return res.status(400).json({
                    success: false,
                    message: `Table '${table}' is not supported`,
                    errors: [{ msg: 'Unsupported table', param: 'table' }],
                });
            }
            const { search, limit, sortField = 'id', sortOrder = 'desc', ...filters } = req.query;
            const options = {
                filters: search
                    ? {
                        OR: service.getSearchFields().map(field => ({
                            [field]: { contains: search, mode: 'insensitive' },
                        })),
                    }
                    : Object.keys(filters).length > 0
                        ? filters
                        : undefined,
                limit: limit ? parseInt(limit) : 1000,
                orderBy: { [sortField]: sortOrder },
            };
            const buffer = await service.exportToPDF(options);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${table}_report_${Date.now()}.pdf`);
            res.setHeader('Content-Length', buffer.length.toString());
            res.send(buffer);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=import-export.controller.js.map