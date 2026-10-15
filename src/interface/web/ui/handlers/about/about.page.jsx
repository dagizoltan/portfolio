import { Page } from "../../components/Page.jsx"
import { Hero } from "../../components/Hero.jsx"
import { Metrics } from "../../components/Metrics.jsx"
import { CtaSection } from "../../components/CtaSection.jsx"
import { paragraphs } from "../../lib/rich-text.js"

export const AboutPage = ({ dict }) => {
    const {
        hero, story, working, education, languages, interests,
        common, lang, metrics, currentPath, seoData, schemas
    } = dict;

    return (
        <Page lang={lang}>
            <Page.Head>
                <Page.Seo seo={seoData} jsonLd={schemas} />
                <link rel="stylesheet" href="/sx/about.css" />
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

                        <section className="story-section section-padding">
                            <div className="container">
                                <span className="label">{story.eyebrow}</span>
                                <h2 className="section-title">{story.title}</h2>
                                <div
                                    className="prose story-body"
                                    dangerouslySetInnerHTML={{ __html: paragraphs(story.body) }}
                                ></div>
                            </div>
                        </section>

                        {/* How he works — the CV's soft skills, written as behaviour */}
                        <section className="working-section section-padding bg-band">
                            <div className="container">
                                <span className="label">{working.eyebrow}</span>
                                <h2 className="section-title">{working.title}</h2>
                                <p className="section-description">{working.description}</p>

                                <ul className="working-list">
                                    {working.items.map((item, i) => (
                                        <li key={i} className="working-item">
                                            <h3 className="working-title">{item.title}</h3>
                                            <p className="working-text">{item.description}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        <section className="education-section section-padding">
                            <div className="container">
                                <div className="two-column">
                                    <div>
                                        <span className="label">{education.eyebrow}</span>
                                        <h2 className="section-title">{education.title}</h2>

                                        <ol className="education-list">
                                            {education.items.map((item, i) => (
                                                <li key={i} className="education-item">
                                                    <span className="education-range">{item.range}</span>
                                                    <h3 className="education-subject">{item.subject}</h3>
                                                    <p className="education-school">{item.school}</p>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>

                                    <div>
                                        <span className="label">{languages.eyebrow}</span>
                                        <h2 className="section-title">{languages.title}</h2>

                                        <dl className="language-list">
                                            {languages.items.map((item, i) => (
                                                <div key={i} className="language-row">
                                                    <dt>{item.name}</dt>
                                                    <dd>{item.level}</dd>
                                                </div>
                                            ))}
                                        </dl>

                                        {interests && (
                                            <div className="interests">
                                                <span className="label interests-label">{interests.eyebrow}</span>
                                                <ul className="interests-list">
                                                    {interests.items.map((item, i) => (
                                                        <li key={i} className="interests-item">{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
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
