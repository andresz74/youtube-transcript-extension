// Disable buttons by default
document.getElementById('extract-transcript').disabled = true;
document.getElementById('copy-transcript').disabled = true;

let transcript = ''; // Global variable to store the transcript

// Check if we're on a YouTube video page
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];

    // Check if it's a YouTube video URL (contains 'watch?v=')
    if (tab.url.includes('youtube.com/watch?v=')) {
        document.getElementById('extract-transcript').disabled = false;
        document.getElementById('message').style.display = 'none';  // Hide the message
    } else {
        document.getElementById('message').innerText = 'Go to a YouTube video for the extension to work.';
        document.getElementById('message').style.display = 'block';  // Show the message
        document.getElementById('extract-transcript').disabled = true;
    }
});


document.getElementById("extract-transcript").addEventListener("click", async () => {
    const transcriptOutput = document.getElementById('transcript-output');
    
    // Clear previous content and show the spinner in a container
    transcriptOutput.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';
    
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const tab = tabs[0];

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: extractTranscript,
        }, (results) => {
            const transcript = results[0].result;

            // Display the transcript and remove the spinner
            transcriptOutput.innerHTML = '';  // Clear the spinner
            transcriptOutput.innerText = transcript;

            if (transcript && transcript !== 'Error fetching transcript') {
                document.getElementById('copy-transcript').disabled = false;
            } else {
                document.getElementById('copy-transcript').disabled = true;
            }
        });
    });
});



document.getElementById('copy-transcript').addEventListener('click', async () => {
    if (transcript) {
        await navigator.clipboard.writeText(transcript);
        const copyButton = document.getElementById('copy-transcript');
        copyButton.innerText = 'Copied!';

        // Reset button text after 2 seconds
        setTimeout(() => {
            copyButton.innerText = 'Copy';
        }, 2000);
    }
});

// Function to extract transcript from YouTube video (runs in YouTube tab context)
async function extractTranscript() {
    const videoUrl = window.location.href;
    const apiBaseUrl = 'https://192.168.1.181/transcript-api';
    const payload = { url: videoUrl };

    try {
        const response = await fetch(`${apiBaseUrl}/simple-transcript`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Error fetching transcript');
        }

        const data = await response.json();
        return data.transcript;
    } catch (error) {
        return 'Error fetching transcript';
    }
}