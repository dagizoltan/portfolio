const LANGS = ["en", "hu"];

/**
 * Swaps the language segment of the current path, preserving the rest of the
 * route so the visitor stays on the page they were reading.
 */
export const LanguagePicker = ({ lang, currentPath = "" }) => {
    const path = currentPath.startsWith("/") ? currentPath : `/${currentPath}`;
    const targetLang = lang === "hu" ? "en" : "hu";

    const segments = path.split("/");
    let targetPath;
    if (LANGS.includes(segments[1])) {
        segments[1] = targetLang;
        targetPath = segments.join("/");
    } else {
        targetPath = `/${targetLang}${path === "/" ? "" : path}`;
    }

    return (
        <div className="language-picker">
            <a href={targetPath} className="lang-link" hrefLang={targetLang} lang={targetLang}>
                {targetLang.toUpperCase()}
                <span className="sr-only">
                    {targetLang === "hu" ? " — Magyar" : " — English"}
                </span>
            </a>
        </div>
    );
};
