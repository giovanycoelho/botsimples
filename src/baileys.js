const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

class BaileysManager extends EventEmitter {
    constructor() {
        super();
        this.sock = null;
        this.authDir = 'auth_info_baileys';
    }

    async connect() {
        const { state, saveCreds } = await useMultiFileAuthState(this.authDir);

        this.sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
        });

        this.sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            if (qr) {
                const qrCodeUrl = await QRCode.toDataURL(qr);
                this.emit('qr', qrCodeUrl);
            }
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                this.emit('status', 'Desconectado');
                if (shouldReconnect) {
                    this.connect();
                } else {
                    this.sock = null;
                    if (fs.existsSync(this.authDir)) {
                        fs.rmSync(this.authDir, { recursive: true, force: true });
                    }
                }
            } else if (connection === 'open') {
                this.emit('status', 'Conectado');
            }
        });

        this.sock.ev.on('creds.update', saveCreds);

        this.sock.ev.on('messages.upsert', (m) => {
            const msg = m.messages[0];
            if (!msg.message || msg.key.fromMe) return;
            this.emit('message', msg);
        });
    }

    async logout() {
        if (this.sock) {
            await this.sock.logout();
        }
    }

    async sendMessage(chatId, message) {
        if (this.sock) {
            await this.sock.sendMessage(chatId, message);
        }
    }

    async updatePresence(chatId, presence) {
        if (this.sock) {
            await this.sock.sendPresenceUpdate(presence, chatId);
        }
    }
}

module.exports = new BaileysManager();