import { SkillsPage } from "./skills.page.jsx"
import { resolveSeo } from "../../lib/seo/resolve-seo.js"
import { buildSchema } from "../../lib/seo/build-schema.js"
import { buildBreadcrumbs } from "../../lib/seo/build-breadcrumbs.js"
import { allSkills } from "../../lib/metrics.js"

export const skillsHandler = {
    get: (c) => {
        const lang = c.req.param("lang")
        const dict = c.dict("skills", lang)

        // Counted here so the copy never has to state a total.
        const groups = (dict.groups || []).map((group) => ({
            ...group,
            items: (group.items || []).map((item) => (typeof item === 'string' ? { name: item } : item)),
            count: (group.items || []).length
        }))

        const seoData = resolveSeo(dict, c.req.path, lang)
        const schemas = [
            buildSchema('Person', {
                lang,
                knowsAbout: allSkills(dict).map((s) => s.name),
                profiles: dict.common.profiles
            }),
            buildBreadcrumbs([
                { name: dict.common.identity?.full_name || "Zoltán Dági", url: `/${lang}` },
                { name: dict.hero?.title || "Stack", url: `/${lang}/skills` }
            ]),
            buildSchema('WebPage', {
                title: dict.head?.title,
                description: dict.head?.description,
                url: `/${lang}/skills`,
                lang
            })
        ].filter(Boolean)

        return c.render(SkillsPage, { dict: { ...dict, groups, total: allSkills(dict).length, seoData, schemas } })
    }
}
