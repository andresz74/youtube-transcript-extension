import { describe, expect, it } from 'vitest';

import { validateTranscriptResponse } from '../src/transcript-contract.js';

describe('validateTranscriptResponse', () => {
    it('accepts a valid transcript payload', () => {
        const payload = {
            title: 'Sample video',
            transcript: 'Transcript body',
            languages: [{ code: 'en', name: 'English' }],
            transcriptLanguageCode: 'en',
        };

        const result = validateTranscriptResponse(payload);

        expect(result.valid).toBe(true);
        expect(result.data).toEqual(payload);
    });

    it('rejects when required fields are missing or malformed', () => {
        const payload = {
            title: 'Sample video',
            transcript: 'Transcript body',
            languages: 'en',
            transcriptLanguageCode: 'en',
        };

        const result = validateTranscriptResponse(payload);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('languages');
    });

    it('rejects malformed language entries', () => {
        const payload = {
            title: 'Sample video',
            transcript: 'Transcript body',
            languages: [{ code: 123, name: 'English' }],
            transcriptLanguageCode: 'en',
        };

        const result = validateTranscriptResponse(payload);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('language');
    });
});
