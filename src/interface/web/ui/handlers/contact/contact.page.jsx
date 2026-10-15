import { Page } from "../../components/Page.jsx"
import { Hero } from "../../components/Hero.jsx"
import { CtaSection } from "../../components/CtaSection.jsx"

export const ContactPage = ({ dict }) => {
    const { hero, channels, details, faq, common, lang, currentPath, seoData, schemas } = dict;

    return (
        <Page lang={lang}>
            <Page.Head>
                <Page.Seo seo={seoData} jsonLd={schemas} />
                <link rel="stylesheet" href="/sx/contact.css" />
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
                                email: common.contact?.email,
                                copy_label: common.bottom_cta?.copy_label,
                                copied_label: common.bottom_cta?.copied_label
                            }}
                            lang={lang}
                        />

                        {/* What to send where */}
                        <section className="channels-section section-padding">
                            <div className="container">
                                <span className="label">{channels.eyebrow}</span>
                                <h2 className="section-title">{channels.title}</h2>
                                <p className="section-description">{channels.description}</p>

                                <div className="channels-grid">
                                    {channels.items.map((channel, i) => (
                                        <div key={i} className="channel-card">
                                            <span className="channel-tag">{channel.tag}</span>
                                            <h3 className="channel-title">{channel.title}</h3>
                                            <p className="channel-text">{channel.description}</p>
                                            {channel.email && (
                                                <a href={`mailto:${channel.email}`} className="channel-email">
                                                    {channel.email}
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="details-section section-padding bg-band">
                            <div className="container">
                                <span className="label">{details.eyebrow}</span>
                                <h2 className="section-title">{details.title}</h2>

                                <dl className="details-grid">
                                    {details.items.map((item, i) => (
                                        <div key={i} className="detail-item">
                                            <dt>{item.label}</dt>
                                            <dd>
                                                {item.href
                                                    ? <a href={item.href} className="detail-link">{item.value}</a>
                                                    : item.value}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>

                                {details.note && <p className="details-note">{details.note}</p>}
                            </div>
                        </section>

                        {faq && (
                            <section className="faq-section section-padding">
                                <div className="container">
                                    <span className="label">{faq.eyebrow}</span>
                                    <h2 className="section-title">{faq.title}</h2>

                                    <div className="faq-list">
                                        {faq.items.map((item, i) => (
                                            <details key={i} className="faq-item">
                                                <summary className="faq-question">{item.question}</summary>
                                                <p className="faq-answer">{item.answer}</p>
                                            </details>
                                        ))}
                                    </div>
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
