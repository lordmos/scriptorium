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
//    Install mermaid-cli globally for pre-rendering to PNG:
//    npm install -g @mermaid-js/mermaid-cli
//    Without it, Mermaid blocks are preserved as <pre> with a note.
//    PNG is used (not SVG) because EPUB readers apply their own CSS to
//    SVG <foreignObject> HTML, causing unpredictable text colours.
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

// Module-level state: PNG files generated during chapter processing.
// Populated by renderMermaidToPng(); consumed by buildContentOpf().
let mermaidCount    = 0;
const mermaidPngFiles = [];   // relative hrefs: ['images/mermaid-01.png', …]

// Detect Puppeteer (bundled with mmdc) for syntax-highlighted code rendering.
const PUPPETEER_DIR = (() => {
  if (!MMDC_PATH) return null;
  try {
    const real = fs.realpathSync(MMDC_PATH);
    const p = path.join(path.dirname(path.dirname(real)), 'node_modules', 'puppeteer');
    return fs.existsSync(path.join(p, 'package.json')) ? p : null;
  } catch { return null; }
})();

// Module-level state for deferred code block rendering.
// Populated during mdToXhtml(); resolved by batchRenderCodeBlocks() in build().
const pendingCodeBlocks = [];   // { id, code, lang }
let   codeRenderResults = {};   // id → { html } | { href }
let   codeImgCount      = 0;
const codePngFiles      = [];   // PNG hrefs (only when RENDER_CODE_AS_PNG = true)

// Renders a Mermaid diagram to PNG and saves it into the EPUB images/ folder.
// Returns the image href (e.g. 'images/mermaid-01.png'), or null on failure.
//
// Why PNG (not SVG)?
//   SVG output from mmdc embeds node/edge labels as HTML inside <foreignObject>.
//   Every EPUB reader handles <foreignObject> CSS differently — some ignore SVG
//   <style> rules entirely, others apply their own colour overrides. The result
//   is unpredictable text contrast across readers and reading modes.
//   PNG output avoids all of this: Chromium (Puppeteer) rasterises the diagram
//   at full colour fidelity before it ever reaches the EPUB reader, so what you
//   see during build is exactly what the reader displays.
function renderMermaidToPng(src) {
  const sanitized = sanitizeSequenceDiagram(src);
  if (!MMDC_PATH) return null;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mmd-'));
  try {
    const inFile  = path.join(tmpDir, 'diagram.mmd');
    const outFile = path.join(tmpDir, 'diagram.png');
    const cfgFile = path.join(tmpDir, 'mmd-config.json');
    fs.writeFileSync(inFile, sanitized, 'utf8');

    fs.writeFileSync(cfgFile, JSON.stringify({
      theme: 'base',      // zero CSS inheritance — all colours come from themeVariables
      themeVariables: {
        background:            THEME.pageBg,
        primaryColor:          '#C8E6FA',   // light steel-blue node fill
        primaryTextColor:      '#111111',   // near-black text
        primaryBorderColor:    '#2B7BC2',
        secondaryColor:        '#D4EDDA',
        secondaryTextColor:    '#111111',
        secondaryBorderColor:  '#388E3C',
        tertiaryColor:         '#FFF3CD',
        tertiaryTextColor:     '#111111',
        tertiaryBorderColor:   '#856404',
        lineColor:             '#444444',
        edgeLabelBackground:   THEME.pageBg,
        clusterBkg:            THEME.pageBg,
        clusterBorder:         '#AAAAAA',
        actorBkg:              '#C8E6FA',
        actorTextColor:        '#111111',
        actorBorder:           '#2B7BC2',
        actorLineColor:        '#444444',
        titleColor:            THEME.textColor,
        fontFamily:            'Georgia, "Times New Roman", serif',
        fontSize:              '16px',
      },
    }), 'utf8');

    execSync(
      `"${MMDC_PATH}" -i "${inFile}" -o "${outFile}" -c "${cfgFile}"` +
      ` --backgroundColor "${THEME.pageBg}" --scale 2 --quiet`,
      { stdio: 'pipe', timeout: 30000 }
    );

    mermaidCount++;
    const imgName = `mermaid-${String(mermaidCount).padStart(2, '0')}.png`;
    const imgHref = `images/${imgName}`;
    fs.copyFileSync(outFile, path.join(IMAGES, imgName));
    mermaidPngFiles.push(imgHref);
    return imgHref;
  } catch (e) {
    const hint = (e.stderr || '').toString().split('\n').find(l => l.trim()) || e.message || '';
    if (hint) console.warn(`  ⚠  mmdc failed: ${hint.trim()}`);
    return null;
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true }); } catch {}
  }
}

// ─────────────────────────────────────────────────────────────────────────────

// ── Code block syntax highlighting helpers ──────────────────────────────────

// Build the one-time HTML page that hosts highlight.js for reuse across all
// code blocks in a single Puppeteer session.
function buildCodeRendererHtml() {
  return [
    '<!DOCTYPE html><html><head><meta charset="UTF-8">',
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>',
    '<style>',
    '* { margin:0; padding:0; box-sizing:border-box; }',
    `body { background:${THEME.pageBg}; padding:16px; font-family:monospace; }`,
    '.wrap { border-radius:8px; overflow:hidden; box-shadow:0 2px 16px rgba(0,0,0,.18);',
    '        display:inline-block; min-width:400px; max-width:900px; }',
    '.lang-label { background:#282c34; color:#888; font-size:11px; padding:8px 16px 4px; }',
    'pre { overflow:visible; }',
    "code { font-family:'SF Mono','Fira Code',Menlo,Consolas,monospace; font-size:13px; line-height:1.55; }",
    '.hljs { padding:12px 16px 16px; border-radius:0; }',
    '</style></head>',
    '<body><div class="wrap" id="wrap"></div></body></html>',
  ].join('\n');
}

// Build the Node.js batch-runner script (executed as a child process).
// It launches ONE Puppeteer browser, renders all tasks, and writes results.json.
function buildBatchRunnerScript(tasksFile, resultsFile, initHtmlFile, pngDir) {
  const renderAsPng = RENDER_CODE_AS_PNG;
  return [
    `const puppeteer = require(${JSON.stringify(PUPPETEER_DIR)});`,
    `const fs = require('fs'), path = require('path');`,
    `const tasks = JSON.parse(fs.readFileSync(${JSON.stringify(tasksFile)}, 'utf8'));`,
    `const results = {};`,
    `(async () => {`,
    `  const br = await puppeteer.launch({`,
    `    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],`,
    `  });`,
    `  const pg = await br.newPage();`,
    `  await pg.setViewport({ width: 960, height: 600, deviceScaleFactor: 2 });`,
    `  // Load via file:// so CDN resources resolve correctly`,
    `  await pg.goto(${JSON.stringify('file://' + initHtmlFile)}, { waitUntil: 'networkidle2', timeout: 20000 });`,
    `  for (const task of tasks) {`,
    `    const escaped = task.code`,
    `      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');`,
    `    const lbl = task.lang`,
    `      ? '<div class="lang-label">' + task.lang + '</div>' : '';`,
    `    try {`,
    `      if (${renderAsPng}) {`,
    `        // PNG mode: screenshot the rendered code block`,
    `        await pg.evaluate((esc, lang, lbl) => {`,
    `          document.getElementById('wrap').innerHTML =`,
    `            lbl + '<pre><code class="language-' + lang + '">' + esc + '</code></pre>';`,
    `          hljs.highlightAll();`,
    `        }, escaped, task.lang, lbl);`,
    `        const pngFile = path.join(${JSON.stringify(pngDir)}, task.id + '.png');`,
    `        const el = await pg.$('#wrap');`,
    `        await el.screenshot({ path: pngFile });`,
    `        results[task.id] = { success: true, pngFile };`,
    `      } else {`,
    `        // Inline-HTML mode: extract highlighted HTML with inline styles`,
    `        // (keeps text selectable + searchable in EPUB readers)`,
    `        const html = await pg.evaluate((code, lang) => {`,
    `          const el = document.createElement('code');`,
    `          el.textContent = code;`,
    `          el.className = 'language-' + (lang || 'plaintext');`,
    `          document.body.appendChild(el);`,
    `          if (typeof hljs !== 'undefined') hljs.highlightElement(el);`,
    `          el.querySelectorAll('[class]').forEach(span => {`,
    `            const cs = window.getComputedStyle(span);`,
    `            let s = '';`,
    `            if (cs.color) s += 'color:' + cs.color + ';';`,
    `            if (cs.fontStyle && cs.fontStyle !== 'normal')`,
    `              s += 'font-style:' + cs.fontStyle + ';';`,
    `            if (cs.fontWeight && cs.fontWeight !== '400')`,
    `              s += 'font-weight:' + cs.fontWeight + ';';`,
    `            if (s) span.setAttribute('style', s);`,
    `            span.removeAttribute('class');`,
    `          });`,
    `          const h = el.innerHTML;`,
    `          el.remove();`,
    `          return h;`,
    `        }, task.code, task.lang);`,
    `        results[task.id] = { success: true, html };`,
    `      }`,
    `    } catch (e) {`,
    `      results[task.id] = { success: false, error: e.message };`,
    `    }`,
    `  }`,
    `  await br.close();`,
    `  fs.writeFileSync(${JSON.stringify(resultsFile)}, JSON.stringify(results), 'utf8');`,
    `})().catch(e => { process.stderr.write(e.message); process.exit(1); });`,
  ].join('\n');
}

// Batch-render all pendingCodeBlocks using a single Puppeteer session.
// Populates codeRenderResults with { html } (inline mode) or { href } (PNG mode).
function batchRenderCodeBlocks() {
  if (!PUPPETEER_DIR || pendingCodeBlocks.length === 0) return;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'code-batch-'));
  try {
    const tasksFile    = path.join(tmpDir, 'tasks.json');
    const resultsFile  = path.join(tmpDir, 'results.json');
    const initHtmlFile = path.join(tmpDir, 'init.html');
    const jsFile       = path.join(tmpDir, 'runner.js');
    fs.writeFileSync(tasksFile,    JSON.stringify(pendingCodeBlocks), 'utf8');
    fs.writeFileSync(initHtmlFile, buildCodeRendererHtml(),           'utf8');
    fs.writeFileSync(jsFile, buildBatchRunnerScript(tasksFile, resultsFile, initHtmlFile, tmpDir), 'utf8');
    execSync('node ' + JSON.stringify(jsFile), { stdio: 'pipe', timeout: 120000 });
    if (!fs.existsSync(resultsFile)) return;
    const raw = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
    for (const [id, r] of Object.entries(raw)) {
      if (!r.success) {
        console.warn(`  ⚠  code render failed (${id}): ${r.error}`);
        continue;
      }
      if (RENDER_CODE_AS_PNG && r.pngFile && fs.existsSync(r.pngFile)) {
        codeImgCount++;
        const imgName = `code-${String(codeImgCount).padStart(2, '0')}.png`;
        const imgHref = `images/${imgName}`;
        fs.copyFileSync(r.pngFile, path.join(IMAGES, imgName));
        codePngFiles.push(imgHref);
        codeRenderResults[id] = { href: imgHref };
      } else if (r.html) {
        codeRenderResults[id] = { html: r.html };
      }
    }
  } catch (e) {
    console.warn('  ⚠  Batch code rendering failed:', e.message,
                 '\n     Falling back to plain <pre><code>');
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true }); } catch {}
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
//  4. CODE BLOCK RENDERING
//  Requires mmdc (which bundles Puppeteer + Chrome).
//
//  false (default) — inline-styled HTML via highlight.js.
//                    Text stays selectable & searchable. Recommended.
//  true            — PNG image (carbon-style). Beautiful but code is
//                    NOT copyable or searchable. Use sparingly.
// ─────────────────────────────────────────────
const RENDER_CODE_AS_PNG = false;

// ─────────────────────────────────────────────
//  5. PATHS  — usually no need to change
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
        const href = renderMermaidToPng(code);
        if (href) {
          result.push(`<div class="diagram"><img src="${href}" alt="Diagram" /></div>`);
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
      } else if (PUPPETEER_DIR) {
        // Defer rendering: Puppeteer batch-renders all blocks at once in build()
        const cbId = `cb-${pendingCodeBlocks.length + 1}`;
        pendingCodeBlocks.push({ id: cbId, code: code.trimEnd(), lang: lang || '' });
        result.push(`\x00CBID:${cbId}\x00`);
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
pre.highlighted {
  background: #282c34;
  padding: 1.2em 1.4em;
  border-radius: 6px;
  overflow-x: auto;
}
pre.highlighted code {
  font-family: "Source Code Pro","SF Mono","Fira Code","Courier New",monospace;
  font-size: 0.87em;
  line-height: 1.55;
  color: #abb2bf;
  background: none;
}
.code-img { margin: 1.2em 0; text-align: left; }
.code-img img { max-width: 100%; border-radius: 6px; }
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
  const mermaidItems = mermaidPngFiles.map((href, i) => {
    const id = `mermaid-img-${String(i + 1).padStart(2, '0')}`;
    return `    <item id="${id}" href="${href}" media-type="image/png"/>`;
  }).join('\n');
  const codeItems = codePngFiles.map((href, i) => {
    const id = `code-img-${String(i + 1).padStart(2, '0')}`;
    return `    <item id="${id}" href="${href}" media-type="image/png"/>`;
  }).join('\n');
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
${mermaidItems ? mermaidItems + '\n' : ''}${codeItems ? codeItems + '\n' : ''}  </manifest>
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

  // Reset all per-build state
  mermaidCount = 0;
  mermaidPngFiles.length = 0;
  pendingCodeBlocks.length = 0;
  codeRenderResults = {};
  codeImgCount = 0;
  codePngFiles.length = 0;

  // Clean temp dir; ensure output dir exists
  if (fs.existsSync(BUILD_DIR)) fs.rmSync(BUILD_DIR, { recursive: true });
  mkdirp(META_INF); mkdirp(OEBPS); mkdirp(IMAGES);
  mkdirp(OUTPUT_DIR);

  if (!MMDC_PATH) {
    console.log('  ℹ  mmdc not found — Mermaid blocks will be preserved as <pre>');
    console.log('     Install: npm install -g @mermaid-js/mermaid-cli\n');
  } else {
    console.log(`  ✓  mmdc found — Mermaid diagrams → PNG`);
    if (PUPPETEER_DIR) {
      const mode = RENDER_CODE_AS_PNG ? 'PNG (carbon-style)' : 'inline-styled HTML (copyable)';
      console.log(`  ✓  Puppeteer found — code blocks → ${mode}`);
    }
    console.log('');
  }

  // Static files
  fs.writeFileSync(path.join(BUILD_DIR, 'mimetype'), 'application/epub+zip', { encoding: 'utf8' });
  fs.writeFileSync(path.join(META_INF, 'container.xml'), CONTAINER_XML, 'utf8');
  fs.writeFileSync(path.join(BUILD_DIR, 'style.css'), buildCss(), 'utf8');
  fs.writeFileSync(path.join(IMAGES, 'cover.svg'), buildCoverSvg(), 'utf8');
  fs.writeFileSync(path.join(OEBPS, 'cover.xhtml'), buildCoverXhtml(), 'utf8');

  // Phase 1: parse all chapters to XHTML (code blocks become placeholders)
  const pendingChapters = [];
  for (let i = 0; i < CHAPTERS.length; i++) {
    const { file, title: configTitle } = CHAPTERS[i];
    const srcPath = path.join(CHAPTERS_DIR, file);

    if (!fs.existsSync(srcPath)) {
      console.warn(`  ⚠  Skipping missing: ${srcPath}`);
      continue;
    }

    const md = fs.readFileSync(srcPath, 'utf8');
    const title = extractMdTitle(md) || configTitle;
    const bodyXhtml = mdToXhtml(md);
    const num = String(i + 1).padStart(2, '0');
    pendingChapters.push({ id: `ch${num}`, title, xhtmlFile: `ch${num}.xhtml`, bodyXhtml });
  }

  if (pendingChapters.length === 0) {
    console.error('\n✖ No chapters found. Check CHAPTERS_DIR:', CHAPTERS_DIR);
    process.exit(1);
  }

  // Phase 2: batch-render all code blocks in a single Puppeteer session
  if (PUPPETEER_DIR && pendingCodeBlocks.length > 0) {
    const mode = RENDER_CODE_AS_PNG ? 'PNG' : 'inline HTML';
    console.log(`  🎨 Rendering ${pendingCodeBlocks.length} code block(s) → ${mode}...`);
    batchRenderCodeBlocks();
  }

  // Phase 3: write chapter files (resolve code block placeholders)
  const builtChapters = [];
  for (const { id, title, xhtmlFile, bodyXhtml } of pendingChapters) {
    const resolved = bodyXhtml.replace(/\x00CBID:([^\x00]+)\x00/g, (_, cbId) => {
      const r = codeRenderResults[cbId];
      if (r && r.href) {
        return `<div class="code-img"><img src="${r.href}" alt="code" /></div>`;
      }
      if (r && r.html) {
        return `<pre class="highlighted"><code>${r.html}</code></pre>`;
      }
      return `<pre><code>[code block render failed]</code></pre>`;
    });
    fs.writeFileSync(path.join(OEBPS, xhtmlFile), buildChapterXhtml(title, resolved), 'utf8');
    builtChapters.push({ id, title, xhtmlFile });
    console.log(`  ✓ ${xhtmlFile}  ${title}`);
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
