const { Telegraf, Markup } = require('telegraf');

// Token Bot & Config Owner
const BOT_TOKEN = '8981165951:AAGVBrwNMYAgtJkc9FfBnOvrBL6FvkWvKe0';
const OWNER_USERNAME = 'mattt215';

const bot = new Telegraf(BOT_TOKEN);

// Database sederhana di memori (bisa diakses saat bot jalan)
let totalFix = 1176;
let fixBerhasil = 1175;

// Command /start
bot.start((ctx) => {
  const name = ctx.from.first_name || 'User';
  const userId = ctx.from.id;
  const username = ctx.from.username ? `@${ctx.from.username}` : 'Tidak Ada';

  const caption = `
🤖 **BOT FIX RED SPDRMT**

👤 **PROFIL USER**
├ 📛 **Nama** : ${name}
├ 🆔 **User ID** : \`${userId}\`
└ 👤 **Username** : ${username}

📊 **STATISTIK USER**
├ 🛠️ **Total Fix** : ${totalFix}
└ ✅ **Fix Berhasil** : ${fixBerhasil}

ℹ️ **INFORMASI TIER**
├ 📦 **Paket** : Free
├ ⚡ **Batch Proses** : 1 nomor
├ ♾️ **Limit Harian** : Unlimited
└ 📅 **Berlaku** : -

🌐 **STATISTIK GLOBAL**
├ 📩 **Total Sender** : 1
├ 👥 **Total User** : 4,080
└ 🛠️ **Total Fix** : 796,899
  `;

  return ctx.replyWithMarkdown(
    caption,
    Markup.inlineKeyboard([
      [
        Markup.button.callback('🔴 Fix Merah', 'menu_fix'),
        Markup.button.callback('💎 VIP', 'menu_vip')
      ],
      [
        Markup.button.url('👑 Owner', `https://t.me/${OWNER_USERNAME}`),
        Markup.button.callback('👥 Undang Teman', 'menu_referral')
      ]
    ])
  );
});

// Menu Cara Pakai / Fix Merah
bot.action('menu_fix', (ctx) => {
  const text = `
📖 **CARA PAKAI BOT FIX**

Gunakan perintah:
\`/fix (nomor)\`

**Contoh:**
\`/fix +628226725xxxx\`

*Bebas pakai + atau tidak, tetap bisa.*
  `;

  return ctx.replyWithMarkdown(
    text,
    Markup.inlineKeyboard([
      [Markup.button.callback('⬅️ Kembali', 'back_to_start')]
    ])
  );
});

// Menu VIP & Paket
bot.action('menu_vip', (ctx) => {
  return ctx.replyWithMarkdown(
    '💎 **AKSES VIP LEXXA FIX MERAH**\n\n' +
    '📦 **PAKET BASIC**\n├ Limit harian: ♾️ Unlimited\n└ Batch proses: 10 nomor\n\n' +
    '💎 **PAKET VIP**\n├ Limit harian: ♾️ Unlimited\n└ Batch proses: 20 nomor\n\n' +
    '💎 **PAKET VIP+**\n├ Limit harian: ♾️ Unlimited\n└ Batch proses: 50 nomor',
    Markup.inlineKeyboard([
      [Markup.button.callback('📦 Paket Basic', 'p_basic')],
      [Markup.button.callback('💎 Paket VIP', 'p_vip')],
      [Markup.button.callback('💎 Paket VIP+', 'p_vipplus')],
      [Markup.button.callback('⬅️ Kembali', 'back_to_start')]
    ])
  );
});

// Handling Tombol Paket VIP
bot.action('p_basic', (ctx) => {
  ctx.reply('📦 **PAKET BASIC**\n\n1 Hari - Rp 2.000\n3 Hari - Rp 5.500\n7 Hari - Rp 13.500\n15 Hari - Rp 25.500\n\nHubungi @' + OWNER_USERNAME + ' untuk beli.');
});

bot.action('p_vip', (ctx) => {
  ctx.reply('💎 **PAKET VIP**\n\n1 Hari - Rp 3.000\n3 Hari - Rp 8.500\n7 Hari - Rp 20.000\n15 Hari - Rp 38.000\n\nHubungi @' + OWNER_USERNAME + ' untuk beli.');
});

bot.action('p_vipplus', (ctx) => {
  ctx.reply('💎 **PAKET VIP+**\n\n1 Hari - Rp 5.000\n3 Hari - Rp 14.000\n7 Hari - Rp 33.000\n15 Hari - Rp 63.000\n\nHubungi @' + OWNER_USERNAME + ' untuk beli.');
});

// Menu Referral
bot.action('menu_referral', (ctx) => {
  const refLink = `https://t.me/${ctx.botInfo.username}?start=${ctx.from.id}`;
  const text = `
🎁 **Keuntungan Mengundang Teman**

• Setiap teman yang diundang akan memberikan **+2 jam akses Basic**.
• Reward diberikan setelah teman melakukan 1x proses fix.

📊 **Statistik Referral**
👤 User Diundang : 0
⏳ User Pending : 0

🔗 **Invite Link:**
\`${refLink}\`
  `;

  return ctx.replyWithMarkdown(
    text,
    Markup.inlineKeyboard([
      [Markup.button.callback('⬅️ Kembali', 'back_to_start')]
    ])
  );
});

// Fitur /fix (Nomor WA)
bot.hears(/^\/fix (.+)/, (ctx) => {
  const targetNum = ctx.match[1].trim();
  totalFix++;
  fixBerhasil++;

  const mailTo = 'support@support.whatsapp.com';
  const subject = encodeURIComponent(`Banding Akun Diblokir (${targetNum})`);
  const body = encodeURIComponent(
    `Halo Tim Dukungan WhatsApp,\n\nNomor telepon saya (${targetNum}) baru-baru ini diblokir secara tidak sengaja. Saya tidak pernah melanggar Syarat dan Ketentuan Layanan WhatsApp. Mohon periksa kembali akun saya dan pulihkan aksesnya secepat mungkin.\n\nTerima kasih.`
  );

  const emailUrl = `mailto:${mailTo}?subject=${subject}&body=${body}`;

  const responseText = `
✅ **REQUEST FIX MERAH BERHASIL DIPROSES**

📱 **Nomor Target:** \`${targetNum}\`
🛠️ **Status:** Ready to Send Appeal

Klik tombol **"🚀 Kirim Email Banding"** di bawah untuk mengirim laporan otomatis ke WhatsApp Support via Email HP kamu!
  `;

  return ctx.replyWithMarkdown(
    responseText,
    Markup.inlineKeyboard([
      [Markup.button.url('🚀 Kirim Email Banding', emailUrl)]
    ])
  );
});

// Tombol Kembali Ke Start
bot.action('back_to_start', (ctx) => {
  ctx.deleteMessage().catch(() => {});
  return ctx.telegram.sendMessage(ctx.chat.id, 'Ketik /start untuk membuka menu utama.');
});

// Launch Bot
bot.launch().then(() => {
  console.log('Bot Fix Merah Berhasil Aktif!');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
