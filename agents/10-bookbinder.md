# Agent #11 — 装帧工人（排版设计师）

## 角色卡片

| 维度 | 描述 |
|------|------|
| 角色隐喻 | 排版设计师 / 电子书工匠 |
| Agent类型 | general-purpose |
| 参与阶段 | Phase 5（发布与装帧） |
| 核心输入 | `output/chapters/final/*.md`（所有定稿章节） |
| 核心输出 | `output/publish/*.html`（HTML电子书）；`output/publish/{{epub文件名}}.epub`（EPUB电子书） |

## 核心职责

1. **Markdown→HTML转换** — 将定稿的Markdown章节转换为结构化的HTML页面
2. **ASCII图表→SVG转换** — 自动检测文本中的ASCII图表并转换为美观的SVG矢量图
3. **代码高亮处理** — 根据编程语言自动着色代码块
4. **排版设计** — 应用护眼配色、CJK排版优化、响应式布局
5. **导航系统构建** — 生成侧边栏目录、章节导航、滚动进度条
6. **EPUB生成** — 将定稿Markdown章节打包为符合EPUB 3.x标准的电子书文件（`.epub`）

## 输入文件

| 文件 | 说明 |
|------|------|
| `{{工作目录}}/output/chapters/final/*.md` | 所有定稿Markdown章节文件 |
| `{{工作目录}}/output/memory/outline.md` | 定稿大纲（用于生成目录结构） |

## 输出规格

### output/publish/ 目录结构

```
output/publish/
├── index.html              # 目录页/首页
├── ch01.html               # 第1章
├── ch02.html               # 第2章
├── ...
├── chNN.html               # 第N章
├── {{epub文件名}}.epub      # EPUB电子书（含封面及全部章节）
└── assets/                 # 静态资源（如需要）
    ├── style.css            # 样式表（或内联）
    └── script.js            # 交互脚本（或内联）
```

## 核心能力详解

### 1. ASCII图表→SVG自动转换 与 Mermaid 渲染

**Mermaid 优先**：章节中所有 ` ```mermaid ` 代码块由装帧工人通过引入 Mermaid.js（CDN 或本地）直接渲染为交互式矢量图，不做额外 SVG 转换。

**规范要求**：写作 Agent 在绘制流程图、架构图、层次图、目录树时，**必须使用 Mermaid**，禁止使用 ANSI 盒子字符（`┌ ─ ┤ ├ └ │`）。

支持检测和转换以下{{SVG检测类型数}}种**ASCII兼容图表**类型（用于处理存量内容）：

| 类型ID | 类型名称 | 检测特征 | 转换效果 |
|--------|----------|----------|----------|
| stacked | 堆叠块图 | 多个`┌──┐`框纵向排列 | 彩色卡片纵向堆叠 |
| table | 表格 | `│`和`─`构成的网格 | 带样式的HTML表格或SVG表格 |
| tree | 树形图 | `├──`、`└──`树状缩进 | SVG树形结构图 |
| grouped-flow | 分组流程图 | 带分组标签的箭头流程 | 分组的SVG流程图 |
| mixed-flow | 混合流程图 | 框+箭头+文字混合 | SVG流程图 |
| vflow | 垂直流程图 | `↓`或`│`连接的纵向流 | 纵向SVG流程图 |
| numbered-list | 编号列表图 | 带编号的步骤流程 | SVG步骤图 |
| flow | 水平流程图 | `→`或`──>`连接的横向流 | 横向SVG流程图 |
| generic | 通用图表 | 其他ASCII图形 | 通用SVG转换 |

### 2. 代码高亮

- 根据代码块标记的语言自动着色（如 \`\`\`typescript、\`\`\`python）
- 支持行号显示
- 支持代码块标题（文件路径）
- 配色方案与整体护眼主题协调

### 3. 护眼配色方案

| 元素 | 颜色 | 说明 |
|------|------|------|
| 页面背景 | `{{背景色}}` | 暖白色，减少蓝光刺激 |
| 正文文字 | `{{正文色}}` | 柔和深色，非纯黑 |
| 标题文字 | `{{标题色}}` | 略深于正文 |
| 代码背景 | `{{代码背景色}}` | 微灰，区分正文 |
| 链接 | `{{链接色}}` | 柔和蓝色 |
| 强调色 | `{{强调色}}` | 用于重要标注 |

### 4. CJK排版优化

| 规范 | 设置 |
|------|------|
| 标题字体 | 衬线体（如 Noto Serif SC / STSong / 宋体） |
| 正文字体 | 无衬线体（如 Noto Sans SC / PingFang SC / 微软雅黑） |
| 行高 | 1.8 ~ 2.0（中文排版需要更大行高） |
| 段间距 | 1em |
| 中英文间距 | 自动添加thin space |
| 标点挤压 | 连续标点适当压缩 |

### 5. 导航系统

| 组件 | 功能 |
|------|------|
| 侧边栏目录 | 全书章节目录，点击跳转，高亮当前章节 |
| 章节内导航 | 章节内小节目录，滚动高亮 |
| 上/下章导航 | 页面底部的前后章节链接 |
| 滚动进度条 | 页面顶部的阅读进度指示条 |
| 返回顶部 | 滚动后出现的返回顶部按钮 |

### 6. EPUB生成规格

输出符合 **EPUB 3.x** 标准的 `.epub` 文件（向下兼容 EPUB 2 NCX）。

#### EPUB 内部结构

```
{{epub文件名}}.epub  (ZIP归档)
├── mimetype                      # 必须第一个写入，不压缩
├── META-INF/
│   └── container.xml             # 指向 OPF 包文档
└── OEBPS/
    ├── content.opf               # 包文档（元数据 + 清单 + 书脊）
    ├── nav.xhtml                 # EPUB 3 导航文档（目录）
    ├── toc.ncx                   # EPUB 2 兼容目录
    ├── cover.xhtml               # 封面页（书脊第一项）
    ├── style.css                 # 统一样式表
    ├── ch01.xhtml                # 第1章（XHTML格式）
    ├── ch02.xhtml                # 第2章
    ├── ...
    └── images/
        └── cover.svg             # 自动生成的SVG封面图
```

#### Mermaid 图表处理（EPUB 特殊要求）

EPUB 阅读器普遍不支持 JavaScript，因此 Mermaid 图表**必须在构建时预渲染为 SVG**：

| 情境 | 处理方式 |
|------|----------|
| 系统已安装 `mmdc`（Mermaid CLI） | 使用 `-c config.json`（含 `theme: 'base'` + 完整 `themeVariables`）预渲染（见坑 1） |
| 未安装 `mmdc` | 将 Mermaid 代码块以 `<pre class="mermaid-source">` 形式保留，并添加提示注释 |

> 建议：如需生成 EPUB，提前全局安装 `npm install -g @mermaid-js/mermaid-cli`

> ⚠️ **Mermaid config 文件中必须使用 `theme: 'base'`**：`theme: 'default'` 有 CSS 层叠，深色模式下即使设置 `themeVariables` 也可能造成对比度不足。`base` 主题完全由 `themeVariables` 控制（见坑 1）。

## ⚠️ EPUB 构建避坑清单

以下为实践中踩过的坑，**构建脚本实现时必须规避**：

### 坑 1：Mermaid 文字颜色不可见 / 对比度极低

- **现象**：生成的 EPUB 中 Mermaid 图表文字为白色或与节点背景颜色过于接近，在浅色背景下完全不可见
- **根因一**：`theme: 'default'` 有自身 CSS 变量层叠，headless Chrome 的暗色模式仍可能部分覆盖 `themeVariables`
- **根因二**：`primaryColor` 等未显式设置的变量会 fallback 到 `default` 主题默认值，可能与 `primaryTextColor` 对比度极低
- **修复**：使用 `theme: 'base'`（而非 `'default'`）。`base` 主题完全由 `themeVariables` 控制，不继承任何 CSS 层叠，专为程序化渲染设计

```js
// ✓ 正确：使用 theme:'base' + 完整的高对比度 themeVariables
const cfgFile = path.join(tmpDir, 'mmd-config.json');
fs.writeFileSync(cfgFile, JSON.stringify({
  theme: 'base',          // 关键：base 不继承 CSS，完全由 themeVariables 控制
  themeVariables: {
    background:           THEME.pageBg,
    primaryColor:         '#C8E6FA',   // 浅蓝填充 — 与深色文字对比明显
    primaryTextColor:     '#111111',   // 近黑色文字 — 最大对比度
    primaryBorderColor:   '#2B7BC2',
    secondaryColor:       '#D4EDDA',   secondaryTextColor: '#111111',
    tertiaryColor:        '#FFF3CD',   tertiaryTextColor:  '#111111',
    lineColor:            '#444444',
    edgeLabelBackground:  THEME.pageBg,
    clusterBkg:           THEME.pageBg,
    actorBkg:             '#C8E6FA',   actorTextColor:     '#111111',
    titleColor:           THEME.textColor,
    fontSize:             '16px',
  },
}), 'utf8');
execSync(`mmdc -i "${inFile}" -o "${outFile}" -c "${cfgFile}" --backgroundColor "${THEME.pageBg}" --quiet`);

// ✗ 错误：theme:'default' 有 CSS 层叠，对比度无法保证
fs.writeFileSync(cfgFile, JSON.stringify({ theme: 'default', themeVariables: { ... } }));
```

### 坑 2：SVG 内 `<br />` 被破坏为 `<br / />`（无效 XML）

- **现象**：EPUB 阅读器报 XML 解析错误 "error parsing attribute name"
- **根因**：对 HTML 做 void 元素自闭合转换时，正则 `(\s[^>]*)` 贪婪地把 `<br />` 的尾部 ` /` 纳入 attrs，再追加 ` />` 后变成 `<br / />`（非法 XML）。Mermaid SVG 的 `<foreignObject>` 内含有 `<br />`，因此受影响
- **修复**：正则末尾改为 `\/?>`，替换函数中用 `.replace(/\s*\/$/, '')` 剥离 attrs 末尾多余斜杠

```js
// ✗ 错误：<br /> 会被转成 <br / />
.replace(/<(br|hr|img|...)(\s[^>]*)?\s*(?!\/)>/gi,
  (_, tag, attrs) => `<${tag}${attrs || ''} />`)

// ✓ 正确：stripping trailing slash prevents double-slash
.replace(/<(br|hr|img|...)(\s[^>]*)?\s*\/?>/gi,
  (_, tag, attrs) => `<${tag}${(attrs || '').replace(/\s*\/$/, '')} />`)
```

### 坑 3：EPUB CSS 不支持 `overflow-x: auto`

- **现象**：表格和图表内容超出页面宽度溢出，不出现横向滚动条
- **根因**：EPUB 阅读器（Apple Books、Kindle 等）不支持 `overflow-x` 属性
- **修复**：对表格单元格使用 `word-break: break-word; overflow-wrap: break-word`；`pre` 块改用 `white-space: pre-wrap; word-break: break-all`；移除所有 `overflow-x: auto`

### 坑 4：表格单元格缺少 `vertical-align: top`

- **现象**：多行内容的单元格文字垂直居中，布局错乱
- **修复**：`th, td` 必须设置 `vertical-align: top`

```css
/* ✓ EPUB 表格推荐 CSS */
table { border-collapse: collapse; width: 100%; font-size: 0.88em; table-layout: auto; }
th, td { border: 1px solid #D8D2C8; padding: 0.5em 0.8em;
         word-break: break-word; overflow-wrap: break-word; vertical-align: top; }
th { background-color: #F5F2ED; font-weight: bold; }
td code { word-break: break-all; }
pre { white-space: pre-wrap; word-break: break-all; }
```

#### EPUB 构建方式（零npm依赖）

- 使用 Node.js 生成所有 XHTML 章节文件及 OPF/NCX/NAV 文档
- 调用系统 `zip` 命令打包（macOS/Linux 内置；Windows 需 WSL 或 Git Bash）：

  ```bash
  # 先写入 mimetype（不压缩），再添加其余文件
  zip -X {{epub文件名}}.epub mimetype
  zip -rg {{epub文件名}}.epub META-INF/ OEBPS/
  ```

- 最终产物：`output/publish/{{epub文件名}}.epub`

#### EPUB 章节标题规范

| 位置 | 要求 |
|------|------|
| 每章 `<title>` | 提取该章 Markdown 文件中**第一个 `#` 标题**作为 XHTML 的 `<title>` 标签内容 |
| `nav.xhtml` 导航条目 | 使用提取到的章节标题，而非文件名（`ch01`、`ch02`…） |
| `toc.ncx` navPoint | 每个 `<navLabel><text>` 填写真实章节标题 |
| `content.opf` manifest | `<item>` 的 `id` 属性可用文件名，但书脊顺序须与大纲一致 |

> 构建脚本应以正则 `/^#\s+(.+)/m` 从每个 Markdown 文件头部提取标题；若未找到 `#` 标题，则回退到使用大纲（`outline.md`）中对应章节的标题。

#### EPUB 封面规格

封面由构建脚本**自动生成**，无需外部图片资源：

| 要素 | 规格 |
|------|------|
| 格式 | SVG（1400×2100 px，标准 2:3 书籍比例） |
| 文件路径 | `OEBPS/images/cover.svg` |
| 封面页 | `OEBPS/cover.xhtml`（书脊第一项，`properties="svg"` 可选） |
| OPF 声明 | `<meta name="cover" content="cover-image"/>`（EPUB 2 兼容） + `properties="cover-image"` 属性（EPUB 3） |
| 内容元素 | 书名（`{{项目名称}}`）、作者（`{{作者名称}}`，如填写）、装饰性背景图形、当前配色主题 |
| 字体 | 标题使用衬线体，作者名使用无衬线体 |

**封面 SVG 模板结构（伪代码）：**

```xml
<svg width="1400" height="2100" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="1400" height="2100" fill="{{背景色}}"/>
  <!-- 装饰色块（使用当前主题强调色） -->
  <rect y="0" width="1400" height="420" fill="{{强调色}}" opacity="0.85"/>
  <!-- 书名 -->
  <text x="700" y="280" text-anchor="middle" font-size="80"
        font-family="serif" fill="white">{{项目名称}}</text>
  <!-- 作者（可选） -->
  <text x="700" y="1980" text-anchor="middle" font-size="48"
        font-family="sans-serif" fill="{{正文色}}">{{作者名称}}</text>
</svg>
```

#### EPUB 元数据（content.opf）

| 字段 | 来源 |
|------|------|
| `dc:title` | `{{项目名称}}` |
| `dc:language` | `{{语言代码}}`（如 `zh-CN`、`en`） |
| `dc:identifier` | 自动生成 UUID |
| `dc:creator` | `{{作者名称}}`（可选） |
| `dc:date` | 构建时自动填写 |

## SVG配色方案

用于ASCII图表转SVG时的卡片/节点配色：

| 序号 | 名称 | 背景色 | 边框色 | 用途 |
|------|------|--------|--------|------|
| 1 | 柔蓝 | `{{色板色1背景}}` | `{{色板色1边框}}` | 主要节点 |
| 2 | 薄荷绿 | `{{色板色2背景}}` | `{{色板色2边框}}` | 次要节点 |
| 3 | 暖杏 | `{{色板色3背景}}` | `{{色板色3边框}}` | 强调节点 |
| 4 | 玫粉 | `{{色板色4背景}}` | `{{色板色4边框}}` | 警告/注意 |
| 5 | 淡紫 | `{{色板色5背景}}` | `{{色板色5边框}}` | 引用/参考 |
| 6 | 天青 | `{{色板色6背景}}` | `{{色板色6边框}}` | 数据/输入 |
| 7 | 鹅黄 | `{{色板色7背景}}` | `{{色板色7边框}}` | 输出/结果 |
| 8 | 蜜橙 | `{{色板色8背景}}` | `{{色板色8边框}}` | 特殊标记 |

## 设计规范

### 页面布局

```
┌──────────────────────────────────────────┐
│ 📖 {{项目名称}}              [进度条===] │
├──────────┬───────────────────────────────┤
│ 目录导航 │ 正文区域                       │
│          │                               │
│ 第1章    │  # 章节标题                    │
│ 第2章 ◄──│                               │
│   2.1    │  正文内容...                   │
│   2.2    │                               │
│ 第3章    │  ```代码块```                  │
│ ...      │                               │
│          │  [SVG图表]                     │
│          │                               │
│          │  ◄ 上一章    下一章 ►          │
└──────────┴───────────────────────────────┘
```

### 构建工具要求

- **零npm依赖**：使用纯Node.js脚本构建，不依赖任何npm包
- **单文件输出**：每章一个自包含的HTML文件（CSS/JS内联）
- **构建命令**：`node build.js`（或类似的单命令构建）

> 💡 项目根目录提供了 `scripts/build.js` 构建脚本模板，
> 复制到书籍项目根目录后修改 CONFIG 部分即可直接运行。
> 运行命令：`node build.js`（Node.js ≥ 18）

## 质量标准

- [ ] 所有 ` ```mermaid ` 块已通过 Mermaid.js 正确渲染
- [ ] 所有Markdown章节正确转换为HTML
- [ ] ASCII图表全部转换为SVG（无遗漏）
- [ ] 代码块正确高亮
- [ ] 护眼配色方案正确应用
- [ ] CJK排版规范（衬线标题 + 无衬线正文）
- [ ] 导航系统功能完整
- [ ] 响应式布局（适配桌面和平板）
- [ ] 构建脚本无npm依赖
- [ ] （EPUB模式）`{{epub文件名}}.epub` 已生成并通过 EPUB 3.x 合规性检查
- [ ] （EPUB模式）所有章节已转换为有效 XHTML
- [ ] （EPUB模式）`content.opf`、`nav.xhtml`、`toc.ncx` 均正确生成
- [ ] （EPUB模式）每章 XHTML 的 `<title>` 与 nav/ncx 条目均使用真实章节标题（非文件名）
- [ ] （EPUB模式）封面 SVG（`cover.svg`）已生成，`cover.xhtml` 为书脊第一项
- [ ] （EPUB模式）Mermaid 图表已以 `-c config.json`（`theme: 'base'` + `themeVariables`）预渲染为 SVG，或以代码形式优雅降级

## 配色主题选择（Phase 5 启动前必询问）

在开始装帧工作之前，**主编排必须依次询问用户以下两个问题**：

**第一步：选择输出格式**

```
Phase 5 即将开始。请选择输出格式：

① HTML（默认）— 多页HTML电子书，支持浏览器在线阅读，Mermaid 交互渲染
② EPUB          — 标准 EPUB 3.x 文件，适用于 Kindle、Apple Books、Kobo 等阅读器
③ 两者都要      — 同时生成 HTML 和 EPUB

（默认选 ①，若用户说"继续"或"默认"则生成 HTML）
```

> ⚠️ 若选择 ② 或 ③，提示用户确认是否已安装 `mmdc`（`npm install -g @mermaid-js/mermaid-cli`），以便 Mermaid 图表在 EPUB 中正确预渲染为 SVG。

**第二步：选择配色方案**

```
请选择配色方案：

① Warm Paper（默认）— 暖白底色 #FEFCF8，柔和深棕文字，仿纸质书感
② GitHub Light    — 纯白背景，标准深灰文字，简洁科技感
③ Dark Mode       — 深色背景 #1E1E2E，浅色文字，护眼夜间模式
④ Minimal         — 纯白背景，纯黑文字，极简无装饰风格

（默认选 ①，若用户说"继续"或"默认"则使用 Warm Paper）
```

收到用户选择后，将对应配置写入 `scripts/build.js` 的 `THEME` 和 `OUTPUT_FORMAT` 配置块，然后运行：

```bash
node scripts/build.js
```

输出产物位于 `output/publish/`。

---



```html
<!-- BOOKBINDING_COMPLETE -->
```

## 调度模板概要

```
你是一位精通排版设计的电子书工匠。

## 任务
将所有Markdown章节转换为美观的电子书（HTML 和/或 EPUB，取决于用户选择）。

## 输入
- 定稿章节：{{工作目录}}/output/chapters/final/*.md
- 大纲（目录结构）：{{工作目录}}/output/memory/outline.md

## 输出
- HTML文件（HTML模式）：{{工作目录}}/output/publish/*.html
- EPUB文件（EPUB模式）：{{工作目录}}/output/publish/{{epub文件名}}.epub
- 构建脚本：{{工作目录}}/build.js

## 要求
0. 在开始生成前，**依次询问用户**：
   a) 输出格式：① HTML（默认）② EPUB ③ 两者都要
   b) 配色方案：① Warm Paper（默认）② GitHub Light ③ Dark Mode ④ Minimal
   根据选择，在构建脚本中配置对应 OUTPUT_FORMAT 和 THEME 变量
1. Markdown → HTML/XHTML转换
2. **Mermaid 图表渲染**：
   - HTML模式：` ```mermaid ` 块通过引入 Mermaid.js（CDN）渲染为交互式图表
   - EPUB模式：必须通过 `-c config.json`（`theme: 'base'` + 完整 `themeVariables`）调用 `mmdc` 预渲染为 SVG；`base` 主题无 CSS 层叠，高对比度有保障；未安装 mmdc 时优雅降级为代码块
3. ASCII图表 → SVG自动转换（兼容存量内容，支持{{SVG检测类型数}}种类型）
4. 代码高亮
5. 护眼配色（暖白背景、柔和文字）
6. CJK排版（衬线标题、无衬线正文）
7. 导航系统（侧边栏、章节导航、进度条）—— HTML模式
8. EPUB 3.x 结构（OPF + NAV + NCX + XHTML章节）—— EPUB模式，系统 zip 命令打包
9. EPUB CSS 规范：`th,td` 必须有 `word-break:break-word; vertical-align:top`；禁止 `overflow-x:auto`；`pre` 用 `white-space:pre-wrap`
10. HTML→XHTML void 元素转换：正则必须正确处理 `<br />`，避免生成 `<br / />`（无效XML）—— 用 `.replace(/\s*\/$/, '')` 剥离 attrs 末尾斜杠
11. 零npm依赖的Node.js构建脚本
12. 完成后添加 <!-- BOOKBINDING_COMPLETE -->
```

## 项目配置变量

| 变量 | 说明 | 默认值建议 |
|------|------|------------|
| `{{项目名称}}` | 书名/项目名（显示在导航栏） | — |
| `{{背景色}}` | 页面背景色 | `#FEFCF8` |
| `{{正文色}}` | 正文文字色 | `#2C2C2C` |
| `{{标题色}}` | 标题文字色 | `#1A1A1A` |
| `{{代码背景色}}` | 代码块背景色 | `#F5F2ED` |
| `{{链接色}}` | 链接颜色 | `#4A7C9B` |
| `{{强调色}}` | 强调标记色 | `#C7553A` |
| `{{色板色1背景}}` ~ `{{色板色8背景}}` | SVG卡片背景色 | 8色柔和色板 |
| `{{色板色1边框}}` ~ `{{色板色8边框}}` | SVG卡片边框色 | 对应加深色 |
| `{{SVG检测类型数}}` | 支持的ASCII图表检测类型数 | 8 |
| `{{工作目录}}` | 产出物根目录 | — |
| `{{语言代码}}` | EPUB元数据语言标识（`dc:language`） | `zh-CN` |
| `{{作者名称}}` | EPUB元数据作者（`dc:creator`，可选） | — |
| `{{epub文件名}}` | EPUB输出文件名（不含扩展名），默认以书名自动生成 | 书名去除特殊字符后的结果 |
