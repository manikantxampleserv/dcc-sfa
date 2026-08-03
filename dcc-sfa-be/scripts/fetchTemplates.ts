import prisma from '../src/configs/prisma.client';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const templates = await prisma.sfa_d_templates.findMany();
  const filePath = path.join(__dirname, '../src/utils/seeders/data/sfa_d_templates.json');
  fs.writeFileSync(filePath, JSON.stringify(templates, null, 2), 'utf8');
  console.log(`Saved ${templates.length} templates to ${filePath}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
