import { engineeringMonths, distinctCompanies } from "./experience.js";

/** Flattens the grouped skill tree into a single list. */
export const allSkills = (skillsDict) =>
    (skillsDict?.groups || []).flatMap((group) =>
        (group.items || []).map((item) => ({
            name: typeof item === 'string' ? item : item.name,
            groupId: group.id,
            groupName: group.name
        }))
    );

/**
 * Derives the headline figures from experience.yaml and skills.yaml so they can
 * never drift out of step with the content. Every number here is counted, not
 * typed — change a date in the dictionary and the strip follows.
 */
export const injectMetrics = (c, dict, lang) => {
    const experienceDict = c.dict("experience", lang);
    const skillsDict = c.dict("skills", lang);

    const roles = experienceDict?.roles || [];
    const years = Math.floor(engineeringMonths(experienceDict) / 12);

    const labels = dict.metrics_labels || experienceDict?.metrics_labels || {};

    dict.metrics = [
        { value: `${years}+`, label: labels.years || "Years in software" },
        { value: String(roles.length), label: labels.roles || "Roles" },
        { value: String(distinctCompanies(experienceDict)), label: labels.companies || "Companies" },
        { value: String(allSkills(skillsDict).length), label: labels.technologies || "Technologies" }
    ];

    return dict;
};
