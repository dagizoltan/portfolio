/**
 * Wordmark — the CV's masthead, rebuilt as live text.
 *
 * On the CV the name sits in green with the job title in orange directly
 * beneath it. That lockup is the identity, so it is reproduced here in the
 * display face rather than drawn as an image: it stays selectable, scalable
 * and translatable, and the two colours come from the tokens rather than from
 * baked-in pixels.
 */
export const Wordmark = ({ className = "", name = "ZOLTÁN DÁGI", title = "SOFTWARE DEVELOPER" }) => (
    <span className={`wordmark ${className}`.trim()} role="img" aria-label={`${name} — ${title}`}>
        <span className="wordmark-text" aria-hidden="true">{name}</span>
        <span className="wordmark-extension" aria-hidden="true">{title}</span>
    </span>
);
