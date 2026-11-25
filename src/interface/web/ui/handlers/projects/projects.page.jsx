import { Page } from "../../components/Page.jsx"
import { Hero } from "../../components/Hero.jsx"
import { Metrics } from "../../components/Metrics.jsx"
import { CtaSection } from "../../components/CtaSection.jsx"
import { paragraphs } from "../../lib/rich-text.js"
import { formatCount } from "../../lib/projects.js"

export const ProjectsPage = ({ dict }) => {
    const {
        hero, disclosure, projects = [], labels = {},
        common, lang, metrics, currentPath, seoData, schemas
    } = dict;

    return (
        <Page lang={lang}>
            <Page.Head>
                <Page.Seo seo={seoData} jsonLd={schemas} />
                {/* The stack chips are .timeline-stack, shared with the
                    experience pages — same component, same stylesheet. */}
                <link rel="stylesheet" href="/sx/experience.css" />
                <link rel="stylesheet" href="/sx/projects.css" />
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
                                cta_secondary: hero.cta_secondary,
                                cta_secondary_href: hero.cta_secondary_href,
                                cta_secondary_download: hero.cta_secondary_download
                            }}
                            lang={lang}
                        />

                        <Metrics metrics={metrics} label={common.metrics_label} />

                        {/* What these are and are not — before the work itself,
                            because every claim below depends on it. */}
                        {disclosure && (
                            <section className="disclosure-section section-padding bg-band">
                                <div className="container">
                                    <span className="label">{disclosure.eyebrow}</span>
                                    <h2 className="section-title">{disclosure.title}</h2>
                                    <div
                                        className="disclosure-body prose"
                                        dangerouslySetInnerHTML={{ __html: paragraphs(disclosure.body) }}
                                    ></div>
                                </div>
                            </section>
                        )}

                        <section className="projects-section section-padding">
                            <div className="container">
                                <ol className="project-list">
                                    {projects.map((project) => (
                                        <li key={project.id} className="project-card">
                                            <div className="project-card-head">
                                                <span className="project-index">
                                                    {String(project.index).padStart(2, '0')}
                                                </span>

                                                <div className="project-identity">
                                                    <h2 className="project-name">
                                                        <a href={project.href}>{project.name}</a>
                                                    </h2>
                                                    <p className="project-kind">{project.kind}</p>
                                                </div>

                                                {/* No separate "active" badge:
                                                    the range already ends in
                                                    the present label. */}
                                                <div className="project-period">
                                                    <span className="project-range">{project.range}</span>
                                                    <span className="project-duration">{project.duration}</span>
                                                </div>
                                            </div>

                                            <p className="project-summary">{project.summary}</p>

                                            {project.status && (
                                                <p className="project-status">
                                                    <span className="project-status-label">{labels.status}</span>
                                                    <span className="project-status-text">{project.status}</span>
                                                </p>
                                            )}

                                            {project.highlights && (
                                                <ul className="project-highlights">
                                                    {project.highlights.map((item, i) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            )}

                                            {project.figures && (
                                                <dl className="project-figures" aria-label={labels.figures}>
                                                    <div className="project-figure">
                                                        <dt>{labels.commits}</dt>
                                                        <dd>{formatCount(project.figures.commits, lang)}</dd>
                                                    </div>
                                                    <div className="project-figure">
                                                        <dt>{labels.tests}</dt>
                                                        <dd>{formatCount(project.figures.tests, lang)}</dd>
                                                    </div>
                                                    <div className="project-figure">
                                                        <dt>{labels.lines}</dt>
                                                        <dd>{formatCount(project.figures.lines, lang)}</dd>
                                                    </div>
                                                    <div className="project-figure">
                                                        <dt>{labels.modules}</dt>
                                                        <dd>{formatCount(project.figures.modules, lang)}</dd>
                                                    </div>
                                                </dl>
                                            )}

                                            {project.stack && project.stack.length > 0 && (
                                                <ul className="timeline-stack" aria-label={labels.stack}>
                                                    {project.stack.map((tech, i) => (
                                                        <li key={i} className="timeline-stack-item">{tech}</li>
                                                    ))}
                                                </ul>
                                            )}

                                            <a href={project.href} className="btn-link project-more">
                                                {labels.detail} &rarr;
                                            </a>
                                        </li>
                                    ))}
                                </ol>

                                <p className="projects-note">{labels.counted_note}</p>
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
