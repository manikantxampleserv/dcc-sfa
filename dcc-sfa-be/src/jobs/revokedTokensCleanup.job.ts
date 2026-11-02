/**
 * Revoked Tokens Cleanup Job
 * Handles scheduled cleanup of revoked API tokens from the database.
 *
 * @module jobs/revokedTokensCleanup
 */

import cron from 'node-cron';
import prisma from '../configs/prisma.client';
import logger from '../configs/logger';

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
export const deleteRevokedTokens = async (
  retentionDays: number = 7
): Promise<number> => {
  const now = new Date();
  const retentionThreshold = new Date();
  retentionThreshold.setDate(retentionThreshold.getDate() - retentionDays);

  const result = await prisma.api_tokens.deleteMany({
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

/**
 * Schedules the nightly cron job to delete revoked API tokens at 02:00 AM.
 * First execution starts tomorrow night (starting Oct 29 night).
 *
 * @returns {void}
 */
export const scheduleRevokedTokensCleanup = (): void => {
  cron.schedule(
    '0 2 * * *',
    async () => {
      const now = new Date();
      if (now < CLEANUP_START_DATE) {
        logger.info(
          `[RevokedTokensCleanupCron] Skipping run before start date: ${CLEANUP_START_DATE.toISOString()}`
        );
        return;
      }

      logger.info(
        `[RevokedTokensCleanupCron] Starting revoked tokens cleanup at ${now.toISOString()}...`
      );

      try {
        const deletedCount = await deleteRevokedTokens();
        logger.info(
          `[RevokedTokensCleanupCron] Cleanup completed successfully. Deleted ${deletedCount} revoked tokens.`
        );
      } catch (error) {
        logger.error(
          `[RevokedTokensCleanupCron] Failed to delete revoked tokens: ${error instanceof Error ? error.message : error}`
        );
      }
    },
    {
      timezone: process.env.TIMEZONE || 'Asia/Kolkata',
    }
  );

  logger.info(
    '[RevokedTokensCleanupCron] Revoked tokens cleanup cron job registered (0 2 * * *).'
  );
};
