function isString(value) {
    return typeof value === 'string';
}

function hasValidLanguageEntries(languages) {
    return languages.every((language) => {
        return (
            language &&
            typeof language === 'object' &&
            isString(language.code) &&
            isString(language.name)
        );
    });
}

export function validateTranscriptResponse(payload) {
    if (!payload || typeof payload !== 'object') {
        return { valid: false, error: 'Invalid API response: expected an object.' };
    }

    if (!isString(payload.title)) {
        return { valid: false, error: 'Invalid API response: "title" must be a string.' };
    }

    if (!isString(payload.transcript)) {
        return { valid: false, error: 'Invalid API response: "transcript" must be a string.' };
    }

    if (!Array.isArray(payload.languages)) {
        return { valid: false, error: 'Invalid API response: "languages" must be an array.' };
    }

    if (!hasValidLanguageEntries(payload.languages)) {
        return {
            valid: false,
            error: 'Invalid API response: each language must include string "code" and "name".',
        };
    }

    if (!isString(payload.transcriptLanguageCode)) {
        return {
            valid: false,
            error: 'Invalid API response: "transcriptLanguageCode" must be a string.',
        };
    }

    return {
        valid: true,
        data: {
            title: payload.title,
            transcript: payload.transcript,
            languages: payload.languages,
            transcriptLanguageCode: payload.transcriptLanguageCode,
        },
    };
}
