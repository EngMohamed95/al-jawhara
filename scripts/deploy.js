/**
 * deploy.js — رفع build على السيرفر تلقائياً
 * تشغيل: npm run deploy
 *
 * مهم: يحفظ data.json الموجودة على السيرفر ويعيد رفعها بعد الـ deploy
 * حتى لا تُفقد البيانات (المنتجات، الطلبات، المستخدمين) عند كل نشر
 */
const ftp  = require('basic-ftp');
const path = require('path');
const fs   = require('fs');
const { execSync } = require('child_process');

const FTP = {
  host: 'aljawhara.matix.one',
  user: 'aljawharamatix',
  password: '^!Z~-VWSpQe*,.lk',
  secure: true,
  secureOptions: { rejectUnauthorized: false },
  port: 21,
};

const BUILD_DIR      = path.join(__dirname, '..', 'build');
const REMOTE_DIR     = '/public_html';
const REMOTE_DATA    = '/public_html/api/data.json';
const LOCAL_BACKUP   = path.join(__dirname, '..', 'build', 'api', 'data.json');
const LOCAL_TEMPLATE = path.join(__dirname, '..', 'public', 'api', 'data.json');

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    await client.access(FTP);

    // ── 1. حفظ data.json الموجودة على السيرفر ──
    let serverDataExists = false;
    try {
      await client.downloadTo(LOCAL_BACKUP, REMOTE_DATA);
      serverDataExists = true;
      console.log('\n💾 Server data.json backed up successfully');

      // دمج: إضافة أي collections أو items جديدة من القالب بدون مسح البيانات الحالية
      const serverData   = JSON.parse(fs.readFileSync(LOCAL_BACKUP,   'utf8'));
      const templateData = JSON.parse(fs.readFileSync(LOCAL_TEMPLATE, 'utf8'));
      let merged = false;
      for (const key of Object.keys(templateData)) {
        if (!(key in serverData)) {
          // مفتاح جديد كلياً — أضفه
          serverData[key] = templateData[key];
          console.log(`   ➕ Added new collection: ${key}`);
          merged = true;
        } else if (Array.isArray(templateData[key]) && Array.isArray(serverData[key])) {
          // Array موجودة — أضف items جديدة + اضف fields جديدة على items موجودة
          const serverIds = new Set(serverData[key].map(i => i.id));
          const newItems  = templateData[key].filter(i => i.id && !serverIds.has(i.id));
          if (newItems.length > 0) {
            serverData[key] = [...serverData[key], ...newItems];
            console.log(`   ➕ Added ${newItems.length} new item(s) to "${key}": ${newItems.map(i=>i.id).join(', ')}`);
            merged = true;
          }
          // اضف fields جديدة على items موجودة (بدون مسح البيانات الحالية)
          serverData[key] = serverData[key].map(serverItem => {
            if (!serverItem.id) return serverItem;
            const tmplItem = templateData[key].find(t => t.id === serverItem.id);
            if (!tmplItem) return serverItem;
            let itemMerged = false;
            for (const field of Object.keys(tmplItem)) {
              if (!(field in serverItem)) {
                serverItem = { ...serverItem, [field]: tmplItem[field] };
                console.log(`   ➕ Added field "${field}" to ${key}[id:${serverItem.id}]`);
                itemMerged = true;
              }
            }
            if (itemMerged) merged = true;
            return serverItem;
          });
        }
      }
      if (merged) {
        fs.writeFileSync(LOCAL_BACKUP, JSON.stringify(serverData, null, 2), 'utf8');
        console.log('   ✅ Merged new items into backup');
      }
    } catch {
      console.log('\n⚠️  No existing data.json on server — will use template');
      // سنرفع القالب كما هو
    }

    // ── 2. رفع الـ build كاملاً ──
    console.log('\n📦 Uploading build to server...');
    await client.ensureDir(REMOTE_DIR);
    await client.clearWorkingDir();
    await client.uploadFromDir(BUILD_DIR);
    console.log('✅ Build uploaded');

    // ── 3. إعادة رفع data.json المحفوظة (تحمي البيانات) ──
    if (serverDataExists) {
      await client.uploadFrom(LOCAL_BACKUP, REMOTE_DATA);
      console.log('✅ Server data restored — no data loss\n');
    } else {
      console.log('✅ Template data.json uploaded\n');
    }

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
    const date = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kuwait' }).slice(0, 16).replace(',', '');
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
