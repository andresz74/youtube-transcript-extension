# YouTube Transcript Extension

YouTube Transcript Extension is a Chrome extension that allows users to easily extract the transcript of any YouTube video. The extension is designed to fetch and display the transcript within a popup, and users can also copy the transcript to their clipboard.

![YouTube Transcript Extractor](https://objects-us-east-1.dream.io/az-assets/youtube-transcript-extension.png)

## Features

- Automatically fetches YouTube video transcripts.
- Displays the transcript in a clean, scrollable interface.
- Allows users to copy the transcript to the clipboard.
- Works on any YouTube video page.

## Important: Required Backend Service

To work correctly, this extension requires a local or remote backend service to fetch transcripts from YouTube videos. Before using the extension, you **must first clone and run** the following API service:

➡️ **[youtube-transcript-generator](https://github.com/andresz74/youtube-transcript-generator)**

This service handles communication with YouTube, extracts the transcript and video title, and provides the data to the extension via a REST API.

Make sure the service is running and accessible at the configured API URL before attempting to extract transcripts.

## Installation

To install the extension locally for development purposes:

1. Clone this repository to your local machine:

    ```bash
    git clone https://github.com/andresz74/youtube-transcript-extension.git
    ```

2. Open Chrome and navigate to `chrome://extensions/`.

3. Enable **Developer Mode** by toggling the switch in the top right corner.

4. Click the **Load unpacked** button and select the cloned repository folder.

5. The extension will now appear in your Chrome toolbar.

## Usage

1. Navigate to any YouTube video page.
2. Click the YouTube Transcript Extractor icon in your Chrome toolbar.
3. The video title and transcript will be fetched and displayed in the popup.
4. Click the **Copy Transcript** button to copy the full transcript (including the title) to your clipboard.

> ⚠️ This extension depends on a running transcript API service.  
> By default, it is configured to use:  
> `https://transcript.andreszenteno.com/simple-transcript`

If you're running the API locally, set the API base URL override shown below.

## Development

### Prerequisites

- Ensure you have [Git](https://git-scm.com/) installed for version control.
- [Node.js](https://nodejs.org/) and npm (if using Node.js for any project dependencies).

### Commands

Install dependencies:

```bash
npm install
```

Run lint checks:

```bash
npm run lint
```

Run formatting check:

```bash
npm run format:check
```

Format files:

```bash
npm run format
```

Run tests:

```bash
npm test
```

### Project Structure

```
📁 extension-root
├── 📁 icons             # Icon files for different sizes (16x16, 48x48, 128x128)
├── 📁 src               # Source files
│   ├── popup.html       # Popup UI for displaying transcript and buttons
│   ├── popup.js         # Popup orchestrator
│   ├── transcript-api.js# API client + timeout/error handling
│   ├── url-detection.js # Active tab and embedded video URL detection
│   ├── ui.js            # Popup rendering helpers
│   ├── config.js        # API base URL and request timeout config
├── 📁 styles            # Styles for the popup
│   └── styles.css
├── .gitignore           # Specifies files and directories to ignore in Git
├── manifest.json        # Chrome extension manifest file
└── README.md            # This file
```

### Version Control

- Branch management with Git is encouraged.
- Create a new branch for significant updates:
    ```bash
    git checkout -b feature/new-feature
    ```

### Manual QA checklist

After `chrome://extensions` reload:

- Open `youtube.com/watch?v=...` and verify **Get Transcript** enables.
- Open a `youtube.com/shorts/...` URL and verify transcript loads.
- Open a non-video page and verify the “No YouTube video found” message.
- Click **Get Transcript** and verify spinner, title, and transcript rendering.
- Change transcript language and verify content refreshes.
- Click **Copy** and verify clipboard contains title + transcript.
- Temporarily break API URL override and verify clear error messaging.

## Contributing

Feel free to fork this repository and make changes. Pull requests are welcome!

## License

This project is licensed under the MIT License.

### API base URL override

You can override the default API base URL without changing code:

```js
localStorage.setItem('ytTranscriptApiBaseUrl', 'http://localhost:3004');
```

Reload the extension popup after setting it. Remove override with:

```js
localStorage.removeItem('ytTranscriptApiBaseUrl');
```
