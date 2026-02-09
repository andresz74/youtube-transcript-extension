import { validateTranscriptResponse } from './transcript-contract.js';
import { fetchTranscript } from './transcript-api.js';
import {
    hideMessage,
    renderLanguageSelect,
    renderLoading,
    renderTranscript,
    setMessage,
} from './ui.js';
import { getActiveTabVideoUrl } from './url-detection.js';

const messageBox = document.getElementById('message');
const transcriptOutput = document.getElementById('transcript-output');
const transcriptLanguages = document.getElementById('transcript-languages');
const extractButton = document.getElementById('extract-transcript');
const copyButton = document.getElementById('copy-transcript');

let transcript = '';
let videoTitle = '';
let videoUrl = '';

function initializeUiState() {
    hideMessage(messageBox);
    extractButton.disabled = true;
    copyButton.disabled = true;
}

async function initializeVideoContext() {
    const { videoUrl: detectedVideoUrl, error } = await getActiveTabVideoUrl();

    if (!detectedVideoUrl) {
        setMessage(messageBox, error || 'No YouTube video found on this page.');
        return;
    }

    videoUrl = detectedVideoUrl;
    extractButton.disabled = false;
}

async function loadTranscript(lang = '') {
    renderLoading(transcriptOutput, !lang);

    const { data, error } = await fetchTranscript(videoUrl, lang);
    if (error) {
        setMessage(messageBox, `Error: ${error}`);
        transcriptOutput.innerHTML = 'Error fetching transcript';
        return;
    }

    const validation = validateTranscriptResponse(data);
    if (!validation.valid) {
        setMessage(messageBox, `Error: ${validation.error}`);
        transcriptOutput.innerHTML = 'Invalid transcript response';
        return;
    }

    const transcriptPayload = validation.data;

    hideMessage(messageBox);
    copyButton.disabled = false;
    transcript = transcriptPayload.transcript;
    videoTitle = transcriptPayload.title;

    renderTranscript(transcriptOutput, videoTitle, transcript);
    renderLanguageSelect(
        transcriptLanguages,
        transcriptPayload.languages,
        transcriptPayload.transcriptLanguageCode,
        async (event) => {
            const selectedLanguage = event.target.value;
            if (!selectedLanguage) {
                return;
            }

            await loadTranscript(selectedLanguage);
        },
    );
}

extractButton.addEventListener('click', async () => {
    await loadTranscript('');
});

copyButton.addEventListener('click', async () => {
    if (!transcript) {
        return;
    }

    await navigator.clipboard.writeText(`${videoTitle}\n\n${transcript}`);
    copyButton.innerText = 'Copied!';
    setTimeout(() => {
        copyButton.innerText = 'Copy';
    }, 2000);
});

initializeUiState();
initializeVideoContext();
