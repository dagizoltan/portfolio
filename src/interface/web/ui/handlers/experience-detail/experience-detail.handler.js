import { ExperienceDetailPage } from "./experience-detail.page.jsx"
import { resolveSeo } from "../../lib/seo/resolve-seo.js"
import { buildSchema } from "../../lib/seo/build-schema.js"
import { buildBreadcrumbs } from "../../lib/seo/build-breadcrumbs.js"
import { allRoles, findRole } from "../../lib/experience.js"
import { buildUrl } from "../../lib/routes.js"

export const experienceDetailHandler = {
    get: (c) => {
        const lang = c.req.param("lang")
        const id = c.req.param("id")
        const dict = c.dict("experience", lang)

        const role = findRole(dict, id, lang, dict.labels)
        if (!role) return c.notFound()

        // Neighbours for the prev/next pager, in the same newest-first order
        // the index uses.
        const ordered = allRoles(dict, lang, dict.labels)
        const position = ordered.findIndex((r) => r.id === id)
        const linkTo = (r) => (r ? { ...r, href: buildUrl(lang, `/experience/${r.id}`) } : null)
        const newer = linkTo(ordered[position - 1])
        const older = linkTo(ordered[position + 1])

        // The page title comes from the role itself rather than from a `head`
        // block, so adding a role to the dictionary needs no SEO bookkeeping.
        const labels = dict.labels || {}
        const pageDict = {
            ...dict,
            head: {
                title: `${role.role} — ${role.company} | ${dict.common.identity?.full_name || ''}`.trim(),
                description: role.summary || `${role.role}, ${role.company}, ${role.range}.`,
                type: 'profile'
            }
        }

        const seoData = resolveSeo(pageDict, c.req.path, lang)
        const schemas = [
            buildSchema('Person', { lang, profiles: dict.common.profiles }),
            buildBreadcrumbs([
                { name: dict.common.identity?.full_name || "Zoltán Dági", url: `/${lang}` },
                { name: dict.hero?.title || "Experience", url: `/${lang}/experience` },
                { name: `${role.role} — ${role.company}`, url: `/${lang}/experience/${role.id}` }
            ]),
            buildSchema('WebPage', {
                title: pageDict.head.title,
                description: pageDict.head.description,
                url: `/${lang}/experience/${role.id}`,
                lang
            }),
            buildSchema('EmployeeRole', {
                role: role.role,
                company: role.company,
                location: role.location,
                // Schema.org wants a date, not a month; the first of the month
                // is the honest reading of a YYYY-MM value.
                start: role.start ? `${role.start}-01` : null,
                end: role.end ? `${role.end}-01` : null
            })
        ].filter(Boolean)

        return c.render(ExperienceDetailPage, {
            dict: { ...pageDict, role, newer, older, labels, seoData, schemas }
        })
    }
}
