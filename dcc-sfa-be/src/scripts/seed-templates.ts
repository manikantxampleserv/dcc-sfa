import prisma from '../configs/prisma.client';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const model = 'sfa_d_templates';
  const filePath = path.join(__dirname, '../utils/seeders/data/sfa_d_templates.json');
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  if (data.length === 0) {
    console.log('No templates to seed.');
    return;
  }
  
  console.log(`Seeding ${model}... (${data.length} records)`);
  
  const formattedData = data.map((item: any) => {
    const formatted = { ...item };
    for (const [key, value] of Object.entries(formatted)) {
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
        formatted[key] = new Date(value);
      }
    }
    return formatted;
  });

  try {
    const hasIdentity: any[] = await prisma.$queryRawUnsafe(`SELECT 1 as has_ident FROM sys.identity_columns WHERE OBJECT_NAME(object_id) = '${model}'`);
    const isIdentity = hasIdentity.length > 0;

    let sqlBatch = '';
    if (isIdentity) {
      sqlBatch += `SET IDENTITY_INSERT ${model} ON;\n`;
    }

    const columns = Object.keys(formattedData[0]);
    const escapedColumns = columns.map(col => `[${col}]`);
    
    for (const row of formattedData) {
      const values = columns.map(col => {
        const val = row[col];
        if (val === null || val === undefined) return 'NULL';
        if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        if (typeof val === 'boolean') return val ? 1 : 0;
        return val;
      });

      sqlBatch += `INSERT INTO [${model}] (${escapedColumns.join(', ')}) VALUES (${values.join(', ')});\n`;
    }

    if (isIdentity) {
      sqlBatch += `SET IDENTITY_INSERT ${model} OFF;\n`;
    }

    try {
      await prisma.$executeRawUnsafe(sqlBatch);
      console.log(`Successfully seeded ${model}`);
    } catch (insertErr: any) {
      if (!insertErr.message.includes('Violation of PRIMARY KEY constraint')) {
         throw insertErr;
      } else {
         console.log(`Skipped ${model} (Already exists / PK Violation)`);
      }
    }
  } catch (e: any) {
    console.error(`Error seeding ${model}:`, e.message);
  }
}

main().finally(() => prisma.$disconnect());
