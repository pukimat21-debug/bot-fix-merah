const { Telegraf, Markup } = require('telegraf');
const yts = require('yt-search');
const axios = require('axios');

// Masukkan Token Bot Kamu dari @BotFather
const BOT_TOKEN = '8981165951:AAGVBrwNMYAgtJkc9FfBnOvrBL6FvkWvKe0';
const bot = new Telegraf(BOT_TOKEN);

// Database playlist sederhana di memori
const userPlaylists = {};

// Command /start
bot.start((ctx) => {
  const name = ctx.from.first_name || 'Teman';
  const welcomeText = `
🎧 **SELAMAT DATANG DI BOT MUSIK** 🎧

Halo **${name}**! Lu bisa cari lagu, dengerin musik, dan buat playlist favorit lu di sini.

📜 **Daftar Perintah:**
🎵 \`/play (judul lagu)\` - Cari & putar lagu
🎧 \`/playlist\` - Lihat playlist tersimpan lu
📝 \`/add (judul lagu)\` - Tambah lagu ke playlist
🗑️ \`/clear\` - Hapus semua lagu di playlist
  `;

  return ctx.replyWithMarkdown(welcomeText);
});

// Fitur Cari & Play Lagu
bot.command('play', async (ctx) => {
  const query = ctx.message.text.split(' ').slice(1).join(' ');
  
  if (!query) {
    return ctx.reply('⚠️ Contoh penggunaan: `/play Sheila on 7 - Dan`', { parse_mode: 'Markdown' });
  }

  const waitingMsg = await ctx.reply(`🔍 *Mencari lagu:* \`${query}\`...`, { parse_mode: 'Markdown' });

  try {
    // Cari lagu di YouTube
    const r = await yts(query);
    const videos = r.videos;

    if (!videos || videos.length === 0) {
      return ctx.telegram.editMessageText(ctx.chat.id, waitingMsg.message_id, null, '❌ Lagu tidak ditemukan, coba judul lain!');
    }

    const firstResult = videos[0];
    
    // Tampilan hasil pencarian
    const caption = `
🎵 **${firstResult.title}**
⏱️ **Durasi:** ${firstResult.timestamp}
👤 **Channel:** ${firstResult.author.name}
🔗 [Tonton di YouTube](${firstResult.url})
    `;

    await ctx.telegram.editMessageText(
      ctx.chat.id, 
      waitingMsg.message_id, 
      null, 
      caption, 
      { 
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
        ...Markup.inlineKeyboard([
          [Markup.button.callback('➕ Tambah ke Playlist', `add_pl_${firstResult.title.substring(0, 20)}`)]
        ])
      }
    );

  } catch (error) {
    console.error(error);
    ctx.telegram.editMessageText(ctx.chat.id, waitingMsg.message_id, null, '❌ Gagal mencari lagu. Coba lagi nanti!');
  }
});

// Fitur Tambah ke Playlist
bot.command('add', (ctx) => {
  const song = ctx.message.text.split(' ').slice(1).join(' ');
  const userId = ctx.from.id;

  if (!song) {
    return ctx.reply('⚠️ Masukkan judul lagu! Contoh: `/add Cold Play - Yellow`', { parse_mode: 'Markdown' });
  }

  if (!userPlaylists[userId]) {
    userPlaylists[userId] = [];
  }

  userPlaylists[userId].push(song);
  return ctx.reply(`✅ Lagu **${song}** berhasil ditambahkan ke playlist lu!`, { parse_mode: 'Markdown' });
});

// Handling Tombol Tambah ke Playlist dari Pencarian
bot.action(/^add_pl_(.+)/, (ctx) => {
  const songTitle = ctx.match[1];
  const userId = ctx.from.id;

  if (!userPlaylists[userId]) {
    userPlaylists[userId] = [];
  }

  userPlaylists[userId].push(songTitle);
  return ctx.answerCbQuery(`✅ "${songTitle}" ditambahkan ke playlist!`);
});

// Fitur Lihat Playlist
bot.command('playlist', (ctx) => {
  const userId = ctx.from.id;
  const list = userPlaylists[userId];

  if (!list || list.length === 0) {
    return ctx.reply('📂 Playlist lu masih kosong. Tambahkan lagu dengan `/add (judul lagu)` atau tombol *Tambah ke Playlist*!');
  }

  let text = '🎧 **PLAYLIST MUSIK LU:**\n\n';
  list.forEach((item, index) => {
    text += `${index + 1}. ${item}\n`;
  });

  text += '\n*Ketik /play (judul) buat muter lagunya!*';

  return ctx.replyWithMarkdown(text, Markup.inlineKeyboard([
    [Markup.button.callback('🗑️ Kosongkan Playlist', 'clear_pl')]
  ]));
});

// Fitur Hapus Playlist
bot.action('clear_pl', (ctx) => {
  const userId = ctx.from.id;
  userPlaylists[userId] = [];
  ctx.answerCbQuery('🗑️ Playlist berhasil dikosongkan!');
  return ctx.editMessageText('🗑️ Playlist lu sekarang sudah kosong.');
});

bot.launch().then(() => console.log('Bot Musik Siap Muter Lagu! 🎶'));
