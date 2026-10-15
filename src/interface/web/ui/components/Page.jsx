import { LanguagePicker } from "./LanguagePicker.jsx"
import { BottomNav } from "./BottomNav.jsx"
import { buildUrl } from "../lib/routes.js"
import { Wordmark } from "./Wordmark.jsx"

export const Icons = {
    mail: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
    phone: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    pin: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
    clock: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    github: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>,
    linkedin: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
};

export const Page = ({ children, lang = "en" }) => (
  <html lang={lang}>
    {children}
  </html>
);

Page.Head = ({ children }) => (
  <head>
    <meta charSet="utf-8" />
    <meta name="theme-color" content="#01243F" />
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
    <link rel="stylesheet" href="/sx/global.css" />
    <script src="/ix/cta.js" type="module"></script>
    {children}
  </head>
);

Page.Seo = ({ seo, jsonLd }) => {
    if (!seo) return null;

    return (
        <>
            <title>{seo.title}</title>
            {seo.description && <meta name="description" content={seo.description} />}
            {seo.keywords && <meta name="keywords" content={seo.keywords} />}
            <meta name="viewport" content="width=device-width, initial-scale=1" />

            <link rel="canonical" href={seo.canonicalUrl} />
            <link rel="alternate" hrefLang="en" href={seo.enUrl} />
            <link rel="alternate" hrefLang="hu" href={seo.huUrl} />
            <link rel="alternate" hrefLang="x-default" href={seo.xDefaultUrl} />

            <meta property="og:type" content={seo.og.type} />
            <meta property="og:title" content={seo.og.title} />
            <meta property="og:description" content={seo.og.description} />
            <meta property="og:url" content={seo.og.url} />
            <meta property="og:site_name" content={seo.og.siteName} />
            <meta property="og:image" content={seo.og.image} />
            <meta property="og:locale" content={seo.og.locale} />
            <meta property="og:locale:alternate" content={seo.og.localeAlternate} />

            <meta name="twitter:card" content={seo.twitter.card} />
            <meta name="twitter:title" content={seo.twitter.title} />
            <meta name="twitter:description" content={seo.twitter.description} />
            <meta name="twitter:image" content={seo.twitter.image} />

            {jsonLd && Array.isArray(jsonLd) && jsonLd.filter(Boolean).map((schema, index) => (
                <script
                    key={index}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
            {jsonLd && !Array.isArray(jsonLd) && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
        </>
    );
};

Page.Body = ({ children }) => (
  <body>
    {children}
  </body>
);

Page.Layout = ({ children, navigation, lang, currentPath, common }) => (
  <div className="layout">
    <a className="skip-link" href="#main">
      {common?.skip_link || (lang === 'hu' ? 'Ugrás a tartalomra' : 'Skip to content')}
    </a>
    {children}
    <BottomNav navigation={navigation} lang={lang} currentPath={currentPath} />
  </div>
);

Page.Header = ({ navigation, lang, currentPath, common }) => {
  if (!navigation) return null;

  const identity = common?.identity || {};
  const cv = common?.cv;

  return (
    <header className="page-header">
      <div className="container">
        <a href={buildUrl(lang, '/')} className="brand" aria-label={`${identity.name || 'Zoltán Dági'} — ${lang === 'hu' ? 'kezdőlap' : 'home'}`}>
          <Wordmark className="wordmark--header" name={identity.name} title={identity.title} />
        </a>
        <nav className="desktop-nav" aria-label={lang === 'hu' ? 'Fő' : 'Main'}>
            <ul>
            {navigation.map((item, index) => {
                const href = buildUrl(lang, item.href);
                const isActive = item.href === '/'
                    ? currentPath === `/${lang}` || currentPath === `/${lang}/`
                    : currentPath.startsWith(`/${lang}${item.href}`);

                return (
                <li key={index}>
                    <a href={href} className={isActive ? 'active' : ''} aria-current={isActive ? 'page' : undefined}>{item.label}</a>
                </li>
                );
            })}
            </ul>
        </nav>
        <div className="header-actions">
            {cv?.href && (
                <a className="header-cv-link" href={cv.href} download>
                    {cv.short_label || cv.label}
                </a>
            )}
            <LanguagePicker lang={lang} currentPath={currentPath} />
        </div>
      </div>
    </header>
  );
};

Page.Footer = ({ lang, common, currentPath }) => {
    const copy = common?.footer?.copyright || "";
    const contact = common?.contact || {};
    const profiles = common?.profiles || [];
    const navigation = common?.navigation || [];
    const identity = common?.identity || {};

    return (
        <footer className="page-footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-branding">
                        <div className="footer-brand">
                            <Wordmark className="wordmark--footer" name={identity.name} title={identity.title} />
                        </div>
                        <p className="footer-slogan">{common?.slogan}</p>
                        {navigation.length > 0 && (
                            <div className="footer-nav">
                                <ul className="footer-links footer-links--horizontal">
                                    {navigation.map((item, i) => (
                                        <li key={i}>
                                            <a href={buildUrl(lang, item.href)}>{item.label}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {profiles.length > 0 && (
                            <div className="footer-socials">
                                {profiles.map((profile, i) => {
                                    const Icon = Icons[profile.icon];
                                    return (
                                        <a key={i} href={profile.href} title={profile.label} target="_blank" rel="noopener noreferrer">
                                            {Icon ? <Icon aria-hidden="true" /> : profile.label[0]}
                                            <span className="sr-only">{profile.label}</span>
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="footer-contact">
                        <h2 className="footer-col-title">{common?.footer?.contact_title || (lang === 'hu' ? 'Elérhetőség' : 'Get in touch')}</h2>
                        <div className="footer-contact-list">
                            {contact.email && (
                                <div className="footer-contact-item">
                                    <Icons.mail aria-hidden="true" />
                                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                                </div>
                            )}
                            {contact.phone && (
                                <div className="footer-contact-item">
                                    <Icons.phone aria-hidden="true" />
                                    <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
                                </div>
                            )}
                            {contact.location && (
                                <div className="footer-contact-item">
                                    <Icons.pin aria-hidden="true" />
                                    <span>{contact.location}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="copyright">
                    <div className="copyright-content">
                        <span>{copy}</span>
                        <div className="footer-legal-links">
                            {common?.footer?.privacy && (
                                <a href={buildUrl(lang, common.footer.privacy.href)} className="privacy-link">
                                    {common.footer.privacy.label}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
