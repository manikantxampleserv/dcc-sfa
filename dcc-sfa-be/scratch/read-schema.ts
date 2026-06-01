import fs from 'fs';
import path from 'path';

function main() {
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  console.log(`Reading schema from: ${schemaPath}`);
  
  const buffer = fs.readFileSync(schemaPath);
  
  // Try utf8 first
  let content = buffer.toString('utf8');
  let encoding = 'utf8';
  
  if (!content.includes('model ') && !content.includes('datasource ')) {
    content = buffer.toString('utf16le');
    encoding = 'utf16le';
  }
  
  console.log(`Detected encoding: ${encoding}`);
  
  const lines = content.split(/\r?\n/);
  let inModel = false;
  let modelContent: string[] = [];
  let modelName = '';
  
  // Let's find any model that contains "inventory_stock" or similar
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('model ') && trimmed.toLowerCase().includes('inventory_stock')) {
      inModel = true;
      const match = trimmed.match(/model\s+(\w+)/);
      modelName = match ? match[1] : '';
    }
    
    if (inModel) {
      modelContent.push(line);
      if (trimmed === '}') {
        inModel = false;
      }
    }
  }
  
  console.log(`\n=== MODEL ${modelName || 'inventory_stock'} ===`);
  if (modelContent.length > 0) {
    console.log(modelContent.join('\n'));
  } else {
    console.log('Model not found in schema.prisma. Showing first 100 lines:');
    console.log(lines.slice(0, 100).join('\n'));
  }
}

main();

