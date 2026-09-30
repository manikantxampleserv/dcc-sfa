"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfig = exports.getNext1130PM = void 0;
/**
 * Calculates the next occurrence of 11:30 PM (23:30) and returns the Date object and remaining seconds.
 * @returns {{ expiresAt: Date, expiresInSeconds: number }}
 */
const getNext1130PM = () => {
    const now = new Date();
    const target = new Date(now);
    target.setHours(23, 30, 0, 0);
    if (now.getTime() >= target.getTime()) {
        target.setDate(target.getDate() + 1);
    }
    const expiresInSeconds = Math.max(1, Math.floor((target.getTime() - now.getTime()) / 1000));
    return { expiresAt: target, expiresInSeconds };
};
exports.getNext1130PM = getNext1130PM;
exports.jwtConfig = {
    secret: process.env.JWT_SECRET || 'SFA_SECRET_KEY',
    expiresIn: '24h',
    refreshExpiresIn: '7d',
    getNext1130PM: exports.getNext1130PM,
};
//# sourceMappingURL=jwt.config.js.map