import { ProjectDetailPage } from "./project-detail.page.jsx"
import { resolveSeo } from "../../lib/seo/resolve-seo.js"
import { buildSchema } from "../../lib/seo/build-schema.js"
import { buildBreadcrumbs } from "../../lib/seo/build-breadcrumbs.js"
import { allProjects, findProject } from "../../lib/projects.js"
import { buildUrl } from "../../lib/routes.js"

export const projectDetailHandler = {
    get: (c) => {
        const lang = c.req.param("lang")
        const id = c.req.param("id")
        const dict = c.dict("projects", lang)

        const project = findProject(dict, id, lang, dict.labels)
        if (!project) return c.notFound()

        // Neighbours for the pager, in the same newest-first order the index
        // uses.
        const ordered = allProjects(dict, lang, dict.labels)
        const position = ordered.findIndex((p) => p.id === id)
        const linkTo = (p) => (p ? { ...p, href: buildUrl(lang, `/projects/${p.id}`) } : null)
        const newer = linkTo(ordered[position - 1])
        const older = linkTo(ordered[position + 1])

        // Title and description come from the project itself, so adding one to
        // the dictionary needs no SEO bookkeeping.
        const labels = dict.labels || {}
        const pageDict = {
            ...dict,
            head: {
                title: `${project.name} — ${project.kind} | ${dict.common.identity?.full_name || ''}`.trim(),
                description: project.summary || `${project.name}, ${project.kind}, ${project.range}.`,
                type: 'article'
            }
        }

        const seoData = resolveSeo(pageDict, c.req.path, lang)
        const schemas = [
            buildSchema('Person', { lang, profiles: dict.common.profiles }),
            buildBreadcrumbs([
                { name: dict.common.identity?.full_name || "Zoltán Dági", url: `/${lang}` },
                { name: dict.hero?.title || "Projects", url: `/${lang}/projects` },
                { name: project.name, url: `/${lang}/projects/${project.id}` }
            ]),
            buildSchema('WebPage', {
                title: pageDict.head.title,
                description: pageDict.head.description,
                url: `/${lang}/projects/${project.id}`,
                lang
            }),
            // The repositories are private, so the schema describes the work
            // without advertising a code location that resolves to nothing.
            buildSchema('SoftwareSourceCode', {
                name: project.name,
                description: project.summary,
                language: project.language,
                stack: project.stack,
                url: `/${lang}/projects/${project.id}`,
                lang
            })
        ].filter(Boolean)

        return c.render(ProjectDetailPage, {
            dict: { ...pageDict, project, newer, older, labels, seoData, schemas }
        })
    }
}
