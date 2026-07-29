export declare const generateOTP: (length?: number) => string;
export declare const storeOTP: (email: string, otpCode: string, ipAddress?: string, userAgent?: string, logInst?: number) => Promise<boolean>;
export declare const verifyOTP: (email: string, otpCode: string) => Promise<boolean>;
export declare const cleanupExpiredOTPs: () => Promise<void>;
export declare const isValidEmail: (email: string) => boolean;
//# sourceMappingURL=otp.util.d.ts.map