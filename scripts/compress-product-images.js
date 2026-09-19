// One-off tool: shrinks the oversized product images in public/products-image
// in place (same filename/extension, so nothing referencing them needs to change).
// Run with: node scripts/compress-product-images.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR = path.join(__dirname, '..', 'public', 'products-image');
const MAX_DIM = 1400;

async function run() {
  const files = fs.readdirSync(DIR).filter((f) => /\.(png|jpe?g)$/i.test(f));
  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const filePath = path.join(DIR, file);
    const before = fs.statSync(filePath).size;
    const isPng = /\.png$/i.test(file);

    const pipeline = sharp(filePath).resize({
      width: MAX_DIM,
      height: MAX_DIM,
      fit: 'inside',
      withoutEnlargement: true,
    });

    const buffer = isPng
      ? await pipeline.png({ palette: true, quality: 90, compressionLevel: 9, effort: 10 }).toBuffer()
      : await pipeline.jpeg({ quality: 85, mozjpeg: true }).toBuffer();

    // Safety net: keep the original if re-encoding somehow grew the file.
    if (buffer.length < before) {
      fs.writeFileSync(filePath, buffer);
    }

    const after = fs.statSync(filePath).size;
    totalBefore += before;
    totalAfter += after;
    console.log(
      `${file}: ${(before / 1024 / 1024).toFixed(2)}MB -> ${(after / 1024).toFixed(0)}KB`
    );
  }

  console.log('---');
  console.log(`Total: ${(totalBefore / 1024 / 1024).toFixed(1)}MB -> ${(totalAfter / 1024 / 1024).toFixed(1)}MB`);
}

run();
