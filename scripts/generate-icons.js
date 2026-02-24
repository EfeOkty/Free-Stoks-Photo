const path = require('path');
const fs = require('fs');

const rootDir = path.join(__dirname, '..');
const buildDir = path.join(rootDir, 'build');
const logoSvg = path.join(rootDir, 'public', 'logo.svg');

if (!fs.existsSync(logoSvg)) {
  console.error('public/logo.svg bulunamadı.');
  process.exit(1);
}

if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });

async function main() {
  try {
    const icongen = require('icon-gen');
    await icongen(logoSvg, buildDir, {
      report: true,
      ico: { name: 'icon' },
      icns: { name: 'icon' },
      favicon: undefined
    });
    // Dock (dev) için PNG — Electron main.js icon.png kullanıyor
    const sharp = require('sharp');
    await sharp(logoSvg).resize(1024, 1024).png().toFile(path.join(buildDir, 'icon.png'));
    console.log('build/icon.ico, build/icon.icns ve build/icon.png oluşturuldu.');
  } catch (e) {
    console.error('İkon hatası:', e.message);
    process.exit(1);
  }
}

main();
