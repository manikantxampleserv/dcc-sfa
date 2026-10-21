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
         * Use dynamic SQL to avoid SQL Server compile-time column resolution error
         * when material_id column does not exist yet.
         */
        await prisma_client_1.default.$executeRawUnsafe(`
      IF EXISTS (
        SELECT 1 FROM sys.columns 
        WHERE object_id = OBJECT_ID('promotion_materials_issue_items') 
        AND name = 'material_id'
      )
      BEGIN
        EXEC sp_executesql N'DELETE FROM promotion_materials_issue_items WHERE material_id IS NULL;';
      END
      ELSE
      BEGIN
        DELETE FROM promotion_materials_issue_items;
      END
    `);
        console.log('Successfully cleaned up legacy rows from promotion_materials_issue_items.');
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