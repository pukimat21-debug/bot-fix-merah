const { Telegraf, Markup } = require('telegraf');

// Masukkan Token & Info Owner
const BOT_TOKEN = '8981165951:AAGVBrwNMYAgtJkc9FfBnOvrBL6FvkWvKe0';
const OWNER_USERNAME = 'mattt215';

const bot = new Telegraf(BOT_TOKEN);

// Database Sederhana dalam Memori
let totalFixCount = 1176;
let fixBerhasilCount = 1175;

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
├ 🛠️ **Total Fix** : ${totalFixCount}
└ ✅ **Fix Berhasil** : ${fixBerhasilCount}

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

// Menu Cara Pakai
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

// Handling Command /fix dengan animasi status real-time ala Lexxa
bot.hears(/^\/fix\s+(.+)/, async (ctx) => {
  const inputNumbers = ctx.match[1].trim().split(/[\s,\n]+/);
  const totalNumbers = inputNumbers.length;

  // 1. Kirim pesan status awal "Memproses Fix"
  const processMsg = await ctx.replyWithMarkdown(`
🔄 **Memproses Fix**

Nomor pending: \`${totalNumbers}\`
Nomor terkirim: \`0\`

**Nomor sukses dapat balasan: 0**
└ \`-\`

**Nomor gagal / tidak dapat balasan: 0**
└ \`-\`

⏱️ **Sisa Waktu:** \`-\`
  `);

  // Simulasi delay pemrosesan (2-3 detik)
  setTimeout(async () => {
    totalFixCount += totalNumbers;
    
    // Pilih nomor secara acak untuk disimulasikan (atau anggap gagal/sukses sesuai kebutuhan)
    const successList = [];
    const failList = inputNumbers; // Default simulasi persis seperti di video kamu

    let failText = failList.map(n => `\`${n.replace('+', '')}\``).join(', ');

    // 2. Edit pesan jadi "Sukses Fix" ala Lexxa
    try {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        processMsg.message_id,
        null,
        `
✅ **Sukses Fix**

Nomor pending: \`1\`
Nomor terkirim: \`0\`

**Nomor sukses dapat balasan: 0**
└ \`-\`

**Nomor gagal / tidak dapat balasan: ${failList.length}**
└ ${failText}

⏱️ **Sisa Waktu:** \`-\`
        `,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      console.log('Error edit message:', err);
    }
  }, 2500);
});

// Back & VIP Handler
bot.action('back_to_start', (ctx) => {
  ctx.deleteMessage().catch(() => {});
  return ctx.telegram.sendMessage(ctx.chat.id, 'Ketik /start untuk membuka menu utama.');
});

bot.action('menu_vip', (ctx) => {
  return ctx.replyWithMarkdown(
    '💎 **AKSES VIP FIX MERAH**\n\n' +
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

bot.launch().then(() => console.log('Bot Lexxa Clone Aktif!'));
