export const CtaSection = ({ lang, common = {}, content }) => {
    const source = content || common?.bottom_cta;
    if (!source) return null;

    const { title, subtitle, eyebrow, description, copy_label, copied_label } = source;
    const email = common.contact?.email;
    const phone = common.contact?.phone;
    const displayEyebrow = eyebrow || subtitle;
    const fallbackCopy = lang === 'hu' ? 'E-mail másolása' : 'Copy email';
    const fallbackCopied = lang === 'hu' ? 'Kimásolva' : 'Copied';

    return (
        <section className="cta-section">
            <div className="container">
                <div className="cta-content">
                    <div className="cta-main-column">
                        {displayEyebrow && <p className="cta-eyebrow">{displayEyebrow}</p>}
                        <h2 className="cta-title">{title}</h2>
                        {description && <p className="cta-description">{description}</p>}
                        {email && (
                            <div className="cta-action">
                                <div className="cta-channels">
                                    <a href={`mailto:${email}`} className="cta-email">{email}</a>
                                    {phone && (
                                        <a href={`tel:${phone.replace(/\s/g, '')}`} className="cta-phone">{phone}</a>
                                    )}
                                    <button
                                        type="button"
                                        data-copy={email}
                                        className="copy-email-trigger"
                                        data-copied-text={copied_label || fallbackCopied}
                                    >
                                        <span className="copy-trigger-text" data-original-text={copy_label || fallbackCopy}>
                                            {copy_label || fallbackCopy}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
