"use strict";
/**
 * One-time script to delete API tokens (revoked and expired) older than one week.
 *
 * @module scripts/delete-revoked-tokens
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
const revokedTokensCleanup_job_1 = require("../jobs/revokedTokensCleanup.job");
/**
 * Executes a one-time cleanup of API tokens older than one week from the database.
 *
 * @returns {Promise<void>}
 */
async function runOnce() {
    try {
        console.log('Starting one-time cleanup of tokens (revoked/expired) older than 7 days...');
        const count = await (0, revokedTokensCleanup_job_1.deleteRevokedTokens)(0);
        console.log(`Successfully deleted ${count} tokens older than 7 days. Only last 7 days are retained.`);
    }
    catch (error) {
        console.error('Failed to delete tokens:', error);
    }
    finally {
        await prisma_client_1.default.$disconnect();
    }
}
runOnce();
//# sourceMappingURL=delete-revoked-tokens.js.map