import {
    getTranscriptAsyncEndpoint,
    getTranscriptStatusEndpoint,
    REQUEST_TIMEOUT_MS,
} from './config.js';

const POLL_INTERVAL_MS = 2000;

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
        const response = await fetch(getTranscriptAsyncEndpoint(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, lang }),
            signal: controller.signal,
        });

        if (response.status === 202) {
            const job = await response.json();
            return await pollTranscriptJob(job, controller.signal);
        }

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

async function pollTranscriptJob(job, signal) {
    if (!job?.requestId) {
        throw new Error('Transcript job response is missing a requestId.');
    }

    while (true) {
        await wait(POLL_INTERVAL_MS, signal);

        const response = await fetch(getTranscriptStatusEndpoint(job.requestId), {
            method: 'GET',
            signal,
        });

        if (!response.ok) {
            const errorDetails = await parseErrorResponse(response);
            throw new Error(
                `Failed to fetch transcript status (HTTP ${response.status}${errorDetails ? `: ${errorDetails}` : ''})`,
            );
        }

        const payload = await response.json();

        if (payload.status === 'queued' || payload.status === 'processing') {
            continue;
        }

        if (payload.status === 'failed') {
            throw new Error(payload.error?.message || 'Transcript generation failed.');
        }

        if (payload.status === 'succeeded') {
            return { data: payload.result, error: null };
        }

        throw new Error(`Unexpected transcript job status: ${payload.status}`);
    }
}

function wait(ms, signal) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            cleanup();
            resolve();
        }, ms);

        const onAbort = () => {
            cleanup();
            const error = new Error('Request aborted');
            error.name = 'AbortError';
            reject(error);
        };

        const cleanup = () => {
            clearTimeout(timeoutId);
            signal?.removeEventListener('abort', onAbort);
        };

        if (signal?.aborted) {
            onAbort();
            return;
        }

        signal?.addEventListener('abort', onAbort);
    });
}
