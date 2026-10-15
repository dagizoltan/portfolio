import { Page } from "../../components/Page.jsx"
import { Hero } from "../../components/Hero.jsx"
import { Metrics } from "../../components/Metrics.jsx"
import { CtaSection } from "../../components/CtaSection.jsx"
import { buildUrl } from "../../lib/routes.js"
import { paragraphs } from "../../lib/rich-text.js"

export const HomePage = ({ dict }) => {
    const {
        hero, practice, recent, stack, common, lang, metrics,
        currentPath, seoData, schemas, featuredRoles = [], stackGroups = [],
        experienceLabels = {}
    } = dict;

    return (
        <Page lang={lang}>
            <Page.Head>
                <Page.Seo seo={seoData} jsonLd={schemas} />
                <link rel="stylesheet" href="/sx/experience.css" />
                <link rel="stylesheet" href="/sx/home.css" />
            </Page.Head>

            <Page.Body>
                <Page.Layout navigation={common.navigation} lang={lang} currentPath={currentPath} common={common}>
                    <Page.Header navigation={common.navigation} lang={lang} currentPath={currentPath} common={common} />

                    <main id="main">
                        <Hero
                            content={{
                                subtitle: hero.eyebrow,
                                title: hero.title,
                                role: hero.role,
                                description: hero.description,
                                short_description: hero.short_description,
                                cta_primary: hero.cta_primary,
                                cta_primary_href: hero.cta_primary_href,
                                cta_secondary: hero.cta_secondary,
                                cta_secondary_href: hero.cta_secondary_href,
                                cta_secondary_download: hero.cta_secondary_download
                            }}
                            lang={lang}
                            isHome={true}
                        />

                        <Metrics metrics={metrics} label={common.metrics_label} />

                        {/* What the work actually is — three lines of practice */}
                        <section className="practice-section section-padding">
                            <div className="container">
                                <span className="label">{practice.eyebrow}</span>
                                <h2 className="section-title">{practice.title}</h2>
                                <p className="section-description" dangerouslySetInnerHTML={{ __html: practice.description }}></p>

                                <div className="practice-grid">
                                    {practice.items.map((item, i) => (
                                        <article key={i} className="practice-card">
                                            <span className="practice-index">{String(i + 1).padStart(2, '0')}</span>
                                            <h3 className="practice-title">{item.title}</h3>
                                            <p className="practice-text">{item.description}</p>
                                            {item.tags && (
                                                <ul className="practice-tags">
                                                    {item.tags.map((tag, t) => (
                                                        <li key={t} className="practice-tag">{tag}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Most recent roles — the rest live on /experience */}
                        <section className="recent-section section-padding bg-band">
                            <div className="container">
                                <span className="label">{recent.eyebrow}</span>
                                <h2 className="section-title">{recent.title}</h2>
                                <p className="section-description">{recent.description}</p>

                                <ol className="role-list">
                                    {featuredRoles.map((role) => (
                                        <li key={role.id} className="role-row">
                                            <a href={role.href} className="role-row-link">
                                                <span className="role-row-index">{String(role.index).padStart(2, '0')}</span>
                                                <span className="role-row-main">
                                                    <span className="role-row-title">{role.role}</span>
                                                    <span className="role-row-company">
                                                        {role.company}
                                                        {role.project && <span className="role-row-project"> — {role.project}</span>}
                                                    </span>
                                                </span>
                                                <span className="role-row-meta">
                                                    <span className="role-row-range">{role.range}</span>
                                                    <span className="role-row-location">{role.location}</span>
                                                </span>
                                            </a>
                                        </li>
                                    ))}
                                </ol>

                                <div className="recent-action">
                                    <a href={buildUrl(lang, '/experience')} className="btn btn-primary">
                                        {recent.cta || experienceLabels.view_all} &rarr;
                                    </a>
                                </div>
                            </div>
                        </section>

                        {/* Stack preview — counts come from skills.yaml, not from copy */}
                        <section className="stack-section section-padding">
                            <div className="container">
                                <span className="label">{stack.eyebrow}</span>
                                <h2 className="section-title">{stack.title}</h2>
                                <div
                                    className="section-description"
                                    dangerouslySetInnerHTML={{ __html: paragraphs(stack.body) }}
                                ></div>

                                <div className="stack-grid">
                                    {stackGroups.map((group) => (
                                        <div key={group.id} className="stack-card">
                                            <div className="stack-card-top">
                                                <span className="stack-card-name">{group.name}</span>
                                                <span className="stack-card-count">{group.count}</span>
                                            </div>
                                            <ul className="stack-card-items">
                                                {group.sample.map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>

                                <div className="recent-action">
                                    <a href={buildUrl(lang, '/skills')} className="btn btn-outline">
                                        {stack.cta} &rarr;
                                    </a>
                                </div>
                            </div>
                        </section>
                    </main>

                    <CtaSection common={common} lang={lang} content={dict.bottom_cta} />
                    <Page.Footer lang={lang} currentPath={currentPath} common={common} />
                </Page.Layout>
            </Page.Body>
        </Page>
    );
};
