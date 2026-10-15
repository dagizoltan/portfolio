import { Page } from "../../components/Page.jsx"
import { Hero } from "../../components/Hero.jsx"
import { CtaSection } from "../../components/CtaSection.jsx"
import { buildUrl } from "../../lib/routes.js"
import { paragraphs } from "../../lib/rich-text.js"

export const ExperienceDetailPage = ({ dict }) => {
    const { role, newer, older, labels = {}, common, lang, currentPath, seoData, schemas } = dict;

    const meta = [
        { label: labels.period, value: role.range },
        { label: labels.duration, value: role.duration },
        { label: labels.location, value: role.location }
    ].filter((item) => item.value);

    return (
        <Page lang={lang}>
            <Page.Head>
                <Page.Seo seo={seoData} jsonLd={schemas} />
                <link rel="stylesheet" href="/sx/experience.css" />
                <link rel="stylesheet" href="/sx/experience-detail.css" />
            </Page.Head>

            <Page.Body>
                <Page.Layout navigation={common.navigation} lang={lang} currentPath={currentPath} common={common}>
                    <Page.Header navigation={common.navigation} lang={lang} currentPath={currentPath} common={common} />

                    <main id="main">
                        <Hero
                            content={{
                                subtitle: role.company,
                                title: role.role,
                                role: role.project,
                                meta,
                                // Page heroes render only the short field (see
                                // .hero-section--page in global.css), so passing
                                // `description` too would just duplicate it.
                                short_description: role.summary
                            }}
                            lang={lang}
                        />

                        <section className="role-detail-section section-padding">
                            <div className="container">
                                <div className="role-detail-grid">
                                    <div className="role-detail-main">
                                        <span className="label">{labels.what_i_did}</span>

                                        <ul className="role-detail-highlights">
                                            {(role.highlights || []).map((item, i) => (
                                                <li key={i}>
                                                    <span className="role-detail-bullet-index">
                                                        {String(i + 1).padStart(2, '0')}
                                                    </span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {role.context && (
                                            <div className="role-detail-context prose">
                                                <h2>{labels.context}</h2>
                                                <div dangerouslySetInnerHTML={{ __html: paragraphs(role.context) }}></div>
                                            </div>
                                        )}
                                    </div>

                                    <aside className="role-detail-aside">
                                        <div className="role-spec">
                                            <h2 className="role-spec-title">{labels.spec}</h2>
                                            <dl className="role-spec-list">
                                                <div className="role-spec-row">
                                                    <dt>{labels.company}</dt>
                                                    <dd>{role.company}</dd>
                                                </div>
                                                {role.project && (
                                                    <div className="role-spec-row">
                                                        <dt>{labels.project}</dt>
                                                        <dd>{role.project}</dd>
                                                    </div>
                                                )}
                                                <div className="role-spec-row">
                                                    <dt>{labels.period}</dt>
                                                    <dd>{role.range}</dd>
                                                </div>
                                                <div className="role-spec-row">
                                                    <dt>{labels.duration}</dt>
                                                    <dd>{role.duration}</dd>
                                                </div>
                                                <div className="role-spec-row">
                                                    <dt>{labels.location}</dt>
                                                    <dd>{role.location}</dd>
                                                </div>
                                            </dl>
                                        </div>

                                        {role.stack && role.stack.length > 0 && (
                                            <div className="role-spec">
                                                <h2 className="role-spec-title">{labels.named_tech}</h2>
                                                <ul className="timeline-stack">
                                                    {role.stack.map((tech, i) => (
                                                        <li key={i} className="timeline-stack-item">{tech}</li>
                                                    ))}
                                                </ul>
                                                <p className="role-spec-note">{labels.named_tech_note}</p>
                                            </div>
                                        )}
                                    </aside>
                                </div>

                                <nav className="role-pager" aria-label={labels.pager}>
                                    {older ? (
                                        <a href={older.href} className="role-pager-link role-pager-link--prev">
                                            <span className="role-pager-dir">&larr; {labels.older}</span>
                                            <span className="role-pager-title">{older.role} — {older.company}</span>
                                        </a>
                                    ) : <span />}

                                    {newer ? (
                                        <a href={newer.href} className="role-pager-link role-pager-link--next">
                                            <span className="role-pager-dir">{labels.newer} &rarr;</span>
                                            <span className="role-pager-title">{newer.role} — {newer.company}</span>
                                        </a>
                                    ) : <span />}
                                </nav>

                                <div className="recent-action">
                                    <a href={buildUrl(lang, '/experience')} className="btn btn-outline">
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
