document.getElementById('refresh-button').disabled = true;
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
        document.getElementById('message').style.display = 'none';
        document.querySelector('[data-view="transcript"]').disabled = false;
    } else {
        document.getElementById('message').innerText = 'Go to a YouTube video for the extension to work.';
        document.getElementById('message').style.display = 'block';
    }
});

// Toggle buttons
const toggleButtons = document.querySelectorAll('.toggle-button');

toggleButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
        const view = btn.getAttribute('data-view');
        const outputBox = document.getElementById('output-box');

        // Visual spinner while fetching
        outputBox.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';
        toggleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (view === 'transcript') {
            if (!transcript && !isFetching) {
                isFetching = true;
                const result = await extractTranscript();
                transcript = result.transcript;
                videoTitle = result.title;
                isFetching = false;

                if (transcript && transcript !== 'Error fetching transcript') {
                    updateOutput(`${videoTitle}\n\n${transcript}`, 'transcript');
                    document.querySelector('[data-view="summary"]').disabled = false;
                    document.getElementById('copy-content').disabled = false;
                    document.getElementById('download-content').disabled = false;
                } else {
                    outputBox.innerText = 'Failed to fetch transcript.';
                }
            } else {
                updateOutput(`${videoTitle}\n\n${transcript}`, 'transcript');
            }
        }

        if (view === 'summary') {
            if (!transcript) {
                outputBox.innerText = 'Please get the transcript first.';
                return;
            }

            if (!summary) {
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
                        updateOutput(summary, 'summary');
                        document.getElementById('refresh-button').disabled = false;
                        document.getElementById('copy-content').disabled = false;
                        document.getElementById('download-content').disabled = false;
                    } else {
                        outputBox.innerText = 'No summary returned.';
                    }
                } catch (err) {
                    outputBox.innerText = 'Failed to summarize transcript.';
                    document.querySelector('[data-view="transcript"]').disabled = false;
                    document.querySelector('[data-view="summary"]').disabled = true;
                    console.error(err);
                }
            } else {
                updateOutput(summary, 'summary');
            }
        }
    });
});

// Copy to clipboard
document.getElementById('copy-content').addEventListener('click', async () => {
    if (currentContent) {
        await navigator.clipboard.writeText(currentContent);
        const btn = document.getElementById('copy-content');
        btn.innerText = 'Copied!';
        setTimeout(() => { btn.innerText = 'Copy'; }, 2000);
    }
});

// Download content
document.getElementById('download-content').addEventListener('click', async () => {
    if (!currentContent) return;
  
    const isTranscript = document.querySelector('[data-view="transcript"]').classList.contains('active');
    const type = isTranscript ? 'transcript' : 'summary';
  
    // Grab current video ID from the tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const videoId = new URL(tabs[0].url).searchParams.get('v') || 'video';
  
    const filename = `YouTube-${videoId}_${type}.txt`;
  
    const blob = new Blob([currentContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  
    URL.revokeObjectURL(url);
});

// Refresh button
document.getElementById('refresh-button').addEventListener('click', () => {
    transcript = '';
    summary = '';
    videoTitle = '';
    currentContent = '';
    isFetching = false;

    document.getElementById('output-box').innerHTML = '';
    document.getElementById('copy-content').disabled = true;
    document.getElementById('download-content').disabled = true;

    // Reset toggle states
    toggleButtons.forEach(b => {
        b.classList.remove('active');
        b.disabled = b.getAttribute('data-view') !== 'transcript';
    });

    // Optionally simulate click on Transcript
    document.querySelector('[data-view="transcript"]').click();

    document.getElementById('copy-content').innerText = 'Copy';

    document.getElementById('refresh-button').disabled = true;
});

// Utility: update content & active toggle
function updateOutput(content, view) {
    const outputBox = document.getElementById('output-box');
    currentContent = content;
    outputBox.innerText = content;

    toggleButtons.forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`[data-view="${view}"]`);
    if (btn) btn.classList.add('active');
}

// Fetch transcript
async function extractTranscript() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];

            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const videoUrl = window.location.href;
                    const apiBaseUrl = 'https://transcript.andreszenteno.com';
                    const payload = { url: videoUrl };

                    return fetch(`${apiBaseUrl}/simple-transcript`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    })
                    .then(res => {
                        if (!res.ok) throw new Error('Fetch failed');
                        return res.json();
                    })
                    .then(data => ({ title: data.title, transcript: data.transcript }))
                    .catch(err => ({ title: '', transcript: 'Error fetching transcript' }));
                },
            }, (results) => {
                if (chrome.runtime.lastError || !results || !results[0]) {
                    console.error('Script injection error:', chrome.runtime.lastError);
                    return resolve({ title: '', transcript: 'Error fetching transcript' });
                }
                resolve(results[0].result);
            });
        });
    });
}
