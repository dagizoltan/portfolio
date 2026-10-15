import { parse } from "jsr:@std/yaml";
import { buildUrl } from "../../lib/routes.js";
import { SITE } from "../../lib/seo/site.js";
import { allRoles, engineeringMonths } from "../../lib/experience.js";
import { allSkills } from "../../lib/metrics.js";

const { domain, languages } = SITE;

const STATIC_ROUTES = [
    { route: "/", dict: "home", priority: "1.0" },
    { route: "/experience", dict: "experience", priority: "0.9" },
    { route: "/skills", dict: "skills", priority: "0.8" },
    { route: "/about", dict: "about", priority: "0.7" },
    { route: "/contact", dict: "contact", priority: "0.7" },
    { route: "/privacy", dict: "privacy", priority: "0.3" }
];

const xml = (urls) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map((u) => {
    let block = `  <url>\n    <loc>${u.loc}</loc>`;
    if (u.lastmod) block += `\n    <lastmod>${u.lastmod}</lastmod>`;
    if (u.changefreq) block += `\n    <changefreq>${u.changefreq}</changefreq>`;
    if (u.priority) block += `\n    <priority>${u.priority}</priority>`;
    (u.alternates || []).forEach((alt) => {
        block += `\n    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.href}"/>`;
    });
    return block + `\n  </url>`;
}).join('\n')}
</urlset>`;

const alternates = (route) => [
    ...languages.map((lang) => ({ lang, href: `${domain}${buildUrl(lang, route)}` })),
    { lang: 'x-default', href: `${domain}${buildUrl('en', route)}` }
];

const lastMod = async (filepath) => {
    try {
        const stat = await Deno.stat(filepath);
        if (stat.mtime) return stat.mtime.toISOString().split('T')[0];
    } catch {
        // Missing file: fall through to today rather than emitting nothing.
    }
    return new Date().toISOString().split('T')[0];
};

const readDict = async (lang, name) => {
    try {
        return parse(await Deno.readTextFile(`data/dict/${lang}/${name}.yaml`));
    } catch (e) {
        console.error(`Sitemap: cannot read ${lang}/${name}.yaml`, e);
        return null;
    }
};

const buildPagesSitemap = async () => {
    const urls = [];
    for (const lang of languages) {
        for (const { route, dict, priority } of STATIC_ROUTES) {
            urls.push({
                loc: `${domain}${buildUrl(lang, route)}`,
                lastmod: await lastMod(`data/dict/${lang}/${dict}.yaml`),
                changefreq: 'monthly',
                priority,
                alternates: alternates(route)
            });
        }
    }
    return xml(urls);
};

const buildExperienceSitemap = async () => {
    const urls = [];
    for (const lang of languages) {
        const dict = await readDict(lang, 'experience');
        if (!dict?.roles) continue;

        const modified = await lastMod(`data/dict/${lang}/experience.yaml`);
        for (const role of dict.roles) {
            if (!role.id) continue;
            const route = `/experience/${role.id}`;
            urls.push({
                loc: `${domain}${buildUrl(lang, route)}`,
                lastmod: modified,
                changefreq: 'yearly',
                // The current role ranks above finished ones.
                priority: role.end ? '0.5' : '0.8',
                alternates: alternates(route)
            });
        }
    }
    return xml(urls);
};

/**
 * Machine-readable career summary for crawlers and assistants. Mirrors the
 * English dictionaries so an agent can answer "what has this person worked on"
 * without scraping the markup.
 */
const buildAiContent = async () => {
    const lang = 'en';
    const experience = await readDict(lang, 'experience');
    const skills = await readDict(lang, 'skills');
    const about = await readDict(lang, 'about');

    return {
        name: SITE.name,
        job_title: SITE.jobTitle,
        tagline: SITE.tagline,
        description: SITE.description,
        url: domain,
        based_in: `${SITE.city}, ${SITE.country}`,
        contact: { email: SITE.email, phone: SITE.phone },
        years_in_software: Math.floor(engineeringMonths(experience) / 12),
        availability:
            "Open to contract and permanent engineering roles. Reach out by email; there is no form on this site.",
        roles: allRoles(experience, lang, experience?.labels).map((role) => ({
            id: role.id,
            role: role.role,
            company: role.company,
            project: role.project || null,
            start: role.start,
            end: role.end || null,
            months: role.months,
            location: role.location,
            highlights: role.highlights || [],
            technologies_named_in_cv: role.stack || [],
            url: `${domain}${buildUrl(lang, `/experience/${role.id}`)}`
        })),
        skills: (skills?.groups || []).map((group) => ({
            group: group.name,
            items: (group.items || []).map((i) => (typeof i === 'string' ? i : i.name))
        })),
        skills_total: allSkills(skills).length,
        languages: (about?.languages?.items || []).map((l) => ({ name: l.name, level: l.level })),
        education: (about?.education?.items || []).map((e) => ({
            subject: e.subject,
            school: e.school,
            range: e.range
        }))
    };
};

const asXml = (body) => [body, 200, { 'Content-Type': 'application/xml; charset=utf-8' }];

export const seoHandler = {
    robots: (c) =>
        c.text(`User-agent: *\nAllow: /\n\nSitemap: ${domain}/sitemap.xml\n`),

    sitemapIndex: (c) => c.body(...asXml(
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        ['pages', 'experience']
            .map((n) => `  <sitemap>\n    <loc>${domain}/sitemap-${n}.xml</loc>\n  </sitemap>`)
            .join('\n') +
        `\n</sitemapindex>`
    )),

    sitemapPages: async (c) => c.body(...asXml(await buildPagesSitemap())),
    sitemapExperience: async (c) => c.body(...asXml(await buildExperienceSitemap())),
    ai: async (c) => c.json(await buildAiContent())
};
