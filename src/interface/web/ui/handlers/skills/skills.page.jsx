import { Page } from "../../components/Page.jsx"
import { Hero } from "../../components/Hero.jsx"
import { CtaSection } from "../../components/CtaSection.jsx"

export const SkillsPage = ({ dict }) => {
    const { hero, groups = [], total, secondary, labels = {}, common, lang, currentPath, seoData, schemas } = dict;

    return (
        <Page lang={lang}>
            <Page.Head>
                <Page.Seo seo={seoData} jsonLd={schemas} />
                <link rel="stylesheet" href="/sx/skills.css" />
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
                                meta: [{ label: labels.total, value: String(total) }]
                            }}
                            lang={lang}
                        />

                        {/*
                            One colour per group, cycling through the four the CV uses.
                            The colour is decoration: the group is already named in the
                            heading above its own list, so nothing depends on telling
                            green from orange.
                        */}
                        <section className="stack-full-section section-padding">
                            <div className="container">
                                {groups.map((group, i) => (
                                    <section key={group.id} className={`skill-group skill-group--c${i % 4}`}>
                                        <div className="skill-group-head">
                                            <h2 className="skill-group-name">{group.name}</h2>
                                            <span className="skill-group-count">
                                                {group.count} <span className="sr-only">{labels.total}</span>
                                            </span>
                                        </div>
                                        {group.description && (
                                            <p className="skill-group-description">{group.description}</p>
                                        )}
                                        <ul className="skill-list">
                                            {group.items.map((item, k) => (
                                                <li key={k} className="skill-chip">{item.name}</li>
                                            ))}
                                        </ul>
                                    </section>
                                ))}
                            </div>
                        </section>

                        {secondary && (
                            <section className="secondary-section section-padding bg-band">
                                <div className="container">
                                    <span className="label">{secondary.eyebrow}</span>
                                    <h2 className="section-title">{secondary.title}</h2>
                                    <p className="section-description">{secondary.description}</p>

                                    <ul className="secondary-list">
                                        {secondary.items.map((item, i) => (
                                            <li key={i} className="secondary-item">
                                                <span className="secondary-index">{String(i + 1).padStart(2, '0')}</span>
                                                <span className="secondary-name">{item.name}</span>
                                                {item.note && <span className="secondary-note">{item.note}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>
                        )}
                    </main>

                    <CtaSection common={common} lang={lang} content={dict.bottom_cta} />
                    <Page.Footer lang={lang} currentPath={currentPath} common={common} />
                </Page.Layout>
            </Page.Body>
        </Page>
    );
};
