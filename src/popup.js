// Disable buttons by default
document.getElementById('extract-transcript').disabled = true;
document.getElementById('copy-transcript').disabled = true;

let transcript = ''; // Global variable to store the transcript
let videoTitle = ''; // Global variable to store the video title

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
            const resultData = results[0].result;
            transcript = resultData.transcript;  // Assign the extracted transcript to the global variable
            videoTitle = resultData.title;  // Assign the video title to the global variable

            // Display the video title and transcript, remove the spinner
            transcriptOutput.innerHTML = '';  // Clear the spinner
            transcriptOutput.innerHTML = `<strong>${videoTitle}</strong><br><br>${transcript}`;  // Insert title and transcript

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
        const fullTranscript = `${videoTitle}\n\n${transcript}`;
        await navigator.clipboard.writeText(fullTranscript);
        const copyButton = document.getElementById('copy-transcript');
        copyButton.innerText = 'Copied!';

        // Reset button text after 2 seconds
        setTimeout(() => {
            copyButton.innerText = 'Copy';
        }, 2000);
    }
});

// Function to extract transcript and title from YouTube video (runs in YouTube tab context)
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
        return { title: data.title, transcript: data.transcript };
    } catch (error) {
        return { title: '', transcript: 'Error fetching transcript' };
    }
}
