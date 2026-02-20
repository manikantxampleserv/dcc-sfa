import { copyFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const sourcePath = path.join(projectRoot, 'web.config');
const targets = ['dist-staging', 'dist-production'];

if (existsSync(sourcePath)) {
  for (const target of targets) {
    const targetDir = path.join(projectRoot, target);
    if (!existsSync(targetDir)) {
      continue;
    }
    const targetPath = path.join(targetDir, 'web.config');
    copyFileSync(sourcePath, targetPath);
  }
}

