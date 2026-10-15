import { SITE } from './site.js';

const sameAs = (profiles) =>
    profiles ? profiles.filter((p) => p.href && p.href !== '#').map((p) => p.href) : [];

/**
 * The subject of this site is a person, not an organisation, so `Person` is the
 * root entity every other node points at — the equivalent of the Organization
 * node on a brand site. `@id` is stable across languages so the two locales
 * describe one person rather than two.
 */
export const buildSchema = (type, data = {}, domain = SITE.domain) => {
    const base = {
        "@context": "https://schema.org",
        "@type": type
    };

    const lang = data.lang || 'en';
    const pageUrl = data.url
        ? (data.url.startsWith('http') ? data.url : `${domain}${data.url}`)
        : `${domain}/${lang}`;

    switch (type) {
        case 'Person':
            return {
                ...base,
                "@id": `${domain}/#person`,
                "name": SITE.name,
                "alternateName": SITE.legalName,
                "url": `${domain}/${lang}`,
                "jobTitle": data.jobTitle || SITE.jobTitle,
                "description": data.description || SITE.description,
                "email": `mailto:${SITE.email}`,
                "telephone": SITE.phone,
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": SITE.city,
                    "addressCountry": SITE.country
                },
                ...(data.knowsAbout?.length ? { "knowsAbout": data.knowsAbout } : {}),
                ...(data.knowsLanguage?.length
                    ? {
                        "knowsLanguage": data.knowsLanguage.map((l) => ({
                            "@type": "Language",
                            "name": l.name,
                            ...(l.code ? { "alternateName": l.code } : {})
                        }))
                    }
                    : {}),
                ...(data.alumniOf?.length
                    ? {
                        "alumniOf": data.alumniOf.map((school) => ({
                            "@type": "EducationalOrganization",
                            "name": school
                        }))
                    }
                    : {}),
                ...(data.worksFor
                    ? { "worksFor": { "@type": "Organization", "name": data.worksFor } }
                    : {}),
                "sameAs": sameAs(data.profiles)
            };

        case 'WebSite':
            return {
                ...base,
                "@id": `${domain}/#website`,
                "url": `${domain}/${lang}`,
                "name": SITE.name,
                "publisher": { "@id": `${domain}/#person` },
                "inLanguage": lang
            };

        case 'WebPage':
            return {
                ...base,
                "@id": `${pageUrl}#webpage`,
                "url": pageUrl,
                "name": data.title,
                "description": data.description,
                "isPartOf": { "@id": `${domain}/#website` },
                "about": { "@id": `${domain}/#person` },
                "inLanguage": lang
            };

        case 'ProfilePage':
            return {
                ...base,
                "@id": `${pageUrl}#profilepage`,
                "url": pageUrl,
                "name": data.title,
                "description": data.description,
                "isPartOf": { "@id": `${domain}/#website` },
                "mainEntity": { "@id": `${domain}/#person` },
                "inLanguage": lang
            };

        case 'CollectionPage':
            return {
                ...base,
                "@id": `${pageUrl}#collection`,
                "url": pageUrl,
                "name": data.title,
                "description": data.description,
                "about": { "@id": `${domain}/#person` },
                "inLanguage": lang,
                ...(data.mainEntity ? { "mainEntity": data.mainEntity } : {})
            };

        case 'AboutPage':
            return {
                ...base,
                "@id": `${pageUrl}#aboutpage`,
                "url": pageUrl,
                "name": data.title,
                "description": data.description,
                "mainEntity": { "@id": `${domain}/#person` },
                "inLanguage": lang
            };

        case 'ContactPage':
            return {
                ...base,
                "@id": `${pageUrl}#contactpage`,
                "url": pageUrl,
                "name": data.title,
                "description": data.description,
                "mainEntity": { "@id": `${domain}/#person` },
                "inLanguage": lang
            };

        case 'FAQPage':
            return {
                ...base,
                "mainEntity": (data.items || []).map((item) => ({
                    "@type": "Question",
                    "name": item.question || item.name,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": item.answer || item.text
                    }
                }))
            };

        /**
         * One past or present engagement. `EmployeeRole` wraps the organisation
         * so the dates belong to the role rather than to the company itself.
         */
        case 'EmployeeRole':
            return {
                ...base,
                "roleName": data.role,
                ...(data.start ? { "startDate": data.start } : {}),
                ...(data.end ? { "endDate": data.end } : {}),
                "worksFor": {
                    "@type": "Organization",
                    "name": data.company,
                    ...(data.location ? { "location": data.location } : {})
                }
            };

        case 'ItemList':
            return {
                ...base,
                "name": data.name,
                "numberOfItems": data.numberOfItems || (data.items || []).length,
                "itemListElement": (data.items || []).map((item, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "name": item.name,
                    "url": item.url
                        ? (item.url.startsWith('http') ? item.url : `${domain}${item.url}`)
                        : pageUrl
                }))
            };

        default:
            return { ...base, ...data };
    }
};
