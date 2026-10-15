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
| `/:lang` | Home — hero, figures, three lines of practice, last three roles, stack preview |
| `/:lang/experience` | Full timeline, newest first |
| `/:lang/experience/:id` | One role: CV bullets, context, spec panel, prev/next pager |
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

Change a date in the dictionary and the metrics strip, the timeline and
`ai.json` all follow. The same applies to the per-group counts on the stack page.

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
