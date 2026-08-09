const { Telegraf } = require('telegraf');
const yts = require('yt-search');
const axios = require('axios');

// Token Bot
const BOT_TOKEN = '8981165951:AAGVBrwNMYAgtJkc9FfBnOvrBL6FvkWvKe0';
const bot = new Telegraf(BOT_TOKEN);

// Command /start
bot.start((ctx) => {
  const name = ctx.from.first_name || 'Teman';
  const welcomeText = `
🕷️ **SELAMAT DATANG DI BOT MUSIK SPIDERMAT 🕷️**

Halo **${name}**! Cari dan dengerin musik favorit lu secara praktis langsung di Telegram.

📜 **Cara Pakai:**
🎵 \`/play (judul lagu)\` - Cari dan unduh langsung file musik (.mp3)

*Contoh:* \`/play Hindia - Secukupnya\`
  `;

  return ctx.replyWithMarkdown(welcomeText);
});

// Fitur Mainkan / Download MP3 Anti-Mogok
bot.command('play', async (ctx) => {
  const query = ctx.message.text.split(' ').slice(1).join(' ');

  if (!query) {
    return ctx.reply('⚠️ **Masukkan judul lagu!**\nContoh: `/play Hindia - Secukupnya`', { parse_mode: 'Markdown' });
  }

  const waitingMsg = await ctx.reply(`🔍 *Mencari musik:* \`${query}\`...`, { parse_mode: 'Markdown' });

  try {
    // 1. Cari video di YouTube
    const searchResult = await yts(query);
    const videos = searchResult.videos;

    if (!videos || videos.length === 0) {
      return ctx.telegram.editMessageText(ctx.chat.id, waitingMsg.message_id, null, '❌ Lagu tidak ditemukan, coba judul lain!');
    }

    const song = videos[0];

    // Update status
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      waitingMsg.message_id,
      null,
      `⏳ *Mengunduh audio:* **${song.title}**\n\n_Mohon tunggu sebentar..._`,
      { parse_mode: 'Markdown' }
    );

    // 2. Ambil Link Audio via API Reliable (Populer & Cepat)
    let audioUrl = null;

    try {
      // Primary API Endpoint
      const res1 = await axios.get(`https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(song.url)}`);
      if (res1.data && res1.data.result && res1.data.result.downloadUrl) {
        audioUrl = res1.data.result.downloadUrl;
      }
    } catch (err) {
      console.log('API 1 Fail, mencoba API Secondary...');
    }

    if (!audioUrl) {
      // Secondary API Endpoint
      const res2 = await axios.get(`https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(song.url)}`);
      if (res2.data && res2.data.data && res2.data.data.dl) {
        audioUrl = res2.data.data.dl;
      }
    }

    // 3. Send Audio
    if (audioUrl) {
      await ctx.replyWithAudio(
        { url: audioUrl },
        {
          title: song.title,
          performer: song.author.name || 'SpiderMat Music',
          duration: song.seconds,
          caption: `🎶 **${song.title}**\n🕷️ *Bot Musik SpiderMat*`,
          parse_mode: 'Markdown'
        }
      );

      ctx.telegram.deleteMessage(ctx.chat.id, waitingMsg.message_id).catch(() => {});
    } else {
      throw new Error('API Downloader belum merespon');
    }

  } catch (error) {
    console.error('Error handling /play:', error.message);
    ctx.telegram.editMessageText(
      ctx.chat.id,
      waitingMsg.message_id,
      null,
      '❌ Server unduh sedang penyesuaian. Coba klik lagi sebentar!'
    );
  }
});

// Handling Polling Error (Biar Bot Nggak Crash Pas Conflict)
bot.launch({
  dropPendingUpdates: true
}).then(() => console.log('Bot Musik SpiderMat 🕷️ Berhasil Aktif Bebas Conflict!'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
