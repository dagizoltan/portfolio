import { LegalPage } from "./legal.page.jsx"
import { resolveSeo } from "../../lib/seo/resolve-seo.js"
import { buildSchema } from "../../lib/seo/build-schema.js"
import { buildBreadcrumbs } from "../../lib/seo/build-breadcrumbs.js"

/** Both legal routes render the same page; only the dictionary differs. */
const render = (page) => (c) => {
    const lang = c.req.param("lang")
    const dict = c.dict(page, lang)

    const seoData = resolveSeo(dict, c.req.path, lang)
    const schemas = [
        buildBreadcrumbs([
            { name: dict.common.identity?.full_name || "Zoltán Dági", url: `/${lang}` },
            { name: dict.hero?.title || page, url: `/${lang}/${page}` }
        ]),
        buildSchema('WebPage', {
            title: dict.head?.title,
            description: dict.head?.description,
            url: `/${lang}/${page}`,
            lang
        })
    ].filter(Boolean)

    return c.render(LegalPage, { dict: { ...dict, seoData, schemas } })
}

export const legalHandler = {
    getPrivacy: render("privacy")
}
