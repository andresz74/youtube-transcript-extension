import { getTranscriptEndpoint, REQUEST_TIMEOUT_MS } from './config.js';

async function parseErrorResponse(response) {
    const contentType = response.headers.get('content-type') || '';

    try {
        if (contentType.includes('application/json')) {
            const body = await response.json();
            return body.error || body.message || '';
        }

        const text = await response.text();
        return text ? text.slice(0, 160) : '';
    } catch {
        return '';
    }
}

export async function fetchTranscript(url, lang = '') {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(getTranscriptEndpoint(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, lang }),
            signal: controller.signal,
        });

        if (!response.ok) {
            const errorDetails = await parseErrorResponse(response);
            throw new Error(
                `Failed to fetch transcript (HTTP ${response.status}${errorDetails ? `: ${errorDetails}` : ''})`,
            );
        }

        return { data: await response.json(), error: null };
    } catch (error) {
        if (error.name === 'AbortError') {
            return { data: null, error: `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s.` };
        }

        return { data: null, error: error.message || 'Unexpected transcript API error.' };
    } finally {
        clearTimeout(timeoutId);
    }
}
