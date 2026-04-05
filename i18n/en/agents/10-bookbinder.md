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
| Core Output | `publish/*.html` (HTML e-book); `publish/{{epub文件名}}.epub` (EPUB e-book) |

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
├── index.html                  # Table of contents / home page
├── ch01.html                   # Chapter 1
├── ch02.html                   # Chapter 2
├── ...
├── chNN.html                   # Chapter N
├── {{epub文件名}}.epub          # EPUB e-book (cover + all chapters)
└── assets/                     # Static assets (if needed)
    ├── style.css                # Stylesheet (or inlined)
    └── script.js                # Interactive script (or inlined)
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

**EPUB mode** (requires Puppeteer, bundled with mmdc):

- At build time, one Chromium session loads highlight.js (atom-one-dark theme via CDN) and batch-renders all code blocks
- Extracts `getComputedStyle` result for each token and writes it as an **inline `style="color:rgb(…)"`** attribute — no external stylesheet dependency
- All blocks in the book share **one** Chrome process (startup cost amortised)
- Text remains selectable, copyable, and searchable — essential for technical book readers
- Gracefully degrades to plain `<pre><code>` if mmdc is not installed or CDN is unreachable

**HTML mode**: Dynamically highlighted by Mermaid.js CDN — no Puppeteer needed.

| Mode | Tool | Output | Text selectable |
|------|------|--------|----------------|
| EPUB default | Puppeteer + highlight.js | Inline-styled HTML | ✅ |
| EPUB optional | Puppeteer + Chrome screenshot | PNG (carbon-style) | ❌ |
| No Puppeteer | — | Plain `<pre><code>` (no colour) | ✅ |

> To enable PNG mode, set `RENDER_CODE_AS_PNG = true` in `build-epub.js`.

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
{{epub文件名}}.epub  (ZIP archive)
├── mimetype                      # Must be written first, uncompressed
├── META-INF/
│   └── container.xml             # Points to the OPF package document
└── OEBPS/
    ├── content.opf               # Package document (metadata + manifest + spine)
    ├── nav.xhtml                 # EPUB 3 navigation document (TOC)
    ├── toc.ncx                   # EPUB 2 compatibility TOC
    ├── cover.xhtml               # Cover page (first item in spine)
    ├── style.css                 # Unified stylesheet
    ├── ch01.xhtml                # Chapter 1 (XHTML format)
    ├── ch02.xhtml                # Chapter 2
    ├── ...
    └── images/
        └── cover.svg             # Auto-generated SVG cover image
```

#### Mermaid Diagram Handling (EPUB-specific)

EPUB readers generally do not support JavaScript, so Mermaid diagrams **must be pre-rendered to PNG at build time**:

| Scenario | Handling |
|----------|----------|
| `mmdc` (Mermaid CLI) is installed | Output `.png` (not `.svg`) — Chromium rasterises with correct CSS, zero post-processing needed (see Pitfall 1) |
| `mmdc` is not installed | Preserve Mermaid code as `<pre class="mermaid-source">` with a fallback comment |

> Recommendation: Install `npm install -g @mermaid-js/mermaid-cli` before generating EPUB.

> ⚠️ **Why PNG instead of SVG**: Mermaid renders node/edge labels as HTML inside SVG `<foreignObject>`. Every EPUB reader handles `<foreignObject>` CSS differently — some ignore SVG `<style>` rules, others apply their own overrides, producing unpredictable text colours. PNG is rasterised by Chromium before reaching the reader, so what you see during the build is exactly what the reader displays. See Pitfall 1.

## ⚠️ EPUB Build Pitfalls

These are real bugs caught in practice. **The build script must avoid them**:

### Pitfall 1: Mermaid Text Invisible or Low-Contrast

**Root cause**: Mermaid renders node/edge labels as HTML (`<div>/<span>/<p>`) inside SVG `<foreignObject>`. Every EPUB reader handles CSS inside `<foreignObject>` differently — some ignore SVG `<style>` block selectors entirely, others apply their own overrides, and dark-mode readers may turn text white. This is reader behaviour variance; no Mermaid theme or themeVariables setting can fix it at the SVG level.

**Fix**: Output **PNG** instead of SVG. Passing `-o diagram.png` to mmdc triggers Chromium rasterisation — CSS is applied correctly at render time, and the result is a flat image the EPUB reader displays as-is.

```js
// ✓ Correct: PNG output — Chromium rasterises with full CSS fidelity
execSync(
  `mmdc -i "${inFile}" -o "${outFile}.png" -c "${cfgFile}"` +
  ` --backgroundColor "${THEME.pageBg}" --scale 2 --quiet`
);
// Save to EPUB images/ directory, embed as <img>
fs.copyFileSync(`${outFile}.png`, path.join(IMAGES, imgName));
result.push(`<div class="diagram"><img src="images/${imgName}" alt="Diagram" /></div>`);

// ✗ Wrong: SVG output — reader's handling of <foreignObject> HTML CSS is unpredictable
execSync(`mmdc -i "${inFile}" -o "${outFile}.svg" ...`);
result.push(`<div class="diagram">${svgContent}</div>`);
```

Still use `theme: 'base'` + full `themeVariables` to control shape fill/border colours (guards against headless Chrome dark-mode overriding `themeVariables` in `theme:'default'`):
```js
fs.writeFileSync(cfgFile, JSON.stringify({
  theme: 'base',
  themeVariables: {
    background:           THEME.pageBg,
    primaryColor:         '#C8E6FA',   primaryTextColor:   '#111111',
    primaryBorderColor:   '#2B7BC2',
    secondaryColor:       '#D4EDDA',   secondaryTextColor: '#111111',
    tertiaryColor:        '#FFF3CD',   tertiaryTextColor:  '#111111',
    lineColor:            '#444444',
    actorBkg:             '#C8E6FA',   actorTextColor:     '#111111',
    edgeLabelBackground:  THEME.pageBg,
    clusterBkg:           THEME.pageBg,
    titleColor:           THEME.textColor,
    fontSize:             '16px',
  },
}), 'utf8');
```

### Pitfall 2: `<br />` in SVG Corrupted to `<br / />` (Invalid XML)

- **Symptom**: EPUB readers report XML parse error "error parsing attribute name"
- **Root cause**: The void-element self-closing regex `(\s[^>]*)` greedily captures the trailing ` /` in `<br />` as part of attrs, then appends ` />`, producing `<br / />` (invalid XML). Mermaid SVGs contain `<br />` inside `<foreignObject>`, so they are affected.
- **Fix**: Change the pattern end to `\/?>` and strip trailing slash from attrs with `.replace(/\s*\/$/, '')`

```js
// ✗ Wrong: <br /> becomes <br / />
.replace(/<(br|hr|img|...)(\s[^>]*)?\s*(?!\/)>/gi,
  (_, tag, attrs) => `<${tag}${attrs || ''} />`)

// ✓ Correct: strip trailing slash prevents double-slash
.replace(/<(br|hr|img|...)(\s[^>]*)?\s*\/?>/gi,
  (_, tag, attrs) => `<${tag}${(attrs || '').replace(/\s*\/$/, '')} />`)
```

### Pitfall 3: `overflow-x: auto` Not Supported in EPUB

- **Symptom**: Table and diagram content overflows the page without a scrollbar
- **Root cause**: EPUB readers (Apple Books, Kindle, etc.) do not support `overflow-x`
- **Fix**: Use `word-break: break-word; overflow-wrap: break-word` on table cells; use `white-space: pre-wrap; word-break: break-all` on `pre`; remove all `overflow-x: auto`

### Pitfall 4: Missing `vertical-align: top` on Table Cells

- **Symptom**: Multi-line cell content is vertically centered, causing layout issues
- **Fix**: Always set `vertical-align: top` on `th` and `td`

```css
/* ✓ Recommended EPUB table CSS */
table { border-collapse: collapse; width: 100%; font-size: 0.88em; table-layout: auto; }
th, td { border: 1px solid #D8D2C8; padding: 0.5em 0.8em;
         word-break: break-word; overflow-wrap: break-word; vertical-align: top; }
th { background-color: #F5F2ED; font-weight: bold; }
td code { word-break: break-all; }
pre { white-space: pre-wrap; word-break: break-all; }
```

### Pitfall 5: Code Syntax Highlighting Colours Lost in EPUB

- **Symptom**: Class-based highlighting (e.g., `.hljs-keyword { color: purple; }`) has no effect in some EPUB readers — all code appears as unstyled text
- **Root cause**: EPUB readers have inconsistent support for external stylesheets; class-based syntax highlighting depends entirely on a stylesheet that may be ignored
- **Fix**: Run highlight.js inside Chromium via Puppeteer, call `getComputedStyle` to extract resolved colours, and write them as **inline `style="color:rgb(…)"` attributes** on every token `<span>` — inline styles are always applied, regardless of the reader's stylesheet handling

```js
// ✓ Correct: inline styles — the reader cannot ignore them
hljs.highlightElement(el);
el.querySelectorAll('[class]').forEach(span => {
  const cs = window.getComputedStyle(span);
  let s = '';
  if (cs.color)                         s += 'color:' + cs.color + ';';
  if (cs.fontStyle !== 'normal')        s += 'font-style:' + cs.fontStyle + ';';
  if (cs.fontWeight !== '400')          s += 'font-weight:' + cs.fontWeight + ';';
  if (s) span.setAttribute('style', s);
  span.removeAttribute('class');   // remove class — rely on inline style only
});

// ✗ Wrong: class-based, depends on external .hljs-keyword { } stylesheet
// Colours may disappear entirely in Apple Books, Kindle, etc.
```

> 💡 Why PNG mode (`RENDER_CODE_AS_PNG=true`) is not recommended for technical books: code in a PNG is **not copyable and not searchable**.



- Node.js generates all XHTML chapter files plus OPF/NCX/NAV documents
- The system `zip` command packages the archive (built-in on macOS/Linux; use WSL or Git Bash on Windows):

  ```bash
  # Write mimetype first (uncompressed), then add remaining files
  zip -X {{epub文件名}}.epub mimetype
  zip -rg {{epub文件名}}.epub META-INF/ OEBPS/
  ```

- Final output: `output/publish/{{epub文件名}}.epub`

#### EPUB Chapter Title Specification

| Location | Requirement |
|----------|-------------|
| Each chapter `<title>` | Extract the **first `#` heading** from the Markdown file and use it as the XHTML `<title>` tag content |
| `nav.xhtml` TOC entries | Use the extracted chapter title, not the filename (`ch01`, `ch02`…) |
| `toc.ncx` navPoints | Fill each `<navLabel><text>` with the real chapter title |
| `content.opf` manifest | `<item>` `id` attributes may use filenames, but spine order must match the outline |

> The build script should extract the title from each Markdown file using `/^#\s+(.+)/m`; if no `#` heading is found, fall back to the corresponding chapter title in `outline.md`.

#### EPUB Cover Specification

The cover is **auto-generated** by the build script — no external image asset required:

| Element | Specification |
|---------|--------------|
| Format | SVG (1400×2100 px, standard 2:3 book ratio) |
| File path | `OEBPS/images/cover.svg` |
| Cover page | `OEBPS/cover.xhtml` (first item in spine) |
| OPF declaration | `<meta name="cover" content="cover-image"/>` (EPUB 2) + `properties="cover-image"` (EPUB 3) |
| Content elements | Book title (`{{项目名称}}`), author (`{{作者名称}}` if set), decorative background, current color theme |
| Typography | Serif font for title, sans-serif for author name |

**Cover SVG template structure (pseudocode):**

```xml
<svg width="1400" height="2100" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1400" height="2100" fill="{{背景色}}"/>
  <!-- Decorative band (theme accent color) -->
  <rect y="0" width="1400" height="420" fill="{{强调色}}" opacity="0.85"/>
  <!-- Book title -->
  <text x="700" y="280" text-anchor="middle" font-size="80"
        font-family="serif" fill="white">{{项目名称}}</text>
  <!-- Author (optional) -->
  <text x="700" y="1980" text-anchor="middle" font-size="48"
        font-family="sans-serif" fill="{{正文色}}">{{作者名称}}</text>
</svg>
```

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

| Tool | Required | Install | Purpose |
|------|----------|---------|---------|
| Node.js ≥ 18 | ✅ Required | System install | Core build engine; no npm packages needed |
| `zip` | ✅ Required | Built-in on macOS/Linux; WSL on Windows | EPUB packaging |
| `mmdc` (Mermaid CLI) | ⚪ Optional | `npm install -g @mermaid-js/mermaid-cli` | Mermaid diagrams → PNG |
| Puppeteer | ⚪ Optional | Auto-detected from mmdc's node_modules | Code block syntax highlighting |
| highlight.js | ⚪ Optional | CDN auto-loaded (requires network) | Highlighting engine; extracts inline styles |

> **Progressive enhancement**: Without any optional tools, the EPUB is generated correctly — Mermaid blocks are preserved as code and code blocks have no colour.

## Quality Standards

- [ ] All ` ```mermaid ` blocks have been correctly rendered via Mermaid.js
- [ ] All Markdown chapters have been correctly converted to HTML
- [ ] All ASCII diagrams have been converted to SVG (none missed)
- [ ] Code blocks are correctly highlighted (EPUB mode: inline-styled HTML — colours independent of external CSS)
- [ ] Eye-friendly color scheme is correctly applied
- [ ] CJK typography conventions followed (serif headings + sans-serif body)
- [ ] Navigation system is fully functional
- [ ] Responsive layout (compatible with desktop and tablet)
- [ ] Build script core has no npm dependencies (Node.js + system zip is sufficient)
- [ ] (EPUB mode) `{{epub文件名}}.epub` generated and passes EPUB 3.x compliance check
- [ ] (EPUB mode) All chapters converted to valid XHTML
- [ ] (EPUB mode) `content.opf`, `nav.xhtml`, and `toc.ncx` correctly generated
- [ ] (EPUB mode) Each chapter XHTML `<title>` and nav/ncx entries use the real chapter title (not the filename)
- [ ] (EPUB mode) Cover SVG (`cover.svg`) generated; `cover.xhtml` is the first item in the spine
- [ ] (EPUB mode) Mermaid diagrams pre-rendered to **PNG** (`-o diagram.png`) and embedded as `<img>`, or gracefully degraded to code blocks
- [ ] (EPUB mode) Code blocks batch-rendered via Puppeteer + highlight.js to inline-styled HTML, or gracefully degraded to plain `<pre><code>`

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
- EPUB file (EPUB mode): {{工作目录}}/publish/{{epub文件名}}.epub
- Build script: {{工作目录}}/build.js

## Requirements
0. Before starting, **ask the user two questions in sequence**:
   a) Output format: ① HTML (default) ② EPUB ③ Both
   b) Color scheme: ① Warm Paper (default) ② GitHub Light ③ Dark Mode ④ Minimal
   Configure OUTPUT_FORMAT and THEME variables in the build script accordingly.
1. Markdown → HTML/XHTML conversion
2. **Mermaid diagram rendering**:
   - HTML mode: ` ```mermaid ` blocks rendered as interactive charts via Mermaid.js (CDN)
   - EPUB mode: output **PNG** (`-o diagram.png`) — Chromium rasterises with full CSS fidelity so colours are reader-independent (see Pitfall 1); gracefully degrade to code blocks if mmdc is unavailable
3. ASCII diagrams → SVG auto-conversion (for legacy content; supports {{SVG检测类型数}} types)
4. **Code syntax highlighting** (EPUB mode):
   - Batch-renders via Puppeteer (bundled with mmdc) + highlight.js (CDN), extracts inline `style="color:rgb(…)"` per token
   - **Text remains selectable, copyable, and searchable** — essential for technical books (see Pitfall 5)
   - All blocks share one Chrome session (startup cost amortised)
   - Gracefully degrades to plain `<pre><code>` if mmdc is unavailable or CDN is unreachable
5. Eye-friendly color scheme (warm white background, soft text)
6. CJK typography (serif headings, sans-serif body)
7. Navigation system (sidebar, chapter navigation, progress bar) — HTML mode
8. EPUB 3.x structure (OPF + NAV + NCX + XHTML chapters) — EPUB mode, packaged with system zip
9. EPUB CSS: `th,td` must have `word-break:break-word; vertical-align:top`; no `overflow-x:auto`; `pre` uses `white-space:pre-wrap`
10. HTML→XHTML void elements: regex must correctly handle `<br />`; use `.replace(/\s*\/$/, '')` on captured attrs to prevent `<br / />` (invalid XML)
11. Zero-npm-dependency Node.js build script
12. Add <!-- BOOKBINDING_COMPLETE --> upon completion
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
| `{{epub文件名}}` | EPUB output filename (without extension); auto-derived from book title by default | Book title with special characters removed |
