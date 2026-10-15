import { Page } from "../../components/Page.jsx"
import { Hero } from "../../components/Hero.jsx"
import { Metrics } from "../../components/Metrics.jsx"
import { CtaSection } from "../../components/CtaSection.jsx"

export const ExperiencePage = ({ dict }) => {
    const { hero, roles = [], labels = {}, common, lang, metrics, currentPath, seoData, schemas } = dict;

    return (
        <Page lang={lang}>
            <Page.Head>
                <Page.Seo seo={seoData} jsonLd={schemas} />
                <link rel="stylesheet" href="/sx/experience.css" />
            </Page.Head>

            <Page.Body>
                <Page.Layout navigation={common.navigation} lang={lang} currentPath={currentPath} common={common}>
                    <Page.Header navigation={common.navigation} lang={lang} currentPath={currentPath} common={common} />

                    <main id="main">
                        <Hero
                            content={{
                                subtitle: hero.eyebrow,
                                title: hero.title,
                                description: hero.description,
                                short_description: hero.short_description,
                                cta_primary: hero.cta_primary,
                                cta_primary_href: hero.cta_primary_href,
                                cta_primary_download: hero.cta_primary_download
                            }}
                            lang={lang}
                        />

                        <Metrics metrics={metrics} label={common.metrics_label} />

                        <section className="timeline-section section-padding">
                            <div className="container">
                                <ol className="timeline">
                                    {roles.map((role) => (
                                        <li key={role.id} className="timeline-entry">
                                            <div className="timeline-marker" aria-hidden="true"></div>

                                            <div className="timeline-dates">
                                                <span className="timeline-range">{role.range}</span>
                                                <span className="timeline-duration">{role.duration}</span>
                                            </div>

                                            <div className="timeline-body">
                                                <div className="timeline-head">
                                                    <h2 className="timeline-role">
                                                        <a href={role.href}>{role.role}</a>
                                                    </h2>
                                                    {role.lead && (
                                                        <span className="status status--lead">{labels.lead}</span>
                                                    )}
                                                </div>

                                                <p className="timeline-company">
                                                    {role.company}
                                                    {role.project && <span className="timeline-project"> — {role.project}</span>}
                                                </p>

                                                <p className="timeline-location">{role.location}</p>

                                                {role.highlights && (
                                                    <ul className="timeline-highlights">
                                                        {role.highlights.map((item, i) => (
                                                            <li key={i}>{item}</li>
                                                        ))}
                                                    </ul>
                                                )}

                                                {role.stack && role.stack.length > 0 && (
                                                    <ul className="timeline-stack" aria-label={labels.named_tech}>
                                                        {role.stack.map((tech, i) => (
                                                            <li key={i} className="timeline-stack-item">{tech}</li>
                                                        ))}
                                                    </ul>
                                                )}

                                                <a href={role.href} className="btn-link timeline-more">
                                                    {labels.detail} &rarr;
                                                </a>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
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
