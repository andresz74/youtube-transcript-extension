// Disable buttons by default
const messageBox = document.getElementById('message');
messageBox.style.display = 'none';
document.getElementById('extract-transcript').disabled = true;
document.getElementById('copy-transcript').disabled = true;

let transcript = ''; // Global variable to store the transcript
let videoTitle = ''; // Global variable to store the video title
let videoUrl = '';

const apiBaseUrl = 'https://transcript.andreszenteno.com';

// Check if we're on a YouTube video page
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    // Check if it's a direct YouTube video URL
    if (tab.url.includes('youtube.com/watch?v=') || tab.url.includes('youtube.com/shorts') || tab.url.includes('youtu.be/')) {
        // If it's a regular YouTube page
        videoUrl = tab.url;
        document.getElementById('extract-transcript').disabled = false;
    }  else {
        // Check if the page contains an embedded YouTube video (run script within the page)
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: extractEmbeddedVideoUrl
        }, (results) => {
            const iframeSrc = results[0]?.result;  // Get the iframe src from the result
            if (iframeSrc) {
                const videoId = iframeSrc.split('embed/')[1]?.split('?')[0];  // Extract video ID from iframe src
                if (videoId) {
                    videoUrl = `https://www.youtube.com/watch?v=${videoId}`;  // Build full YouTube URL
                    document.getElementById('extract-transcript').disabled = false;
                }
            } else {
                // If no YouTube video found, show message
                messageBox.style.display = 'block';
                messageBox.innerText = 'No YouTube video found on this page.';
            }
        });
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
            args: [videoUrl]
        }, (results) => {
            const resultData = results[0].result;
            transcript = resultData.transcript;  // Assign the extracted transcript to the global variable
            videoTitle = resultData.title;  // Assign the video title to the global variable
            const languages = resultData.languages;  // Get the available languages
            const transcriptLanguages = document.getElementById('transcript-languages');
            transcriptLanguages.innerHTML = '';  // Clear previous languages
            if (languages && languages.length > 0) {
                // Create a dropdown for available languages
                const select = document.createElement('select');
                select.id = 'language-select';
                select.innerHTML = `<option value="">Available Languages</option>`;
                languages.forEach(lang => {
                    const option = document.createElement('option');
                    option.value = lang.code;
                    option.textContent = lang.name;
                    select.appendChild(option);
                });
                transcriptLanguages.appendChild(select);

                // Add event listener to update transcript based on selected language
                select.addEventListener('change', async (event) => {
                    const selectedLanguage = event.target.value;
                    transcriptOutput.innerHTML = '';  // Clear previous content
                    transcriptOutput.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';  // Show spinner again
                    if (selectedLanguage) {
                        const response = await fetch(`${apiBaseUrl}/simple-transcript-test`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url: videoUrl, lang: selectedLanguage }),
                        });
                        if (!response.ok) {
                            messageBox.innerText = `${response.status}: ${errorData.message}`;
                            messageBox.style.display = 'block';
                            return;
                        }
                        const data = await response.json();
                        transcriptOutput.innerHTML = '';  // Clear the spinner
                        transcriptOutput.innerHTML = `<strong>${videoTitle}</strong><br><br>${data.transcript}`;  // Insert title and transcript
                    }
                });
            }

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

// Function to extract the embedded YouTube video URL (runs inside the page)
function extractEmbeddedVideoUrl() {
    // Check all iframes for YouTube embeds
    const iframes = document.querySelectorAll('iframe');
    for (let iframe of iframes) {
        const src = iframe.src;
        if (src.includes('youtube.com/embed/')) {
            return src;  // Return the iframe src if it's a YouTube embed
        }
    }
    return null;  // No YouTube iframe found
}

// Function to extract transcript and title from YouTube video (runs in YouTube tab context)
async function extractTranscript(videoUrl) {
    const apiBaseUrl = 'https://transcript.andreszenteno.com';
    const payload = { url: videoUrl };
    try {
        const response = await fetch(`${apiBaseUrl}/simple-transcript-test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            messageBox.innerText = `${response.status}: ${errorData.message}`;
            messageBox.style.display = 'block';
            throw new Error('Error fetching transcriptt');
        }

        const data = await response.json();
        return { title: data.title, transcript: data.transcript, languages: data.languages };
    } catch (error) {
        return { title: '', transcript: 'Error fetching transcript' };
    }
}
