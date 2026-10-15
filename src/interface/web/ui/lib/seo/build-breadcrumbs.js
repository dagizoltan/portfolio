import { SITE } from './site.js';

export const buildBreadcrumbs = (items, domain = SITE.domain) => {
    if (!items || items.length === 0) return null;

    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": `${domain}${item.url}`
        }))
    };
};
