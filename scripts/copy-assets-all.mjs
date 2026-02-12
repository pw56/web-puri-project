import fs from 'fs-extra'; // または標準の fs/promises

const src = '../assets';
const dest = './public';
const currentDir = process.cwd();

try {
  await fs.remove(dest);
  await fs.ensureDir(dest);
  await fs.copy(src, dest);
  console.log('Assets synced!');
} catch (err) {
  console.error(err);
}
