export const buildUrl = (lang, path) => {
    if (!lang) return '/en';
    if (!path || path === '/') return `/${lang}`;

    // Ensure path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // Strip trailing slash if present
    const strippedPath = normalizedPath.endsWith('/') && normalizedPath !== '/'
        ? normalizedPath.slice(0, -1)
        : normalizedPath;

    return `/${lang}${strippedPath}`;
};

export const getCanonicalUrl = (domain, lang, path) => {
    return `${domain}${buildUrl(lang, path)}`;
};
