// Disable buttons by default
document.getElementById('extract-transcript').disabled = true;
document.getElementById('summarize-transcript').disabled = true;
document.getElementById('copy-content').disabled = true;

let transcript = '';
let videoTitle = '';
let summary = '';
let currentContent = '';
let isFetching = false;

// Enable extension on YouTube pages
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab.url.includes('youtube.com/watch?v=')) {
        document.getElementById('extract-transcript').disabled = false;
        document.getElementById('message').style.display = 'none';
    } else {
        document.getElementById('message').innerText = 'Go to a YouTube video for the extension to work.';
        document.getElementById('message').style.display = 'block';
    }
});

document.getElementById('extract-transcript').addEventListener('click', async () => {
    if (isFetching) return;
    isFetching = true;
    const outputBox = document.getElementById('output-box');
    outputBox.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const tab = tabs[0];
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: extractTranscript,
        }, (results) => {
            const resultData = results[0].result;
            transcript = resultData.transcript;
            videoTitle = resultData.title;

            if (transcript && transcript !== 'Error fetching transcript') {
                isFetching = false;
                currentContent = `${videoTitle}\n\n${transcript}`;
                outputBox.innerText = currentContent;
                document.getElementById('extract-transcript').disabled = true;
                document.getElementById('summarize-transcript').disabled = false;
                document.querySelector('[data-view="transcript"]').disabled = false;
                document.getElementById('copy-content').disabled = false;
                // Set transcript toggle as active
                document.querySelectorAll('.toggle-button').forEach(b => b.classList.remove('active'));
                document.querySelector('[data-view="transcript"]').classList.add('active');
            } else {
                outputBox.innerText = 'Failed to fetch transcript.';
            }
        });
    });
});

document.getElementById('summarize-transcript').addEventListener('click', async () => {
    if (!transcript) return;

    const outputBox = document.getElementById('output-box');
    outputBox.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';

    const chatGptMessages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: `Please summarize this YouTube transcript:\n\n${transcript}` }
    ];

    try {
        const response = await fetch('https://chat-gpt-access.vercel.app/api/openai-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatGptMessages }),
        });

        if (!response.ok) throw new Error('Error summarizing transcript');
        const data = await response.json();
        summary = data.choices?.[0]?.message?.content;

        if (summary) {
            currentContent = summary;
            outputBox.innerText = summary;
            document.getElementById('summarize-transcript').disabled = true;
            document.getElementById('copy-content').disabled = false;
            document.querySelector('[data-view="summary"]').disabled = false;
            document.querySelectorAll('.toggle-button').forEach(b => b.classList.remove('active'));
            document.querySelector('[data-view="summary"]').classList.add('active');
        } else {
            outputBox.innerText = 'No summary returned.';
        }
    } catch (err) {
        outputBox.innerText = 'Failed to summarize transcript.';
        console.error(err);
    }
});

document.getElementById('copy-content').addEventListener('click', async () => {
    if (currentContent) {
        await navigator.clipboard.writeText(currentContent);
        const btn = document.getElementById('copy-content');
        btn.innerText = 'Copied!';
        setTimeout(() => { btn.innerText = 'Copy'; }, 2000);
    }
});

// Add listeners to toggle buttons
function updateOutput(content, view) {
    const outputBox = document.getElementById('output-box');
    currentContent = content;
    outputBox.innerText = content;

    // Update toggle button UI
    document.querySelectorAll('.toggle-button').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`[data-view="${view}"]`);
    if (btn) btn.classList.add('active');
}

const toggleButtons = document.querySelectorAll('.toggle-button');

toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        const outputBox = document.getElementById('output-box');

        // Activate clicked button
        toggleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (view === 'transcript' && transcript) {
            updateOutput(`${videoTitle}\n\n${transcript}`, 'transcript');
        }

        if (view === 'summary') {
            if (summary) {
                updateOutput(summary, 'summary');
            } else {
                outputBox.innerText = 'No summary available yet.';
            }
        }
    });
});

async function extractTranscript() {
    const videoUrl = window.location.href;
    const apiBaseUrl = 'https://transcript.andreszenteno.com';
    const payload = { url: videoUrl };

    try {
        const response = await fetch(`${apiBaseUrl}/simple-transcript`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Error fetching transcript');
        const data = await response.json();
        return { title: data.title, transcript: data.transcript };
    } catch (error) {
        return { title: '', transcript: 'Error fetching transcript' };
    }
}

document.getElementById('refresh-button').addEventListener('click', async () => {
    // Reset content
    transcript = '';
    summary = '';
    currentContent = '';
    document.getElementById('output-box').innerHTML = '';
    document.getElementById('copy-content').disabled = true;
    document.getElementById('summarize-transcript').disabled = true;

    // Re-fetch transcript
    document.getElementById('extract-transcript').click();
});
