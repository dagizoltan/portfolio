/**
 * Single source of truth for site-level identity used across SEO output
 * (canonicals, JSON-LD, sitemaps, ai.json).
 *
 * Change `domain` here and canonicals, hreflang, JSON-LD, the sitemaps and
 * ai.json all follow. Nothing else hard-codes it.
 */
export const SITE = {
    domain: "https://dagizoltan.deno.net",
    name: "Zoltán Dági",
    legalName: "Dági Zoltán",
    jobTitle: "Software Developer",
    tagline: "Software developer. Frontend depth, embedded roots.",
    description:
        "Zoltán Dági is a software developer based in Budapest, Hungary, with eight years across frontend engineering, Node.js and Deno services, and embedded systems.",
    email: "dagizoltan@gmail.com",
    phone: "+36 70 587 8519",
    city: "Budapest",
    country: "Hungary",
    logo: "/assets/og-default.svg",
    defaultImage: "/assets/og-default.svg",
    languages: ["en", "hu"],
    profiles: []
};
