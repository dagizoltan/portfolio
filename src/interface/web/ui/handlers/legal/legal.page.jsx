import { Page } from "../../components/Page.jsx"
import { Hero } from "../../components/Hero.jsx"
import { paragraphs } from "../../lib/rich-text.js"

export const LegalPage = ({ dict }) => {
    const { hero, sections = [], updated, common, lang, currentPath, seoData, schemas } = dict;

    return (
        <Page lang={lang}>
            <Page.Head>
                <Page.Seo seo={seoData} jsonLd={schemas} />
                <link rel="stylesheet" href="/sx/legal.css" />
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
                                short_description: hero.short_description
                            }}
                            lang={lang}
                        />

                        <section className="legal-section section-padding">
                            <div className="container">
                                {updated && <p className="legal-updated">{updated}</p>}

                                <div className="legal-body prose">
                                    {sections.map((section, i) => (
                                        <section key={i} className="legal-block">
                                            <h2>{section.title}</h2>
                                            <div dangerouslySetInnerHTML={{ __html: paragraphs(section.body) }}></div>
                                        </section>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </main>

                    <Page.Footer lang={lang} currentPath={currentPath} common={common} />
                </Page.Layout>
            </Page.Body>
        </Page>
    );
};
