"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_config_1 = require("../../configs/jwt.config");
const ipUtils_1 = require("../../utils/ipUtils");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const truncateString = (str, maxLength) => {
    if (!str)
        return 'Unknown';
    return str.length > maxLength ? str.substring(0, maxLength) : str;
};
const generateTokens = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.user_role?.name || user.role,
        parent_id: user.parent_id,
        depot_id: user.depot_id,
        zone_id: user.zone_id,
    };
    const accessToken = jsonwebtoken_1.default.sign(payload, jwt_config_1.jwtConfig.secret, {
        expiresIn: jwt_config_1.jwtConfig.expiresIn,
    });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, jwt_config_1.jwtConfig.secret, {
        expiresIn: jwt_config_1.jwtConfig.refreshExpiresIn,
    });
    return { accessToken, refreshToken };
};
const register = async (req, res) => {
    try {
        const { email, password, name, role_id, parent_id } = req.body;
        const existing = await prisma_client_1.default.users.findFirst({ where: { email } });
        if (existing) {
            return res.error('Email already exists', 400);
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma_client_1.default.users.create({
            data: {
                email,
                password_hash: hashedPassword,
                name,
                role_id: role_id || 1,
                parent_id: parent_id ?? null,
                createdby: 0,
                createdate: new Date(),
                is_active: 'Y',
            },
            include: {
                user_role: true,
            },
        });
        return res.success('User registered successfully', {
            id: user.id,
            email: user.email,
            role: user.user_role?.name,
            name: user.name,
        }, 201);
    }
    catch (error) {
        console.error(error);
        return res.error('Registration failed', 500);
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.error('Email and password are required', 400);
        }
        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.error('Email and password must be strings', 400);
        }
        const user = await prisma_client_1.default.users.findFirst({
            where: { email },
            include: {
                user_role: true,
            },
        });
        if (!user) {
            console.log(`Failed login attempt for unknown user: ${email} from IP: ${(0, ipUtils_1.getClientIP)(req)}`);
            return res.error('User not found', 404);
        }
        if (user.is_active !== 'Y') {
            try {
                const userAgent = req.get('User-Agent') || 'Unknown';
                await prisma_client_1.default.login_history.create({
                    data: {
                        user_id: user.id,
                        login_time: new Date(),
                        ip_address: truncateString((0, ipUtils_1.getClientIP)(req), 50),
                        device_info: truncateString(userAgent, 255),
                        os_info: truncateString(userAgent, 100),
                        app_version: truncateString(req.get('X-App-Version'), 50) || '1.0.0',
                        login_status: 'failed',
                        failure_reason: 'Account inactive',
                        is_active: 'Y',
                        createdate: new Date(),
                        createdby: user.id,
                    },
                });
            }
            catch (error) {
                console.error('Error creating failed login history:', error);
            }
            return res.error('Your account is inactive. Please contact administrator to activate your account.', 403);
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            try {
                const userAgent = req.get('User-Agent') || 'Unknown';
                await prisma_client_1.default.login_history.create({
                    data: {
                        user_id: user.id,
                        login_time: new Date(),
                        ip_address: truncateString((0, ipUtils_1.getClientIP)(req), 50),
                        device_info: truncateString(userAgent, 255),
                        os_info: truncateString(userAgent, 100),
                        app_version: truncateString(req.get('X-App-Version'), 50) || '1.0.0',
                        login_status: 'failed',
                        failure_reason: 'Invalid credentials',
                        is_active: 'Y',
                        createdate: new Date(),
                        createdby: user.id,
                    },
                });
            }
            catch (error) {
                console.error('Error creating failed login history:', error);
            }
            return res.error('Invalid credentials', 400);
        }
        const { accessToken, refreshToken } = generateTokens(user);
        const userAgent = req.get('User-Agent') || 'Unknown';
        const clientIP = (0, ipUtils_1.getClientIP)(req);
        await prisma_client_1.default.api_tokens.create({
            data: {
                user_id: user.id,
                token: accessToken,
                token_type: 'Bearer',
                issued_at: new Date(),
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
                device_id: truncateString(userAgent, 100),
                ip_address: truncateString(clientIP, 50),
                is_active: 'Y',
                created_by: user.id,
                created_date: new Date(),
            },
        });
        try {
            await prisma_client_1.default.login_history.create({
                data: {
                    user_id: user.id,
                    login_time: new Date(),
                    ip_address: truncateString(clientIP, 50),
                    device_info: truncateString(userAgent, 255),
                    os_info: truncateString(userAgent, 100),
                    app_version: truncateString(req.get('X-App-Version'), 50) || '1.0.0',
                    login_status: 'success',
                    is_active: 'Y',
                    createdate: new Date(),
                    createdby: user.id,
                },
            });
        }
        catch (error) {
            console.error('Error creating successful login history:', error);
        }
        return res.success('Login successful', {
            user: {
                id: user.id,
                email: user.email,
                role: user.user_role.name,
                name: user.name,
            },
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: jwt_config_1.jwtConfig.expiresIn,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        if (error?.message?.includes('connection pool') ||
            error?.message?.includes('timeout')) {
            return res.error('Request Time Out. Please check your VPN connection.', 503);
        }
        if (error?.code === 'P2002') {
            return res.error('Database constraint violation. Please try again.', 500);
        }
        if (error?.code === 'P2025') {
            return res.error('Database record not found. Please try again.', 404);
        }
        if (!req.body?.email || !req.body?.password) {
            return res.error('Email and password are required', 400);
        }
        const errorMessage = error?.message || 'An unexpected error occurred during login';
        return res.error(`Login failed: ${errorMessage}`, 500);
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        if (!req.token || !req.user) {
            return res.error('No active session', 400);
        }
        await prisma_client_1.default.api_tokens.updateMany({
            where: {
                token: req.token,
                user_id: req.user.id,
            },
            data: {
                is_revoked: true,
                updated_date: new Date(),
                updated_by: req.user.id,
            },
        });
        await prisma_client_1.default.login_history.updateMany({
            where: {
                user_id: req.user.id,
                logout_time: null,
                login_status: 'success',
            },
            data: {
                logout_time: new Date(),
                updatedate: new Date(),
                updatedby: req.user.id,
            },
        });
        return res.success('Logged out successfully');
    }
    catch (error) {
        console.error(error);
        return res.error('Logout failed', 500);
    }
};
exports.logout = logout;
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.error('Refresh token required', 400);
        const decoded = jsonwebtoken_1.default.verify(refreshToken, jwt_config_1.jwtConfig.secret);
        const user = await prisma_client_1.default.users.findUnique({
            where: { id: decoded.id, is_active: 'Y' },
            include: {
                user_role: true,
            },
        });
        if (!user)
            return res.error('User not found', 404);
        const { accessToken } = generateTokens(user);
        await prisma_client_1.default.api_tokens.create({
            data: {
                user_id: user.id,
                token: accessToken,
                token_type: 'Bearer',
                issued_at: new Date(),
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
                is_active: 'Y',
                created_by: user.id,
                created_date: new Date(),
            },
        });
        return res.success('Token refreshed', {
            accessToken,
            expiresIn: jwt_config_1.jwtConfig.expiresIn,
        });
    }
    catch (error) {
        console.error(error);
        return res.error('Invalid refresh token', 401);
    }
};
exports.refresh = refresh;
//# sourceMappingURL=auth.controller.js.map