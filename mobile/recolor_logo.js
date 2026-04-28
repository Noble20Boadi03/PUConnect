const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const targetColor = '#1e2d5a';
const inputFiles = [
  'assets/images/splash-icon.png',
  'assets/images/icon.png',
  'assets/images/puconnect_logo.png',
  'assets/images/favicon.png'
];

async function recolor(filePath) {
  const fullPath = path.resolve(__dirname, filePath);
  if (!fs.existsSync(fullPath)) return;
  
  const tempPath = fullPath + '.tmp.png';
  
  try {
    const metadata = await sharp(fullPath).metadata();
    
    const solidColor = await sharp({
      create: {
        width: metadata.width,
        height: metadata.height,
        channels: 4,
        background: targetColor
      }
    }).png().toBuffer();
    
    await sharp(fullPath)
      .composite([{
        input: solidColor,
        blend: 'in'
      }])
      .toFile(tempPath);
      
    fs.renameSync(tempPath, fullPath);
    console.log(`Recolored ${filePath}`);
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

async function main() {
  for (const file of inputFiles) {
    await recolor(file);
  }
}

main();
