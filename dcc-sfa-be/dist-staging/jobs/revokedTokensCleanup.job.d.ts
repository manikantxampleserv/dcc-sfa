/**
 * Revoked Tokens Cleanup Job
 * Handles scheduled cleanup of revoked API tokens from the database.
 *
 * @module jobs/revokedTokensCleanup
 */
/**
 * Deletes API tokens (revoked or expired) that are older than one week (7 days).
 * Retains only the most recent one week of API tokens and protects active sessions.
 *
 * @param {number} [retentionDays=7] Number of days of tokens to retain
 * @returns {Promise<number>} Number of deleted tokens
 */
export declare const deleteRevokedTokens: (retentionDays?: number) => Promise<number>;
/**
 * Schedules the nightly cron job to delete revoked API tokens at 02:00 AM.
 * First execution starts tomorrow night (starting Oct 29 night).
 *
 * @returns {void}
 */
export declare const scheduleRevokedTokensCleanup: () => void;
//# sourceMappingURL=revokedTokensCleanup.job.d.ts.map