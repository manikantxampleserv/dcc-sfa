"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyResetOtp = exports.forgotPassword = exports.refresh = exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_config_1 = require("../../configs/jwt.config");
const ipUtils_1 = require("../../utils/ipUtils");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const otp_util_1 = require("../../utils/otp.util");
const mailer_1 = require("../../utils/mailer");
const truncateString = (str, maxLength) => {
    if (!str)
        return 'Unknown';
    return str.length > maxLength ? str.substring(0, maxLength) : str;
};
const generateTokens = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        employee_id: user.employee_id,
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
        const { email, password, name, role_id, parent_id, employee_id } = req.body;
        const existing = await prisma_client_1.default.users.findFirst({ where: { email } });
        if (existing) {
            return res.error('Email already exists', 400);
        }
        if (employee_id) {
            const existingEmployeeId = await prisma_client_1.default.users.findFirst({
                where: { employee_id },
            });
            if (existingEmployeeId) {
                return res.error('Employee ID already exists', 400);
            }
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma_client_1.default.users.create({
            data: {
                email,
                password_hash: hashedPassword,
                name,
                role_id: role_id || 1,
                parent_id: parent_id ?? null,
                employee_id: employee_id || null,
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
        const { email, username, password } = req.body;
        if (!password) {
            return res.error('Password is required', 400);
        }
        const identifier = email || username;
        if (!identifier) {
            return res.error('Email or username is required', 400);
        }
        if (typeof identifier !== 'string') {
            return res.error('Email/username must be a string', 400);
        }
        if (typeof password !== 'string') {
            return res.error('Password must be a string', 400);
        }
        const user = await prisma_client_1.default.users.findFirst({
            where: {
                OR: [{ email: identifier }, { employee_id: identifier }],
            },
            include: {
                user_role: true,
            },
        });
        if (!user) {
            console.log(`Failed login attempt for unknown user: ${identifier} from IP: ${(0, ipUtils_1.getClientIP)(req)}`);
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
        if (!req.body?.password) {
            return res.error('Password is required', 400);
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
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.error('Email is required', 400);
        }
        if (!(0, otp_util_1.isValidEmail)(email)) {
            return res.error('Invalid email format', 400);
        }
        const user = await prisma_client_1.default.users.findFirst({
            where: {
                email,
                is_active: 'Y',
            },
        });
        if (!user) {
            return res.error('No user associated with this email', 400);
        }
        const otpCode = (0, otp_util_1.generateOTP)(6);
        const ipAddress = (0, ipUtils_1.getClientIP)(req);
        const userAgent = req.get('User-Agent') || 'Unknown';
        const otpStored = await (0, otp_util_1.storeOTP)(email, otpCode, ipAddress, userAgent, user.parent_id || undefined);
        if (!otpStored) {
            return res.error('Failed to generate OTP. Please try again.', 500);
        }
        try {
            const emailHtml = `<!DOCTYPE html>
<html>
<body style="font-family:Arial, sans-serif;background:#f5f7fb;padding:40px">

<table align="center" width="500" style="background:#ffffff;border-radius:8px;padding:30px">
<tr>
<td align="center">

<h2 style="color:#333;">Reset Your Password</h2>

<p style="color:#666;">
Hi <b>${user.name}</b>, <br>
We received a request to reset your password.
</p>

<div style="
font-size:34px;
letter-spacing:8px;
background:#f2f4f8;
padding:15px;
margin:25px 0;
border-radius:6px;
font-weight:bold;
color:#111;
">
${otpCode}
</div>

<p style="color:#777;font-size:14px">
This OTP will expire in <b>15 minutes</b>.
</p>

<p style="color:#999;font-size:13px">
If you didn't request this, please ignore this email.
</p>

<hr style="margin:30px 0">

<p style="font-size:12px;color:#aaa">
© 2026 DCC-SFA
</p>

</td>
</tr>
</table>

</body>
</html>`;
            const emailSent = await (0, mailer_1.sendEmail)({
                to: email,
                subject: 'Password Reset OTP',
                html: emailHtml,
                log_inst: user.parent_id || undefined,
            });
            if (!emailSent) {
                console.error('Failed to send OTP email to:', email);
                return res.error('Failed to send OTP email. Please try again.', 500);
            }
            console.log(`Password reset OTP sent to ${email}: ${otpCode}`);
            return res.success('Password reset OTP has been sent to your email.');
        }
        catch (emailError) {
            console.error('Error generating/sending OTP email:', emailError);
            return res.error('Failed to send OTP email. Please try again.', 500);
        }
    }
    catch (error) {
        console.error('Forgot password error:', error);
        return res.error('Failed to process forgot password request', 500);
    }
};
exports.forgotPassword = forgotPassword;
const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.error('Email and OTP are required', 400);
        }
        if (!(0, otp_util_1.isValidEmail)(email)) {
            return res.error('Invalid email format', 400);
        }
        const otpValid = await (0, otp_util_1.verifyOTP)(email, otp);
        if (!otpValid) {
            return res.error('Invalid or expired OTP', 400);
        }
        const user = await prisma_client_1.default.users.findFirst({
            where: { email, is_active: 'Y' },
        });
        if (!user) {
            return res.error('User not found', 404);
        }
        const resetToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, purpose: 'password_reset' }, jwt_config_1.jwtConfig.secret, { expiresIn: '5m' });
        console.log(`OTP verified — reset token issued for: ${email}`);
        return res.success('OTP verified successfully. You may now set a new password.', {
            resetToken,
        });
    }
    catch (error) {
        console.error('Verify OTP error:', error);
        return res.error('Failed to verify OTP', 500);
    }
};
exports.verifyResetOtp = verifyResetOtp;
const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        if (!resetToken || !newPassword) {
            return res.error('Reset token and new password are required', 400);
        }
        if (newPassword.length < 6) {
            return res.error('Password must be at least 6 characters long', 400);
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(resetToken, jwt_config_1.jwtConfig.secret);
        }
        catch (err) {
            return res.error('Reset token is invalid or has expired. Please request a new OTP.', 400);
        }
        if (decoded.purpose !== 'password_reset') {
            return res.error('Invalid reset token', 400);
        }
        const user = await prisma_client_1.default.users.findFirst({
            where: { id: decoded.id, email: decoded.email, is_active: 'Y' },
        });
        if (!user) {
            return res.error('User not found', 404);
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await prisma_client_1.default.users.update({
            where: { id: user.id },
            data: {
                password_hash: hashedPassword,
                updatedate: new Date(),
                updatedby: user.id,
            },
        });
        await prisma_client_1.default.api_tokens.updateMany({
            where: { user_id: user.id, is_revoked: false },
            data: {
                is_revoked: true,
                updated_date: new Date(),
                updated_by: user.id,
            },
        });
        console.log(`Password reset successfully for user: ${decoded.email}`);
        return res.success('Password has been reset successfully. Please login with your new password.');
    }
    catch (error) {
        console.error('Reset password error:', error);
        return res.error('Failed to reset password', 500);
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=auth.controller.js.map