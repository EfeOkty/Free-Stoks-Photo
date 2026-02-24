const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const standaloneDir = path.join(root, '.next', 'standalone');
const outDir = path.join(root, 'electron-app');
const siteUrl = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || '').trim();
const isLocal = /localhost|127\.0\.0\.1/i.test(siteUrl);

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });

if (isLocal) {
  if (!fs.existsSync(standaloneDir)) {
    console.error('Run "next build" first. .next/standalone not found.');
    process.exit(1);
  }
  copyRecursive(standaloneDir, outDir);
  const staticSrc = path.join(root, '.next', 'static');
  const staticDest = path.join(outDir, '.next', 'static');
  if (fs.existsSync(staticSrc)) copyRecursive(staticSrc, staticDest);
  const publicDir = path.join(root, 'public');
  if (fs.existsSync(publicDir)) copyRecursive(publicDir, path.join(outDir, 'public'));
}

fs.writeFileSync(path.join(outDir, 'config.json'), JSON.stringify({ siteUrl: siteUrl || null }, null, 2));
console.log('Electron app ready.', siteUrl ? (isLocal ? `Local: ${siteUrl}` : `Site: ${siteUrl}`) : 'Set SITE_URL in .env');
