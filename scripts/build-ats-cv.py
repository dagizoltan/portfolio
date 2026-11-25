#!/usr/bin/env python3
"""
Builds an ATS-readable CV from the same YAML dictionaries the site renders.

WHY THIS EXISTS
---------------
`Dági Zoltán - CV.pdf` is a design export. Its visible content is ~96,000
vector path operators; the text layer beside it is a set of Type 3 fonts whose
glyph procedures contain only a `d1` metrics operator and paint nothing. Delete
every BT/ET block from that file and it still renders identically — the text is
an approximation bolted onto a picture, which is why `pdftotext` turns the
skills block into "HTM C A C WE PACK RO".

Applicant tracking systems score the extracted text. That file scores near zero
on keyword match however many of the right words are printed on it.

This produces the opposite: one column, real text, base-14 Helvetica, no
graphics, no tables, no header/footer, drawn strictly in reading order. Ugly on
purpose. Keep the designed PDF for humans and send this one to the robots.

RULES THAT MATTER (do not "improve" these)
------------------------------------------
- Single column. Dates go inline, never right-aligned on the same line as a
  title: a parser reading in x-order turns that into interleaved nonsense,
  which is exactly what the designed CV does.
- Base-14 Helvetica, not an embedded face. Universally extractable and it keeps
  the file under 50 KB.
- Standard section headings ("Experience", "Education", "Skills"). Parsers
  match on these literal words.
- Skills as comma-separated prose, not chips or columns. This is the block ATS
  keyword matching actually reads.

USAGE
-----
    python3 -m venv .venv && .venv/bin/pip install reportlab pyyaml
    .venv/bin/python scripts/build-ats-cv.py

Writes `Zoltan-Dagi-CV-ATS.pdf` in the repository root. Verify with:

    pdftotext Zoltan-Dagi-CV-ATS.pdf - | less

If that output reads correctly, so will an ATS.
"""

import re
import sys
from pathlib import Path

import yaml
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer,
)

ROOT = Path(__file__).resolve().parent.parent
DICT = ROOT / "data" / "dict" / "en"
OUT = ROOT / "Zoltan-Dagi-CV-ATS.pdf"

MONTHS = ["January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"]


def load(name):
    with open(DICT / f"{name}.yaml", encoding="utf-8") as fh:
        return yaml.safe_load(fh)


def esc(text):
    """Escape for reportlab's mini-markup; collapse whitespace."""
    text = re.sub(r"\s+", " ", str(text)).strip()
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def strip_html(text):
    """The dictionaries carry <br/> and <strong> for the web; drop both."""
    text = re.sub(r"<br\s*/?>", " ", str(text))
    text = re.sub(r"<[^>]+>", "", text)
    return re.sub(r"\s+", " ", text).strip()


def month_year(value):
    """`2024-07` -> `July 2024`. Spelled out, which parsers handle best."""
    if not value:
        return ""
    year, month = str(value).split("-")
    return f"{MONTHS[int(month) - 1]} {year}"


def date_range(start, end, present="Present"):
    return f"{month_year(start)} - {month_year(end) if end else present}"


# --- styles ---------------------------------------------------------------
# Black on white, one family, no decoration. Everything here is chosen for the
# parser rather than the eye.

def styles():
    base = ParagraphStyle(
        "base", fontName="Helvetica", fontSize=9, leading=11.4,
        alignment=TA_LEFT, textColor="#000000",
    )
    return {
        "name": ParagraphStyle("name", parent=base, fontName="Helvetica-Bold",
                               fontSize=18, leading=22, spaceAfter=2),
        "title": ParagraphStyle("title", parent=base, fontSize=11.5, leading=14,
                                spaceAfter=4),
        "contact": ParagraphStyle("contact", parent=base, fontSize=9,
                                  leading=11.8),
        "h2": ParagraphStyle("h2", parent=base, fontName="Helvetica-Bold",
                             fontSize=10.5, leading=13, spaceBefore=8,
                             spaceAfter=2),
        "role": ParagraphStyle("role", parent=base, fontName="Helvetica-Bold",
                               fontSize=9.5, leading=12, spaceBefore=5),
        "meta": ParagraphStyle("meta", parent=base, fontSize=8.5, leading=11,
                               spaceAfter=1),
        "body": base,
        "bullet": ParagraphStyle("bullet", parent=base, leftIndent=9,
                                 firstLineIndent=-9, spaceAfter=1),
        "note": ParagraphStyle("note", parent=base, fontSize=8.5, leading=11.5,
                               spaceAfter=2),
    }


def heading(text, st):
    """A section heading plus a rule, kept with whatever follows it."""
    return [Paragraph(esc(text), st["h2"]),
            HRFlowable(width="100%", thickness=0.6, color="#000000",
                       spaceBefore=1, spaceAfter=4)]


def build():
    common, experience = load("common"), load("experience")
    skills, about, home = load("skills"), load("about"), load("home")
    contact, projects = load("contact"), load("projects")

    st = styles()
    story = []

    # --- header: identity and how to reach him ---------------------------
    ident, c = common["identity"], common["contact"]
    story.append(Paragraph(esc(ident["full_name"]), st["name"]))
    story.append(Paragraph(esc(common["identity"]["title"].title()), st["title"]))

    langs = ", ".join(f"{l['name']} ({l['level'].lower()})"
                      for l in about["languages"]["items"])
    licence = next((d["value"] for d in contact["details"]["items"]
                    if "licence" in d["label"].lower()
                    or "license" in d["label"].lower()), None)

    lines = [f"{c['email']} | {c['phone']}",
             esc(c["location"].replace(" — remote-first", "")) + " | Remote-first",
             f"Languages: {langs}"]
    if licence:
        lines.append(f"Driving licence: {licence}")
    for line in lines:
        story.append(Paragraph(esc(line), st["contact"]))

    # --- summary ----------------------------------------------------------
    story += heading("Summary", st)
    story.append(Paragraph(esc(strip_html(home["hero"]["description"])), st["body"]))

    # --- skills -----------------------------------------------------------
    # The block ATS keyword matching reads. Comma-separated prose on purpose:
    # chips, columns and tables all scramble under extraction.
    story += heading("Skills", st)
    for group in skills["groups"]:
        items = ", ".join(i if isinstance(i, str) else i["name"]
                          for i in group["items"])
        story.append(Paragraph(f"<b>{esc(group['name'])}:</b> {esc(items)}",
                               st["bullet"]))
    secondary = ", ".join(i["name"] for i in skills["secondary"]["items"])
    story.append(Paragraph(f"<b>Secondary:</b> {esc(secondary)}", st["bullet"]))

    # --- experience -------------------------------------------------------
    story += heading("Experience", st)
    roles = sorted(experience["roles"], key=lambda r: r["start"], reverse=True)
    for role in roles:
        block = [Paragraph(f"{esc(role['role'])}, {esc(role['company'])}", st["role"])]
        meta = [date_range(role.get("start"), role.get("end"))]
        if role.get("location"):
            meta.append(role["location"])
        if role.get("project"):
            meta.append(role["project"])
        block.append(Paragraph(esc(" | ".join(meta)), st["meta"]))
        for h in role.get("highlights", []):
            block.append(Paragraph(f"- {esc(h)}", st["bullet"]))
        story.append(KeepTogether(block))

    # --- self-directed projects ------------------------------------------
    # Named as personal work in the heading and the note, so neither a parser
    # nor a reader can file them as employment.
    story += heading("Self-Directed Projects", st)
    story.append(Paragraph(
        esc("Personal engineering projects, not client work and not shipped "
            "products. Source is private; access on request."), st["note"]))
    for p in sorted(projects["projects"], key=lambda p: p["start"], reverse=True):
        block = [Paragraph(f"{esc(p['name'])} - {esc(p['kind'])}", st["role"])]
        meta = [date_range(p.get("start"), p.get("end"), present="Ongoing"),
                p.get("language", "")]
        block.append(Paragraph(esc(" | ".join(x for x in meta if x)), st["meta"]))
        block.append(Paragraph(esc(p["summary"]), st["bullet"]))
        for h in p.get("highlights", [])[:2]:
            block.append(Paragraph(f"- {esc(h)}", st["bullet"]))
        tech = ", ".join(p.get("stack", []))
        if tech:
            block.append(Paragraph(f"- Technologies: {esc(tech)}", st["bullet"]))
        story.append(KeepTogether(block))

    # --- education --------------------------------------------------------
    story += heading("Education", st)
    for e in about["education"]["items"]:
        story.append(Paragraph(esc(e["subject"]), st["role"]))
        story.append(Paragraph(esc(f"{e['school']} | {e['range']}"), st["meta"]))

    doc = SimpleDocTemplate(
        str(OUT), pagesize=A4,
        leftMargin=18 * mm, rightMargin=18 * mm,
        topMargin=15 * mm, bottomMargin=15 * mm,
        title=f"{ident['full_name']} - {ident['title'].title()}",
        author=ident["full_name"],
        subject="Curriculum Vitae",
        keywords=", ".join(i if isinstance(i, str) else i["name"]
                           for g in skills["groups"] for i in g["items"]),
    )
    doc.build(story)
    return OUT


if __name__ == "__main__":
    out = build()
    print(f"wrote {out} ({out.stat().st_size / 1024:.1f} KB)")
