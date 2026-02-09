export function setMessage(messageBox, text) {
    messageBox.innerText = text;
    messageBox.style.display = 'block';
}

export function hideMessage(messageBox) {
    messageBox.style.display = 'none';
}

export function renderLoading(transcriptOutput, includeText = true) {
    const loadingText = includeText
        ? '<div class="spinner-text">Fetching transcript... This may take a few seconds.</div>'
        : '';

    transcriptOutput.innerHTML = `<div class="spinner-container"><div class="spinner"></div>${loadingText}</div>`;
}

export function renderTranscript(transcriptOutput, videoTitle, transcript) {
    transcriptOutput.innerHTML = '';

    const titleEl = document.createElement('strong');
    titleEl.textContent = videoTitle || 'Untitled video';

    const spacerOne = document.createElement('br');
    const spacerTwo = document.createElement('br');
    const transcriptText = document.createElement('span');
    transcriptText.textContent = transcript || '';

    transcriptOutput.appendChild(titleEl);
    transcriptOutput.appendChild(spacerOne);
    transcriptOutput.appendChild(spacerTwo);
    transcriptOutput.appendChild(transcriptText);
}

export function renderLanguageSelect(container, languages, currentLangCode, onChange) {
    container.innerHTML = '';

    if (!languages || languages.length === 0) {
        return;
    }

    const select = document.createElement('select');
    select.innerHTML = '<option value="">Available languages</option>';

    languages.forEach((lang) => {
        const option = document.createElement('option');
        option.value = lang.code;
        option.textContent = lang.name;
        option.selected = lang.code === currentLangCode;
        select.appendChild(option);
    });

    select.addEventListener('change', onChange);
    container.appendChild(select);
}
