import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchTranscript } from '../src/transcript-api.js';

describe('fetchTranscript', () => {
    function createLocalStorageMock() {
        const store = new Map();
        return {
            getItem(key) {
                return store.has(key) ? store.get(key) : null;
            },
            setItem(key, value) {
                store.set(key, String(value));
            },
            removeItem(key) {
                store.delete(key);
            },
            clear() {
                store.clear();
            },
        };
    }

    beforeEach(() => {
        vi.stubGlobal('localStorage', createLocalStorageMock());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns parsed data on success', async () => {
        const payload = {
            title: 'A title',
            transcript: 'Transcript text',
            languages: [{ code: 'en', name: 'English' }],
            transcriptLanguageCode: 'en',
        };

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => payload,
            }),
        );

        const result = await fetchTranscript('https://www.youtube.com/watch?v=abc', '');

        expect(result.error).toBeNull();
        expect(result.data).toEqual(payload);
    });

    it('returns detailed errors for non-OK JSON responses', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                headers: {
                    get: () => 'application/json',
                },
                json: async () => ({ error: 'Unauthorized' }),
                text: async () => '',
            }),
        );

        const result = await fetchTranscript('https://www.youtube.com/watch?v=abc', '');

        expect(result.data).toBeNull();
        expect(result.error).toContain('HTTP 401');
        expect(result.error).toContain('Unauthorized');
    });
});
