/**
 * Diagnostic script to inspect API token date breakdown and retention stats.
 * Read-only: does not modify or delete any data.
 *
 * @module scripts/check-token-stats
 */

import prisma from '../configs/prisma.client';

/**
 * Analyzes and displays API token distribution by status and age.
 *
 * @returns {Promise<void>}
 */
async function checkStats(): Promise<void> {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalCount,
      activeCount,
      revokedCount,
      expiredCount,
      olderThan7Days,
      within7Days,
      oldestToken,
      newestToken,
    ] = await Promise.all([
      prisma.api_tokens.count(),
      prisma.api_tokens.count({
        where: {
          is_active: 'Y',
          is_revoked: false,
          OR: [{ expires_at: null }, { expires_at: { gte: now } }],
        },
      }),
      prisma.api_tokens.count({
        where: { is_revoked: true },
      }),
      prisma.api_tokens.count({
        where: {
          expires_at: { lt: now },
          is_revoked: false,
        },
      }),
      prisma.api_tokens.count({
        where: {
          OR: [
            { created_date: { lt: sevenDaysAgo } },
            { issued_at: { lt: sevenDaysAgo } },
            { expires_at: { lt: sevenDaysAgo } },
          ],
        },
      }),
      prisma.api_tokens.count({
        where: {
          OR: [
            { created_date: { gte: sevenDaysAgo } },
            { issued_at: { gte: sevenDaysAgo } },
          ],
        },
      }),
      prisma.api_tokens.findFirst({
        orderBy: { id: 'asc' },
        select: {
          id: true,
          created_date: true,
          issued_at: true,
          expires_at: true,
        },
      }),
      prisma.api_tokens.findFirst({
        orderBy: { id: 'desc' },
        select: {
          id: true,
          created_date: true,
          issued_at: true,
          expires_at: true,
        },
      }),
    ]);

    console.log('--- API Tokens Diagnostic Report ---');
    console.log(`Total Tokens:          ${totalCount}`);
    console.log(`Active Tokens:         ${activeCount}`);
    console.log(`Revoked Tokens:        ${revokedCount}`);
    console.log(`Expired Tokens:        ${expiredCount}`);
    console.log('------------------------------------');
    console.log(`Tokens Older than 7d:  ${olderThan7Days}`);
    console.log(`Tokens Within 7d:      ${within7Days}`);
    console.log('Oldest Token in DB:   ', oldestToken);
    console.log('Newest Token in DB:   ', newestToken);
    console.log('------------------------------------');
  } catch (error) {
    console.error('Failed to inspect token stats:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStats();

