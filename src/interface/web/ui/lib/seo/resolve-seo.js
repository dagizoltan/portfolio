import { getCanonicalUrl } from '../routes.js';
import { SITE } from './site.js';

/**
 * Derives canonical/hreflang URLs and social metadata for a page.
 *
 * The language segment is stripped from the request path so the same logical
 * route can emit both /en/... and /hu/... alternates.
 */
export const resolveSeo = (pageData, currentPath, lang) => {
    const head = pageData.head || {};

    let pathWithoutLang = '/';
    if (currentPath) {
        const parts = currentPath.split('/');
        if (SITE.languages.includes(parts[1])) {
            pathWithoutLang = parts.length > 2 ? '/' + parts.slice(2).join('/') : '/';
        } else {
            pathWithoutLang = currentPath;
        }
    }

    if (pathWithoutLang !== '/' && pathWithoutLang.endsWith('/')) {
        pathWithoutLang = pathWithoutLang.slice(0, -1);
    }

    const routePath = pathWithoutLang === '/' ? '' : pathWithoutLang;
    const enUrl = getCanonicalUrl(SITE.domain, 'en', routePath);
    const huUrl = getCanonicalUrl(SITE.domain, 'hu', routePath);
    const canonicalUrl = lang === 'hu' ? huUrl : enUrl;

    const title = head.title || `${SITE.name} — ${SITE.jobTitle}`;
    const description = head.description || SITE.description;
    const keywords = head.keywords || '';
    const image = head.image || SITE.defaultImage;
    const imageUrl = image.startsWith('http') ? image : `${SITE.domain}${image}`;

    return {
        title,
        description,
        keywords,
        canonicalUrl,
        enUrl,
        huUrl,
        xDefaultUrl: enUrl,
        og: {
            title,
            description,
            url: canonicalUrl,
            siteName: SITE.name,
            type: head.type || 'website',
            image: imageUrl,
            locale: lang === 'hu' ? 'hu_HU' : 'en_US',
            localeAlternate: lang === 'hu' ? 'en_US' : 'hu_HU'
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            image: imageUrl
        }
    };
};
