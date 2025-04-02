# YouTube Transcript Extension

YouTube Transcript Extension is a Chrome extension that allows users to easily extract, **summarize**, copy, and download the transcript of any YouTube video. The extension fetches the data through a backend API and provides a clean, minimal UI for interacting with both the full transcript and the summary.

---

## ✨ Features

- ✅ Automatically fetches YouTube video transcripts.
- ✅ AI-generated summaries powered by OpenAI (via your backend service).
- ✅ Toggle between **Transcript** and **Summary**.
- ✅ Copy the current content (Transcript or Summary) to the clipboard.
- ✅ Download the content as a `.txt` file (with video ID in filename).
- ✅ Refresh functionality to re-fetch both the transcript and the summary.
- ✅ Clean, scrollable interface.
- ✅ Works on any YouTube video page.

---

## 🚀 Important: Required Backend Services

This extension depends on **two backend services** to work:

### 1. Transcript Service
Cloned from:  
➡️ [youtube-transcript-generator](https://github.com/andresz74/youtube-transcript-generator)

- Fetches the transcript and title of a YouTube video.
- You can run this service locally or host it (like `https://transcript.andreszenteno.com`).
- Default endpoint in use:  
  `https://transcript.andreszenteno.com/simple-transcript`

### 2. AI Chat Service (for Summarization)

Powered by OpenAI, this second backend accepts a chat format and returns summaries.  
➡️ Example: [chat-gpt-access](https://github.com/andresz74/ChatGptAccess)  
Used endpoint:  
`https://chat-gpt-access.vercel.app/api/openai-chat`

Make sure **both services are deployed or running locally** and that the URLs are correctly set inside `popup.js`.

---

## 🛠 Installation

To install the extension locally for development:

1. Clone this repository to your local machine:
    ```bash
    git clone https://github.com/andresz74/youtube-transcript-extension.git
    ```

2. Open Chrome and go to:  
   `chrome://extensions/`

3. Enable **Developer Mode** in the top right corner.

4. Click **Load unpacked** and select the cloned folder.

5. The extension icon should now appear in your Chrome toolbar.

---

## 💡 Usage

1. Open any YouTube video.
2. Click the **YouTube Transcript Extractor** icon.
3. The transcript will automatically load.
4. Use the toggle buttons:
   - 📜 **Transcript** to view the full text
   - 🧠 **Summary** to generate and view an AI summary
5. Click:
   - 📋 **Copy** to copy the current content
   - 💾 **Download** to save the content as `.txt`
   - 🔁 **Refresh** to reset and re-fetch data

> ⚠️ Make sure the backend services are running and accessible, or the extension won't be able to fetch the data.

---

## 🧰 Development

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (if modifying any backend or frontend JS behavior)

### Folder Structure

```
📁 extension-root
├── 📁 icons             # Extension icons
├── 📁 src
│   ├── popup.html       # Extension popup UI
│   ├── popup.js         # UI logic and API communication
│   ├── content.js       # (optional) Page scripts
│   ├── background.js    # (optional) Background logic
├── 📁 styles
│   └── styles.css       # Custom UI styles
├── manifest.json        # Chrome extension manifest
└── README.md
```

---

## 🧪 Version Control & Branching

Create a feature branch before pushing major changes:
```bash
git checkout -b feature/my-update
```

---

## 🤝 Contributing

Pull requests are welcome! If you spot a bug or want to suggest a new feature, feel free to open an issue or PR.

---

## 📄 License

This project is licensed under the MIT License.
