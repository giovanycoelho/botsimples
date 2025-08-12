function splitMessage(text, maxLength = 400) {
    const chunks = [];
    let currentChunk = "";

    // First, split by newlines to respect paragraph breaks
    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
        if (currentChunk.length + paragraph.length + 1 > maxLength) {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = paragraph;
        } else {
            currentChunk += (currentChunk ? "\n" : "") + paragraph;
        }
    }
    if (currentChunk) chunks.push(currentChunk);

    // Further split any chunks that are still too long
    const finalChunks = [];
    for (const chunk of chunks) {
        if (chunk.length > maxLength) {
            let subChunk = "";
            const words = chunk.split(' ');
            for (const word of words) {
                if (subChunk.length + word.length + 1 > maxLength) {
                    finalChunks.push(subChunk);
                    subChunk = word;
                } else {
                    subChunk += (subChunk ? " " : "") + word;
                }
            }
            if (subChunk) finalChunks.push(subChunk);
        } else {
            finalChunks.push(chunk);
        }
    }

    return finalChunks;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { splitMessage, sleep };