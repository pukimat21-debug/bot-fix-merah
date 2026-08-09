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

// Fitur Download MP3 dengan Backup API
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

    // 2. Gunakan Endpoint Downloader Backup
    let downloadUrl = null;

    try {
      // Opsi 1: API Direct Audio
      const api1 = await axios.get(`https://api.tinomedia.my.id/api/ytmp3?url=${encodeURIComponent(song.url)}`);
      if (api1.data && api1.data.result && api1.data.result.download) {
        downloadUrl = api1.data.result.download;
      }
    } catch (e) {
      console.log('API 1 Fail, mencoba API 2...');
    }

    // Jika Opsi 1 gagal, coba Opsi 2 (Cobalt Instance)
    if (!downloadUrl) {
      const api2 = await axios.post('https://co.wuk.sh/api/json', {
        url: song.url,
        isAudioOnly: true,
        aFormat: 'mp3'
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (api2.data && api2.data.url) {
        downloadUrl = api2.data.url;
      }
    }

    // 3. Kirim Audio
    if (downloadUrl) {
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

      ctx.telegram.deleteMessage(ctx.chat.id, waitingMsg.message_id).catch(() => {});
    } else {
      throw new Error('Semua Server Downloader Gagal');
    }

  } catch (error) {
    console.error('Error handling /play:', error.message);
    ctx.telegram.editMessageText(
      ctx.chat.id,
      waitingMsg.message_id,
      null,
      '❌ Server downloader sedang sibuk. Coba ganti kata kunci lagu lain bro!'
    );
  }
});

bot.launch().then(() => console.log('Bot Musik SpiderMat 🕷️ Online & Siap!'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
    
