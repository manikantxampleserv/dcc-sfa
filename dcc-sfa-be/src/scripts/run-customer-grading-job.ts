import { runCustomerCategoryAssignment } from '../jobs/customerCategoryAssignment.job';
import prisma from '../configs/prisma.client';

async function main() {
  console.log('--- Triggering Customer Category Assignment Job ---');
  try {
    const results = await runCustomerCategoryAssignment();
    console.log('Job finished successfully:', results);
  } catch (error) {
    console.error('Job execution failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();

