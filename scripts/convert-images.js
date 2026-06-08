const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

// Collect all source files:
// 1. *-source.jpg files
// 2. Original .webp files that are NOT already sized variants (no -640, -1024, -1920)
const allFiles = fs.readdirSync(assetsDir);
const srcFiles = allFiles.filter(f => {
  if (f.endsWith('-source.jpg')) return true;
  if (f.endsWith('.webp') && !f.includes('-640') && !f.includes('-1024') && !f.includes('-1920')) return true;
  return false;
});

// Skip logo.webp from responsive variants (it's used as-is)
const filesToConvert = srcFiles.filter(f => f !== 'logo.webp');

const sizes = [640, 1024, 1920];

async function convert() {
  let total = 0;
  for (const file of filesToConvert) {
    // Derive base name: remove '-source' and extension
    const name = file
      .replace('-source', '')
      .replace(/\.(jpg|webp)$/, '');

    const src = path.join(assetsDir, file);

    for (const w of sizes) {
      // AVIF
      await sharp(src).resize(w).avif({ quality: 60 }).toFile(path.join(assetsDir, `${name}-${w}.avif`));
      total++;
      // WebP
      await sharp(src).resize(w).webp({ quality: 80 }).toFile(path.join(assetsDir, `${name}-${w}.webp`));
      total++;
    }

    // JPEG fallback at 1920
    await sharp(src).resize(1920).jpeg({ quality: 85 }).toFile(path.join(assetsDir, `${name}-1920.jpg`));
    total++;

    console.log(`✓ ${file} → ${name} (7 variants)`);
  }
  console.log(`\nDone: ${total} files generated from ${filesToConvert.length} sources`);
}

convert().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
