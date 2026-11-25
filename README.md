# PORTFOLIO — Zoltán Dági

Personal site for Zoltán Dági, software developer. Navy ground, pale type, green
for structure, orange for fact. Deno + Hono JSX, server-rendered, no build step.

```bash
deno task start     # http://localhost:8000, redirects to /en or /hu
```

## Architecture

Adapted from the NERO site, so the structure will look familiar. One handler
directory per route, each owning its own page component and CSS:

```
src/interface/web/
  web.js                        routing, dict loader, CSS/island serving
  ui/
    styles/global.css           design tokens + everything shared
    components/                 Page, Hero, CtaSection, Metrics, Wordmark, …
    lib/
      routes.js                 buildUrl(lang, path)
      experience.js             date maths — durations, ordering, totals
      projects.js               project ordering, totals, number formatting
      metrics.js                headline figures, counted from the dictionaries
      rich-text.js              **bold** / *italic* + paragraphs for YAML copy
      seo/site.js               single source of truth for site identity
      seo/{resolve-seo,build-schema,build-breadcrumbs}.js
    handlers/<route>/
      <route>.handler.js        loads dict, builds SEO, renders
      <route>.page.jsx          markup
      <route>.css               served at /sx/<route>.css
    islands/common/cta.island.js   served at /ix/cta.js
data/dict/{en,hu}/*.yaml        all copy — nothing user-facing lives in JSX
```

Content is entirely YAML. Adding a role or a technology means editing `data/`,
never a component.

### Routes

| Route | Notes |
|---|---|
| `/:lang` | Home — hero, figures, three lines of practice, last three roles, projects teaser, stack preview |
| `/:lang/experience` | Full timeline, newest first |
| `/:lang/experience/:id` | One role: CV bullets, context, spec panel, prev/next pager |
| `/:lang/projects` | Self-directed projects, newest first, behind a disclosure block |
| `/:lang/projects/:id` | One project: maturity statement, what it does, why, measured figures |
| `/:lang/skills` | Full technology list grouped, plus the CV's secondary skills |
| `/:lang/about` | Story, how he works, education, languages, interests |
| `/:lang/contact` | Channels, details, FAQ |
| `/:lang/privacy` | Rendered from `handlers/legal` |
| `/robots.txt`, `/sitemap*.xml`, `/ai.json` | Generated from `data/` |

`:lang` is `en` or `hu`. Anything else 404s. `/` redirects by `cf-ipcountry` or
`accept-language`.

## Design system

Everything is driven by tokens at the top of `global.css`. The palette is lifted
pixel-for-pixel from `Dági Zoltán - CV.pdf`:

| Token | Value | From the CV |
|---|---|---|
| `--color-background` | `#01243F` | page ground |
| `--color-void` | `#011A2E` | derived — deeper navy for bands |
| `--color-foreground` | `#CCD3D8` | body type |
| `--color-text-muted` | `#99A7B2` | secondary type |
| `--color-accent` | `#3EB823` | the green — name, headings, rules |
| `--color-signal` | `#CC750C` | the orange — employers, dates, labels |

**Green is structure, orange is fact.** On the CV the green names things
(the person, each section) and the orange states them (which employer, which
dates, which place). The site keeps that division: headings and rules are green,
eyebrows, dates, employers and spec labels are orange.

**Two rules keep the palette legal.** Both are enforced by convention, not by
code, so read them before adding a surface:

1. **Alternating bands go darker, never lighter.** `--color-void` sits *below*
   the ground, so every token gains contrast inside a band. A lighter navy would
   cost the orange its pass: `#CC750C` measures 4.62:1 on `#01243F` and 5.15:1
   on `#011A2E`, but only 4.24:1 on `#042B48` and 3.92:1 on `#07314F`. There is
   deliberately **no lighter surface token** — cards sit on the ground and are
   separated by hairline borders instead.
2. **Filled elements carry the navy ink, never white.** White on the green is
   2.60:1 and on the orange 3.43:1; both fail. `#011A2E` on them is 6.80:1 and
   5.15:1. Hover lifts the fill *lighter* (8.83:1 and 7.42:1), so the state
   change raises the ink's contrast rather than eroding it.

The green needs no separate lifted text token — at 6.10:1 on the ground it is
safe at 11px and at 5rem alike.

Other conventions:

- `--radius: 0` — nothing is rounded, anywhere.
- Roboto Light for display (the CV's own face, uppercase and widely tracked),
  Inter for body, Roboto Mono for labels, dates and buttons. Loaded from Google
  Fonts — the one external request the site makes, disclosed on `/privacy`.
- Card grids draw hairlines as **borders on the cards**, with the container
  supplying the top and left edge. Do not switch to the `gap: 1px` over a
  coloured container trick: it paints the border colour through the empty cells
  of an incomplete final row.
- On the skills page, colour rotates by group **position**, not by proficiency,
  and carries no meaning — see below.

## Where the numbers come from

Nothing on this site states a figure in prose. Every number is counted at
render time:

- **Years in software** — summed from role `start`/`end` months in
  `experience.yaml`, excluding roles marked `engineering: false`.
- **Roles, companies** — counted from the same file (`companies` is distinct).
- **Technologies** — counted from `skills.yaml`.
- **Durations and date ranges** — formatted from `YYYY-MM` in `lib/experience.js`,
  inclusive of both endpoints, and localised per language.
- **Project figures** — commits, tests, source lines and modules per project are
  measured from each repository and stored in `projects.yaml`; the totals on the
  projects strip are summed from those entries in `lib/projects.js`, never typed.

Change a date in the dictionary and the metrics strip, the timeline and
`ai.json` all follow. The same applies to the per-group counts on the stack page.

## The projects section

`/:lang/projects` covers the self-directed work from 2026 — four codebases, none
of them client work and none of them a shipped product. Three rules apply there
and they are not optional:

- **A disclosure block comes before the work.** It states that these are not
  products, not client work, and that the source is private. Every claim further
  down the page depends on it, so it is not something to shorten or move below
  the fold.
- **Each project leads with its own maturity statement.** `status` in
  `projects.yaml` is rendered first on the detail page, in the project's own
  words. A reader who stops after one paragraph should still leave with the
  right impression of how finished the thing is.
- **`figures` are measured, not estimated.** Commits come from the git history,
  tests from test attributes and registrations in the source, lines from tracked
  source files. Re-measure them when a project moves; do not round them up.

`Sovereign` is the site's name for the repository called `counter-terrorist`.
The page describes what it is — a host security orchestrator — rather than the
mission framing in the repository's own README.

## What the content does and does not claim

The CV is the source. Three rules were applied while turning it into pages, and
they matter if you edit the copy:

- **`highlights` are the CV's own bullets**, lightly repunctuated. `summary` and
  `context` are framing written for the site — they interpret the role, they do
  not add new facts about it.
- **`stack` per role lists only technologies the CV names inside that role's own
  bullets.** It is deliberately not a complete list of what was used, because
  the CV does not record that. The page says so, next to the list.
- **Skill colours mean nothing.** The CV prints its technology list in four
  colours; here the same rotation is driven by group position. The CV states
  *which* technologies, not *how well*, and colouring a judgement it never made
  would be inventing one. Nothing is lost if a reader cannot separate the greens
  from the oranges — each group is named in the heading above its own list.

## Before this goes live

- [ ] **Set the domain.** `src/interface/web/ui/lib/seo/site.js` holds
      `https://dagizoltan.deno.net`. Change it there and canonicals, hreflang,
      JSON-LD, both sitemaps and `ai.json` all follow.
- [ ] **Add profile links.** `profiles: []` in both `common.yaml` files is empty,
      so the footer shows no social row and the `Person` schema has an empty
      `sameAs`. Add GitHub and LinkedIn — `sameAs` is one of the stronger signals
      for a personal-name search. Icons available: `github`, `linkedin`.
- [ ] **A GitHub link is the biggest single gap.** The CV lists Git, GitLab,
      GitHub and Bitbucket but links no public code. For a developer portfolio
      that is the first thing a technical reviewer looks for.
- [ ] **The CV PDF is served from `/assets/zoltan-dagi-cv.pdf`** and is the file
      from the repository root. Re-export it there when the CV changes — the
      header, both hero buttons and the about page all point at that one path.
- [ ] **The OG image is an SVG.** `assets/og-default.svg` renders correctly in
      most previews, but a few social platforms only accept raster. Export a
      1200×630 PNG and update `logo`/`defaultImage` in `site.js` if that matters.
- [ ] **`privacy.yaml` carries a date** (`updated:`) in both languages. Change
      it whenever the page changes.
- [ ] Consider self-hosting the three typefaces to remove the Google Fonts
      request, which the privacy page currently discloses.
- [ ] **No analytics is installed**, by design. If you add any, the privacy page
      stops being accurate — update it in the same commit.
