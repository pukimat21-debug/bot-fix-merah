const { Telegraf } = require('telegraf');
const yts = require('yt-search');
const axios = require('axios');

// Token Bot Baru Lu
const BOT_TOKEN = '8981165951:AAGMOw880IiiznvlhjRxkoo0mnB7a7-41fg';
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

// Fitur Mainkan / Download MP3
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

    // 2. System Downloader 3 Lapis Lintas API
    let downloadUrl = null;

    // Lapis 1
    try {
      const res1 = await axios.get(`https://api.vreden.web.id/api/ytmp3?url=${encodeURIComponent(song.url)}`);
      if (res1.data?.result?.download?.url) {
        downloadUrl = res1.data.result.download.url;
      }
    } catch (err) {
      console.log('Lapis 1 Gagal, oper ke Lapis 2...');
    }

    // Lapis 2 (Jika Lapis 1 Gagal)
    if (!downloadUrl) {
      try {
        const res2 = await axios.get(`https://api.lolhuman.xyz/api/ytaudio2?apikey=8507613bc61ae6f8e26a4f3f&url=${encodeURIComponent(song.url)}`);
        if (res2.data?.result?.link) {
          downloadUrl = res2.data.result.link;
        }
      } catch (err) {
        console.log('Lapis 2 Gagal, oper ke Lapis 3...');
      }
    }

    // Lapis 3 (Jika Lapis 2 Gagal)
    if (!downloadUrl) {
      try {
        const res3 = await axios.get(`https://btch.zone/ytmp3?url=${encodeURIComponent(song.url)}`);
        if (res3.data?.url) {
          downloadUrl = res3.data.url;
        }
      } catch (err) {
        console.log('Lapis 3 Gagal.');
      }
    }

    // 3. Kirim Audio ke Chat
    if (downloadUrl) {
      await ctx.replyWithAudio(
        { url: downloadUrl },
        {
          title: song.title,
          performer: song.author?.name || 'SpiderMat Music',
          duration: song.seconds,
          caption: `🎶 **${song.title}**\n🕷️ *Bot Musik SpiderMat*`,
          parse_mode: 'Markdown'
        }
      );

      ctx.telegram.deleteMessage(ctx.chat.id, waitingMsg.message_id).catch(() => {});
    } else {
      throw new Error('Semua server unduh sedang tidak merespon');
    }

  } catch (error) {
    console.error('Error handling /play:', error.message);
    ctx.telegram.editMessageText(
      ctx.chat.id,
      waitingMsg.message_id,
      null,
      '❌ Server unduh sedang penyesuaian. Coba klik/kirim ulang lagi!'
    );
  }
});

// Launch Bot + Bersihin Sisa Polling Lawas
bot.launch({
  dropPendingUpdates: true
}).then(() => console.log('Bot Musik SpiderMat 🕷️ ONLINE & SIAP DIPAKAI!'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
