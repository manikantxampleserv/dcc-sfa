"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmail = exports.cleanupExpiredOTPs = exports.verifyOTP = exports.storeOTP = exports.generateOTP = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[crypto_1.default.randomInt(0, digits.length)];
    }
    return otp;
};
exports.generateOTP = generateOTP;
const storeOTP = async (email, otpCode, ipAddress, userAgent, logInst) => {
    try {
        await prisma_client_1.default.password_reset_otps.updateMany({
            where: {
                email,
                is_active: 'Y',
                is_used: false,
                expires_at: {
                    gt: new Date(),
                },
            },
            data: {
                is_active: 'N',
                updated_at: new Date(),
            },
        });
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await prisma_client_1.default.password_reset_otps.create({
            data: {
                email,
                otp_code: otpCode,
                expires_at: expiresAt,
                ip_address: ipAddress,
                user_agent: userAgent,
                is_active: 'Y',
                createdby: 0,
                log_inst: logInst,
            },
        });
        return true;
    }
    catch (error) {
        console.error('Error storing OTP:', error);
        return false;
    }
};
exports.storeOTP = storeOTP;
const verifyOTP = async (email, otpCode) => {
    try {
        const otpRecord = await prisma_client_1.default.password_reset_otps.findFirst({
            where: {
                email,
                otp_code: otpCode,
                is_active: 'Y',
                is_used: false,
                expires_at: {
                    gt: new Date(),
                },
            },
        });
        if (!otpRecord) {
            return false;
        }
        await prisma_client_1.default.password_reset_otps.update({
            where: {
                id: otpRecord.id,
            },
            data: {
                is_used: true,
                updated_at: new Date(),
            },
        });
        return true;
    }
    catch (error) {
        console.error('Error verifying OTP:', error);
        return false;
    }
};
exports.verifyOTP = verifyOTP;
const cleanupExpiredOTPs = async () => {
    try {
        await prisma_client_1.default.password_reset_otps.updateMany({
            where: {
                expires_at: {
                    lt: new Date(),
                },
                is_active: 'Y',
            },
            data: {
                is_active: 'N',
                updated_at: new Date(),
            },
        });
    }
    catch (error) {
        console.error('Error cleaning up expired OTPs:', error);
    }
};
exports.cleanupExpiredOTPs = cleanupExpiredOTPs;
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
//# sourceMappingURL=otp.util.js.map