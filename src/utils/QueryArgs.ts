

export const getQueryArg = (key: string, defaultValue: string | null = null): string | null => {
    return new URLSearchParams(window.location.search).get(key) ?? defaultValue;
};