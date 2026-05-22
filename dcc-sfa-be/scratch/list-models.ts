import fs from 'fs';
import path from 'path';

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const buffer = fs.readFileSync(schemaPath);
let content = buffer.toString('utf8');
if (!content.includes('model ')) content = buffer.toString('utf16le');

const models = [...content.matchAll(/^model\s+(\w+)\s*\{/gm)].map(m => m[1]);
console.log('All models:\n', models.filter(m =>
  /van|invoice|order|stock|movement/i.test(m)
).join('\n'));
