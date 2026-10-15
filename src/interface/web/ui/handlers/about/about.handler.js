import { AboutPage } from "./about.page.jsx"
import { resolveSeo } from "../../lib/seo/resolve-seo.js"
import { buildSchema } from "../../lib/seo/build-schema.js"
import { buildBreadcrumbs } from "../../lib/seo/build-breadcrumbs.js"
import { injectMetrics } from "../../lib/metrics.js"

export const aboutHandler = {
    get: (c) => {
        const lang = c.req.param("lang")
        let dict = c.dict("about", lang)
        dict = injectMetrics(c, dict, lang)

        const seoData = resolveSeo(dict, c.req.path, lang)
        const schemas = [
            buildSchema('Person', {
                lang,
                knowsLanguage: (dict.languages?.items || []).map((l) => ({ name: l.name, code: l.code })),
                alumniOf: (dict.education?.items || []).map((e) => e.school),
                profiles: dict.common.profiles
            }),
            buildBreadcrumbs([
                { name: dict.common.identity?.full_name || "Zoltán Dági", url: `/${lang}` },
                { name: dict.hero?.title || "About", url: `/${lang}/about` }
            ]),
            buildSchema('AboutPage', {
                title: dict.head?.title,
                description: dict.head?.description,
                url: `/${lang}/about`,
                lang
            })
        ].filter(Boolean)

        return c.render(AboutPage, { dict: { ...dict, seoData, schemas } })
    }
}
