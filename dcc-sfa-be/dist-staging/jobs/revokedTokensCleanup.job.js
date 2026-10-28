"use strict";
/**
 * Revoked Tokens Cleanup Job
 * Handles scheduled cleanup of revoked API tokens from the database.
 *
 * @module jobs/revokedTokensCleanup
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleRevokedTokensCleanup = exports.deleteRevokedTokens = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
const logger_1 = __importDefault(require("../configs/logger"));
/**
 * Effective start date for the cleanup job (Oct 29, 2026 night).
 */
const CLEANUP_START_DATE = new Date('2026-10-29T18:00:00');
/**
 * Deletes API tokens (revoked or expired) that are older than one week (7 days).
 * Retains only the most recent one week of API tokens and protects active sessions.
 *
 * @param {number} [retentionDays=7] Number of days of tokens to retain
 * @returns {Promise<number>} Number of deleted tokens
 */
const deleteRevokedTokens = async (retentionDays = 7) => {
    const now = new Date();
    const retentionThreshold = new Date();
    retentionThreshold.setDate(retentionThreshold.getDate() - retentionDays);
    const result = await prisma_client_1.default.api_tokens.deleteMany({
        where: {
            OR: [{ is_revoked: true }, { expires_at: { lt: now } }],
            AND: [
                {
                    OR: [
                        { created_date: { lt: retentionThreshold } },
                        { expires_at: { lt: retentionThreshold } },
                        { issued_at: { lt: retentionThreshold } },
                    ],
                },
            ],
        },
    });
    return result.count;
};
exports.deleteRevokedTokens = deleteRevokedTokens;
/**
 * Schedules the nightly cron job to delete revoked API tokens at 02:00 AM.
 * First execution starts tomorrow night (starting Oct 29 night).
 *
 * @returns {void}
 */
const scheduleRevokedTokensCleanup = () => {
    node_cron_1.default.schedule('0 2 * * *', async () => {
        const now = new Date();
        if (now < CLEANUP_START_DATE) {
            logger_1.default.info(`[RevokedTokensCleanupCron] Skipping run before start date: ${CLEANUP_START_DATE.toISOString()}`);
            return;
        }
        logger_1.default.info(`[RevokedTokensCleanupCron] Starting revoked tokens cleanup at ${now.toISOString()}...`);
        try {
            const deletedCount = await (0, exports.deleteRevokedTokens)();
            logger_1.default.info(`[RevokedTokensCleanupCron] Cleanup completed successfully. Deleted ${deletedCount} revoked tokens.`);
        }
        catch (error) {
            logger_1.default.error(`[RevokedTokensCleanupCron] Failed to delete revoked tokens: ${error instanceof Error ? error.message : error}`);
        }
    }, {
        timezone: process.env.TIMEZONE || 'Asia/Kolkata',
    });
    logger_1.default.info('[RevokedTokensCleanupCron] Revoked tokens cleanup cron job registered (0 2 * * *).');
};
exports.scheduleRevokedTokensCleanup = scheduleRevokedTokensCleanup;
//# sourceMappingURL=revokedTokensCleanup.job.js.map