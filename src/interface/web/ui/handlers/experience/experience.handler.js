import { ExperiencePage } from "./experience.page.jsx"
import { resolveSeo } from "../../lib/seo/resolve-seo.js"
import { buildSchema } from "../../lib/seo/build-schema.js"
import { buildBreadcrumbs } from "../../lib/seo/build-breadcrumbs.js"
import { injectMetrics } from "../../lib/metrics.js"
import { allRoles } from "../../lib/experience.js"
import { buildUrl } from "../../lib/routes.js"

export const experienceHandler = {
    get: (c) => {
        const lang = c.req.param("lang")
        let dict = c.dict("experience", lang)
        dict = injectMetrics(c, dict, lang)

        const roles = allRoles(dict, lang, dict.labels).map((role) => ({
            ...role,
            href: buildUrl(lang, `/experience/${role.id}`)
        }))

        const seoData = resolveSeo(dict, c.req.path, lang)
        const schemas = [
            buildSchema('Person', {
                lang,
                profiles: dict.common.profiles
            }),
            buildBreadcrumbs([
                { name: dict.common.identity?.full_name || "Zoltán Dági", url: `/${lang}` },
                { name: dict.hero?.title || "Experience", url: `/${lang}/experience` }
            ]),
            buildSchema('CollectionPage', {
                title: dict.head?.title,
                description: dict.head?.description,
                url: `/${lang}/experience`,
                lang,
                mainEntity: buildSchema('ItemList', {
                    name: dict.hero?.title,
                    items: roles.map((role) => ({
                        name: `${role.role} — ${role.company}`,
                        url: role.href
                    }))
                })
            })
        ].filter(Boolean)

        return c.render(ExperiencePage, { dict: { ...dict, roles, seoData, schemas } })
    }
}
