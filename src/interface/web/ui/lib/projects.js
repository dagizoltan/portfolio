/**
 * Shared reading of projects.yaml.
 *
 * The date helpers are the ones the experience pages already use, so a project
 * and a role format their periods identically and there is one implementation
 * of "inclusive span in months" on the site.
 *
 * Every figure the projects pages display — the per-project counts and the
 * totals on the metrics strip — is summed from the dictionary here rather than
 * written into the copy, the same rule the rest of the site follows.
 */

import { formatRange, formatDuration, monthsBetween } from "./experience.js";

/** `YYYY-MM` → absolute month index, for ordering. */
const monthIndex = (value) => {
    if (!value) return null;
    const [year, month] = String(value).split('-').map(Number);
    if (!year || !month) return null;
    return year * 12 + (month - 1);
};

/**
 * Decorates each project with its computed fields and sorts newest first.
 *
 * A project with no `end` is still being worked on; it takes the `present`
 * label the dictionary supplies ("Active" / "Aktív") rather than a date, and
 * its duration runs to the current month.
 */
export const allProjects = (projectsDict, lang = 'en', labels = {}) => {
    const projects = projectsDict?.projects || [];
    const presentLabel = labels.present || (lang === 'hu' ? 'Aktív' : 'Active');

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const decorated = projects.map((project) => {
        const months = monthsBetween(project.start, project.end || currentMonth);
        return {
            ...project,
            months,
            active: !project.end,
            range: formatRange(project, lang, presentLabel),
            duration: formatDuration(months, lang),
            sortKey: monthIndex(project.start) || 0
        };
    });

    const oldestFirst = [...decorated].sort((a, b) => a.sortKey - b.sortKey);
    oldestFirst.forEach((project, i) => { project.index = i + 1; });

    return oldestFirst.reverse();
};

export const findProject = (projectsDict, id, lang = 'en', labels = {}) =>
    allProjects(projectsDict, lang, labels).find((project) => project.id === id) || null;

/**
 * Totals across every project, summed from each entry's own `figures` block.
 *
 * These describe volume and nothing else. The copy on the page says so; this
 * function only has to make sure the numbers are real.
 */
export const projectTotals = (projectsDict) => {
    const projects = projectsDict?.projects || [];

    const sum = (key) => projects.reduce(
        (total, project) => total + (Number(project.figures?.[key]) || 0),
        0
    );

    return {
        projects: projects.length,
        commits: sum('commits'),
        tests: sum('tests'),
        lines: sum('lines'),
        modules: sum('modules')
    };
};

/** `141297` → `141,297` / `141 297` — grouped the way each locale expects. */
export const formatCount = (value, lang = 'en') =>
    new Intl.NumberFormat(lang === 'hu' ? 'hu-HU' : 'en-US').format(Number(value) || 0);

/**
 * Compact form for the metrics strip, where six digits would wrap on a phone.
 * `141297` → `141k`. Below 10,000 the exact number is short enough to keep.
 */
export const formatCompact = (value, lang = 'en') => {
    const n = Number(value) || 0;
    if (n < 10000) return formatCount(n, lang);
    return `${Math.round(n / 1000)}k`;
};

/**
 * Injects the projects figures into a dictionary's metrics strip.
 *
 * Deliberately a different strip from the career one on the other pages: these
 * count repositories, not employment, and mixing the two would imply the
 * projects were roles.
 */
export const injectProjectMetrics = (dict, projectsDict, lang = 'en') => {
    const totals = projectTotals(projectsDict);
    const labels = dict.metrics_labels || {};

    dict.metrics = [
        { value: String(totals.projects), label: labels.projects || 'Projects' },
        { value: formatCompact(totals.commits, lang), label: labels.commits || 'Commits' },
        { value: formatCompact(totals.tests, lang), label: labels.tests || 'Tests' },
        { value: formatCompact(totals.lines, lang), label: labels.lines || 'Lines of source' }
    ];

    return dict;
};
