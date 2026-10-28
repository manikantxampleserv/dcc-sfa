/**
 * One-time script to delete API tokens (revoked and expired) older than one week.
 *
 * @module scripts/delete-revoked-tokens
 */

import prisma from '../configs/prisma.client';
import { deleteRevokedTokens } from '../jobs/revokedTokensCleanup.job';

/**
 * Executes a one-time cleanup of API tokens older than one week from the database.
 *
 * @returns {Promise<void>}
 */
async function runOnce(): Promise<void> {
  try {
    console.log(
      'Starting one-time cleanup of tokens (revoked/expired) older than 7 days...'
    );
    const count = await deleteRevokedTokens(0);
    console.log(
      `Successfully deleted ${count} tokens older than 7 days. Only last 7 days are retained.`
    );
  } catch (error) {
    console.error('Failed to delete tokens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runOnce();
