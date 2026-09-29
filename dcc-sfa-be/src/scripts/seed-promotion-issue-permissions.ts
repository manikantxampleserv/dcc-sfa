import prisma from '../configs/prisma.client';

async function main() {
  const permissions = [
    {
      id: 569,
      name: 'promotion_material_issue_read',
      module: 'Promotion Materials Issue',
      action: 'READ',
      description: 'View and access data for Promotion Materials Issue',
      is_active: 'Y',
      createdate: new Date(),
      createdby: 1,
      updatedate: new Date(),
    },
    {
      id: 570,
      name: 'promotion_material_issue_create',
      module: 'Promotion Materials Issue',
      action: 'CREATE',
      description: 'Create new records for Promotion Materials Issue',
      is_active: 'Y',
      createdate: new Date(),
      createdby: 1,
      updatedate: new Date(),
    },
    {
      id: 571,
      name: 'promotion_material_issue_update',
      module: 'Promotion Materials Issue',
      action: 'UPDATE',
      description: 'Modify existing records for Promotion Materials Issue',
      is_active: 'Y',
      createdate: new Date(),
      createdby: 1,
      updatedate: new Date(),
    },
    {
      id: 572,
      name: 'promotion_material_issue_delete',
      module: 'Promotion Materials Issue',
      action: 'DELETE',
      description: 'Remove records for Promotion Materials Issue',
      is_active: 'Y',
      createdate: new Date(),
      createdby: 1,
      updatedate: new Date(),
    },
  ];

  try {
    let sqlBatch = 'SET IDENTITY_INSERT permissions ON;\n';

    for (const p of permissions) {
      const createdate = p.createdate.toISOString().slice(0, 19).replace('T', ' ');
      const updatedate = p.updatedate.toISOString().slice(0, 19).replace('T', ' ');
      
      sqlBatch += `
        IF NOT EXISTS (SELECT 1 FROM permissions WHERE id = ${p.id})
        BEGIN
          INSERT INTO permissions (id, name, module, action, description, is_active, createdate, createdby, updatedate)
          VALUES (${p.id}, '${p.name}', '${p.module}', '${p.action}', '${p.description}', '${p.is_active}', '${createdate}', ${p.createdby}, '${updatedate}');
        END
      `;
    }

    sqlBatch += '\nSET IDENTITY_INSERT permissions OFF;';

    await prisma.$executeRawUnsafe(sqlBatch);
    console.log('Successfully seeded Promotion Materials Issue permissions.');
  } catch (error) {
    console.error('Error seeding permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
