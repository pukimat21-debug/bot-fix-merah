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

// Fitur Mainkan / Download Musik MP3 Anti-Mabok
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

    // Update status pesan
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      waitingMsg.message_id,
      null,
      `⏳ *Mengunduh audio:* **${song.title}**\n\n_Mohon tunggu sebentar..._`,
      { parse_mode: 'Markdown' }
    );

    // 2. Ambil link MP3 dari API Downloader Pihak Ke-3 (Fast API)
    const apiUrl = `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(song.url)}`;
    const res = await axios.get(apiUrl);

    if (res.data && res.data.result && res.data.result.download && res.data.result.download.url) {
      const downloadUrl = res.data.result.download.url;

      // 3. Kirim file Audio ke Telegram via Link Direct
      await ctx.replyWithAudio(
        { url: downloadUrl },
        {
          title: song.title,
          performer: song.author.name || 'SpiderMat Music',
          duration: song.seconds,
          caption: `🎶 **${song.title}**\n⏱️ Durasi: ${song.timestamp}\n🕷️ *Bot Musik SpiderMat*`,
          parse_mode: 'Markdown'
        }
      );

      // Hapus pesan "Mengunduh"
      ctx.telegram.deleteMessage(ctx.chat.id, waitingMsg.message_id).catch(() => {});
    } else {
      throw new Error('API Download Gagal');
    }

  } catch (error) {
    console.error('Error handling /play:', error.message);
    ctx.telegram.editMessageText(
      ctx.chat.id,
      waitingMsg.message_id,
      null,
      '❌ Gagal mengunduh audio. Coba judul lagu yang lain ya bro!'
    );
  }
});

bot.launch().then(() => console.log('Bot Musik SpiderMat 🕷️ Siap Meluncur!'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
