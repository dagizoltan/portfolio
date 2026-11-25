import { HomePage } from "./home.page.jsx"
import { resolveSeo } from "../../lib/seo/resolve-seo.js"
import { buildSchema } from "../../lib/seo/build-schema.js"
import { injectMetrics, allSkills } from "../../lib/metrics.js"
import { allRoles } from "../../lib/experience.js"
import { allProjects, formatCount } from "../../lib/projects.js"
import { buildUrl } from "../../lib/routes.js"

export const homeHandler = {
    get: (c) => {
        const lang = c.req.param("lang")
        let dict = c.dict("home", lang)
        dict = injectMetrics(c, dict, lang)

        const experienceDict = c.dict("experience", lang)
        const skillsDict = c.dict("skills", lang)
        const aboutDict = c.dict("about", lang)

        const roles = allRoles(experienceDict, lang, experienceDict.labels)
        const featuredRoles = roles.slice(0, 3).map((role) => ({
            ...role,
            href: buildUrl(lang, `/experience/${role.id}`)
        }))

        // The self-directed work, in the same newest-first order the projects
        // page uses. All four fit on the home page, so this is the whole list
        // rather than a slice — the teaser's job is to show the work exists.
        const projectsDict = c.dict("projects", lang)
        const featuredProjects = allProjects(projectsDict, lang, projectsDict.labels).map((project) => ({
            id: project.id,
            name: project.name,
            kind: project.kind,
            tagline: project.tagline || project.summary,
            range: project.range,
            commits: formatCount(project.figures?.commits, lang),
            tests: formatCount(project.figures?.tests, lang),
            href: buildUrl(lang, `/projects/${project.id}`)
        }))

        // Group counts for the stack preview, counted rather than typed.
        const stackGroups = (skillsDict.groups || []).map((group) => ({
            id: group.id,
            name: group.name,
            count: (group.items || []).length,
            sample: (group.items || []).slice(0, 6).map((i) => (typeof i === 'string' ? i : i.name))
        }))

        const seoData = resolveSeo(dict, c.req.path, lang)
        const schemas = [
            buildSchema('Person', {
                lang,
                jobTitle: dict.hero?.role,
                description: dict.head?.description,
                knowsAbout: allSkills(skillsDict).map((s) => s.name),
                knowsLanguage: (aboutDict.languages?.items || []).map((l) => ({ name: l.name, code: l.code })),
                alumniOf: (aboutDict.education?.items || []).map((e) => e.school),
                profiles: dict.common.profiles
            }),
            buildSchema('WebSite', { lang }),
            buildSchema('ProfilePage', {
                title: dict.head?.title,
                description: dict.head?.description,
                url: `/${lang}`,
                lang
            })
        ].filter(Boolean)

        return c.render(HomePage, {
            dict: {
                ...dict,
                featuredRoles,
                featuredProjects,
                stackGroups,
                experienceLabels: experienceDict.labels || {},
                skillsLabels: skillsDict.labels || {},
                seoData,
                schemas
            }
        })
    }
}
