"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const jwt_config_1 = require("../../configs/jwt.config");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const excelSync_controller_1 = require("../controllers/excelSync.controller");
const router = (0, express_1.Router)();
/**
 * Middleware that disables all HTTP caching for Excel live sync.
 * Prevents Excel Power Query from serving stale cached records.
 */
router.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.removeHeader('ETag');
    next();
});
/**
 * Authentication middleware for Excel live integration.
 * Supports:
 * 1. Query parameter token (?token=... or ?apiKey=...)
 * 2. Excel Basic Auth dialog (Username/Password encoded in base64)
 * 3. Excel Web API tab (Raw JWT key in Authorization header)
 * 4. Standard Bearer token in Authorization header
 *
 * @param {Request} req Express request
 * @param {Response} res Express response
 * @param {NextFunction} next Express next middleware
 * @returns {Promise<any>}
 */
const allowExcelTokenAuth = async (req, res, next) => {
    try {
        const rawAuth = req.headers['authorization'];
        const apiKeyHeader = req.headers['x-api-key'];
        const queryToken = (req.query.token ||
            req.query.apiKey ||
            req.query.key);
        let companyExcelCreds = null;
        try {
            companyExcelCreds = (await prisma_client_1.default.companies.findFirst({
                select: {
                    excel_api_username: true,
                    excel_api_password: true,
                    excel_api_key: true,
                },
            }));
        }
        catch (_e) {
            /** Columns might not exist yet before migration */
        }
        /**
         * Check Excel Web API Key via query param, x-api-key header, or raw Authorization header
         */
        const candidateApiKey = queryToken ||
            apiKeyHeader ||
            (rawAuth && rawAuth.startsWith('Bearer ')
                ? rawAuth.substring(7).trim()
                : rawAuth && !rawAuth.startsWith('Basic ')
                    ? rawAuth.trim()
                    : null);
        if (companyExcelCreds?.excel_api_key &&
            candidateApiKey &&
            candidateApiKey === companyExcelCreds.excel_api_key) {
            req.user = {
                id: 1,
                email: companyExcelCreds.excel_api_username || 'excel_sync@dcc.co.tz',
                employee_id: 'EXCEL_SYNC',
                name: 'Excel API Service',
                role: 'Admin',
                permissions: ['all'],
                depot_id: null,
                zone_id: null,
            };
            return next();
        }
        /**
         * Handle Excel Basic Authentication tab (Authorization: Basic base64(email:password))
         */
        if (rawAuth && rawAuth.startsWith('Basic ')) {
            const base64Credentials = rawAuth.substring(6).trim();
            const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');
            const colonIndex = decoded.indexOf(':');
            if (colonIndex !== -1) {
                const username = decoded.substring(0, colonIndex).trim();
                const password = decoded.substring(colonIndex + 1);
                /** Check company-level dedicated Excel credentials */
                if (companyExcelCreds?.excel_api_username &&
                    companyExcelCreds?.excel_api_password &&
                    username === companyExcelCreds.excel_api_username &&
                    password === companyExcelCreds.excel_api_password) {
                    req.user = {
                        id: 1,
                        email: companyExcelCreds.excel_api_username,
                        employee_id: 'EXCEL_SYNC',
                        name: 'Excel API Service',
                        role: 'Admin',
                        permissions: ['all'],
                        depot_id: null,
                        zone_id: null,
                    };
                    return next();
                }
                const user = await prisma_client_1.default.users.findFirst({
                    where: {
                        OR: [{ email: { equals: username } }, { employee_id: username }],
                        is_active: 'Y',
                    },
                    include: {
                        user_role: {
                            include: {
                                roles_permission: {
                                    include: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                });
                if (user && (await bcrypt_1.default.compare(password, user.password_hash))) {
                    req.user = {
                        id: user.id,
                        email: user.email,
                        employee_id: user.employee_id,
                        name: user.name,
                        role: user.user_role?.name || 'Admin',
                        version: user.version ?? null,
                        permissions: user.user_role?.roles_permission
                            ?.filter(rp => rp.is_active === 'Y' && rp.permission?.is_active === 'Y')
                            ?.map(rp => rp.permission.name) || [],
                        parent_id: user.parent_id,
                        depot_id: user.depot_id,
                        zone_id: user.zone_id,
                    };
                    return next();
                }
                res.setHeader('WWW-Authenticate', 'Basic realm="Excel Live Sync"');
                return res.status(401).json({
                    error: 'invalid_credentials',
                    message: 'Invalid email or password for Excel sync.',
                });
            }
        }
        /**
        /**
         * Map Query Param, x-api-key, or raw token to Bearer Authorization header.
         * Sanitizes tokens where trailing query parameters were accidentally concatenated.
         */
        let token = queryToken || apiKeyHeader;
        if (!token && rawAuth) {
            if (rawAuth.startsWith('Bearer ')) {
                token = rawAuth.substring(7).trim();
            }
            else if (!rawAuth.startsWith('Basic ')) {
                token = rawAuth.trim();
            }
        }
        let cleanToken = token;
        if (cleanToken && cleanToken.includes('.')) {
            const parts = cleanToken.split('.');
            if (parts.length >= 3 && parts[2].length > 43) {
                const sigPart = parts[2];
                const extra = sigPart.substring(43);
                const sigClean = sigPart.substring(0, 43);
                cleanToken = `${parts[0]}.${parts[1]}.${sigClean}`;
                if (!req.query.start_date) {
                    const sdMatch = extra.match(/start_date=([^&]+)/);
                    if (sdMatch) {
                        req.query.start_date = sdMatch[1];
                    }
                    else if (req.query.end_date) {
                        req.query.start_date = req.query.end_date;
                    }
                }
            }
        }
        if (cleanToken) {
            req.headers['authorization'] = `Bearer ${cleanToken}`;
            let decoded = null;
            try {
                decoded = jsonwebtoken_1.default.verify(cleanToken, jwt_config_1.jwtConfig.secret);
            }
            catch (err) {
                if (err.name === 'TokenExpiredError') {
                    /**
                     * For Excel Live Sync, allow token decode with ignoreExpiration
                     * so Excel scheduled refresh doesn't break daily at 11:30 PM,
                     * provided the user is still active in the database.
                     */
                    try {
                        decoded = jsonwebtoken_1.default.verify(cleanToken, jwt_config_1.jwtConfig.secret, {
                            ignoreExpiration: true,
                        });
                    }
                    catch (_ignoreErr) {
                        decoded = null;
                    }
                }
            }
            if (decoded && decoded.id) {
                const user = await prisma_client_1.default.users.findFirst({
                    where: {
                        id: Number(decoded.id),
                        is_active: 'Y',
                    },
                    include: {
                        user_role: {
                            include: {
                                roles_permission: {
                                    include: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                });
                if (user) {
                    req.user = {
                        id: user.id,
                        email: user.email,
                        employee_id: user.employee_id,
                        name: user.name,
                        role: user.user_role?.name || 'Admin',
                        version: user.version ?? null,
                        permissions: user.user_role?.roles_permission
                            ?.filter(rp => rp.is_active === 'Y' && rp.permission?.is_active === 'Y')
                            ?.map(rp => rp.permission.name) || [],
                        parent_id: user.parent_id,
                        depot_id: user.depot_id,
                        zone_id: user.zone_id,
                    };
                    return next();
                }
            }
        }
        if (!req.headers['authorization']) {
            res.setHeader('WWW-Authenticate', 'Basic realm="Excel Live Sync"');
            return res.status(401).json({
                error: 'access_token_missing',
                message: 'Authentication credentials or token required for Excel access.',
            });
        }
        return (0, auth_middleware_1.authenticateToken)(req, res, next);
    }
    catch (error) {
        return res.status(500).json({
            error: 'auth_processing_error',
            message: 'Failed to process authentication for Excel request.',
        });
    }
};
/**
 * 1. Sales Data Endpoint
 * Streams live sales CSV data.
 * Query filters:
 * - Date filters: start_date, end_date, from_date, to_date, date (Formats: DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, ISO).
 * - Format: EvDate column is formatted as DD-MM-YYYY.
 * - Hierarchy filters: depot_id, zone_id, route_id, customer_id, channel_id, category_id, type_id, user_id.
 */
router.get('/excel/sale-data', allowExcelTokenAuth, excelSync_controller_1.excelSyncController.getSalesData);
router.get('/excel/sales-data', allowExcelTokenAuth, excelSync_controller_1.excelSyncController.getSalesData);
/**
 * 2. Outlet Master Endpoint
 * Streams flat outlet master CSV data (or JSON when format=json).
 * Query filters:
 * - Hierarchy filters: depot_id, zone_id, route_id, search.
 */
router.get('/excel/outlet-master', allowExcelTokenAuth, excelSync_controller_1.excelSyncController.getOutletMaster);
/**
 * 2b. Outlet Master JSON Endpoint
 * Returns lightweight outlet master JSON records with OR-mode search across
 * customer number, name, and contact details.
 *
 * Query filters:
 * - Search filters (OR mode): customer_no, name, contact_details, search/q.
 * - Hierarchy filters: depot_id, zone_id, route_id, is_active.
 * - Pagination filters: page, limit, take, page_size, raw/array.
 */
router.get('/excel/outlet-master-json', allowExcelTokenAuth, excelSync_controller_1.excelSyncController.getOutletMasterJson);
router.get('/excel/outlet-master/json', allowExcelTokenAuth, excelSync_controller_1.excelSyncController.getOutletMasterJson);
/**
 * 3. Survey Data Endpoint
 * Streams questionnaire answer details CSV.
 * Query filters:
 * - Date filters: start_date, end_date, from_date, to_date, date (Formats: DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, ISO).
 * - Format: Date column is formatted as DD-MM-YYYY.
 * - Hierarchy filters: survey_id, user_id, customer_id.
 */
router.get('/excel/survey-data', allowExcelTokenAuth, excelSync_controller_1.excelSyncController.getSurveyData);
/**
 * 4. Van Load and Unload Detail Endpoint
 * Streams inventory movement load/unload details CSV.
 * Query filters:
 * - Date filters: start_date, end_date, from_date, to_date, date (Formats: DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, ISO).
 * - Format: Date column is formatted as DD-MM-YYYY.
 * - Other filters: type (LOAD/UNLOAD), user_id.
 */
router.get('/excel/van-load-unload', allowExcelTokenAuth, excelSync_controller_1.excelSyncController.getVanLoadUnload);
exports.default = router;
//# sourceMappingURL=excelSync.routes.js.map