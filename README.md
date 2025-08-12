# Bot WhatsApp com IA

Um bot para WhatsApp desenvolvido com Electron e Baileys, integrado com APIs de IA (OpenAI, Google Gemini, OpenRouter) para responder mensagens automaticamente.

## Características

- 🤖 **Integração com IA**: Suporte para OpenAI GPT-4, Google Gemini e OpenRouter
- 🎵 **Transcrição de áudio**: Converte mensagens de voz em texto usando Whisper
- 🖼️ **Processamento de imagens**: Analisa imagens enviadas nas conversas
- 💬 **Interface gráfica**: Interface Electron para configuração e monitoramento
- 📱 **WhatsApp Web**: Conecta via QR Code usando Baileys
- ⚙️ **Configurações personalizáveis**: Sistema de prompts e configurações de IA

## Tecnologias Utilizadas

- **Electron**: Interface desktop
- **Baileys**: Biblioteca para WhatsApp Web
- **OpenAI**: GPT-4 e Whisper para IA e transcrição
- **Google Generative AI**: Gemini para respostas alternativas
- **FFmpeg**: Processamento de áudio
- **QRCode**: Geração de QR codes para autenticação

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/giovanycoelho/botsimples.git
cd botsimples
```

2. Instale as dependências:
```bash
npm install
```

3. Configure suas chaves de API:
   - Abra a aplicação
   - Vá para as configurações
   - Adicione suas chaves de API (OpenAI, Gemini, etc.)

4. Execute o projeto:
```bash
npm start
```

## Configuração

### APIs Suportadas

- **OpenAI**: Para GPT-4 e transcrição Whisper
- **Google Gemini**: Alternativa ao GPT-4
- **OpenRouter**: Acesso a múltiplos modelos de IA

### Conectando ao WhatsApp

1. Execute a aplicação
2. Clique em "Conectar WhatsApp"
3. Escaneie o QR Code com seu WhatsApp
4. Aguarde a confirmação de conexão

## Estrutura do Projeto

```
├── src/
│   ├── ai.js              # Integração com APIs de IA
│   ├── baileys.js         # Gerenciamento do WhatsApp
│   ├── message-processor.js # Processamento de mensagens
│   ├── utils.js           # Utilitários
│   └── location.js        # Processamento de localização
├── main.js                # Processo principal do Electron
├── renderer.js            # Interface do usuário
├── preload.js            # Script de pré-carregamento
├── index.html            # Interface HTML
├── style.css             # Estilos
└── package.json          # Dependências e scripts
```

## Funcionalidades

### Processamento de Mensagens
- Texto simples
- Mensagens de áudio (transcritas automaticamente)
- Imagens (analisadas pela IA)
- Mensagens em grupo e privadas

### Sistema de IA
- Histórico de conversas mantido por chat
- Prompts personalizáveis
- Múltiplos provedores de IA
- Processamento de mídia

## Segurança

⚠️ **Importante**: 
- Nunca compartilhe suas chaves de API
- Os arquivos de autenticação do WhatsApp são mantidos localmente
- Use com responsabilidade e respeite os termos de uso do WhatsApp

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests

## Licença

Este projeto está sob a licença ISC.

## Aviso Legal

Este bot é para uso educacional e pessoal. Certifique-se de cumprir os termos de serviço do WhatsApp e das APIs utilizadas.