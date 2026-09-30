/**
 * Calculates the next occurrence of 11:30 PM (23:30) and returns the Date object and remaining seconds.
 * @returns {{ expiresAt: Date, expiresInSeconds: number }}
 */
export declare const getNext1130PM: () => {
    expiresAt: Date;
    expiresInSeconds: number;
};
export declare const jwtConfig: {
    secret: string;
    expiresIn: "24h";
    refreshExpiresIn: "7d";
    getNext1130PM: () => {
        expiresAt: Date;
        expiresInSeconds: number;
    };
};
//# sourceMappingURL=jwt.config.d.ts.map