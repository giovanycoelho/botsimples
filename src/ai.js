const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const fs = require('fs');

// --- Transcription ---
async function transcribeAudio(filePath, apiKey) {
    if (!apiKey) throw new Error('OpenAI API key is missing for transcription.');
    const openai = new OpenAI({ apiKey });
    const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-1",
    });
    return transcription.text;
}

// --- Helper to build the prompt ---
function buildPrompt(history, newMessagesContent, systemPrompt) {
    // newMessagesContent is now an array of content blocks (text or image)
    const userContent = newMessagesContent.map(item => {
        if (item.type === 'text') {
            return { type: 'text', text: item.text };
        } else if (item.type === 'image_url') {
            return { type: 'image_url', image_url: { url: item.image_url.url } };
        }
    }).filter(Boolean);

    const messages = [
        { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
        ...history,
        { role: 'user', content: userContent }
    ];
    return messages;
}

// --- OpenAI Implementation ---
async function generateOpenAIResponse(messages, apiKey, model = 'gpt-4o') {
    if (!apiKey) throw new Error('OpenAI API key is missing.');
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
        messages: messages,
        model: model,
    });
    return completion.choices[0].message.content;
}

// --- Gemini Implementation (Vision support is more complex, simplified for now) --- //
async function generateGeminiResponse(messages, apiKey, model = "gemini-1.5-flash") {
    if (!apiKey) throw new Error('Gemini API key is missing.');
    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model: model});

    // Flatten content for Gemini's format
    const flattenedContent = messages[messages.length - 1].content.map(item => item.text || '[Image]').join('\n');

    const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts: [{ text: msg.content }]
    }));

    const chat = geminiModel.startChat({ history });
    const result = await chat.sendMessage(flattenedContent);
    const response = await result.response;
    return response.text();
}

// --- OpenRouter Implementation --- //
async function generateOpenRouterResponse(messages, apiKey, model = 'openai/gpt-4o') {
    if (!apiKey) throw new Error('OpenRouter API key is missing.');
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: model, 
            messages: messages,
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("OpenRouter API Error:", error.response ? error.response.data : error.message);
        throw new Error('Failed to get response from OpenRouter.');
    }
}

// --- Main Orchestrator --- //
async function generateResponse(history, newMessagesContent, settings) {
    const systemPrompt = settings.prompt;
    const messages = buildPrompt(history, newMessagesContent, systemPrompt);

    console.log(`Calling ${settings.provider} with model ${settings.models[settings.provider]}...`);

    switch (settings.provider) {
        case 'openai':
            return generateOpenAIResponse(messages, settings.apiKey, settings.models.openai);
        case 'gemini':
            // Note: Full vision support for Gemini requires more specific formatting.
            return generateGeminiResponse(messages, settings.apiKey, settings.models.gemini);
        case 'openrouter':
            return generateOpenRouterResponse(messages, settings.apiKey, settings.models.openrouter);
        default:
            throw new Error("Invalid AI provider selected.");
    }
}

module.exports = { generateResponse, transcribeAudio };