import { ProjectsPage } from "./projects.page.jsx"
import { resolveSeo } from "../../lib/seo/resolve-seo.js"
import { buildSchema } from "../../lib/seo/build-schema.js"
import { buildBreadcrumbs } from "../../lib/seo/build-breadcrumbs.js"
import { allProjects, injectProjectMetrics } from "../../lib/projects.js"
import { buildUrl } from "../../lib/routes.js"

export const projectsHandler = {
    get: (c) => {
        const lang = c.req.param("lang")
        let dict = c.dict("projects", lang)

        // The projects strip counts repositories, not employment, so it is
        // built here rather than by injectMetrics — see lib/projects.js.
        dict = injectProjectMetrics(dict, dict, lang)

        const projects = allProjects(dict, lang, dict.labels).map((project) => ({
            ...project,
            href: buildUrl(lang, `/projects/${project.id}`)
        }))

        const seoData = resolveSeo(dict, c.req.path, lang)
        const schemas = [
            buildSchema('Person', {
                lang,
                profiles: dict.common.profiles
            }),
            buildBreadcrumbs([
                { name: dict.common.identity?.full_name || "Zoltán Dági", url: `/${lang}` },
                { name: dict.hero?.title || "Projects", url: `/${lang}/projects` }
            ]),
            buildSchema('CollectionPage', {
                title: dict.head?.title,
                description: dict.head?.description,
                url: `/${lang}/projects`,
                lang,
                mainEntity: buildSchema('ItemList', {
                    name: dict.hero?.title,
                    items: projects.map((project) => ({
                        name: `${project.name} — ${project.kind}`,
                        url: project.href
                    }))
                })
            })
        ].filter(Boolean)

        return c.render(ProjectsPage, { dict: { ...dict, projects, seoData, schemas } })
    }
}
