<!--
  Translation status:
  Source file : agents/10-bookbinder.md
  Source commit: b016f9b
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **Languages**: [简体中文](../../../agents/10-bookbinder.md) · **English** · [日本語](../../ja/agents/10-bookbinder.md) · [繁體中文](../../zh-TW/agents/10-bookbinder.md)

---

# Agent #11 — Bookbinder (Layout Designer)

## Role Card

| Dimension | Description |
|-----------|-------------|
| Role Metaphor | Layout Designer / E-book Craftsman |
| Agent Type | general-purpose |
| Participation Phase | Phase 5 (publishing and binding) |
| Core Input | `chapters/*.md` (all finalized chapters) |
| Core Output | `publish/*.html` (HTML e-book); `publish/book.epub` (EPUB e-book) |

## Core Responsibilities

1. **Markdown → HTML Conversion** — Convert finalized Markdown chapters into structured HTML pages
2. **ASCII Diagrams → SVG Conversion** — Automatically detect ASCII diagrams in text and convert them to clean SVG vector graphics
3. **Code Syntax Highlighting** — Automatically colorize code blocks by programming language
4. **Typography Design** — Apply eye-friendly color schemes, CJK typography optimization, and responsive layout
5. **Navigation System** — Generate sidebar table of contents, chapter navigation, and scroll progress bar
6. **EPUB Generation** — Package finalized Markdown chapters into a standard EPUB 3.x e-book file (`.epub`)

## Input Files

| File | Description |
|------|-------------|
| `{{工作目录}}/chapters/*.md` | All finalized Markdown chapter files |
| `{{工作目录}}/outline-final.md` | Finalized outline (used to generate the table of contents structure) |

## Output Specification

### publish/ Directory Structure

```
publish/
├── index.html          # Table of contents / home page
├── ch01.html           # Chapter 1
├── ch02.html           # Chapter 2
├── ...
├── chNN.html           # Chapter N
├── book.epub           # EPUB e-book (all chapters bundled)
└── assets/             # Static assets (if needed)
    ├── style.css        # Stylesheet (or inlined)
    └── script.js        # Interactive script (or inlined)
```

## Core Capabilities

### 1. ASCII Diagrams → SVG Auto-Conversion and Mermaid Rendering

**Mermaid First**: All ` ```mermaid ` code blocks in chapters are rendered directly into interactive vector graphics by the Bookbinder via Mermaid.js (CDN or local), with no additional SVG conversion.

**Convention**: Writing agents **must use Mermaid** for flow charts, architecture diagrams, hierarchy diagrams, and directory trees. Using ANSI box-drawing characters (`┌ ─ ┤ ├ └ │`) is prohibited.

The following {{SVG检测类型数}} **ASCII-compatible diagram** types are supported for detection and conversion (to handle legacy content):

| Type ID | Type Name | Detection Features | Conversion Result |
|---------|-----------|-------------------|-------------------|
| stacked | Stacked Block Diagram | Multiple `┌──┐` boxes stacked vertically | Colored cards stacked vertically |
| table | Table | Grid formed by `│` and `─` | Styled HTML table or SVG table |
| tree | Tree Diagram | `├──`, `└──` tree-style indentation | SVG tree structure |
| grouped-flow | Grouped Flow Chart | Arrow flow with group labels | Grouped SVG flow chart |
| mixed-flow | Mixed Flow Chart | Mix of boxes, arrows, and text | SVG flow chart |
| vflow | Vertical Flow Chart | Vertical flow connected by `↓` or `│` | Vertical SVG flow chart |
| numbered-list | Numbered List Diagram | Numbered step-by-step flow | SVG step diagram |
| flow | Horizontal Flow Chart | Horizontal flow connected by `→` or `──>` | Horizontal SVG flow chart |
| generic | Generic Diagram | Other ASCII graphics | Generic SVG conversion |

### 2. Code Syntax Highlighting

- Automatic colorization based on the language tag on the code block (e.g., \`\`\`typescript, \`\`\`python)
- Line number display support
- Code block title support (file paths)
- Color scheme coordinated with the overall eye-friendly theme

### 3. Eye-Friendly Color Scheme

| Element | Color | Description |
|---------|-------|-------------|
| Page background | `{{背景色}}` | Warm white — reduces blue-light strain |
| Body text | `{{正文色}}` | Soft dark — not pure black |
| Heading text | `{{标题色}}` | Slightly darker than body text |
| Code background | `{{代码背景色}}` | Subtle gray — distinguishes from body text |
| Links | `{{链接色}}` | Soft blue |
| Accent color | `{{强调色}}` | Used for important annotations |

### 4. CJK Typography Optimization

| Specification | Setting |
|---------------|---------|
| Heading font | Serif (e.g., Noto Serif SC / STSong / SimSun) |
| Body font | Sans-serif (e.g., Noto Sans SC / PingFang SC / Microsoft YaHei) |
| Line height | 1.8 ~ 2.0 (CJK text requires more generous line spacing) |
| Paragraph spacing | 1em |
| CJK–Latin spacing | Thin space automatically inserted |
| Punctuation compression | Consecutive punctuation marks compressed appropriately |

### 5. Navigation System

| Component | Function |
|-----------|----------|
| Sidebar table of contents | Full-book chapter list with clickable navigation and current-chapter highlighting |
| In-chapter navigation | Section list within the chapter with scroll-based highlighting |
| Previous/Next chapter navigation | Links to adjacent chapters at the bottom of the page |
| Scroll progress bar | Reading progress indicator at the top of the page |
| Back to top | A back-to-top button that appears after scrolling |

### 6. EPUB Generation Specification

Outputs a `.epub` file compliant with the **EPUB 3.x** standard (with EPUB 2 NCX backward compatibility).

#### EPUB Internal Structure

```
book.epub  (ZIP archive)
├── mimetype                      # Must be written first, uncompressed
├── META-INF/
│   └── container.xml             # Points to the OPF package document
└── OEBPS/
    ├── content.opf               # Package document (metadata + manifest + spine)
    ├── nav.xhtml                 # EPUB 3 navigation document (TOC)
    ├── toc.ncx                   # EPUB 2 compatibility TOC
    ├── style.css                 # Unified stylesheet
    ├── ch01.xhtml                # Chapter 1 (XHTML format)
    ├── ch02.xhtml                # Chapter 2
    ├── ...
    └── images/                   # Image/SVG assets (if any)
```

#### Mermaid Diagram Handling (EPUB-specific)

EPUB readers generally do not support JavaScript, so Mermaid diagrams **must be pre-rendered to SVG at build time**:

| Scenario | Handling |
|----------|----------|
| `mmdc` (Mermaid CLI) is installed | Call `mmdc -i input.mmd -o output.svg` to pre-render |
| `mmdc` is not installed | Preserve Mermaid code as `<pre class="mermaid-source">` with a fallback comment |

> Recommendation: Install `npm install -g @mermaid-js/mermaid-cli` before generating EPUB.

#### EPUB Build Method (Zero npm Dependencies)

- Node.js generates all XHTML chapter files plus OPF/NCX/NAV documents
- The system `zip` command packages the archive (built-in on macOS/Linux; use WSL or Git Bash on Windows):

  ```bash
  # Write mimetype first (uncompressed), then add remaining files
  zip -X book.epub mimetype
  zip -rg book.epub META-INF/ OEBPS/
  ```

- Final output: `output/publish/book.epub`

#### EPUB Metadata (content.opf)

| Field | Source |
|-------|--------|
| `dc:title` | `{{项目名称}}` |
| `dc:language` | `{{语言代码}}` (e.g., `en`, `zh-CN`) |
| `dc:identifier` | Auto-generated UUID |
| `dc:creator` | `{{作者名称}}` (optional) |
| `dc:date` | Automatically set at build time |

## SVG Color Palette

Used for card/node coloring when converting ASCII diagrams to SVG:

| Index | Name | Background | Border | Usage |
|-------|------|-----------|--------|-------|
| 1 | Soft Blue | `{{色板色1背景}}` | `{{色板色1边框}}` | Primary nodes |
| 2 | Mint Green | `{{色板色2背景}}` | `{{色板色2边框}}` | Secondary nodes |
| 3 | Warm Apricot | `{{色板色3背景}}` | `{{色板色3边框}}` | Emphasis nodes |
| 4 | Rose Pink | `{{色板色4背景}}` | `{{色板色4边框}}` | Warnings / cautions |
| 5 | Lavender | `{{色板色5背景}}` | `{{色板色5边框}}` | References / citations |
| 6 | Sky Cyan | `{{色板色6背景}}` | `{{色板色6边框}}` | Data / inputs |
| 7 | Pale Yellow | `{{色板色7背景}}` | `{{色板色7边框}}` | Outputs / results |
| 8 | Honey Orange | `{{色板色8背景}}` | `{{色板色8边框}}` | Special markers |

## Design Specifications

### Page Layout

```
┌──────────────────────────────────────────┐
│ 📖 {{项目名称}}              [进度条===] │
├──────────┬───────────────────────────────┤
│ TOC Nav  │ Content Area                  │
│          │                               │
│ Ch 1     │  # Chapter Title              │
│ Ch 2 ◄───│                               │
│   2.1    │  Body text...                 │
│   2.2    │                               │
│ Ch 3     │  ```code block```             │
│ ...      │                               │
│          │  [SVG diagram]                │
│          │                               │
│          │  ◄ Previous    Next ►         │
└──────────┴───────────────────────────────┘
```

### Build Tool Requirements

- **Zero npm dependencies**: Built with a pure Node.js script — no npm packages required
- **Single-file output**: Each chapter is a self-contained HTML file (CSS/JS inlined)
- **Build command**: `node build.js` (or a similar single-command build)

## Quality Standards

- [ ] All ` ```mermaid ` blocks have been correctly rendered via Mermaid.js
- [ ] All Markdown chapters have been correctly converted to HTML
- [ ] All ASCII diagrams have been converted to SVG (none missed)
- [ ] Code blocks are correctly highlighted
- [ ] Eye-friendly color scheme is correctly applied
- [ ] CJK typography conventions followed (serif headings + sans-serif body)
- [ ] Navigation system is fully functional
- [ ] Responsive layout (compatible with desktop and tablet)
- [ ] Build script has no npm dependencies
- [ ] (EPUB mode) `book.epub` generated and passes EPUB 3.x compliance check
- [ ] (EPUB mode) All chapters converted to valid XHTML
- [ ] (EPUB mode) `content.opf`, `nav.xhtml`, and `toc.ncx` correctly generated
- [ ] (EPUB mode) Mermaid diagrams pre-rendered to SVG or gracefully degraded to code blocks

## Completion Marker

```html
<!-- BOOKBINDING_COMPLETE -->
```

## Dispatch Template Summary

```
You are an E-book Craftsman with expertise in typography and layout design.

## Task
Convert all Markdown chapters into a beautiful e-book (HTML and/or EPUB, depending on user choice).

## Input
- Finalized chapters: {{工作目录}}/chapters/*.md
- Outline (table of contents structure): {{工作目录}}/outline-final.md

## Output
- HTML files (HTML mode): {{工作目录}}/publish/*.html
- EPUB file (EPUB mode): {{工作目录}}/publish/book.epub
- Build script: {{工作目录}}/build.js

## Requirements
0. Before starting, **ask the user two questions in sequence**:
   a) Output format: ① HTML (default) ② EPUB ③ Both
   b) Color scheme: ① Warm Paper (default) ② GitHub Light ③ Dark Mode ④ Minimal
   Configure OUTPUT_FORMAT and THEME variables in the build script accordingly.
1. Markdown → HTML/XHTML conversion
2. **Mermaid diagram rendering**:
   - HTML mode: ` ```mermaid ` blocks rendered as interactive charts via Mermaid.js (CDN)
   - EPUB mode: pre-render using mmdc; gracefully degrade to code blocks if mmdc is unavailable
3. ASCII diagrams → SVG auto-conversion (for legacy content; supports {{SVG检测类型数}} types)
4. Code syntax highlighting
5. Eye-friendly color scheme (warm white background, soft text)
6. CJK typography (serif headings, sans-serif body)
7. Navigation system (sidebar, chapter navigation, progress bar) — HTML mode
8. EPUB 3.x structure (OPF + NAV + NCX + XHTML chapters) — EPUB mode, packaged with system zip
9. Zero-npm-dependency Node.js build script
10. Add <!-- BOOKBINDING_COMPLETE --> upon completion
```

## Project Configuration Variables

| Variable | Description | Suggested Default |
|----------|-------------|-------------------|
| `{{项目名称}}` | Book title / project name (displayed in the navigation bar) | — |
| `{{背景色}}` | Page background color | `#FEFCF8` |
| `{{正文色}}` | Body text color | `#2C2C2C` |
| `{{标题色}}` | Heading text color | `#1A1A1A` |
| `{{代码背景色}}` | Code block background color | `#F5F2ED` |
| `{{链接色}}` | Link color | `#4A7C9B` |
| `{{强调色}}` | Accent marker color | `#C7553A` |
| `{{色板色1背景}}` ~ `{{色板色8背景}}` | SVG card background colors | 8-color soft palette |
| `{{色板色1边框}}` ~ `{{色板色8边框}}` | SVG card border colors | Corresponding deepened colors |
| `{{SVG检测类型数}}` | Number of supported ASCII diagram detection types | 8 |
| `{{工作目录}}` | Output artifacts root directory | — |
| `{{语言代码}}` | EPUB metadata language tag (`dc:language`) | `en` |
| `{{作者名称}}` | EPUB metadata author (`dc:creator`, optional) | — |
