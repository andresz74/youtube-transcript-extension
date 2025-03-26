# YouTube Transcript Extension

YouTube Transcript Extension is a Chrome extension that allows users to easily extract the transcript of any YouTube video. The extension is designed to fetch and display the transcript within a popup, and users can also copy the transcript to their clipboard.

## Features

- Automatically fetches YouTube video transcripts.
- Displays the transcript in a clean, scrollable interface.
- Allows users to copy the transcript to the clipboard.
- Works on any YouTube video page.

## Important: Required Backend Service

To work correctly, this extension requires a local or remote backend service to fetch transcripts from YouTube videos. Before using the extension, you **must first clone and run** the following API service:

➡️ **[youtube-transcript-generator](https://github.com/andresz74/youtube-transcript-generator)**

This service handles communication with YouTube, extracts the transcript and video title, and provides the data to the extension via a REST API.

Make sure the service is running and accessible at the correct URL (as configured in `popup.js`) before attempting to extract transcripts.

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

If you're running the API locally, make sure to update the base URL in `popup.js`.


## Development

### Prerequisites

- Ensure you have [Git](https://git-scm.com/) installed for version control.
- [Node.js](https://nodejs.org/) and npm (if using Node.js for any project dependencies).

### Project Structure

```
📁 extension-root
├── 📁 icons             # Icon files for different sizes (16x16, 48x48, 128x128)
├── 📁 src               # Source files
│   ├── background.js    # Handles extension logic and background scripts
│   ├── popup.js         # Handles UI interactions and message passing
│   ├── content.js       # Content script for interacting with the web page
│   ├── popup.html       # Popup UI for displaying transcript and buttons
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

## Contributing

Feel free to fork this repository and make changes. Pull requests are welcome!

## License

This project is licensed under the MIT License.
