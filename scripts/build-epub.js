'use strict';
// ═══════════════════════════════════════════════════════════════════
//  Scriptorium — EPUB E-Book Build Script Template
//
//  Converts Markdown chapter files into a standard EPUB 3.x e-book.
//
//  Usage:
//    1. Copy this file to your book project root as build-epub.js
//       (or run directly with: node scripts/build-epub.js)
//    2. Fill in the CONFIG section (Book Info + Chapter List + Theme)
//    3. Run from project root: node build-epub.js
//
//  Requirements:
//    - Node.js >= 18.0.0  (no npm packages required)
//    - System `zip` command  (macOS/Linux built-in;
//      Windows: use WSL or Git Bash)
//
//  For Mermaid diagrams in EPUB:
//    Install mermaid-cli globally for pre-rendering:
//    npm install -g @mermaid-js/mermaid-cli
//    Without it, Mermaid blocks are preserved as <pre> with a note.
//
//  Input:  output/chapters/final/chXX-final.md
//  Output: output/publish/{{书名}}.epub
// ═══════════════════════════════════════════════════════════════════

const fs     = require('fs');
const path   = require('path');
const os     = require('os');
const crypto = require('crypto');
const { execSync, spawnSync } = require('child_process');

// ─── Mermaid pre-rendering helpers ───────────────────────────────────────────

// Mermaid v11+ added reserved keywords to sequenceDiagram syntax.
// If a participant ID collides with a keyword, rename it (e.g. create → p_create).
const MERMAID_SEQ_RESERVED = new Set([
  'create', 'destroy', 'box', 'end', 'note', 'over', 'right', 'left',
  'activate', 'deactivate', 'loop', 'alt', 'else', 'opt', 'break',
  'critical', 'option', 'par', 'and', 'rect', 'autonumber', 'title',
  'link', 'links',
]);

function replaceOutsideQuotes(text, word, replacement) {
  const parts = text.split(/"([^"]*)"/g);
  return parts.map((part, i) =>
    i % 2 === 0
      ? part.replace(new RegExp(`\\b${word}\\b`, 'g'), replacement)
      : `"${part}"`
  ).join('');
}

function sanitizeSequenceDiagram(src) {
  if (!/^\s*sequenceDiagram/m.test(src)) return src;
  const toRename = new Map();
  src.replace(/^\s*participant\s+(\w+)\b/gm, (_, id) => {
    if (MERMAID_SEQ_RESERVED.has(id.toLowerCase())) toRename.set(id, `p_${id}`);
  });
  if (toRename.size === 0) return src;
  let result = src;
  for (const [orig, repl] of toRename) result = replaceOutsideQuotes(result, orig, repl);
  return result;
}

// Resolve mmdc path once at startup (null if not installed)
const MMDC_PATH = (() => {
  try { return execSync('which mmdc', { stdio: 'pipe' }).toString().trim(); } catch { return null; }
})();

function renderMermaidToSvg(src) {
  const sanitized = sanitizeSequenceDiagram(src);
  if (!MMDC_PATH) return null;
  try {
    const tmpDir  = fs.mkdtempSync(path.join(os.tmpdir(), 'mmd-'));
    const inFile  = path.join(tmpDir, 'diagram.mmd');
    const outFile = path.join(tmpDir, 'diagram.svg');
    fs.writeFileSync(inFile, sanitized, 'utf8');
    execSync(`"${MMDC_PATH}" -i "${inFile}" -o "${outFile}" --backgroundColor transparent --quiet`, {
      stdio: 'pipe', timeout: 30000,
    });
    const svgRaw = fs.readFileSync(outFile, 'utf8');
    fs.rmSync(tmpDir, { recursive: true });
    const m = svgRaw.match(/<svg[\s\S]*<\/svg>/i);
    return m ? m[0] : null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────
//  1. BOOK INFO  — fill in before running
// ─────────────────────────────────────────────
const BOOK_TITLE    = '{{书名}}';       // e.g. 'Angular 源码深度解析'
const BOOK_SUBTITLE = '{{副标题}}';     // shown on cover (optional, set '' to hide)
const BOOK_AUTHOR   = '{{作者名称}}';   // e.g. 'Scriptorium'
const BOOK_LANG     = '{{语言代码}}';   // e.g. 'zh-CN', 'en', 'ja'

// EPUB filename (without .epub). Defaults to book title with spaces → hyphens.
// Override if the title contains characters unsafe for filenames.
const EPUB_SLUG = BOOK_TITLE.replace(/[\s\/\\:*?"<>|]+/g, '-').replace(/-+/g, '-');

// ─────────────────────────────────────────────
//  2. CHAPTER LIST  — one entry per chapter
//     title: used in TOC, cover, and each chapter <title>
//     file:  filename inside output/chapters/final/
// ─────────────────────────────────────────────
const CHAPTERS = [
  { file: 'ch01-final.md', title: '第1章：{{标题}}' },
  { file: 'ch02-final.md', title: '第2章：{{标题}}' },
  // { file: 'ch03-final.md', title: '第3章：{{标题}}' },
  // ... add/remove rows to match your outline
];

// ─────────────────────────────────────────────
//  3. COLOR THEME
//  Uncomment one preset, or define your own.
// ─────────────────────────────────────────────

// ── Warm Paper (default) ─────────────────────
const THEME = {
  pageBg:      '#FEFCF8',
  textColor:   '#2C2C2C',
  headingColor:'#1A1A1A',
  codeBg:      '#F5F2ED',
  linkColor:   '#4A7C9B',
  accentColor: '#C7553A',
};

// ── GitHub Light ─────────────────────────────
// const THEME = {
//   pageBg: '#FFFFFF',      textColor: '#1F2328',  headingColor: '#1F2328',
//   codeBg: '#F6F8FA',      linkColor: '#0969DA',  accentColor: '#0550AE',
// };

// ── Dark Mode ────────────────────────────────
// const THEME = {
//   pageBg: '#1E1E2E',      textColor: '#CDD6F4',  headingColor: '#FFFFFF',
//   codeBg: '#313244',      linkColor: '#89B4FA',  accentColor: '#89DCEB',
// };

// ── Minimal ──────────────────────────────────
// const THEME = {
//   pageBg: '#FFFFFF',      textColor: '#333333',  headingColor: '#111111',
//   codeBg: '#F7F7F7',      linkColor: '#333333',  accentColor: '#000000',
// };

// ── Meridian Orange ──────────────────────────
// const THEME = {
//   pageBg: '#FEFAF5',      textColor: '#1C1917',  headingColor: '#1C1917',
//   codeBg: '#FFF7ED',      linkColor: '#C2410C',  accentColor: '#F97316',
// };

// ─────────────────────────────────────────────
//  4. PATHS  — usually no need to change
// ─────────────────────────────────────────────
const ROOT         = process.cwd();
const CHAPTERS_DIR = path.join(ROOT, 'output', 'chapters', 'final');
const OUTPUT_DIR   = path.join(ROOT, 'output', 'publish');

// ═══════════════════════════════════════════════════════════════════
//  INTERNALS — no changes needed below this line
// ═══════════════════════════════════════════════════════════════════

const BOOK_UUID = 'urn:uuid:' + crypto.randomUUID();
const BUILD_DIR = path.join(OUTPUT_DIR, '.epub-build-tmp');
const OEBPS     = path.join(BUILD_DIR, 'OEBPS');
const META_INF  = path.join(BUILD_DIR, 'META-INF');
const IMAGES    = path.join(OEBPS, 'images');
const EPUB_OUT  = path.join(OUTPUT_DIR, `${EPUB_SLUG}.epub`);

// ── Markdown → XHTML converter (zero-dependency) ─────────────────
function mdToXhtml(md) {
  const lines = md.split('\n');
  const out   = [];
  let i = 0;

  // Protect fenced code blocks early
  const codeBlocks = [];
  const protected_ = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push({ lang: lang.trim(), code });
    return `\x00CODE${idx}\x00`;
  });

  // Now work line by line on the protected string
  const pLines = protected_.split('\n');
  const result = [];
  let pi = 0;

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function inline(s) {
    return s
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,         '<em>$1</em>')
      .replace(/`([^`]+)`/g,         (_, c) => `<code>${esc(c)}</code>`)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />')
      .replace(/~~(.+?)~~/g,         '<del>$1</del>');
  }

  function processTable(rows) {
    // rows[0] = header, rows[1] = separator, rows[2+] = data
    if (rows.length < 2) return rows.map(r => `<p>${inline(r)}</p>`).join('\n');
    const header = rows[0].split('|').filter((_, i, a) => i > 0 && i < a.length - 1)
      .map(h => `<th>${inline(h.trim())}</th>`).join('');
    const body = rows.slice(2).map(r => {
      const cells = r.split('|').filter((_, i, a) => i > 0 && i < a.length - 1)
        .map(c => `<td>${inline(c.trim())}</td>`).join('');
      return `\n<tr>${cells}</tr>`;
    }).join('');
    return `<table>\n<thead>\n<tr>${header}</tr>\n</thead>\n<tbody>${body}\n</tbody>\n</table>`;
  }

  while (pi < pLines.length) {
    const line = pLines[pi];

    // Code block placeholder
    const codeMatch = line.match(/^\x00CODE(\d+)\x00$/);
    if (codeMatch) {
      const { lang, code } = codeBlocks[+codeMatch[1]];
      if (lang === 'mermaid') {
        const svg = renderMermaidToSvg(code);
        if (svg) {
          result.push(`<div class="diagram">${svg}</div>`);
        } else {
          result.push(
            `<div class="mermaid-note">`,
            MMDC_PATH
              ? `<p><em>[Diagram could not be rendered]</em></p>`
              : `<p><em>[Install mmdc for diagrams: npm install -g @mermaid-js/mermaid-cli]</em></p>`,
            `<pre class="mermaid-source"><code>${esc(code.trimEnd())}</code></pre>`,
            `</div>`
          );
        }
      } else {
        const cls = lang ? ` class="language-${lang}"` : '';
        result.push(`<pre><code${cls}>${esc(code.trimEnd())}</code></pre>`);
      }
      pi++;
      continue;
    }

    // Heading
    const hMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (hMatch) {
      const level = hMatch[1].length;
      const text  = inline(hMatch[2]);
      const id    = 'h-' + hMatch[2].toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5\s-]/g, '').replace(/\s+/g, '-');
      result.push(`<h${level} id="${id}">${text}</h${level}>`);
      pi++; continue;
    }

    // Horizontal rule
    if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line)) {
      result.push('<hr />'); pi++; continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const bqLines = [];
      while (pi < pLines.length && pLines[pi].startsWith('> ')) {
        bqLines.push(pLines[pi].slice(2));
        pi++;
      }
      result.push(`<blockquote><p>${inline(bqLines.join(' '))}</p></blockquote>`);
      continue;
    }

    // Unordered list
    if (/^[-*+]\s/.test(line)) {
      const items = [];
      while (pi < pLines.length && /^[-*+]\s/.test(pLines[pi])) {
        items.push(`<li>${inline(pLines[pi].replace(/^[-*+]\s/, '').trim())}</li>`);
        pi++;
      }
      result.push(`<ul>\n${items.join('\n')}\n</ul>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (pi < pLines.length && /^\d+\.\s/.test(pLines[pi])) {
        items.push(`<li>${inline(pLines[pi].replace(/^\d+\.\s/, '').trim())}</li>`);
        pi++;
      }
      result.push(`<ol>\n${items.join('\n')}\n</ol>`);
      continue;
    }

    // Table (detect by | at start/end or multiple |)
    if (line.includes('|') && /^\|/.test(line)) {
      const tableRows = [];
      while (pi < pLines.length && pLines[pi].includes('|') && /^\|/.test(pLines[pi])) {
        tableRows.push(pLines[pi]);
        pi++;
      }
      result.push(processTable(tableRows));
      continue;
    }

    // Empty line
    if (line.trim() === '') { result.push(''); pi++; continue; }

    // Paragraph
    const paraLines = [];
    while (pi < pLines.length && pLines[pi].trim() !== '' &&
           !/^(#{1,6}\s|>\s|[-*+]\s|\d+\.\s|\||\x00CODE)/.test(pLines[pi]) &&
           !/^(\*{3,}|-{3,}|_{3,})\s*$/.test(pLines[pi])) {
      paraLines.push(pLines[pi]);
      pi++;
    }
    if (paraLines.length) {
      result.push(`<p>${inline(paraLines.join(' '))}</p>`);
    }
  }

  return result.filter(l => l !== undefined).join('\n');
}

// ── Auto-extract title from first # heading ───────────────────────
function extractMdTitle(md) {
  const m = md.match(/^#\s+(.+)/m);
  return m ? m[1].trim() : null;
}

// ── EPUB CSS ──────────────────────────────────────────────────────
function buildCss() {
  const t = THEME;
  return `
body {
  background: ${t.pageBg};
  color: ${t.textColor};
  font-family: "Noto Sans SC","PingFang SC","Microsoft YaHei","Helvetica Neue",Arial,sans-serif;
  font-size: 1em;
  line-height: 1.85;
  margin: 1.5em 1.8em;
}
h1,h2,h3,h4 {
  font-family: "Noto Serif SC","STSong","SimSun",Georgia,serif;
  color: ${t.headingColor};
  margin: 1.2em 0 0.5em;
  line-height: 1.4;
}
h1 { font-size: 1.7em; border-bottom: 2px solid ${t.accentColor}; padding-bottom: 0.3em; }
h2 { font-size: 1.3em; }
h3 { font-size: 1.1em; }
p  { margin: 0.8em 0; }
a  { color: ${t.linkColor}; text-decoration: none; }
pre,code {
  font-family: "Source Code Pro","Courier New",monospace;
  font-size: 0.88em;
  background: ${t.codeBg};
  border-radius: 4px;
}
pre  { padding: 1em; margin: 1em 0; white-space: pre-wrap; word-break: break-all; }
code { padding: 0.1em 0.3em; }
pre code { padding: 0; background: none; }
table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 0.88em; table-layout: auto; }
th,td { border: 1px solid #D8D2C8; padding: 0.5em 0.8em; text-align: left;
        word-break: break-word; overflow-wrap: break-word; vertical-align: top; }
th    { background-color: ${t.codeBg}; font-weight: bold; }
td code { word-break: break-all; }
blockquote {
  border-left: 4px solid ${t.accentColor};
  margin: 1em 0; padding: 0.5em 1em;
  background: ${t.codeBg}; font-style: italic;
}
hr { border: none; border-top: 1px solid #D8D2C8; margin: 1.5em 0; }
.mermaid-source { border-left: 4px solid #D8D2C8; opacity: 0.7; }
.diagram { margin: 1.2em 0; text-align: center; }
.diagram svg { max-width: 100%; height: auto; }
`.trim();
}

// ── Cover SVG ─────────────────────────────────────────────────────
function buildCoverSvg() {
  const t = THEME;
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const titleLines = BOOK_TITLE.length > 12
    ? [BOOK_TITLE.slice(0, Math.ceil(BOOK_TITLE.length/2)),
       BOOK_TITLE.slice(Math.ceil(BOOK_TITLE.length/2))]
    : [BOOK_TITLE];
  const subtitleBlock = BOOK_SUBTITLE
    ? `<text x="700" y="${titleLines.length > 1 ? 560 : 480}" text-anchor="middle"
        font-family="'Noto Sans SC',sans-serif" font-size="38"
        fill="rgba(255,255,255,0.85)" letter-spacing="4">${esc(BOOK_SUBTITLE)}</text>`
    : '';
  const authorBlock = BOOK_AUTHOR
    ? `<text x="700" y="2020" text-anchor="middle"
        font-family="'Noto Sans SC',sans-serif" font-size="44"
        fill="white" letter-spacing="2">${esc(BOOK_AUTHOR)}</text>`
    : '';
  const titleSvg = titleLines.map((line, i) =>
    `<text x="700" y="${260 + i * 200}" text-anchor="middle"
        font-family="'Noto Serif SC','STSong','SimSun',serif"
        font-size="${titleLines.length > 1 ? 100 : 120}" font-weight="bold"
        fill="white" letter-spacing="8">${esc(line)}</text>`
  ).join('\n  ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1400" height="2100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 2100">
  <rect width="1400" height="2100" fill="${t.pageBg}"/>
  <rect x="0" y="0" width="1400" height="640" fill="${t.accentColor}" opacity="0.9"/>
  <rect x="0" y="1950" width="1400" height="150" fill="${t.accentColor}" opacity="0.6"/>
  <rect x="80" y="680" width="6" height="1220" fill="${t.accentColor}" opacity="0.35"/>
  ${titleSvg}
  ${subtitleBlock}
  ${authorBlock}
</svg>`;
}

// ── Cover XHTML ───────────────────────────────────────────────────
function buildCoverXhtml() {
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${BOOK_LANG}">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>${esc(BOOK_TITLE)}</title>
  <style type="text/css">
    body { margin:0; padding:0; background:${THEME.pageBg}; text-align:center; }
    img  { max-width:100%; height:auto; }
  </style>
</head>
<body>
  <div style="text-align:center;">
    <img src="images/cover.svg" alt="${esc(BOOK_TITLE)}" style="width:100%;max-width:1400px;" />
  </div>
</body>
</html>`;
}

// ── Chapter XHTML ────────────────────────────────────────────────
function buildChapterXhtml(title, bodyXhtml) {
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${BOOK_LANG}">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>${esc(title)}</title>
  <link rel="stylesheet" type="text/css" href="../style.css" />
</head>
<body>
${bodyXhtml}
</body>
</html>`;
}

// ── nav.xhtml (EPUB 3 TOC) ────────────────────────────────────────
function buildNavXhtml(chapters) {
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const items = chapters.map(ch =>
    `      <li><a href="${ch.xhtmlFile}">${esc(ch.title)}</a></li>`
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:epub="http://www.idpf.org/2007/ops"
      xml:lang="${BOOK_LANG}">
<head>
  <meta charset="UTF-8" />
  <title>${esc(BOOK_TITLE)}</title>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>目录</h1>
    <ol>
${items}
    </ol>
  </nav>
</body>
</html>`;
}

// ── toc.ncx (EPUB 2 compatibility) ───────────────────────────────
function buildTocNcx(chapters) {
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const navPoints = chapters.map((ch, i) => `
  <navPoint id="np-${i+1}" playOrder="${i+2}">
    <navLabel><text>${esc(ch.title)}</text></navLabel>
    <content src="${ch.xhtmlFile}"/>
  </navPoint>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN"
  "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${BOOK_UUID}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${esc(BOOK_TITLE)}</text></docTitle>
  <navMap>
  <navPoint id="np-0" playOrder="1">
    <navLabel><text>封面</text></navLabel>
    <content src="cover.xhtml"/>
  </navPoint>${navPoints}
  </navMap>
</ncx>`;
}

// ── content.opf ───────────────────────────────────────────────────
function buildContentOpf(chapters) {
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  const manifestItems = chapters.map(ch =>
    `    <item id="${ch.id}" href="${ch.xhtmlFile}" media-type="application/xhtml+xml"/>`
  ).join('\n');
  const spineItems = chapters.map(ch =>
    `    <itemref idref="${ch.id}"/>`
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0"
         unique-identifier="bookid" xml:lang="${BOOK_LANG}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${esc(BOOK_TITLE)}</dc:title>
    <dc:creator>${esc(BOOK_AUTHOR)}</dc:creator>
    <dc:language>${BOOK_LANG}</dc:language>
    <dc:identifier id="bookid">${BOOK_UUID}</dc:identifier>
    <meta property="dcterms:modified">${now}</meta>
    <meta name="cover" content="cover-image"/>
  </metadata>
  <manifest>
    <item id="nav"         href="nav.xhtml"       media-type="application/xhtml+xml" properties="nav"/>
    <item id="ncx"         href="toc.ncx"          media-type="application/x-dtbncx+xml"/>
    <item id="cover-page"  href="cover.xhtml"      media-type="application/xhtml+xml"/>
    <item id="cover-image" href="images/cover.svg" media-type="image/svg+xml" properties="cover-image"/>
    <item id="stylesheet"  href="../style.css"     media-type="text/css"/>
${manifestItems}
  </manifest>
  <spine toc="ncx">
    <itemref idref="cover-page" linear="no"/>
${spineItems}
  </spine>
  <guide>
    <reference type="cover" title="封面"  href="cover.xhtml"/>
    <reference type="toc"   title="目录"  href="nav.xhtml"/>
    <reference type="text"  title="正文"  href="${chapters[0].xhtmlFile}"/>
  </guide>
</package>`;
}

// ── container.xml ─────────────────────────────────────────────────
const CONTAINER_XML = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf"
              media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

// ── helpers ───────────────────────────────────────────────────────
function mkdirp(dir) { fs.mkdirSync(dir, { recursive: true }); }

// ── MAIN ──────────────────────────────────────────────────────────
function build() {
  console.log('📚 Scriptorium EPUB Builder');
  console.log(`   Book   : ${BOOK_TITLE}`);
  console.log(`   Author : ${BOOK_AUTHOR}`);
  console.log(`   Output : ${EPUB_OUT}\n`);

  // Clean temp dir; ensure output dir exists
  if (fs.existsSync(BUILD_DIR)) fs.rmSync(BUILD_DIR, { recursive: true });
  mkdirp(META_INF); mkdirp(OEBPS); mkdirp(IMAGES);
  mkdirp(OUTPUT_DIR);

  if (!MMDC_PATH) {
    console.log('  ℹ  mmdc not found — Mermaid blocks will be preserved as <pre>');
    console.log('     Install: npm install -g @mermaid-js/mermaid-cli\n');
  } else {
    console.log(`  ✓  mmdc found — Mermaid diagrams will be pre-rendered to SVG\n`);
  }

  // Static files
  fs.writeFileSync(path.join(BUILD_DIR, 'mimetype'), 'application/epub+zip', { encoding: 'utf8' });
  fs.writeFileSync(path.join(META_INF, 'container.xml'), CONTAINER_XML, 'utf8');
  fs.writeFileSync(path.join(BUILD_DIR, 'style.css'), buildCss(), 'utf8');
  fs.writeFileSync(path.join(IMAGES, 'cover.svg'), buildCoverSvg(), 'utf8');
  fs.writeFileSync(path.join(OEBPS, 'cover.xhtml'), buildCoverXhtml(), 'utf8');

  // Process chapters
  const builtChapters = [];
  for (let i = 0; i < CHAPTERS.length; i++) {
    const { file, title: configTitle } = CHAPTERS[i];
    const srcPath = path.join(CHAPTERS_DIR, file);

    if (!fs.existsSync(srcPath)) {
      console.warn(`  ⚠  Skipping missing: ${srcPath}`);
      continue;
    }

    const md = fs.readFileSync(srcPath, 'utf8');
    // Title: prefer first # heading in file; fall back to config title
    const title = extractMdTitle(md) || configTitle;
    const bodyXhtml = mdToXhtml(md);
    const num = String(i + 1).padStart(2, '0');
    const xhtmlFile = `ch${num}.xhtml`;
    const id = `ch${num}`;

    fs.writeFileSync(path.join(OEBPS, xhtmlFile), buildChapterXhtml(title, bodyXhtml), 'utf8');
    builtChapters.push({ id, title, xhtmlFile });
    console.log(`  ✓ ${xhtmlFile}  ${title}`);
  }

  if (builtChapters.length === 0) {
    console.error('\n✖ No chapters found. Check CHAPTERS_DIR:', CHAPTERS_DIR);
    process.exit(1);
  }

  // Navigation files
  fs.writeFileSync(path.join(OEBPS, 'nav.xhtml'),    buildNavXhtml(builtChapters),    'utf8');
  fs.writeFileSync(path.join(OEBPS, 'toc.ncx'),      buildTocNcx(builtChapters),      'utf8');
  fs.writeFileSync(path.join(OEBPS, 'content.opf'),  buildContentOpf(builtChapters),  'utf8');

  // Package into EPUB
  console.log('\n📦 Packaging...');
  if (fs.existsSync(EPUB_OUT)) fs.unlinkSync(EPUB_OUT);

  // mimetype MUST be first and uncompressed
  execSync(`cd "${BUILD_DIR}" && zip -X "${EPUB_OUT}" mimetype`, { stdio: 'pipe' });
  execSync(`cd "${BUILD_DIR}" && zip -rg "${EPUB_OUT}" META-INF/ OEBPS/ style.css`, { stdio: 'pipe' });

  // Clean temp dir
  fs.rmSync(BUILD_DIR, { recursive: true });

  const kb = (fs.statSync(EPUB_OUT).size / 1024).toFixed(1);
  console.log(`\n✅  ${EPUB_OUT}  (${kb} KB)`);
  console.log(`    ${builtChapters.length} chapters · EPUB 3.x + EPUB 2 NCX · cover SVG`);
}

build();
