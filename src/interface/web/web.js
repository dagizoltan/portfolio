import { Hono } from "hono"
import { parse } from "jsr:@std/yaml"
import { serveStatic } from "hono/deno"

import { homeHandler } from "./ui/handlers/home/home.handler.js"
import { experienceHandler } from "./ui/handlers/experience/experience.handler.js"
import { experienceDetailHandler } from "./ui/handlers/experience-detail/experience-detail.handler.js"
import { skillsHandler } from "./ui/handlers/skills/skills.handler.js"
import { aboutHandler } from "./ui/handlers/about/about.handler.js"
import { contactHandler } from "./ui/handlers/contact/contact.handler.js"
import { legalHandler } from "./ui/handlers/legal/legal.handler.js"
import { seoHandler } from "./ui/handlers/seo/seo.handler.js"

const web = new Hono()

const LANGS = ["en", "hu"]

/** Collapse trailing slashes so each page has exactly one URL. */
web.use('*', async (c, next) => {
    const path = c.req.path
    if (path !== '/' && path.endsWith('/')) {
        return c.redirect(path.slice(0, -1), 301)
    }
    await next()
})

/**
 * Reject unknown language segments so /xx/experience 404s instead of silently
 * falling back to English.
 *
 * This inspects the path directly rather than using a `/:lang/*` pattern: that
 * pattern also matches single-segment paths and the non-page prefixes, so it
 * would read "sx" in /sx/global.css and "robots.txt" in /robots.txt as language
 * codes and 404 every stylesheet, island, asset and SEO file on the site.
 *
 * Anything containing a dot is treated as a file and left to normal routing.
 */
const RESERVED_PREFIXES = ['sx', 'ix', 'assets']

web.use('*', async (c, next) => {
    const first = c.req.path.split('/')[1]
    const isNonPage = !first || first.includes('.') || RESERVED_PREFIXES.includes(first)

    if (!isNonPage && !LANGS.includes(first)) {
        return c.notFound()
    }
    await next()
})

web.use('*', async (c, next) => {
    c.dict = (page, lang) => {
        const safeLang = LANGS.includes(lang) ? lang : 'en'
        try {
            const pageDict = parse(Deno.readTextFileSync(`data/dict/${safeLang}/${page}.yaml`))
            const commonDict = parse(Deno.readTextFileSync(`data/dict/${safeLang}/common.yaml`))
            return { ...pageDict, common: commonDict, lang: safeLang, currentPath: c.req.path }
        } catch (e) {
            console.error(`Error loading dict for ${page} ${safeLang}:`, e)
            return { head: {}, common: {}, lang: safeLang, currentPath: c.req.path }
        }
    }

    c.render = (Component, props) => {
        const content = Component(props)
        return c.html(`<!DOCTYPE html>${content}`)
    }
    await next()
})

const serveText = (path, contentType) => async (c) => {
    try {
        const content = await Deno.readTextFile(path)
        return c.body(content, 200, { 'Content-Type': contentType })
    } catch (e) {
        console.error(`Error serving ${path}:`, e)
        return c.text('Not Found', 404)
    }
}

const serveCss = (path) => serveText(path, 'text/css; charset=utf-8')
const serveIsland = (path) => serveText(path, 'application/javascript; charset=utf-8')

const H = 'src/interface/web/ui/handlers'

// Detect country and preferred browser language for root redirection
web.get('/', (c) => {
    const country = (c.req.header('cf-ipcountry') || c.req.header('x-country-code') || c.req.header('x-country') || '').toUpperCase()
    const acceptLang = (c.req.header('accept-language') || '').toLowerCase()

    const isHungary = country === 'HU'
    const prefersHungarian = acceptLang.includes('hu')

    const targetLang = (isHungary || prefersHungarian) ? 'hu' : 'en'
    return c.redirect(`/${targetLang}`, 302)
})

// SEO
web.get('/robots.txt', seoHandler.robots)
web.get('/sitemap.xml', seoHandler.sitemapIndex)
web.get('/sitemap-pages.xml', seoHandler.sitemapPages)
web.get('/sitemap-experience.xml', seoHandler.sitemapExperience)
web.get('/ai.json', seoHandler.ai)

// Static assets
web.get('/assets/*', serveStatic({ root: './src/interface/web/ui/' }))
web.get('/favicon.ico', (c) => c.redirect('/assets/favicon.svg', 301))

// Styles
web.get('/sx/global.css', serveCss('src/interface/web/ui/styles/global.css'))
web.get('/sx/home.css', serveCss(`${H}/home/home.css`))
web.get('/sx/experience.css', serveCss(`${H}/experience/experience.css`))
web.get('/sx/experience-detail.css', serveCss(`${H}/experience-detail/experience-detail.css`))
web.get('/sx/skills.css', serveCss(`${H}/skills/skills.css`))
web.get('/sx/about.css', serveCss(`${H}/about/about.css`))
web.get('/sx/contact.css', serveCss(`${H}/contact/contact.css`))
web.get('/sx/legal.css', serveCss(`${H}/legal/legal.css`))

// Islands
web.get('/ix/cta.js', serveIsland('src/interface/web/ui/islands/common/cta.island.js'))

// Pages
web.get('/:lang', homeHandler.get)

web.get('/:lang/experience', experienceHandler.get)
web.get('/:lang/experience/:id', experienceDetailHandler.get)

web.get('/:lang/skills', skillsHandler.get)
web.get('/:lang/about', aboutHandler.get)
web.get('/:lang/contact', contactHandler.get)

web.get('/:lang/privacy', legalHandler.getPrivacy)

export { web }
