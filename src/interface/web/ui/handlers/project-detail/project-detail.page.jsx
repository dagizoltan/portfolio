import { Page } from "../../components/Page.jsx"
import { Hero } from "../../components/Hero.jsx"
import { CtaSection } from "../../components/CtaSection.jsx"
import { buildUrl } from "../../lib/routes.js"
import { paragraphs } from "../../lib/rich-text.js"
import { formatCount } from "../../lib/projects.js"

export const ProjectDetailPage = ({ dict }) => {
    const { project, newer, older, labels = {}, common, lang, currentPath, seoData, schemas } = dict;

    const meta = [
        { label: labels.period, value: project.range },
        { label: labels.duration, value: project.duration },
        { label: labels.language, value: project.language }
    ].filter((item) => item.value);

    const figures = project.figures
        ? [
            { label: labels.commits, value: formatCount(project.figures.commits, lang) },
            { label: labels.tests, value: formatCount(project.figures.tests, lang) },
            { label: labels.lines, value: formatCount(project.figures.lines, lang) },
            { label: labels.modules, value: formatCount(project.figures.modules, lang) }
        ]
        : [];

    return (
        <Page lang={lang}>
            <Page.Head>
                <Page.Seo seo={seoData} jsonLd={schemas} />
                {/* The detail layout — grid, bullet list, spec panel and
                    pager — is the one the role pages use. Same components,
                    same stylesheets; project-detail.css only adds what a
                    project needs on top. */}
                <link rel="stylesheet" href="/sx/experience.css" />
                <link rel="stylesheet" href="/sx/experience-detail.css" />
                <link rel="stylesheet" href="/sx/projects.css" />
                <link rel="stylesheet" href="/sx/project-detail.css" />
            </Page.Head>

            <Page.Body>
                <Page.Layout navigation={common.navigation} lang={lang} currentPath={currentPath} common={common}>
                    <Page.Header navigation={common.navigation} lang={lang} currentPath={currentPath} common={common} />

                    <main id="main">
                        <Hero
                            content={{
                                subtitle: project.kind,
                                title: project.name,
                                meta,
                                short_description: project.summary
                            }}
                            lang={lang}
                        />

                        <section className="project-detail-section section-padding">
                            <div className="container">
                                {/* Maturity before anything else. A reader who
                                    stops after one paragraph should still leave
                                    with the right impression of readiness. */}
                                {project.status && (
                                    <div className="project-detail-status">
                                        <span className="project-status-label">{labels.status}</span>
                                        <p className="project-detail-status-text">{project.status}</p>
                                    </div>
                                )}

                                <div className="role-detail-grid">
                                    <div className="role-detail-main">
                                        <span className="label">{labels.what_it_does}</span>

                                        <ul className="role-detail-highlights">
                                            {(project.highlights || []).map((item, i) => (
                                                <li key={i}>
                                                    <span className="role-detail-bullet-index">
                                                        {String(i + 1).padStart(2, '0')}
                                                    </span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {project.context && (
                                            <div className="role-detail-context prose">
                                                <h2>{labels.context}</h2>
                                                <div dangerouslySetInnerHTML={{ __html: paragraphs(project.context) }}></div>
                                            </div>
                                        )}
                                    </div>

                                    <aside className="role-detail-aside">
                                        <div className="role-spec">
                                            <h2 className="role-spec-title">{labels.spec}</h2>
                                            <dl className="role-spec-list">
                                                <div className="role-spec-row">
                                                    <dt>{labels.period}</dt>
                                                    <dd>{project.range}</dd>
                                                </div>
                                                <div className="role-spec-row">
                                                    <dt>{labels.duration}</dt>
                                                    <dd>{project.duration}</dd>
                                                </div>
                                                <div className="role-spec-row">
                                                    <dt>{labels.language}</dt>
                                                    <dd>{project.language}</dd>
                                                </div>
                                                <div className="role-spec-row">
                                                    <dt>{labels.source}</dt>
                                                    <dd>{labels.source_private}</dd>
                                                </div>
                                            </dl>
                                        </div>

                                        {figures.length > 0 && (
                                            <div className="role-spec">
                                                <h2 className="role-spec-title">{labels.figures}</h2>
                                                <dl className="role-spec-list">
                                                    {figures.map((figure, i) => (
                                                        <div key={i} className="role-spec-row">
                                                            <dt>{figure.label}</dt>
                                                            <dd className="project-detail-figure">{figure.value}</dd>
                                                        </div>
                                                    ))}
                                                </dl>
                                                <p className="role-spec-note">{labels.counted_note}</p>
                                            </div>
                                        )}

                                        {project.stack && project.stack.length > 0 && (
                                            <div className="role-spec">
                                                <h2 className="role-spec-title">{labels.stack}</h2>
                                                <ul className="timeline-stack">
                                                    {project.stack.map((tech, i) => (
                                                        <li key={i} className="timeline-stack-item">{tech}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </aside>
                                </div>

                                <nav className="role-pager" aria-label={labels.pager}>
                                    {older ? (
                                        <a href={older.href} className="role-pager-link role-pager-link--prev">
                                            <span className="role-pager-dir">&larr; {labels.older}</span>
                                            <span className="role-pager-title">{older.name} — {older.kind}</span>
                                        </a>
                                    ) : <span />}

                                    {newer ? (
                                        <a href={newer.href} className="role-pager-link role-pager-link--next">
                                            <span className="role-pager-dir">{labels.newer} &rarr;</span>
                                            <span className="role-pager-title">{newer.name} — {newer.kind}</span>
                                        </a>
                                    ) : <span />}
                                </nav>

                                <div className="recent-action">
                                    <a href={buildUrl(lang, '/projects')} className="btn btn-outline">
                                        {labels.back} &rarr;
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
