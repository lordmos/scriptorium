import { defineConfig } from 'vitepress'

// ─── Sidebar helpers ────────────────────────────────────────────────────────

function sidebarZh() {
  return [
    {
      text: '使用指南',
      collapsed: false,
      items: [
        { text: '如何使用 Scriptorium', link: '/quick-start' },
        { text: '与 AI 工具集成', link: '/ai-tools' },
      ],
    },
    {
      text: 'Agent 规格',
      collapsed: false,
      items: [
        { text: '🏗️ 系统架构与Agent注册表', link: '/agents/00-system-overview' },
        { text: 'Agent #0 — 主编排', link: '/agents/01-orchestrator' },
        { text: 'Agent #1 — 架构师', link: '/agents/02-architect' },
        { text: 'Agent #2 — 读者代言人', link: '/agents/03-reader-advocate' },
        { text: 'Agent #3 — 研究员', link: '/agents/04-researcher' },
        { text: 'Agent #4 — 作家', link: '/agents/05-writer' },
        { text: 'Agent R1 — 源码审查员', link: '/agents/06-code-reviewer' },
        { text: 'Agent R2 — 一致性审查员', link: '/agents/07-consistency-reviewer' },
        { text: 'Agent R3 — 内容审查员', link: '/agents/08-content-reviewer' },
        { text: '读者评审团', link: '/agents/09-reader-panel' },
        { text: 'Agent #11 — 装帧工人', link: '/agents/10-bookbinder' },
      ],
    },
    {
      text: '框架文档',
      collapsed: false,
      items: [
        { text: '5阶段生产流水线', link: '/framework/workflow' },
        { text: '无状态Agent记忆协议（File Pointers）', link: '/framework/file-pointers' },
        { text: 'DAG批次执行策略', link: '/framework/parallel-strategy' },
        { text: '三审并行架构', link: '/framework/review-architecture' },
        { text: '断点恢复与容灾', link: '/framework/recovery' },
      ],
    },
    {
      text: '模板文件',
      collapsed: true,
      items: [
        { text: '源码映射', link: '/templates/source-map' },
        { text: '大纲', link: '/templates/outline' },
        { text: '写作规范', link: '/templates/style-guide' },
        { text: '术语表', link: '/templates/glossary' },
        { text: '比喻注册表', link: '/templates/metaphor-registry' },
        { text: '章节摘要', link: '/templates/chapter-summary' },
        { text: '进度追踪', link: '/templates/checkpoint' },
        { text: '审计日志', link: '/templates/audit-log' },
      ],
    },
  ]
}

function sidebarEn() {
  return [
    {
      text: 'Guides',
      collapsed: false,
      items: [
        { text: 'How to Use Scriptorium', link: '/en/quick-start' },
        { text: 'Using with AI Tools', link: '/en/ai-tools' },
      ],
    },
    {
      text: 'Agent Specs',
      collapsed: false,
      items: [
        { text: '🏗️ System Architecture & Agent Registry', link: '/en/agents/00-system-overview' },
        { text: 'Agent #0 — Orchestrator', link: '/en/agents/01-orchestrator' },
        { text: 'Agent #1 — Architect', link: '/en/agents/02-architect' },
        { text: 'Agent #2 — Reader Advocate', link: '/en/agents/03-reader-advocate' },
        { text: 'Agent #3 — Researcher', link: '/en/agents/04-researcher' },
        { text: 'Agent #4 — Writer', link: '/en/agents/05-writer' },
        { text: 'Agent R1 — Code Reviewer', link: '/en/agents/06-code-reviewer' },
        { text: 'Agent R2 — Consistency Reviewer', link: '/en/agents/07-consistency-reviewer' },
        { text: 'Agent R3 — Content Reviewer', link: '/en/agents/08-content-reviewer' },
        { text: 'Reader Panel', link: '/en/agents/09-reader-panel' },
        { text: 'Agent #11 — Bookbinder', link: '/en/agents/10-bookbinder' },
      ],
    },
    {
      text: 'Framework',
      collapsed: false,
      items: [
        { text: '5-Phase Production Pipeline', link: '/en/framework/workflow' },
        { text: 'Stateless Agent Memory Protocol (File Pointers)', link: '/en/framework/file-pointers' },
        { text: 'DAG Batch Execution Strategy', link: '/en/framework/parallel-strategy' },
        { text: 'Triple-Parallel Review Architecture', link: '/en/framework/review-architecture' },
        { text: 'Checkpoint Recovery & Disaster Recovery', link: '/en/framework/recovery' },
      ],
    },
    {
      text: 'Templates',
      collapsed: true,
      items: [
        { text: 'Source Map', link: '/en/templates/source-map' },
        { text: 'Outline', link: '/en/templates/outline' },
        { text: 'Style Guide', link: '/en/templates/style-guide' },
        { text: 'Glossary', link: '/en/templates/glossary' },
        { text: 'Metaphor Registry', link: '/en/templates/metaphor-registry' },
        { text: 'Chapter Summaries', link: '/en/templates/chapter-summary' },
        { text: 'Progress Tracking', link: '/en/templates/checkpoint' },
        { text: 'Audit Log', link: '/en/templates/audit-log' },
      ],
    },
  ]
}

function sidebarJa() {
  return [
    {
      text: '使い方ガイド',
      collapsed: false,
      items: [
        { text: 'Scriptorium の使い方', link: '/ja/quick-start' },
      ],
    },
    {
      text: 'Agentスペック',
      collapsed: false,
      items: [
        { text: '🏗️ システムアーキテクチャ & Agentレジストリ', link: '/ja/agents/00-system-overview' },
        { text: 'Agent #0 — オーケストレーター', link: '/ja/agents/01-orchestrator' },
        { text: 'Agent #1 — アーキテクト', link: '/ja/agents/02-architect' },
        { text: 'Agent #2 — 読者アドボケート', link: '/ja/agents/03-reader-advocate' },
        { text: 'Agent #3 — リサーチャー', link: '/ja/agents/04-researcher' },
        { text: 'Agent #4 — ライター', link: '/ja/agents/05-writer' },
        { text: 'Agent R1 — コードレビュアー', link: '/ja/agents/06-code-reviewer' },
        { text: 'Agent R2 — 一貫性レビュアー', link: '/ja/agents/07-consistency-reviewer' },
        { text: 'Agent R3 — コンテンツレビュアー', link: '/ja/agents/08-content-reviewer' },
        { text: '読者パネル', link: '/ja/agents/09-reader-panel' },
        { text: 'Agent #11 — ブックバインダー', link: '/ja/agents/10-bookbinder' },
      ],
    },
    {
      text: 'フレームワーク',
      collapsed: false,
      items: [
        { text: '5フェーズ制作パイプライン', link: '/ja/framework/workflow' },
        { text: 'ステートレスAgentメモリプロトコル（File Pointers）', link: '/ja/framework/file-pointers' },
        { text: 'DAGバッチ実行戦略', link: '/ja/framework/parallel-strategy' },
        { text: '三並行レビューアーキテクチャ', link: '/ja/framework/review-architecture' },
        { text: 'チェックポイント回復と障害復旧', link: '/ja/framework/recovery' },
      ],
    },
    {
      text: 'テンプレート',
      collapsed: true,
      items: [
        { text: 'ソースマップ', link: '/ja/templates/source-map' },
        { text: 'アウトライン', link: '/ja/templates/outline' },
        { text: 'スタイルガイド', link: '/ja/templates/style-guide' },
        { text: '用語集', link: '/ja/templates/glossary' },
        { text: '比喩レジストリ', link: '/ja/templates/metaphor-registry' },
        { text: '章要約', link: '/ja/templates/chapter-summary' },
        { text: '進捗管理', link: '/ja/templates/checkpoint' },
        { text: '監査ログ', link: '/ja/templates/audit-log' },
      ],
    },
  ]
}

function sidebarZhTW() {
  return [
    {
      text: '使用指南',
      collapsed: false,
      items: [
        { text: '如何使用 Scriptorium', link: '/zh-TW/quick-start' },
      ],
    },
    {
      text: 'Agent 規格',
      collapsed: false,
      items: [
        { text: '🏗️ 系統架構與Agent註冊表', link: '/zh-TW/agents/00-system-overview' },
        { text: 'Agent #0 — 主編排', link: '/zh-TW/agents/01-orchestrator' },
        { text: 'Agent #1 — 架構師', link: '/zh-TW/agents/02-architect' },
        { text: 'Agent #2 — 讀者代言人', link: '/zh-TW/agents/03-reader-advocate' },
        { text: 'Agent #3 — 研究員', link: '/zh-TW/agents/04-researcher' },
        { text: 'Agent #4 — 作家', link: '/zh-TW/agents/05-writer' },
        { text: 'Agent R1 — 原始碼審查員', link: '/zh-TW/agents/06-code-reviewer' },
        { text: 'Agent R2 — 一致性審查員', link: '/zh-TW/agents/07-consistency-reviewer' },
        { text: 'Agent R3 — 內容審查員', link: '/zh-TW/agents/08-content-reviewer' },
        { text: '讀者評審團', link: '/zh-TW/agents/09-reader-panel' },
        { text: 'Agent #11 — 裝幀工人', link: '/zh-TW/agents/10-bookbinder' },
      ],
    },
    {
      text: '框架文件',
      collapsed: false,
      items: [
        { text: '5階段生產流水線', link: '/zh-TW/framework/workflow' },
        { text: '無狀態Agent記憶協議（File Pointers）', link: '/zh-TW/framework/file-pointers' },
        { text: 'DAG批次執行策略', link: '/zh-TW/framework/parallel-strategy' },
        { text: '三審並行架構', link: '/zh-TW/framework/review-architecture' },
        { text: '斷點恢復與容災', link: '/zh-TW/framework/recovery' },
      ],
    },
    {
      text: '模板文件',
      collapsed: true,
      items: [
        { text: '原始碼映射', link: '/zh-TW/templates/source-map' },
        { text: '大綱', link: '/zh-TW/templates/outline' },
        { text: '寫作規範', link: '/zh-TW/templates/style-guide' },
        { text: '術語表', link: '/zh-TW/templates/glossary' },
        { text: '比喻注冊表', link: '/zh-TW/templates/metaphor-registry' },
        { text: '章節摘要', link: '/zh-TW/templates/chapter-summary' },
        { text: '進度追蹤', link: '/zh-TW/templates/checkpoint' },
        { text: '審計日誌', link: '/zh-TW/templates/audit-log' },
      ],
    },
  ]
}

// ─── Markdown plugin: escape {{ }} so Vue template compiler doesn't choke ────
// Source files use {{变量名}} as literal placeholders; escape to HTML entities.

function escapeMustache(md: any) {
  md.core.ruler.push('escape_vue_interpolation', (state: any) => {
    for (const token of state.tokens) {
      if (token.type === 'inline' && token.children) {
        for (const child of token.children) {
          if (child.type === 'text' || child.type === 'html_inline') {
            child.content = child.content
              .replace(/\{\{/g, '&#123;&#123;')
              .replace(/\}\}/g, '&#125;&#125;')
          }
        }
      } else if (token.type === 'html_block') {
        token.content = token.content
          .replace(/\{\{/g, '&#123;&#123;')
          .replace(/\}\}/g, '&#125;&#125;')
      }
    }
  })
}

// ─── Main config ─────────────────────────────────────────────────────────────

export default defineConfig({
  title: 'Scriptorium',
  titleTemplate: ':title',
  description: 'Multi-Agent Technical Book Writing Framework',
  base: '/scriptorium/',

  head: [
    ['link', { rel: 'icon', href: '/scriptorium/hero.svg', type: 'image/svg+xml' }],
  ],

  // Source files contain repo-relative cross-language links that don't map to VitePress URLs
  ignoreDeadLinks: true,

  markdown: {
    config: escapeMustache,
  },

  // Follow symlinks during build; preserveSymlinks ensures node_modules resolves
  // from docs/ rather than the symlink target's real path
  vite: {
    resolve: { preserveSymlinks: true },
    server: { fs: { strict: false } },
  },

  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      description: '多Agent技术书籍编写框架',
      themeConfig: {
        nav: [
          { text: '首页', link: '/' },
          { text: 'Agents', link: '/agents/00-system-overview' },
          { text: '框架', link: '/framework/workflow' },
          { text: '模板', link: '/templates/source-map' },
        ],
        sidebar: sidebarZh(),
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      description: 'Multi-Agent Technical Book Writing Framework',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Agents', link: '/en/agents/00-system-overview' },
          { text: 'Framework', link: '/en/framework/workflow' },
          { text: 'Templates', link: '/en/templates/source-map' },
        ],
        sidebar: sidebarEn(),
      },
    },
    ja: {
      label: '日本語',
      lang: 'ja',
      description: 'マルチエージェント技術書籍執筆フレームワーク',
      themeConfig: {
        nav: [
          { text: 'ホーム', link: '/ja/' },
          { text: 'Agents', link: '/ja/agents/00-system-overview' },
          { text: 'フレームワーク', link: '/ja/framework/workflow' },
          { text: 'テンプレート', link: '/ja/templates/source-map' },
        ],
        sidebar: sidebarJa(),
      },
    },
    'zh-TW': {
      label: '繁體中文',
      lang: 'zh-TW',
      description: '多Agent技術書籍編寫框架',
      themeConfig: {
        nav: [
          { text: '首頁', link: '/zh-TW/' },
          { text: 'Agents', link: '/zh-TW/agents/00-system-overview' },
          { text: '框架', link: '/zh-TW/framework/workflow' },
          { text: '模板', link: '/zh-TW/templates/source-map' },
        ],
        sidebar: sidebarZhTW(),
      },
    },
  },

  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/lordmos/scriptorium' },
    ],
    search: {
      provider: 'local',
    },
    footer: {
      message: 'Built with <a href="https://github.com/lordmos/meridian" target="_blank">Meridian</a>',
      copyright: 'Released under the MIT License',
    },
  },
})
