// src/utils/audioHelper.js

export const playAudio = (audioUrl, fallbackText) => {
    if (audioUrl && audioUrl.trim() !== '') {
        const audio = new Audio(audioUrl);
        audio.play().catch((error) => {
            console.error("Failed to play audio from URL, falling back to Text-to-Speech:", error);
            speakText(fallbackText);
        });
        return;
    }

    speakText(fallbackText);
};

const speakText = (text) => {
    if (!text || !text.trim()) {
        alert("No text available for pronunciation!");
        return;
    }

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP'; 
        utterance.rate = 0.9;     
        
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Your browser does not support automatic text-to-speech pronunciation.");
    }
};