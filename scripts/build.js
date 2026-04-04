'use strict';
// ═══════════════════════════════════════════════════════════════════
//  Scriptorium — HTML E-Book Build Script Template
//
//  Converts Markdown chapter files into a complete static HTML e-book.
//
//  Usage:
//    1. Copy this file to your book project root as build.js
//       (or run directly with: node scripts/build.js from project root)
//    2. Fill in the CONFIG section (Book Info + Chapter List)
//    3. Choose or customize a color theme in the THEME section
//    4. Run from project root: node build.js  (or: node scripts/build.js)
//
//  Requirements: Node.js >= 18.0.0  (no npm packages required)
//
//  Input:  output/chapters/final/chXX-final.md
//  Output: output/publish/index.html  +  chXX.html  +  assets/
// ═══════════════════════════════════════════════════════════════════

const fs   = require('fs');
const path = require('path');

// ─────────────────────────────────────────────
//  1. BOOK INFO  — fill in before running
// ─────────────────────────────────────────────
const BOOK_TITLE       = '{{书名}}';        // e.g. 'Angular 源码深度解析'
const BOOK_SUBTITLE    = '{{副标题}}';      // e.g. '深入 Angular 17+ 运行时的源码之旅'
const BOOK_DESCRIPTION = `{{书籍简介段落}}`; // Shown on the index page (multi-line OK)

// ─────────────────────────────────────────────
//  2. CHAPTER LIST  — one entry per chapter
// ─────────────────────────────────────────────
const CHAPTERS = [
  { num: 1,  file: 'ch01-final.md', out: 'ch01.html', title: '第1章：{{标题}}' },
  { num: 2,  file: 'ch02-final.md', out: 'ch02.html', title: '第2章：{{标题}}' },
  // { num: 3, file: 'ch03-final.md', out: 'ch03.html', title: '第3章：{{标题}}' },
  // ... add/remove rows to match your outline
];

// ─────────────────────────────────────────────
//  3. COLOR THEME
//  Uncomment one preset, or define your own values below.
// ─────────────────────────────────────────────

// ── Warm Paper (default) ─────────────────────
const THEME = {
  pageBg:           '#FEFCF8',
  textColor:        '#2C2C2C',
  headingColor:     '#1A1A1A',
  codeBg:           '#F5F2ED',
  codeBorder:       '#E0D9CF',
  linkColor:        '#4A7C9B',
  accentColor:      '#C7553A',  // progress bar, active nav item, h1 border
  sidebarBg:        '#F8F4EE',
  sidebarBorder:    '#E8E2D8',
  blockquoteBorder: '#C7553A',
  blockquoteBg:     'linear-gradient(to right, #FFF9F5, #FEFCF8)',
};

// ── GitHub Light ─────────────────────────────
// const THEME = {
//   pageBg: '#FFFFFF',        textColor: '#1F2328',   headingColor: '#1F2328',
//   codeBg: '#F6F8FA',        codeBorder: '#D0D7DE',  linkColor: '#0969DA',
//   accentColor: '#0550AE',   sidebarBg: '#F6F8FA',   sidebarBorder: '#D0D7DE',
//   blockquoteBorder: '#0550AE', blockquoteBg: '#EFF9FF',
// };

// ── Dark Mode ────────────────────────────────
// const THEME = {
//   pageBg: '#1E1E1E',        textColor: '#D4D4D4',   headingColor: '#FFFFFF',
//   codeBg: '#2D2D2D',        codeBorder: '#3C3C3C',  linkColor: '#4EC9B0',
//   accentColor: '#569CD6',   sidebarBg: '#252526',   sidebarBorder: '#3C3C3C',
//   blockquoteBorder: '#569CD6', blockquoteBg: '#252526',
// };

// ── Minimal (clean white) ────────────────────
// const THEME = {
//   pageBg: '#FFFFFF',        textColor: '#333333',   headingColor: '#111111',
//   codeBg: '#F7F7F7',        codeBorder: '#EEEEEE',  linkColor: '#333333',
//   accentColor: '#000000',   sidebarBg: '#F7F7F7',   sidebarBorder: '#EEEEEE',
//   blockquoteBorder: '#AAAAAA', blockquoteBg: '#F7F7F7',
// };

// ─────────────────────────────────────────────
//  4. PATHS  — usually no need to change
//  ROOT = the directory from which `node build.js` (or `node scripts/build.js`) is run
// ─────────────────────────────────────────────
const ROOT         = process.cwd();  // always the project root
const CHAPTERS_DIR = path.join(ROOT, 'output', 'chapters', 'final');
const OUTPUT_DIR   = path.join(ROOT, 'output', 'publish');
const ASSETS_DIR   = path.join(OUTPUT_DIR, 'assets');

// ═══════════════════════════════════════════════════════════════════
//  INTERNALS — no changes needed below this line
// ═══════════════════════════════════════════════════════════════════

// ── CSS (theme variables injected) ───────────
function buildCSS() {
  const t = THEME;
  return `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  background: ${t.pageBg};
  color: ${t.textColor};
  font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  line-height: 1.85;
}
/* Progress bar */
#progress-bar {
  position: fixed; top: 0; left: 0; width: 0%; height: 3px;
  background: ${t.accentColor}; z-index: 2000; transition: width 0.08s linear;
}
/* Layout */
#layout { display: flex; min-height: 100vh; }
/* Left sidebar */
#sidebar {
  position: fixed; top: 3px; left: 0;
  width: 260px; height: calc(100vh - 3px);
  background: ${t.sidebarBg}; border-right: 1px solid ${t.sidebarBorder};
  overflow-y: auto; z-index: 100;
}
.sidebar-header { padding: 22px 18px 14px; border-bottom: 1px solid ${t.sidebarBorder}; }
.sidebar-title {
  font-family: "Noto Serif SC", "STSong", "SimSun", Georgia, serif;
  font-size: 1em; font-weight: 700; color: ${t.headingColor}; line-height: 1.4; margin-bottom: 5px;
}
.sidebar-subtitle { font-size: 0.7em; color: #999; line-height: 1.4; }
.sidebar-nav { padding: 10px 8px 24px; }
.sidebar-nav a {
  display: block; padding: 6px 12px; border-radius: 5px;
  color: #444; font-size: 0.82em; text-decoration: none;
  line-height: 1.45; margin-bottom: 2px; word-break: break-all;
  transition: background 0.15s, color 0.15s;
}
.sidebar-nav a.active { background: ${t.sidebarBorder}; color: ${t.accentColor}; font-weight: 600; }
/* Main content */
#main { margin-left: 260px; margin-right: 224px; padding: 48px 52px 80px; min-height: 100vh; }
/* Right TOC */
#toc-right {
  position: fixed; top: 3px; right: 0;
  width: 224px; height: calc(100vh - 3px);
  background: ${t.sidebarBg}; border-left: 1px solid ${t.sidebarBorder};
  overflow-y: auto; z-index: 100; padding: 22px 14px;
}
.toc-title { font-size: 0.68em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #aaa; margin-bottom: 10px; }
.toc-list { list-style: none; }
.toc-list li { margin-bottom: 3px; }
.toc-list li a {
  display: block; padding: 3px 8px; font-size: 0.77em; color: #666;
  text-decoration: none; border-left: 2px solid transparent;
  line-height: 1.4; word-break: break-all; transition: color 0.15s, border-color 0.15s;
}
.toc-list li a.active { color: ${t.accentColor}; border-left-color: ${t.accentColor}; font-weight: 600; }
/* Headings */
h1, h2, h3, h4, h5, h6 {
  font-family: "Noto Serif SC", "STSong", "SimSun", Georgia, serif;
  color: ${t.headingColor}; line-height: 1.4; margin-top: 1.8em; margin-bottom: 0.55em;
}
h1 { font-size: 2.1em; margin-top: 0; padding-bottom: 0.35em; border-bottom: 2px solid ${t.accentColor}; }
h2 { font-size: 1.55em; padding-bottom: 0.28em; border-bottom: 1px solid ${t.sidebarBorder}; }
h3 { font-size: 1.25em; }
h4 { font-size: 1.08em; }
p { margin-bottom: 1em; }
strong { color: ${t.headingColor}; font-weight: 700; }
a { color: ${t.linkColor}; text-decoration: none; }
a:hover { text-decoration: underline; }
/* Code */
code {
  font-family: "JetBrains Mono", "Fira Code", "SF Mono", Consolas, "Courier New", monospace;
  font-size: 0.875em; background: ${t.codeBg}; padding: 0.15em 0.38em;
  border-radius: 3px; border: 1px solid ${t.codeBorder}; word-break: break-all;
}
pre {
  background: ${t.codeBg}; padding: 18px 22px; border-radius: 8px;
  overflow-x: auto; margin: 1.4em 0; border: 1px solid ${t.codeBorder}; line-height: 1.6;
}
pre code { background: none; padding: 0; border: none; border-radius: 0; font-size: 0.84em; word-break: normal; }
.hljs { background: ${t.codeBg} !important; }
/* Blockquote */
blockquote {
  margin: 1.4em 0; padding: 14px 20px;
  border-left: 4px solid ${t.blockquoteBorder};
  background: ${t.blockquoteBg};
  border-radius: 0 6px 6px 0;
}
blockquote p { margin: 0; color: #555; font-style: italic; }
/* Lists */
ul, ol { padding-left: 1.8em; margin-bottom: 1em; }
li { margin-bottom: 0.38em; }
/* Tables */
.table-wrap { overflow-x: auto; margin: 1.4em 0; }
table { width: 100%; border-collapse: collapse; font-size: 0.9em; }
th, td { padding: 9px 13px; border: 1px solid ${t.sidebarBorder}; text-align: left; vertical-align: top; }
th { background: ${t.codeBg}; font-weight: 600; color: ${t.headingColor}; white-space: nowrap; }
/* HR */
hr { border: none; border-top: 1px solid ${t.sidebarBorder}; margin: 2.2em 0; }
/* Mermaid */
.mermaid {
  margin: 1.6em 0; padding: 20px;
  background: ${t.codeBg}; border: 1px solid ${t.sidebarBorder}; border-radius: 8px;
  text-align: center; overflow-x: auto;
}
/* Chapter nav */
.chapter-nav {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 4em; padding-top: 1.8em; border-top: 2px solid ${t.sidebarBorder}; gap: 12px;
}
.chapter-nav a {
  display: inline-flex; align-items: center; padding: 10px 16px;
  background: ${t.codeBg}; border: 1px solid ${t.sidebarBorder}; border-radius: 6px;
  color: ${t.linkColor}; font-size: 0.85em; text-decoration: none; max-width: 46%;
  line-height: 1.4; transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.chapter-nav a:hover { border-color: ${t.accentColor}; color: ${t.accentColor}; text-decoration: none; }
.chapter-nav span { flex: 1; }
/* Back to top */
#back-to-top {
  position: fixed; bottom: 28px; right: 240px;
  width: 42px; height: 42px; background: ${t.accentColor}; color: #fff;
  border: none; border-radius: 50%; cursor: pointer;
  font-size: 18px; font-weight: bold; display: none;
  align-items: center; justify-content: center; z-index: 500;
  box-shadow: 0 2px 12px rgba(0,0,0,0.25); transition: transform 0.2s;
}
#back-to-top.visible { display: flex; }
#back-to-top:hover { transform: translateY(-2px); }
/* Index page */
.index-hero {
  text-align: center; padding: 44px 0 52px;
  border-bottom: 1px solid ${t.sidebarBorder}; margin-bottom: 52px;
}
.index-hero h1 { font-size: 2.6em; border: none; margin-bottom: 14px; padding: 0; }
.index-hero .subtitle { font-size: 1.08em; color: #666; font-style: italic; }
.chapter-list { padding-left: 0; list-style: none; }
.chapter-list li {
  margin-bottom: 10px; padding: 13px 20px;
  background: ${t.sidebarBg}; border-radius: 8px; border: 1px solid ${t.sidebarBorder};
  transition: background 0.15s, border-color 0.15s;
}
.chapter-list li:hover { border-color: ${t.accentColor}; }
.chapter-list li a { color: ${t.headingColor}; font-size: 1em; font-weight: 500; text-decoration: none; }
.chapter-list li a:hover { color: ${t.accentColor}; }
/* Responsive */
@media (max-width: 900px) {
  #sidebar { display: none; }
  #toc-right { display: none; }
  #main { margin: 0; padding: 24px 20px 60px; }
  #back-to-top { right: 20px; }
}
`.trim();
}

// ── JS ────────────────────────────────────────
const JS = `
(function() {
  // Progress bar
  var bar = document.getElementById('progress-bar');
  if (bar) {
    window.addEventListener('scroll', function() {
      var s = document.documentElement, scrollTop = s.scrollTop || document.body.scrollTop;
      var scrollH = s.scrollHeight - s.clientHeight;
      bar.style.width = (scrollH > 0 ? (scrollTop / scrollH * 100) : 0) + '%';
    });
  }
  // Back to top
  var btn = document.getElementById('back-to-top');
  if (btn) {
    window.addEventListener('scroll', function() {
      btn.classList.toggle('visible', window.scrollY > 300);
    });
    btn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }
  // Right TOC highlight
  var tocLinks = document.querySelectorAll('.toc-list a');
  if (tocLinks.length) {
    var headings = Array.from(document.querySelectorAll('#main h2'));
    window.addEventListener('scroll', function() {
      var scrollY = window.scrollY + 80;
      var active = headings.filter(function(h) { return h.offsetTop <= scrollY; }).pop();
      tocLinks.forEach(function(a) { a.classList.remove('active'); });
      if (active) {
        var match = document.querySelector('.toc-list a[href="#' + active.id + '"]');
        if (match) match.classList.add('active');
      }
    });
  }
  // Mermaid
  if (document.querySelector('.mermaid')) {
    var s = document.createElement('script');
    s.type = 'module';
    s.textContent = 'import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs"; mermaid.initialize({ startOnLoad: true, theme: "neutral" }); mermaid.run();';
    document.head.appendChild(s);
  }
  // Highlight.js
  if (document.querySelector('pre code')) {
    var hl = document.createElement('link');
    hl.rel = 'stylesheet';
    hl.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
    document.head.appendChild(hl);
    var sc = document.createElement('script');
    sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
    sc.onload = function() { hljs.highlightAll(); };
    document.head.appendChild(sc);
  }
})();
`.trim();

// ── Markdown → HTML (pure Node.js) ───────────
function mdToHtml(md) {
  // Strip completion markers
  md = md.replace(/<!--\s*\w+_COMPLETE\s*-->/g, '');

  const lines = md.split('\n');
  let html = '';
  let inPre = false, preContent = '', preLang = '';
  let inTable = false, tableRows = [];
  let inUl = false, inOl = false;
  let ulDepth = 0;

  function flushList() {
    if (inUl)  { html += '</ul>\n'; inUl = false; }
    if (inOl)  { html += '</ol>\n'; inOl = false; }
  }
  function flushTable() {
    if (!inTable) return;
    html += '<div class="table-wrap"><table>\n';
    tableRows.forEach(function(row, i) {
      const cells = row.split('|').map(function(c) { return c.trim(); }).filter(Boolean);
      if (cells.length === 0 || (cells.length === 1 && /^[-: ]+$/.test(cells[0]))) return;
      const tag = i === 0 ? 'th' : 'td';
      html += '<tr>' + cells.map(function(c) { return '<' + tag + '>' + inlineHtml(c) + '</' + tag + '>'; }).join('') + '</tr>\n';
    });
    html += '</table></div>\n';
    inTable = false; tableRows = [];
  }

  function inlineHtml(s) {
    return s
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/~~(.+?)~~/g, '<del>$1</del>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced code block
    const fenceMatch = line.match(/^```(\w*)/);
    if (fenceMatch && !inPre) {
      flushList(); flushTable();
      inPre = true; preLang = fenceMatch[1] || ''; preContent = '';
      continue;
    }
    if (inPre) {
      if (line.match(/^```/)) {
        if (preLang === 'mermaid') {
          html += '<div class="mermaid">' + preContent.trim() + '</div>\n';
        } else {
          const langClass = preLang ? ' class="language-' + preLang + '"' : '';
          html += '<pre><code' + langClass + '>' + preContent.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</code></pre>\n';
        }
        inPre = false;
      } else {
        preContent += line + '\n';
      }
      continue;
    }

    // Table
    if (/^\s*\|/.test(line)) {
      flushList();
      if (!inTable) inTable = true;
      tableRows.push(line.trim().replace(/^\||\|$/g, ''));
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Headings
    const hMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (hMatch) {
      flushList();
      const level = hMatch[1].length;
      const text = hMatch[2];
      const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '');
      html += '<h' + level + ' id="' + id + '">' + inlineHtml(text) + '</h' + level + '>\n';
      continue;
    }

    // HR
    if (/^---+$/.test(line.trim())) { flushList(); html += '<hr>\n'; continue; }

    // Blockquote
    if (/^>\s?/.test(line)) {
      flushList();
      html += '<blockquote><p>' + inlineHtml(line.replace(/^>\s?/, '')) + '</p></blockquote>\n';
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^(\s*)[-*]\s+(.+)/);
    if (ulMatch) {
      if (!inUl) { if (inOl) { html += '</ol>\n'; inOl = false; } html += '<ul>\n'; inUl = true; }
      html += '<li>' + inlineHtml(ulMatch[2]) + '</li>\n';
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^(\s*)\d+\.\s+(.+)/);
    if (olMatch) {
      if (!inOl) { if (inUl) { html += '</ul>\n'; inUl = false; } html += '<ol>\n'; inOl = true; }
      html += '<li>' + inlineHtml(olMatch[2]) + '</li>\n';
      continue;
    }

    // Empty line
    if (line.trim() === '') { flushList(); flushTable(); html += '\n'; continue; }

    // Paragraph
    flushList(); flushTable();
    html += '<p>' + inlineHtml(line) + '</p>\n';
  }
  flushList(); flushTable();
  return html;
}

// ── Slug helper ───────────────────────────────
function slugify(text) {
  return text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '');
}

// ── Build sidebar HTML ────────────────────────
function buildSidebar(currentOut) {
  const items = [{ out: 'index.html', title: '📖 目录' }]
    .concat(CHAPTERS.map(function(ch) { return { out: ch.out, title: ch.title }; }));
  return items.map(function(item) {
    const active = item.out === currentOut ? ' class="active"' : '';
    return '<a href="' + item.out + '"' + active + '>' + item.title + '</a>';
  }).join('\n');
}

// ── Build right TOC from h2 headings ─────────
function buildRightToc(bodyHtml) {
  const matches = [];
  bodyHtml.replace(/<h2[^>]*id="([^"]*)"[^>]*>(.*?)<\/h2>/g, function(_, id, text) {
    matches.push({ id: id, text: text.replace(/<[^>]+>/g, '') });
  });
  if (!matches.length) return '';
  return '<div class="toc-title">本章目录</div><ul class="toc-list">' +
    matches.map(function(m) { return '<li><a href="#' + m.id + '">' + m.text + '</a></li>'; }).join('') +
    '</ul>';
}

// ── Full page wrapper ─────────────────────────
function wrapPage(opts) {
  // opts: { title, bodyHtml, sidebar, rightToc, prevLink, nextLink }
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${opts.title} — ${BOOK_TITLE}</title>
<style>${buildCSS()}</style>
</head>
<body>
<div id="progress-bar"></div>
<div id="layout">
  <nav id="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-title">${BOOK_TITLE}</div>
      <div class="sidebar-subtitle">${BOOK_SUBTITLE}</div>
    </div>
    <div class="sidebar-nav">
${opts.sidebar}
    </div>
  </nav>
  <main id="main">
${opts.bodyHtml}
${opts.prevLink || opts.nextLink ? `<nav class="chapter-nav">
  ${opts.prevLink ? `<a href="${opts.prevLink.href}">◀ ${opts.prevLink.title}</a>` : '<span></span>'}
  ${opts.nextLink ? `<a href="${opts.nextLink.href}">${opts.nextLink.title} ▶</a>` : '<span></span>'}
</nav>` : ''}
  </main>
  <aside id="toc-right">${opts.rightToc}</aside>
</div>
<button id="back-to-top" title="返回顶部">↑</button>
<script>${JS}</script>
</body>
</html>`;
}

// ── Build index page ──────────────────────────
function buildIndex() {
  const chapterLinks = CHAPTERS.map(function(ch) {
    return `<li><a href="${ch.out}">${ch.title}</a></li>`;
  }).join('\n');

  const bodyHtml = `
<div class="index-hero">
  <h1>${BOOK_TITLE}</h1>
  <p class="subtitle">${BOOK_SUBTITLE}</p>
</div>
<div class="index-intro">
${BOOK_DESCRIPTION.split('\n').filter(Boolean).map(function(p) { return '<p>' + p.trim() + '</p>'; }).join('\n')}
</div>
<div class="index-toc">
  <h2>章节目录</h2>
  <ul class="chapter-list">
${chapterLinks}
  </ul>
</div>
<!-- BOOKBINDING_COMPLETE -->`;

  const sidebar = buildSidebar('index.html');
  return wrapPage({ title: '目录', bodyHtml, sidebar, rightToc: '', prevLink: null, nextLink: CHAPTERS[0] ? { href: CHAPTERS[0].out, title: CHAPTERS[0].title } : null });
}

// ── Build chapter page ────────────────────────
function buildChapter(ch, idx) {
  const mdPath = path.join(CHAPTERS_DIR, ch.file);
  if (!fs.existsSync(mdPath)) {
    console.warn('  ⚠ Missing: ' + mdPath);
    return null;
  }
  const md = fs.readFileSync(mdPath, 'utf8');
  const bodyHtml = mdToHtml(md);
  const sidebar   = buildSidebar(ch.out);
  const rightToc  = buildRightToc(bodyHtml);
  const prevCh    = idx > 0 ? CHAPTERS[idx - 1] : null;
  const nextCh    = idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : null;
  return wrapPage({
    title:    ch.title,
    bodyHtml,
    sidebar,
    rightToc,
    prevLink: prevCh ? { href: prevCh.out, title: prevCh.title } : { href: 'index.html', title: '目录' },
    nextLink: nextCh ? { href: nextCh.out, title: nextCh.title } : null,
  });
}

// ── Main build ────────────────────────────────
function main() {
  console.log('📚 Scriptorium Build Script');
  console.log('   Book: ' + BOOK_TITLE);
  console.log('   Chapters: ' + CHAPTERS.length);
  console.log('');

  // Create output directories
  [OUTPUT_DIR, ASSETS_DIR].forEach(function(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // Write shared assets
  fs.writeFileSync(path.join(ASSETS_DIR, 'style.css'),  buildCSS());
  fs.writeFileSync(path.join(ASSETS_DIR, 'script.js'),  JS);

  // Build index
  console.log('  ✔ index.html');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), buildIndex());

  // Build chapters
  let built = 0;
  CHAPTERS.forEach(function(ch, idx) {
    const html = buildChapter(ch, idx);
    if (html) {
      fs.writeFileSync(path.join(OUTPUT_DIR, ch.out), html);
      console.log('  ✔ ' + ch.out + '  (' + ch.title + ')');
      built++;
    }
  });

  console.log('');
  console.log('✅ Build complete: ' + (built + 1) + ' HTML files → output/publish/');
  console.log('   Open: output/publish/index.html');
}

main();
