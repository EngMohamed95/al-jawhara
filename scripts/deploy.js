/**
 * deploy.js — رفع build على السيرفر تلقائياً
 * تشغيل: npm run deploy
 */
const ftp  = require('basic-ftp');
const path = require('path');
const { execSync } = require('child_process');

const FTP = {
  host: 'aljawhara.matix.one',
  user: 'aljawharamatix',
  password: '^!Z~-VWSpQe*,.lk',
  secure: true,
  secureOptions: { rejectUnauthorized: false },
  port: 21,
};

const BUILD_DIR  = path.join(__dirname, '..', 'build');
const REMOTE_DIR = '/public_html';

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    console.log('\n📦 Uploading build to server...');
    await client.access(FTP);
    await client.ensureDir(REMOTE_DIR);
    await client.clearWorkingDir();
    await client.uploadFromDir(BUILD_DIR);
    console.log('✅ Server updated: https://aljawhara.matix.one\n');
  } catch (err) {
    console.error('❌ FTP Error:', err.message);
    process.exit(1);
  } finally {
    client.close();
  }

  // Git push
  try {
    console.log('📤 Pushing to GitHub...');
    execSync('git add -A', { stdio: 'inherit' });
    const date = new Date().toISOString().slice(0, 16).replace('T', ' ');
    execSync(`git commit -m "deploy: ${date}" --allow-empty`, { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('✅ GitHub updated\n');
  } catch (err) {
    console.error('⚠️  Git push failed:', err.message);
  }

  console.log('🎉 Done!');
  console.log('   🌐 Live:   https://aljawhara.matix.one');
  console.log('   📦 GitHub: https://github.com/EngMohamed95/al-jawhara\n');
}

deploy();
