import fs from 'fs-extra'; // または標準の fs/promises

const appIconsSrc = '../assets/app-icons';
const fontSrc = '../assets/fonts';
const dest = './public';

try {  
  await fs.remove(dest);
  await fs.ensureDir(dest);
  await fs.copy(appIconsSrc, dest);
  await fs.copy(fontSrc, dest);
  console.log('Assets synced!');
} catch (err) {
  console.error(err);
}
