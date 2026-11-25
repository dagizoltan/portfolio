#!/usr/bin/env python3
"""
Builds both CVs from the same YAML dictionaries the site renders.

    Zoltan-Dagi-CV-ATS.pdf     plain, for applicant tracking systems
    Zoltan-Dagi-CV.pdf         the portfolio's design, for humans

ONE CONTENT MODEL, TWO THEMES
-----------------------------
`build_content()` reads `data/dict/<lang>/` and returns a structure of
sections, entries and bullets. Neither theme may add, drop or reword anything
in it — they only decide what it looks like. That is what keeps the two files
the same CV, and `--verify` proves it by extracting the text from both and
comparing it word for word.

So: add content in `build_content`, add styling in a theme. Never in both.

WHY NOT JUST EDIT THE OLD DESIGN EXPORT
---------------------------------------
The original design export (deleted; in git history at `e37b55a`) could not
be edited or parsed. Its visible content is
~96,000 vector path operators, and the Type 3 text layer beside it has glyph
procedures containing only a `d1` metrics operator — they paint nothing. Strip
every BT/ET block and it renders identically. That is why `pdftotext` reduces
its technology list to "HTM C A C WE PACK RO", and why its phone number could
not be corrected in place: patching the text layer would make copy-paste report
one number while the page displayed another.

Both files this script writes carry a real text layer, so the designed one is
readable by software too. The plain one still exists because strict parsers do
better without colour, rules and a dark ground.

LAYOUT RULES THAT ARE LOAD-BEARING (both themes)
------------------------------------------------
- Single column. Dates inline, never right-aligned beside a title: a parser
  reading in x-order turns that into interleaved nonsense, which is exactly
  what the old export does.
- Skills as comma-separated prose, not chips, tables or columns. This is the
  block ATS keyword matching actually reads.
- Standard headings ("Experience", "Education", "Skills"). Parsers match the
  literal words.
- Letter-spacing is applied with the PDF `Tc` operator (see TrackedLine), never
  by inserting spaces between characters — that would wreck extraction.

USAGE
-----
    python3 -m venv .venv && .venv/bin/pip install reportlab pyyaml
    .venv/bin/python scripts/build-cv.py            # writes both
    .venv/bin/python scripts/build-cv.py --verify   # and diffs their text

Typefaces are cached in `scripts/.fonts/` on first run (Roboto, Roboto Mono and
Inter — the three the site loads). Without a network the designed build falls
back to system fonts and says so loudly; the ATS build never needs them.
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

import yaml
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Flowable, KeepTogether, Paragraph, SimpleDocTemplate, Spacer,
)

ROOT = Path(__file__).resolve().parent.parent
FONT_CACHE = Path(__file__).resolve().parent / ".fonts"

MONTHS = ["January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"]

# The site's tokens, lifted from styles/global.css. Green names things, orange
# states them — headings and rules green, dates and employers orange.
PALETTE = {
    "ground":  "#01243F",
    "void":    "#011A2E",
    "text":    "#CCD3D8",
    "muted":   "#99A7B2",
    "accent":  "#3EB823",   # green  — structure
    "signal":  "#CC750C",   # orange — fact
    "rule":    "#10385A",
}

FONTS = {
    "Roboto-Light":          "Roboto:300",
    "Roboto-Regular":        "Roboto:400",
    "RobotoMono-Regular":    "Roboto+Mono:400",
    "RobotoMono-Bold":       "Roboto+Mono:700",
    "Inter-Regular":         "Inter:400",
    "Inter-SemiBold":        "Inter:600",
}


# --------------------------------------------------------------------------
# fonts
# --------------------------------------------------------------------------

def fetch_fonts(quiet=False):
    """Download the site's three typefaces once into scripts/.fonts/.

    `subset=latin,latin-ext` is required, not cosmetic: the plain `latin`
    subset has no ő or ű, which the Hungarian copy needs and which appear in
    place names here regardless.
    """
    FONT_CACHE.mkdir(exist_ok=True)
    ok = True
    for name, family in FONTS.items():
        target = FONT_CACHE / f"{name}.ttf"
        if target.exists() and target.stat().st_size > 1000:
            continue
        url = f"https://fonts.googleapis.com/css?family={family}&subset=latin,latin-ext"
        try:
            # A bare UA is what makes the API serve TrueType; modern ones get
            # woff2 and an old IE string gets EOT, neither of which reportlab
            # can embed.
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            css = urllib.request.urlopen(req, timeout=30).read().decode()
            m = re.search(r"src:\s*url\(([^)]+)\)", css)
            if not m:
                raise RuntimeError("no font url in CSS response")
            data = urllib.request.urlopen(
                urllib.request.Request(m.group(1), headers={"User-Agent": "Mozilla/5.0"}),
                timeout=60).read()
            if data[:4] != b"\x00\x01\x00\x00":
                raise RuntimeError(f"not TrueType (magic {data[:4].hex()})")
            target.write_bytes(data)
            if not quiet:
                print(f"  fetched {name}.ttf ({len(data) // 1024} KB)")
        except Exception as exc:                      # noqa: BLE001
            print(f"  ! could not fetch {name}: {exc}", file=sys.stderr)
            ok = False
    return ok


def register_fonts():
    """Returns True if the real typefaces are available and registered."""
    if not all((FONT_CACHE / f"{n}.ttf").exists() for n in FONTS):
        return False
    try:
        for name in FONTS:
            pdfmetrics.registerFont(TTFont(name, str(FONT_CACHE / f"{name}.ttf")))
        return True
    except Exception as exc:                          # noqa: BLE001
        print(f"  ! font registration failed: {exc}", file=sys.stderr)
        return False


# --------------------------------------------------------------------------
# content — read once, rendered twice
# --------------------------------------------------------------------------

def esc(text):
    text = re.sub(r"\s+", " ", str(text)).strip()
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def strip_html(text):
    text = re.sub(r"<br\s*/?>", " ", str(text))
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", text)).strip()


def month_year(value):
    if not value:
        return ""
    year, month = str(value).split("-")
    return f"{MONTHS[int(month) - 1]} {year}"


def date_range(start, end, present="Present"):
    return f"{month_year(start)} - {month_year(end) if end else present}"


def build_content(lang="en"):
    d = ROOT / "data" / "dict" / lang

    def load(name):
        with open(d / f"{name}.yaml", encoding="utf-8") as fh:
            return yaml.safe_load(fh)

    common, experience = load("common"), load("experience")
    skills, about, home = load("skills"), load("about"), load("home")
    contact, projects = load("contact"), load("projects")

    ident, c = common["identity"], common["contact"]
    langs = ", ".join(f"{l['name']} ({l['level'].lower()})"
                      for l in about["languages"]["items"])
    licence = next((x["value"] for x in contact["details"]["items"]
                    if "licen" in x["label"].lower()), None)

    contact_lines = [
        f"{c['email']}  |  {c['phone']}",
        f"{c['location'].replace(' — remote-first', '')}  |  Remote-first",
        f"Languages: {langs}",
    ]
    if licence:
        contact_lines.append(f"Driving licence: {licence}")

    sections = []

    sections.append({
        "title": "Summary",
        "paras": [strip_html(home["hero"]["description"])],
    })

    skill_lines = [(g["name"], ", ".join(i if isinstance(i, str) else i["name"]
                                         for i in g["items"]))
                   for g in skills["groups"]]
    skill_lines.append(("Secondary",
                        ", ".join(i["name"] for i in skills["secondary"]["items"])))
    sections.append({"title": "Skills", "pairs": skill_lines})

    entries = []
    for r in sorted(experience["roles"], key=lambda r: r["start"], reverse=True):
        meta = [date_range(r.get("start"), r.get("end"))]
        if r.get("location"):
            meta.append(r["location"])
        if r.get("project"):
            meta.append(r["project"])
        entries.append({
            "title": f"{r['role']}, {r['company']}",
            "meta": "  |  ".join(meta),
            "bullets": list(r.get("highlights", [])),
        })
    sections.append({"title": "Experience", "entries": entries})

    entries = []
    for p in sorted(projects["projects"], key=lambda p: p["start"], reverse=True):
        meta = [date_range(p.get("start"), p.get("end"), present="Ongoing")]
        if p.get("language"):
            meta.append(p["language"])
        entries.append({
            "title": f"{p['name']} - {p['kind']}",
            "meta": "  |  ".join(meta),
            "lead": p["summary"],
            "bullets": list(p.get("highlights", [])[:2])
                       + ([f"Technologies: {', '.join(p['stack'])}"] if p.get("stack") else []),
        })
    sections.append({
        "title": "Self-Directed Projects",
        # Said plainly so neither a parser nor a reader files these as jobs.
        "intro": ("Personal engineering projects, not client work and not shipped "
                  "products. Source is private; access on request."),
        "entries": entries,
    })

    sections.append({
        "title": "Education",
        "entries": [{"title": e["subject"],
                     "meta": f"{e['school']}  |  {e['range']}",
                     "bullets": []}
                    for e in about["education"]["items"]],
    })

    return {
        "name": ident["full_name"],
        "title": ident["title"].title(),
        "contact_lines": contact_lines,
        "sections": sections,
        "keywords": ", ".join(i if isinstance(i, str) else i["name"]
                              for g in skills["groups"] for i in g["items"]),
    }


# --------------------------------------------------------------------------
# a tracked display line
# --------------------------------------------------------------------------

class TrackedLine(Flowable):
    """One line of letter-spaced text.

    Uses the PDF `Tc` operator rather than padding the string with spaces, so
    the wide uppercase display type the CV is set in still extracts as a normal
    word. Inserting spaces between characters would read as "Z O L T A N".
    """

    def __init__(self, text, font, size, color, tracking=0.0, leading=None,
                 rule=None, rule_gap=4):
        super().__init__()
        self.text, self.font, self.size = text, font, size
        self.color, self.tracking = color, tracking
        self.leading = leading or size * 1.2
        self.rule, self.rule_gap = rule, rule_gap

    def wrap(self, avail_w, avail_h):
        self.width = avail_w
        self.height = self.leading + (self.rule_gap + 1 if self.rule else 0)
        return self.width, self.height

    def draw(self):
        c = self.canv
        c.saveState()
        baseline = self.height - self.size
        # Tracking is a text-object parameter (`Tc`), not a canvas one.
        t = c.beginText(0, baseline)
        t.setFont(self.font, self.size)
        t.setFillColor(self.color)
        t.setCharSpace(self.tracking)
        t.textOut(self.text)
        c.drawText(t)
        if self.rule:
            c.setStrokeColor(self.rule)
            c.setLineWidth(0.7)
            y = baseline - self.rule_gap
            c.line(0, y, self.width, y)
        c.restoreState()


# --------------------------------------------------------------------------
# themes
# --------------------------------------------------------------------------

class Theme:
    """Styling only. A theme never changes what the CV says."""

    name = "base"
    suffix = ""
    page_bg = None

    def on_page(self, canvas, doc):
        if self.page_bg is not None:
            canvas.saveState()
            canvas.setFillColor(self.page_bg)
            canvas.rect(0, 0, doc.pagesize[0], doc.pagesize[1], stroke=0, fill=1)
            canvas.restoreState()


class PlainTheme(Theme):
    """Black on white, base-14 Helvetica, no decoration. For the parsers."""

    name, suffix = "ats", "-ATS"
    page_bg = None

    body_font, bold_font = "Helvetica", "Helvetica-Bold"

    def styles(self):
        base = ParagraphStyle("base", fontName=self.body_font, fontSize=9,
                              leading=11.4, textColor=black)
        return {
            "contact": ParagraphStyle("contact", parent=base, leading=11.8),
            "body": base,
            "intro": ParagraphStyle("intro", parent=base, fontSize=8.5,
                                    leading=11, spaceAfter=1),
            "entry": ParagraphStyle("entry", parent=base, fontName=self.bold_font,
                                    fontSize=9.5, leading=12, spaceBefore=5),
            "meta": ParagraphStyle("meta", parent=base, fontSize=8.5,
                                   leading=11, spaceAfter=1),
            "bullet": ParagraphStyle("bullet", parent=base, leftIndent=9,
                                     firstLineIndent=-9, spaceAfter=1),
        }

    def header(self, content, st):
        return [
            TrackedLine(content["name"], self.bold_font, 18, black, 0, 21),
            TrackedLine(content["title"], self.body_font, 11, black, 0, 14),
            Spacer(1, 3),
        ] + [Paragraph(esc(l), st["contact"]) for l in content["contact_lines"]]

    def heading(self, text, st):
        return [Spacer(1, 7),
                TrackedLine(text, self.bold_font, 10.5, black, 0, 13,
                            rule=black, rule_gap=3),
                Spacer(1, 2)]

    def pair(self, label, value, st):
        return Paragraph(f"<b>{esc(label)}:</b> {esc(value)}", st["bullet"])

    def bullet(self, text, st):
        return Paragraph(f"- {esc(text)}", st["bullet"])


class PortfolioTheme(Theme):
    """The site's own palette and type. For humans.

    Green names things, orange states them — the division the CV and the site
    both use. Nothing is rounded, because `--radius: 0`.
    """

    name, suffix = "portfolio", ""
    page_bg = HexColor(PALETTE["ground"])

    display_font = "Roboto-Light"
    body_font, bold_font = "Inter-Regular", "Inter-SemiBold"
    mono_font, mono_bold = "RobotoMono-Regular", "RobotoMono-Bold"

    def __init__(self, real_fonts=True):
        if not real_fonts:
            self.display_font = "Helvetica"
            self.body_font, self.bold_font = "Helvetica", "Helvetica-Bold"
            self.mono_font = self.mono_bold = "Courier"

    def styles(self):
        text, muted = HexColor(PALETTE["text"]), HexColor(PALETTE["muted"])
        base = ParagraphStyle("base", fontName=self.body_font, fontSize=8.4,
                              leading=11.2, textColor=text)
        return {
            "contact": ParagraphStyle("contact", parent=base,
                                      fontName=self.mono_font, fontSize=7.4,
                                      leading=11, textColor=muted),
            "body": base,
            "intro": ParagraphStyle("intro", parent=base, fontSize=7.8,
                                    leading=10.6, textColor=muted, spaceAfter=1),
            "entry": ParagraphStyle("entry", parent=base, fontName=self.bold_font,
                                    fontSize=9.2, leading=11.6, spaceBefore=5),
            "meta": ParagraphStyle("meta", parent=base, fontName=self.mono_font,
                                   fontSize=7, leading=10.2,
                                   textColor=HexColor(PALETTE["signal"]),
                                   spaceAfter=1),
            "bullet": ParagraphStyle("bullet", parent=base, leftIndent=10,
                                     firstLineIndent=-10, spaceAfter=0.8),
        }

    def header(self, content, st):
        accent = HexColor(PALETTE["accent"])
        return [
            TrackedLine(content["name"].upper(), self.display_font, 21,
                        accent, 2.0, 24),
            TrackedLine(content["title"].upper(), self.display_font, 11.5,
                        HexColor(PALETTE["muted"]), 2.6, 15),
            Spacer(1, 5),
        ] + [Paragraph(esc(l), st["contact"]) for l in content["contact_lines"]]

    def heading(self, text, st):
        return [Spacer(1, 6),
                TrackedLine(text.upper(), self.display_font, 10.8,
                            HexColor(PALETTE["accent"]), 2.2, 13,
                            rule=HexColor(PALETTE["accent"]), rule_gap=3),
                Spacer(1, 2)]

    def pair(self, label, value, st):
        sig = PALETTE["signal"]
        return Paragraph(
            f'<font face="{self.mono_bold}" size="7.4" color="{sig}">'
            f'{esc(label.upper())}</font>  {esc(value)}', st["bullet"])

    def bullet(self, text, st):
        accent = PALETTE["accent"]
        return Paragraph(f'<font color="{accent}">—</font> {esc(text)}',
                         st["bullet"])


# --------------------------------------------------------------------------
# render
# --------------------------------------------------------------------------

def render(content, theme, out_path):
    st = theme.styles()
    story = list(theme.header(content, st))

    for section in content["sections"]:
        story += theme.heading(section["title"], st)
        if section.get("intro"):
            story.append(Paragraph(esc(section["intro"]), st["intro"]))
        for para in section.get("paras", []):
            story.append(Paragraph(esc(para), st["body"]))
        for label, value in section.get("pairs", []):
            story.append(theme.pair(label, value, st))
        for entry in section.get("entries", []):
            block = [Paragraph(esc(entry["title"]), st["entry"]),
                     Paragraph(esc(entry["meta"]), st["meta"])]
            if entry.get("lead"):
                block.append(Paragraph(esc(entry["lead"]), st["bullet"]))
            block += [theme.bullet(b, st) for b in entry["bullets"]]
            story.append(KeepTogether(block))

    doc = SimpleDocTemplate(
        str(out_path), pagesize=A4,
        leftMargin=18 * mm, rightMargin=18 * mm,
        topMargin=15 * mm, bottomMargin=15 * mm,
        title=f"{content['name']} - {content['title']}",
        author=content["name"], subject="Curriculum Vitae",
        keywords=content["keywords"],
    )
    doc.build(story, onFirstPage=theme.on_page, onLaterPages=theme.on_page)
    return out_path


def extract(path):
    """The words a parser gets out of a built PDF, normalised for comparison.

    Case and punctuation are dropped deliberately: the portfolio theme sets
    headings in caps and uses an em dash for bullets where the plain one uses
    a hyphen and a colon. Those are styling. What must match is the words and
    their order — if that holds, the two files say the same thing.
    """
    out = subprocess.run(["pdftotext", str(path), "-"],
                         capture_output=True, text=True, check=True).stdout
    out = re.sub(r"[^\w\s]", " ", out.lower(), flags=re.UNICODE)
    return re.sub(r"\s+", " ", out).strip()


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--lang", default="en")
    ap.add_argument("--verify", action="store_true",
                    help="extract text from both and confirm they match")
    args = ap.parse_args()

    print("fonts:")
    fetch_fonts(quiet=True)
    real = register_fonts()
    print("  real typefaces" if real else
          "  ! FALLING BACK to system fonts — the designed CV will not match the site")

    content = build_content(args.lang)
    built = []
    for theme in (PlainTheme(), PortfolioTheme(real_fonts=real)):
        out = ROOT / f"Zoltan-Dagi-CV{theme.suffix}.pdf"
        render(content, theme, out)
        built.append(out)
        print(f"  wrote {out.name} ({out.stat().st_size / 1024:.0f} KB)")

    if args.verify:
        a, b = (extract(p) for p in built)
        if a == b:
            words = len(a.split())
            print(f"verify: identical content in both ({words} words)")
        else:
            print("verify: CONTENT DIFFERS", file=sys.stderr)
            import difflib
            for line in list(difflib.unified_diff(a.split(), b.split(), lineterm=""))[:40]:
                print("  " + line, file=sys.stderr)
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
