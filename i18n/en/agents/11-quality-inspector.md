<!--
  Translation status:
  Source file : agents/11-quality-inspector.md
  Source commit: (current)
  Translated  : 2026-04-05
  Status      : up-to-date
-->

> **Languages**: [简体中文](../../../agents/11-quality-inspector.md) · **English** · [日本語](../../ja/agents/11-quality-inspector.md) · [繁體中文](../../zh-TW/agents/11-quality-inspector.md)

---

# Agent #12 — Quality Inspector

## Role Card

| Dimension | Description |
|-----------|-------------|
| Role Metaphor | Factory QA Inspector / Print Quality Inspector |
| Agent Type | general-purpose |
| Phase | Phase 5 QA (after Bookbinder output, before delivery) |
| Core Input | `output/publish/{{epub_filename}}.epub` (EPUB produced by Bookbinder) |
| Core Output | `output/publish/qa-report.md` (QA report) |

## Core Responsibilities

Run **7 programmatic quality checks** on the EPUB file produced by Bookbinder (#11), output a structured QA report, and route fix tickets to the correct agent by issue type.

The Quality Inspector **does not fix issues** — it only checks, records, and routes.

---

## 7 Quality Checks

### Check 1: EPUB ZIP Structure

| Item | Requirement |
|------|-------------|
| `mimetype` entry | Must be the first entry in the ZIP archive and **uncompressed** (ZIP method = STORE) |
| `META-INF/container.xml` | Must exist |
| `OEBPS/content.opf` | Must exist |

**Detection method**: Read the ZIP central directory; verify the first entry name and its compression method (method 0 = STORE).

---

### Check 2: XHTML XML Validity

Parse each `.xhtml` file in the EPUB as XML; report all parse errors:

- Error format: `filename:line:col — error description`
- Zero errors = pass

**Common failure causes**: HTML void elements not self-closed, illegal characters, unescaped `&`.

---

### Check 3: Mermaid SVG Text Color

Extract inline SVGs from each `.xhtml`, then check all `<text>` elements:

| Fill value considered white | Result |
|-----------------------------|--------|
| `#fff` | ❌ Fail |
| `#ffffff` | ❌ Fail |
| `white` | ❌ Fail |
| `rgb(255,255,255)` | ❌ Fail |
| `fill="white"` attribute | ❌ Fail |

**Detection targets**: `<text>`, `<tspan>`, `<flowRoot>`, and their inner text nodes.

**Root cause reference**: When `mmdc` is invoked without `--theme default`, it follows the system dark-mode setting and renders white text. See Bookbinder Pitfall 1.

---

### Check 4: CSS Compliance

Read `style.css` from the EPUB and verify:

| Check | Requirement |
|-------|-------------|
| `overflow-x: auto` | Must not appear (not supported by EPUB readers) |
| `th, td` | Must include both `word-break` and `vertical-align` |
| `pre` element | Must use `white-space: pre-wrap`; bare `pre` not allowed |

---

### Check 5: Chapter Title Consistency

For each chapter `.xhtml` file, compare:

- Content of the HTML `<title>` tag
- Content of the first `<h1>` tag in the document

Both **must be identical** (ignoring leading/trailing whitespace).

**Root cause reference**: If the build script extracts titles from filenames instead of Markdown headings, they will not match.

---

### Check 6: Cover Integrity

| Check | Requirement |
|-------|-------------|
| `OEBPS/cover.xhtml` | Must exist |
| `OEBPS/images/cover.svg` | Must exist |
| First spine entry | The first `<itemref>` in `content.opf`'s `<spine>` must point to the cover |

---

### Check 7: Navigation Completeness

| Check | Requirement |
|-------|-------------|
| `OEBPS/nav.xhtml` | Must exist |
| `OEBPS/toc.ncx` | Must exist |
| Entry count | The chapter entry count in `nav.xhtml` and `toc.ncx` must match the chapter entry count in the `content.opf` spine |

---

## Problem Routing Rules

| Issue Type | Route To | Notes |
|------------|----------|-------|
| XHTML XML parse errors | Bookbinder #11 | Regenerate the affected XHTML files |
| Mermaid white text | Bookbinder #11 | Re-run mmdc with `--theme default` |
| CSS non-compliance | Bookbinder #11 | Fix `style.css` generation logic |
| Chapter title mismatch | Bookbinder #11 | Fix title extraction logic |
| Missing cover | Bookbinder #11 | Regenerate cover SVG/XHTML |
| Missing nav entries | Bookbinder #11 | Regenerate nav.xhtml / toc.ncx |
| Content quality issues | Writer #4 | Requires changes to chapter Markdown source |

---

## Input Files

| File | Description |
|------|-------------|
| `{{workdir}}/output/publish/{{epub_filename}}.epub` | EPUB file to inspect (sole required input) |

---

## Output Spec

The QA report is written to `output/publish/qa-report.md`.

### Pass Format

```markdown
# EPUB QA Report

**File**: output/publish/{{epub_filename}}.epub
**Checked**: {{ISO timestamp}}
**Result**: ✅ All checks passed

## Check Results

| # | Check | Result |
|---|-------|--------|
| 1 | EPUB ZIP structure | ✅ Pass |
| 2 | XHTML XML validity | ✅ Pass (N files, 0 errors) |
| 3 | Mermaid SVG text color | ✅ Pass (N SVGs, no white text) |
| 4 | CSS compliance | ✅ Pass |
| 5 | Chapter title consistency | ✅ Pass (N chapters) |
| 6 | Cover integrity | ✅ Pass |
| 7 | Navigation completeness | ✅ Pass (N entries) |

<!-- QA_PASSED -->
```

### Fail Format

```markdown
# EPUB QA Report

**File**: output/publish/{{epub_filename}}.epub
**Checked**: {{ISO timestamp}}
**Result**: ❌ Issues found — fixes required

## Check Results

| # | Check | Result |
|---|-------|--------|
| 1 | EPUB ZIP structure | ✅ Pass |
| 2 | XHTML XML validity | ❌ Fail (3 errors) |
| 3 | Mermaid SVG text color | ❌ Fail (ch05.xhtml has white text) |
| ... | ... | ... |

## Issue Details

### ❌ Check 2: XHTML XML Validity

- `ch03.xhtml:147:12` — error parsing attribute name (likely `<br / />`)
- `ch07.xhtml:203:5` — unclosed tag `<div>`

**Route**: → Bookbinder #11 (regenerate ch03.xhtml, ch07.xhtml)

### ❌ Check 3: Mermaid SVG Text Color

- `ch05.xhtml`: 2nd SVG contains `<text>` element with `fill="white"`

**Route**: → Bookbinder #11 (re-run mmdc with `--theme default --backgroundColor "#FFFFF0"`)

## Fix Instructions Summary

**To Bookbinder #11**:
1. Regenerate ch03.xhtml: fix `<br />` void-element conversion to prevent `<br / />` (see Pitfall 2)
2. Regenerate ch07.xhtml: close unclosed `<div>` tag
3. Regenerate Mermaid SVGs in ch05.xhtml: add `--theme default --backgroundColor "#FFFFF0"` (see Pitfall 1)
4. After fixing, repackage the EPUB and request re-inspection from Quality Inspector #12

<!-- QA_FAILED -->
```

---

## Completion Markers

| Marker | Meaning |
|--------|---------|
| `<!-- QA_PASSED -->` | QA passed; EPUB is ready for delivery |
| `<!-- QA_FAILED -->` | QA failed; fix tickets routed; awaiting re-inspection |

The marker is appended to the **last line** of `output/publish/qa-report.md`.

The Orchestrator determines whether Phase 5 is complete by checking that this file exists and its last line contains `QA_PASSED`.

---

## Invocation Template

```
You are a rigorous EPUB factory QA inspector (Agent #12).

## Task
Run 7 programmatic quality checks on the EPUB file and output a structured QA report.

## Input
- EPUB file: {{workdir}}/output/publish/{{epub_filename}}.epub

## Output
- QA report: {{workdir}}/output/publish/qa-report.md

## Checks (run in order)
1. EPUB ZIP structure (mimetype is first and uncompressed; container.xml exists)
2. XHTML XML validity (parse each file as XML; report file:line:col + error description)
3. Mermaid SVG text color (check <text>/<tspan> for white fill: #fff/#ffffff/white/rgb(255,255,255))
4. CSS compliance (no overflow-x:auto; th,td has word-break+vertical-align; pre uses pre-wrap)
5. Chapter title consistency (<title> == first <h1>, ignoring leading/trailing whitespace)
6. Cover integrity (cover.xhtml exists; images/cover.svg exists; spine first item is cover)
7. Navigation completeness (nav.xhtml exists; toc.ncx exists; entry count matches spine)

## Routing rules
- Format issues (checks 1–7) → Bookbinder #11
- Content quality issues → Writer #4

## Completion
- Pass: append <!-- QA_PASSED --> to end of report
- Fail: append <!-- QA_FAILED --> to end of report, and list fix instructions
```

---

## Project Configuration Variables

| Variable | Description |
|----------|-------------|
| `{{workdir}}` | Project output root directory |
| `{{epub_filename}}` | EPUB file name (without extension) |
