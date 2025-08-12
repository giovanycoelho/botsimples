const { generateResponse, transcribeAudio } = require('./ai.js');
const { splitMessage, sleep } = require('./utils.js');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const ffmpeg = require('fluent-ffmpeg');
const tmp = require('tmp');
const fs = require('fs');
const baileysManager = require('./baileys.js');

const messageCollectors = {};
const messageQueues = {};
const chatHistories = {};

async function processQueuedMessages(messages, apiKey) {
    // This function is the same as before
    let processedContent = [];
    let textBuffer = [];

    const flushTextBuffer = () => {
        if (textBuffer.length > 0) {
            processedContent.push({ type: 'text', text: textBuffer.join('\n') });
            textBuffer = [];
        }
    };

    for (const msg of messages) {
        const messageType = Object.keys(msg.message)[0];
        
        if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
            textBuffer.push(msg.message.conversation || msg.message.extendedTextMessage.text);
        } else if (messageType === 'audioMessage') {
            flushTextBuffer();
            try {
                const buffer = await downloadMediaMessage(msg, 'buffer', {});
                const tempOggFile = tmp.fileSync({ postfix: '.ogg' });
                fs.writeFileSync(tempOggFile.name, buffer);
                const tempMp3File = tmp.fileSync({ postfix: '.mp3' });
                await new Promise((resolve, reject) => {
                    ffmpeg(tempOggFile.name).toFormat('mp3').on('error', reject).on('end', resolve).save(tempMp3File.name);
                });
                const transcription = await transcribeAudio(tempMp3File.name, apiKey);
                textBuffer.push(`[Áudio]: "${transcription}"`);
                tempOggFile.removeCallback();
                tempMp3File.removeCallback();
            } catch (error) {
                console.error('Error processing audio:', error);
                textBuffer.push('[Não foi possível processar o áudio]');
            }
        } else if (messageType === 'imageMessage') {
            flushTextBuffer();
            try {
                const buffer = await downloadMediaMessage(msg, 'buffer', {});
                const base64Image = buffer.toString('base64');
                const mimeType = msg.message.imageMessage.mimetype;
                const imageUrl = `data:${mimeType};base64,${base64Image}`;
                processedContent.push({ type: 'image_url', image_url: { url: imageUrl } });
            } catch (error) {
                console.error('Error processing image:', error);
                textBuffer.push('[Não foi possível processar a imagem]');
            }
        }
    }
    flushTextBuffer();
    return processedContent;
}

function handleIncomingMessage(msg, settings) {
    const chatId = msg.key.remoteJid;

    if (!messageQueues[chatId]) {
        messageQueues[chatId] = [];
    }
    messageQueues[chatId].push(msg);

    if (messageCollectors[chatId]) {
        clearTimeout(messageCollectors[chatId]);
    }

    const delay = (settings.delay || 10) * 1000;
    messageCollectors[chatId] = setTimeout(async () => {
        const queuedMessages = messageQueues[chatId];
        const history = chatHistories[chatId] || [];

        try {
            const newMessagesContent = await processQueuedMessages(queuedMessages, settings.apiKey);
            if (newMessagesContent.length === 0) return;

            const newMessagesForHistory = newMessagesContent.map(item => item.text || '[Imagem]').join('\n');
            const fullResponse = await generateResponse(history, newMessagesContent, settings);
            
            const chunks = splitMessage(fullResponse);
            for (const chunk of chunks) {
                await baileysManager.updatePresence(chatId, 'composing');
                await sleep(Math.random() * 2000 + 1000);
                await baileysManager.sendMessage(chatId, { text: chunk });
            }
            await baileysManager.updatePresence(chatId, 'paused');

            if (!chatHistories[chatId]) chatHistories[chatId] = [];
            chatHistories[chatId].push({ role: 'user', content: newMessagesForHistory });
            chatHistories[chatId].push({ role: 'assistant', content: fullResponse });

        } catch (error) {
            console.error('Error processing AI response:', error);
            await baileysManager.sendMessage(chatId, { text: 'Desculpe, ocorreu um erro ao processar sua mensagem.' });
        } finally {
            delete messageQueues[chatId];
            delete messageCollectors[chatId];
        }
    }, delay);
}

module.exports = { handleIncomingMessage };