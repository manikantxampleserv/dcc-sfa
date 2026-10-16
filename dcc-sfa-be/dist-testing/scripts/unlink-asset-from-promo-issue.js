"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
/**
 * Script to safely remove legacy NULL material_id items from promotion_materials_issue_items
 * so Prisma can mark material_id as required (NOT NULL) without data conflicts.
 */
async function cleanLegacyNullMaterialItems() {
    try {
        /**
         * Remove the 3 legacy items where material_id was NULL
         */
        const deletedCount = await prisma_client_1.default.$executeRawUnsafe(`
      DELETE FROM promotion_materials_issue_items WHERE material_id IS NULL;
    `);
        console.log(`Successfully cleaned up ${deletedCount} legacy items with NULL material_id.`);
    }
    catch (error) {
        console.error('Error cleaning up legacy null material_id items:', error);
    }
    finally {
        await prisma_client_1.default.$disconnect();
    }
}
cleanLegacyNullMaterialItems();
//# sourceMappingURL=unlink-asset-from-promo-issue.js.map