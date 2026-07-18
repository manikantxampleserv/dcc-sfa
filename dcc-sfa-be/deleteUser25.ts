import prisma from './src/configs/prisma.client';

async function deleteAllUserData(userId: number) {
  console.log(`Starting dynamic cleanup for User ID: ${userId}...`);

  try {
    // 1. Manually handle deep nested children that would block their parents from being deleted
    console.log('Deleting deep children...');

    const userInvoices = await prisma.invoices.findMany({
      where: { salesperson_id: userId },
    });
    if (userInvoices.length > 0) {
      await prisma.invoice_items.deleteMany({
        where: { parent_id: { in: userInvoices.map(i => i.id) } },
      });
    }

    const userRecons = await prisma.reconciliation.findMany({
      where: { salesman_id: userId },
    });
    if (userRecons.length > 0) {
      await prisma.reconciliation_items.deleteMany({
        where: { reconciliation_id: { in: userRecons.map(r => r.id) } },
      });
    }

    const userVanInvs = await prisma.van_inventory.findMany({
      where: { user_id: userId },
    });
    if (userVanInvs.length > 0) {
      await prisma.stock_movements.deleteMany({
        where: { van_inventory_id: { in: userVanInvs.map(v => v.id) } },
      });
    }

    // 2. Dynamically find all tables referencing `users`
    const fks: any[] = await prisma.$queryRaw`
      SELECT 
          tp.name AS table_name,
          cp.name AS column_name
      FROM sys.foreign_keys fk
      INNER JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
      INNER JOIN sys.tables tr ON fk.referenced_object_id = tr.object_id
      INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
      INNER JOIN sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
      WHERE tr.name = 'users'
    `;

    console.log(`Found ${fks.length} relations referencing the users table.`);

    // 3. For each table, delete the records linked to this user
    for (const fk of fks) {
      const { table_name, column_name } = fk;
      if (table_name === 'users') continue; // Skip self-references (e.g. reporting_to) to avoid deleting other users

      try {
        const result: number = await prisma.$executeRawUnsafe(
          `DELETE FROM ${table_name} WHERE ${column_name} = ${userId}`
        );
        if (result > 0) {
          console.log(
            `[Deleted] ${result} records from ${table_name} (via ${column_name})`
          );
        }
      } catch (e: any) {
        console.error(
          `[Warning] Could not delete from ${table_name}.${column_name}: ${e.message}`
        );
      }
    }

    // Notice we do NOT delete the user!
    console.log(
      `\nSuccessfully deleted all associated data for User ID: ${userId}, but kept the user record.`
    );
  } catch (error: any) {
    console.error(`\nFailed to clean up data for user ${userId}.`);
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Pass the user ID you want to clean up
deleteAllUserData(25);
