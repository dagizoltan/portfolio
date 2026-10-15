import { buildUrl } from "../lib/routes.js"

/**
 * Page hero.
 *
 * Two mutually exclusive footers: a contact block (contact-style pages) or a
 * button row. `meta` renders a mono spec line — dates, location, duration —
 * used by the experience and role pages.
 *
 * `role` carries the CV's own lockup: the green name with the orange job title
 * set immediately beneath it.
 */
export const Hero = ({ content, lang, isHome, className, children, aside }) => {
    const resolveHref = (href, fallback) => {
        const target = href || fallback;
        if (!target) return null;
        return target.startsWith(`/${lang}`) || target.startsWith('http') || target.startsWith('/assets')
            ? target
            : buildUrl(lang, target);
    };

    const buttons = [];

    if (content.cta_primary) {
        buttons.push({
            label: content.cta_primary,
            href: resolveHref(content.cta_primary_href, '/experience'),
            primary: true,
            download: Boolean(content.cta_primary_download)
        });
    }

    if (content.cta_secondary) {
        buttons.push({
            label: content.cta_secondary,
            href: resolveHref(content.cta_secondary_href, '/contact'),
            primary: false,
            download: Boolean(content.cta_secondary_download)
        });
    }

    return (
        <section className={`hero-section ${isHome ? 'hero-section--home' : 'hero-section--page'} ${className || ''}`}>
            <div className="hero-overlay"></div>

            <div className="container">
                <div className={`hero-content animate-fade-up ${aside ? 'hero-content--with-aside' : ''}`}>
                    <div className="hero-main-column">
                        {content.subtitle && <p className="hero-subtitle">{content.subtitle}</p>}

                        <div className="hero-title-row">
                            <h1 className="hero-title">{content.title}</h1>
                            {content.role && <p className="hero-role">{content.role}</p>}
                        </div>

                        {content.meta && content.meta.length > 0 && (
                            <ul className="hero-meta">
                                {content.meta.map((item, i) => (
                                    <li key={i} className="hero-meta-item">
                                        <span className="hero-meta-label">{item.label}</span>
                                        <span className="hero-meta-value">{item.value}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="hero-text-block">
                            {content.short_description && (
                                <div className="hero-description-short" dangerouslySetInnerHTML={{ __html: content.short_description }}></div>
                            )}
                            {content.description && (
                                <div className="hero-description" dangerouslySetInnerHTML={{ __html: content.description }}></div>
                            )}
                        </div>

                        {content.email ? (
                            <div className="hero-contact-block">
                                <a href={`mailto:${content.email}`} className="hero-email">
                                    {content.email}
                                </a>
                                <button
                                    type="button"
                                    data-copy={content.email}
                                    className="copy-email-trigger"
                                    data-copied-text={content.copied_label || (lang === 'hu' ? 'Kimásolva' : 'Copied')}
                                >
                                    <span className="copy-trigger-text" data-original-text={content.copy_label || (lang === 'hu' ? 'Másolás' : 'Copy')}>
                                        {content.copy_label || (lang === 'hu' ? 'Másolás' : 'Copy')}
                                    </span>
                                </button>
                            </div>
                        ) : (
                            buttons.length > 0 && (
                                <div className="hero-buttons">
                                    {buttons.map((btn, i) => (
                                        <a
                                            key={i}
                                            href={btn.href}
                                            download={btn.download ? "" : undefined}
                                            className={btn.primary ? "btn btn-primary" : "btn btn-outline"}
                                        >
                                            {btn.label}
                                        </a>
                                    ))}
                                </div>
                            )
                        )}

                        {children}
                    </div>

                    {aside && (
                        <aside className="hero-aside">
                            {aside}
                        </aside>
                    )}
                </div>
            </div>
        </section>
    );
};
