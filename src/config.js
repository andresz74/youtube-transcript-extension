const DEFAULT_API_BASE_URL = 'https://transcript.andreszenteno.com';
const API_BASE_OVERRIDE_KEY = 'ytTranscriptApiBaseUrl';

export const REQUEST_TIMEOUT_MS = 60000;

export function getApiBaseUrl() {
    const override = (localStorage.getItem(API_BASE_OVERRIDE_KEY) || '').trim();
    return override || DEFAULT_API_BASE_URL;
}

export function getTranscriptEndpoint() {
    return `${getApiBaseUrl()}/simple-transcript-v3`;
}
