const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyDir(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function build() {
  console.log('Building for Alibaba Cloud ESA deployment...');

  ensureDir(DIST_DIR);

  const rootDir = path.join(__dirname, '..');

  fs.copyFileSync(
    path.join(rootDir, 'index.html'),
    path.join(DIST_DIR, 'index.html')
  );
  console.log('Copied index.html');

  copyDir(
    path.join(rootDir, 'data'),
    path.join(DIST_DIR, 'data')
  );
  console.log('Copied data/');

  copyDir(
    path.join(rootDir, 'api'),
    path.join(DIST_DIR, 'api')
  );
  console.log('Copied api/');

  console.log('Build complete! Output directory: dist/');
}

build();
