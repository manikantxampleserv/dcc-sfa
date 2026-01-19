"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfig = void 0;
exports.jwtConfig = {
    secret: process.env.JWT_SECRET || 'SFA_SECRET_KEY',
    expiresIn: '24h',
    refreshExpiresIn: '7d',
};
//# sourceMappingURL=jwt.config.js.map