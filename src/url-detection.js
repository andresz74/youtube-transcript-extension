function isDirectYouTubeVideoUrl(url) {
    return (
        url.includes('youtube.com/watch?v=') ||
        url.includes('youtube.com/shorts') ||
        url.includes('youtu.be/')
    );
}

function extractEmbeddedVideoUrl() {
    const iframe = Array.from(document.querySelectorAll('iframe')).find((node) =>
        node.src.includes('youtube.com/embed/'),
    );
    return iframe ? iframe.src : null;
}

function getEmbeddedVideoUrl(tabId) {
    return new Promise((resolve) => {
        chrome.scripting.executeScript(
            {
                target: { tabId },
                func: extractEmbeddedVideoUrl,
            },
            (results) => {
                if (chrome.runtime.lastError || !results || results.length === 0) {
                    resolve(null);
                    return;
                }

                resolve(results[0]?.result || null);
            },
        );
    });
}

function normalizeVideoUrlFromIframe(iframeSrc) {
    const videoId = iframeSrc.split('embed/')[1]?.split('?')[0];
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
}

export async function getActiveTabVideoUrl() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];

    if (!tab || !tab.id) {
        return { videoUrl: null, error: 'Unable to access the current tab.' };
    }

    const tabUrl = typeof tab.url === 'string' ? tab.url : '';
    if (isDirectYouTubeVideoUrl(tabUrl)) {
        return { videoUrl: tabUrl, error: null };
    }

    const iframeSrc = await getEmbeddedVideoUrl(tab.id);
    if (!iframeSrc) {
        return { videoUrl: null, error: 'No YouTube video found on this page.' };
    }

    return {
        videoUrl: normalizeVideoUrlFromIframe(iframeSrc),
        error: null,
    };
}
