const connectBtn = document.getElementById('connect-btn');
const disconnectBtn = document.getElementById('disconnect-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');

const qrContainer = document.getElementById('qr-container');
const statusDiv = document.getElementById('status');

const apiProviderInput = document.getElementById('api-provider');
const apiKeyInput = document.getElementById('api-key');
const knowledgePromptInput = document.getElementById('knowledge-prompt');
const responseDelayInput = document.getElementById('response-delay');

// Model selection elements
const openaiModelGroup = document.getElementById('openai-model-group');
const openaiModelInput = document.getElementById('openai-model');
const geminiModelGroup = document.getElementById('gemini-model-group');
const geminiModelInput = document.getElementById('gemini-model');
const openrouterModelGroup = document.getElementById('openrouter-model-group');
const openrouterModelInput = document.getElementById('openrouter-model');

// --- Helper to update model group visibility ---
function updateModelGroupVisibility() {
    const selectedProvider = apiProviderInput.value;
    openaiModelGroup.style.display = 'none';
    geminiModelGroup.style.display = 'none';
    openrouterModelGroup.style.display = 'none';

    switch (selectedProvider) {
        case 'openai':
            openaiModelGroup.style.display = 'block';
            break;
        case 'gemini':
            geminiModelGroup.style.display = 'block';
            break;
        case 'openrouter':
            openrouterModelGroup.style.display = 'block';
            break;
    }
}

// --- Event Listeners ---

connectBtn.addEventListener('click', () => {
    statusDiv.textContent = 'Status: Gerando QR Code...';
    qrContainer.innerHTML = ''; // Clear previous QR code
    window.electronAPI.connectWhatsApp();
});

disconnectBtn.addEventListener('click', () => {
    statusDiv.textContent = 'Status: Desconectando...';
    window.electronAPI.disconnectWhatsApp();
});

saveSettingsBtn.addEventListener('click', () => {
    const settings = {
        provider: apiProviderInput.value,
        apiKey: apiKeyInput.value,
        prompt: knowledgePromptInput.value,
        delay: responseDelayInput.value,
        models: {
            openai: openaiModelInput.value,
            gemini: geminiModelInput.value,
            openrouter: openrouterModelInput.value,
        }
    };
    window.electronAPI.saveSettings(settings);
    alert('Configurações salvas!');
});

apiProviderInput.addEventListener('change', updateModelGroupVisibility);

// --- IPC Handlers ---

window.electronAPI.onQRCode((qr) => {
    console.log('QR Code received in renderer');
    qrContainer.innerHTML = `<img src="${qr}" alt="QR Code">`;
    statusDiv.textContent = 'Status: Aguardando leitura do QR Code...';
});

window.electronAPI.onStatusUpdate((status) => {
    statusDiv.textContent = `Status: ${status}`;
    if (status === 'Conectado') {
        qrContainer.innerHTML = '<p>Conectado com sucesso!</p>';
        connectBtn.style.display = 'none';
        disconnectBtn.style.display = 'block';
    } else {
        connectBtn.style.display = 'block';
        disconnectBtn.style.display = 'none';
        if (status === 'Desconectado' || status.startsWith('Desconectado')) {
            qrContainer.innerHTML = '<p>Clique em "Conectar" para gerar o QR Code.</p>';
        }
    }
});

window.electronAPI.onSettingsLoaded((settings) => {
    console.log('Settings loaded:', settings);
    apiProviderInput.value = settings.provider || 'openai';
    apiKeyInput.value = settings.apiKey || '';
    knowledgePromptInput.value = settings.prompt || '';
    responseDelayInput.value = settings.delay || 10;

    // Populate model inputs
    openaiModelInput.value = settings.models?.openai || 'gpt-4o';
    geminiModelInput.value = settings.models?.gemini || 'gemini-1.5-flash';
    openrouterModelInput.value = settings.models?.openrouter || 'openai/gpt-4o';

    updateModelGroupVisibility(); // Set initial visibility
});

// --- Initial Load ---

document.addEventListener('DOMContentLoaded', () => {
    window.electronAPI.loadSettings();
});