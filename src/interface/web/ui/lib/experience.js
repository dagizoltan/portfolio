/**
 * Shared reading of experience.yaml.
 *
 * Dates in the dictionary are plain `YYYY-MM` strings. Everything derived from
 * them — durations, ordering, the "current" flag, the headline figures — is
 * computed here so no number has to be typed into the copy and then kept in
 * step by hand.
 */

const MONTH_NAMES = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    hu: ['jan.', 'febr.', 'márc.', 'ápr.', 'máj.', 'jún.', 'júl.', 'aug.', 'szept.', 'okt.', 'nov.', 'dec.']
};

/** `YYYY-MM` → absolute month index, so arithmetic never crosses a year badly. */
const monthIndex = (value) => {
    if (!value) return null;
    const [year, month] = String(value).split('-').map(Number);
    if (!year || !month) return null;
    return year * 12 + (month - 1);
};

/** Inclusive span: a role running 2024-07 → 2024-12 lasted six months, not five. */
export const monthsBetween = (start, end) => {
    const from = monthIndex(start);
    const to = monthIndex(end);
    if (from === null || to === null) return 0;
    return Math.max(0, to - from + 1);
};

export const formatMonth = (value, lang = 'en') => {
    if (!value) return '';
    const [year, month] = String(value).split('-').map(Number);
    const names = MONTH_NAMES[lang] || MONTH_NAMES.en;
    const name = names[(month || 1) - 1];
    return lang === 'hu' ? `${year}. ${name}` : `${year} ${name}`;
};

export const formatRange = (role, lang = 'en', presentLabel = 'Present') =>
    `${formatMonth(role.start, lang)} — ${role.end ? formatMonth(role.end, lang) : presentLabel}`;

/** "1 yr 5 mos" / "1 év 5 hónap", built from the months the dates imply. */
export const formatDuration = (months, lang = 'en') => {
    const years = Math.floor(months / 12);
    const rest = months % 12;

    if (lang === 'hu') {
        const parts = [];
        if (years) parts.push(`${years} év`);
        if (rest) parts.push(`${rest} hónap`);
        return parts.join(' ') || '1 hónap';
    }

    const parts = [];
    if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
    if (rest) parts.push(`${rest} mo${rest > 1 ? 's' : ''}`);
    return parts.join(' ') || '1 mo';
};

/**
 * Decorates each role with its computed fields and sorts newest first.
 * `index` counts up from the oldest role so the displayed numbering reads as a
 * career sequence rather than a list position.
 */
export const allRoles = (experienceDict, lang = 'en', labels = {}) => {
    const roles = experienceDict?.roles || [];
    const presentLabel = labels.present || (lang === 'hu' ? 'Jelenleg' : 'Present');

    const decorated = roles.map((role) => {
        const months = monthsBetween(role.start, role.end || role.start);
        return {
            ...role,
            months,
            current: !role.end,
            range: formatRange(role, lang, presentLabel),
            duration: formatDuration(months, lang),
            sortKey: monthIndex(role.start) || 0
        };
    });

    const oldestFirst = [...decorated].sort((a, b) => a.sortKey - b.sortKey);
    oldestFirst.forEach((role, i) => { role.index = i + 1; });

    return oldestFirst.reverse();
};

export const findRole = (experienceDict, id, lang = 'en', labels = {}) =>
    allRoles(experienceDict, lang, labels).find((role) => role.id === id) || null;

/**
 * Total time spent in engineering roles, in months.
 *
 * Roles tagged `engineering: false` (the Bertelsmann client-service year) are
 * excluded, so the headline figure describes software work specifically and
 * does not quietly inflate itself with everything else on the CV.
 */
export const engineeringMonths = (experienceDict) =>
    (experienceDict?.roles || [])
        .filter((role) => role.engineering !== false)
        .reduce((sum, role) => sum + monthsBetween(role.start, role.end || role.start), 0);

export const distinctCompanies = (experienceDict) =>
    new Set((experienceDict?.roles || []).map((role) => role.company)).size;
