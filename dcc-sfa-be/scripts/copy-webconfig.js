const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const sourcePath = path.join(projectRoot, 'web.config');
const targets = ['dist', 'dist-staging', 'dist-production'];

if (fs.existsSync(sourcePath)) {
  for (const target of targets) {
    const targetDir = path.join(projectRoot, target);
    if (!fs.existsSync(targetDir)) {
      continue;
    }
    const targetPath = path.join(targetDir, 'web.config');
    fs.copyFileSync(sourcePath, targetPath);
  }
}

