import { buildUrl } from "../lib/routes.js"

const stroke = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "square",
    strokeLinejoin: "miter"
};

/** Keyed by the nav href so the icon set stays in step with common.yaml. */
const Icons = {
    '/': () => (
        <svg {...stroke}>
            <path d="M3 10 12 3l9 7v11H3z" />
            <path d="M9 21v-7h6v7" />
        </svg>
    ),
    '/experience': () => (
        // Briefcase — the work history
        <svg {...stroke}>
            <path d="M3 8h18v12H3z" />
            <path d="M9 8V5h6v3" />
            <path d="M3 13h18" />
        </svg>
    ),
    '/skills': () => (
        // Stacked layers — the technology groups
        <svg {...stroke}>
            <path d="m12 3 9 5-9 5-9-5z" />
            <path d="m3 13 9 5 9-5" />
        </svg>
    ),
    '/about': () => (
        <svg {...stroke}>
            <path d="M3 3h18v18H3z" />
            <path d="M12 11v6" />
            <path d="M12 7.5h.01" />
        </svg>
    ),
    '/contact': () => (
        <svg {...stroke}>
            <path d="M2 4h20v16H2z" />
            <path d="m2 6 10 7 10-7" />
        </svg>
    )
};

export const BottomNav = ({ navigation, lang, currentPath }) => {
    if (!navigation) return null;

    return (
        <nav className="bottom-nav" aria-label={lang === 'hu' ? 'Fő' : 'Main'}>
            <ul>
                {navigation.map((item, index) => {
                    const href = buildUrl(lang, item.href);
                    const Icon = Icons[item.href];
                    const path = currentPath || '';
                    const isActive = item.href === '/'
                        ? path === `/${lang}` || path === `/${lang}/`
                        : path.startsWith(buildUrl(lang, item.href));

                    return (
                        <li key={index}>
                            <a
                                href={href}
                                className={`bottom-nav-link ${isActive ? 'active' : ''}`}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {Icon && <Icon aria-hidden="true" />}
                                <span className="bottom-nav-label">{item.label}</span>
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};
