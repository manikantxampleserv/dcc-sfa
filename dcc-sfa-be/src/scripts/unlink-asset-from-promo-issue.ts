import prisma from '../configs/prisma.client';

/**
 * Script to safely remove legacy NULL material_id items from promotion_materials_issue_items
 * so Prisma can mark material_id as required (NOT NULL) without data conflicts.
 */
async function cleanLegacyNullMaterialItems() {
  try {
    /**
     * Remove the 3 legacy items where material_id was NULL
     */
    const deletedCount = await prisma.$executeRawUnsafe(`
      DELETE FROM promotion_materials_issue_items WHERE material_id IS NULL;
    `);

    console.log(
      `Successfully cleaned up ${deletedCount} legacy items with NULL material_id.`
    );
  } catch (error) {
    console.error('Error cleaning up legacy null material_id items:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanLegacyNullMaterialItems();
