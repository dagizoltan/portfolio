import { ContactPage } from "./contact.page.jsx"
import { resolveSeo } from "../../lib/seo/resolve-seo.js"
import { buildSchema } from "../../lib/seo/build-schema.js"
import { buildBreadcrumbs } from "../../lib/seo/build-breadcrumbs.js"

export const contactHandler = {
    get: (c) => {
        const lang = c.req.param("lang")
        const dict = c.dict("contact", lang)

        const seoData = resolveSeo(dict, c.req.path, lang)
        const schemas = [
            buildSchema('Person', { lang, profiles: dict.common.profiles }),
            buildBreadcrumbs([
                { name: dict.common.identity?.full_name || "Zoltán Dági", url: `/${lang}` },
                { name: dict.hero?.title || "Contact", url: `/${lang}/contact` }
            ]),
            buildSchema('ContactPage', {
                title: dict.head?.title,
                description: dict.head?.description,
                url: `/${lang}/contact`,
                lang
            }),
            dict.faq?.items ? buildSchema('FAQPage', { items: dict.faq.items }) : null
        ].filter(Boolean)

        return c.render(ContactPage, { dict: { ...dict, seoData, schemas } })
    }
}
