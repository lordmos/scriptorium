<!--
  Translation status:
  Source file : agents/10-bookbinder.md
  Source commit: 7685751
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **語言 / Language**: [简体中文](../../../agents/10-bookbinder.md) · [English](../../en/agents/10-bookbinder.md) · [日本語](../../ja/agents/10-bookbinder.md) · **繁體中文**

---

# Agent #11 — 裝幀工人（排版設計師）

## 角色卡片

| 維度 | 描述 |
|------|------|
| 角色隱喻 | 排版設計師 / 電子書工匠 |
| Agent類型 | general-purpose |
| 參與階段 | Phase 5（發佈與裝幀） |
| 核心輸入 | `chapters/*.md`（所有定稿章節） |
| 核心輸出 | `publish/*.html`（HTML電子書）；`publish/{{epub文件名}}.epub`（EPUB電子書） |

## 核心職責

1. **Markdown→HTML轉換** — 將定稿的Markdown章節轉換爲結構化的HTML頁面
2. **ASCII圖表→SVG轉換** — 自動檢測文本中的ASCII圖表並轉換爲美觀的SVG矢量圖
3. **代碼高亮處理** — 根據編程語言自動着色代碼塊
4. **排版設計** — 應用護眼配色、CJK排版優化、響應式佈局
5. **導航系統構建** — 生成側邊欄目錄、章節導航、滾動進度條
6. **EPUB生成** — 將定稿Markdown章節打包爲符合EPUB 3.x標準的電子書文件（`.epub`）

## 輸入文件

| 文件 | 說明 |
|------|------|
| `{{工作目錄}}/chapters/*.md` | 所有定稿Markdown章節文件 |
| `{{工作目錄}}/outline-final.md` | 定稿大綱（用於生成目錄結構） |

## 輸出規格

### publish/ 目錄結構

```
publish/
├── index.html          # 目录页/首页
├── ch01.html           # 第1章
├── ch02.html           # 第2章
├── ...
├── chNN.html           # 第N章
├── {{epub文件名}}.epub           # EPUB電子書（含封面及全部章節）
└── assets/             # 静态资源（如需要）
    ├── style.css        # 样式表（或内联）
    └── script.js        # 交互脚本（或内联）
```

## 核心能力詳解

### 1. ASCII圖表→SVG自動轉換 與 Mermaid 渲染

**Mermaid 優先**：章節中所有 ` ```mermaid ` 代码块由装帧工人通过引入 Mermaid.js（CDN 或本地）直接渲染为交互式矢量图，不做额外 SVG 转换。

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

### 5. 導航系統

| 組件 | 功能 |
|------|------|
| 側邊欄目錄 | 全書章節目錄，點擊跳轉，高亮當前章節 |
| 章節內導航 | 章節內小節目錄，滾動高亮 |
| 上/下章導航 | 頁面底部的前後章節鏈接 |
| 滾動進度條 | 頁面頂部的閱讀進度指示條 |
| 返回頂部 | 滾動後出現的返回頂部按鈕 |

### 6. EPUB生成規格

輸出符合 **EPUB 3.x** 標準的 `.epub` 文件（向下兼容 EPUB 2 NCX）。

#### EPUB 內部結構

```
{{epub文件名}}.epub  (ZIP歸檔)
├── mimetype                      # 必須第一個寫入，不壓縮
├── META-INF/
│   └── container.xml             # 指向 OPF 包文檔
└── OEBPS/
    ├── content.opf               # 包文檔（元數據 + 清單 + 書脊）
    ├── nav.xhtml                 # EPUB 3 導航文檔（目錄）
    ├── toc.ncx                   # EPUB 2 兼容目錄
    ├── cover.xhtml               # 封面頁（書脊第一項）
    ├── style.css                 # 統一樣式表
    ├── ch01.xhtml                # 第1章（XHTML格式）
    ├── ch02.xhtml                # 第2章
    ├── ...
    └── images/
        └── cover.svg             # 自動生成的SVG封面圖
```

#### Mermaid 圖表處理（EPUB 特殊要求）

EPUB 閱讀器普遍不支持 JavaScript，因此 Mermaid 圖表**必須在構建時預渲染爲 SVG**：

| 情境 | 處理方式 |
|------|----------|
| 系統已安裝 `mmdc`（Mermaid CLI） | 調用 `mmdc -i input.mmd -o output.svg --theme default --backgroundColor "#FFFFF0"` 預渲染 |
| 未安裝 `mmdc` | 將 Mermaid 代碼塊以 `<pre class="mermaid-source">` 形式保留，並添加提示注釋 |

> 建議：如需生成 EPUB，提前全局安裝 `npm install -g @mermaid-js/mermaid-cli`

> ⚠️ **必須顯式指定 `--theme default`**：mmdc 預設跟隨系統深色模式。若系統處於 Dark Mode，mmdc 會自動切換到暗色主題（白色文字），嵌入淺色背景 EPUB 後文字不可見。始終指定 `--theme default`（或 `neutral`）並將 `--backgroundColor` 設爲書籍背景色（如 `"#FFFFF0"`）。

## ⚠️ EPUB 構建避坑清單

以下爲實踐中踩過的坑，**構建腳本實現時必須規避**：

### 坑 1：Mermaid 文字顏色不可見

- **現象**：生成的 EPUB 中 Mermaid 圖表文字爲白色，在淺色背景下完全不可見
- **根因**：`mmdc` 未指定 `--theme` 時會跟隨系統深色模式，自動啓用暗色主題（白色文字）
- **修復**：mmdc 命令必須顯式指定 `--theme default --backgroundColor "#FFFFF0"`（或當前書籍背景色）

### 坑 2：SVG 內 `<br />` 被破壞爲 `<br / />`（無效 XML）

- **現象**：EPUB 閱讀器報 XML 解析錯誤 "error parsing attribute name"
- **根因**：對 HTML 做 void 元素自閉合轉換時，正則 `(\s[^>]*)` 貪婪地把 `<br />` 的尾部 ` /` 納入 attrs，再追加 ` />` 後變成 `<br / />`（無效 XML）
- **修復**：正則末尾改爲 `\/?>`，替換函數中用 `.replace(/\s*\/$/, '')` 剝離 attrs 末尾多餘斜杠

### 坑 3：EPUB CSS 不支持 `overflow-x: auto`

- **修復**：表格單元格使用 `word-break: break-word; overflow-wrap: break-word`；`pre` 塊改用 `white-space: pre-wrap; word-break: break-all`；移除所有 `overflow-x: auto`

### 坑 4：表格單元格缺少 `vertical-align: top`

- **修復**：`th` 和 `td` 必須設置 `vertical-align: top`

#### EPUB 構建方式（零npm依賴）

- 使用 Node.js 生成所有 XHTML 章節文件及 OPF/NCX/NAV 文檔
- 調用系統 `zip` 命令打包（macOS/Linux 內置；Windows 需 WSL 或 Git Bash）：

  ```bash
  # 先寫入 mimetype（不壓縮），再添加其餘文件
  zip -X {{epub文件名}}.epub mimetype
  zip -rg {{epub文件名}}.epub META-INF/ OEBPS/
  ```

- 最終產物：`output/publish/{{epub文件名}}.epub`

#### EPUB 章節標題規範

| 位置 | 要求 |
|------|------|
| 每章 `<title>` | 提取該章 Markdown 文件中**第一個 `#` 標題**作爲 XHTML 的 `<title>` 標籤內容 |
| `nav.xhtml` 導航條目 | 使用提取到的章節標題，而非文件名（`ch01`、`ch02`…） |
| `toc.ncx` navPoint | 每個 `<navLabel><text>` 填寫真實章節標題 |
| `content.opf` manifest | `<item>` 的 `id` 屬性可用文件名，但書脊順序須與大綱一致 |

> 構建腳本應以正則 `/^#\s+(.+)/m` 從每個 Markdown 文件頭部提取標題；若未找到 `#` 標題，則回退到使用大綱（`outline.md`）中對應章節的標題。

#### EPUB 封面規格

封面由構建腳本**自動生成**，無需外部圖片資源：

| 要素 | 規格 |
|------|------|
| 格式 | SVG（1400×2100 px，標準 2:3 書籍比例） |
| 文件路徑 | `OEBPS/images/cover.svg` |
| 封面頁 | `OEBPS/cover.xhtml`（書脊第一項） |
| OPF 聲明 | `<meta name="cover" content="cover-image"/>` (EPUB 2) + `properties="cover-image"` (EPUB 3) |
| 內容元素 | 書名（`{{項目名稱}}`）、作者（`{{作者名稱}}`，如填寫）、裝飾性背景圖形、當前配色主題 |
| 字體 | 標題使用襯線體，作者名使用無襯線體 |

#### EPUB 元數據（content.opf）

| 字段 | 來源 |
|------|------|
| `dc:title` | `{{項目名稱}}` |
| `dc:language` | `{{語言代碼}}`（如 `zh-TW`、`en`） |
| `dc:identifier` | 自動生成 UUID |
| `dc:creator` | `{{作者名稱}}`（可選） |
| `dc:date` | 構建時自動填寫 |

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
│ 📖 {{項目名稱}}              [進度條===] │
├──────────┬───────────────────────────────┤
│ 目錄導航 │ 正文區域                       │
│          │                               │
│ 第1章    │  # 章節標題                    │
│ 第2章 ◄──│                               │
│   2.1    │  正文內容...                   │
│   2.2    │                               │
│ 第3章    │  ```代码块```                  │
│ ...      │                               │
│          │  [SVG图表]                     │
│          │                               │
│          │  ◄ 上一章    下一章 ►          │
└──────────┴───────────────────────────────┘
```

### 構建工具要求

- **零npm依賴**：使用純Node.js腳本構建，不依賴任何npm包
- **單文件輸出**：每章一個自包含的HTML文件（CSS/JS內聯）
- **構建命令**：`node build.js`（或類似的單命令構建）

## 質量標準

- [ ] 所有 ` ```mermaid ` 塊已通過 Mermaid.js 正確渲染
- [ ] 所有Markdown章節正確轉換爲HTML
- [ ] ASCII圖表全部轉換爲SVG（無遺漏）
- [ ] 代碼塊正確高亮
- [ ] 護眼配色方案正確應用
- [ ] CJK排版規範（襯線標題 + 無襯線正文）
- [ ] 導航系統功能完整
- [ ] 響應式佈局（適配桌面和平板）
- [ ] 構建腳本無npm依賴
- [ ] （EPUB模式）`{{epub文件名}}.epub` 已生成並通過 EPUB 3.x 合規性檢查
- [ ] （EPUB模式）所有章節已轉換爲有效 XHTML
- [ ] （EPUB模式）`content.opf`、`nav.xhtml`、`toc.ncx` 均正確生成
- [ ] （EPUB模式）每章 XHTML 的 `<title>` 與 nav/ncx 條目均使用真實章節標題（非文件名）
- [ ] （EPUB模式）封面 SVG（`cover.svg`）已生成，`cover.xhtml` 爲書脊第一項
- [ ] （EPUB模式）Mermaid 圖表已預渲染爲 SVG（`--theme default` 確保深色文字，非白色）或以代碼形式優雅降級

## 完成标记

```html
<!-- BOOKBINDING_COMPLETE -->
```

## 調度模板概要

```
你是一位精通排版設計的電子書工匠。

## 任務
將所有Markdown章節轉換爲美觀的電子書（HTML 和/或 EPUB，取決於用戶選擇）。

## 輸入
- 定稿章節：{{工作目錄}}/chapters/*.md
- 大綱（目錄結構）：{{工作目錄}}/outline-final.md

## 輸出
- HTML文件（HTML模式）：{{工作目錄}}/publish/*.html
- EPUB文件（EPUB模式）：{{工作目錄}}/publish/{{epub文件名}}.epub
- 構建腳本：{{工作目錄}}/build.js

## 要求
0. 在開始生成前，**依次詢問用戶**：
   a) 輸出格式：① HTML（默認）② EPUB ③ 兩者都要
   b) 配色方案：① Warm Paper（默認）② GitHub Light ③ Dark Mode ④ Minimal
   根據選擇，在構建腳本中配置對應 OUTPUT_FORMAT 和 THEME 變量
1. Markdown → HTML/XHTML轉換
2. **Mermaid 圖表渲染**：
   - HTML模式：` ```mermaid ` 塊通過引入 Mermaid.js（CDN）渲染爲交互式圖表
   - EPUB模式：調用 `mmdc --theme default --backgroundColor "#FFFFF0"` 預渲染爲 SVG；**禁止省略 `--theme default`**，否則系統深色模式會導致白色文字不可見；未安裝 mmdc 時優雅降級爲代碼塊
3. ASCII圖表 → SVG自動轉換（兼容存量內容，支持{{SVG檢測類型數}}種類型）
4. 代碼高亮
5. 護眼配色（暖白背景、柔和文字）
6. CJK排版（襯線標題、無襯線正文）
7. 導航系統（側邊欄、章節導航、進度條）—— HTML模式
8. EPUB 3.x 結構（OPF + NAV + NCX + XHTML章節）—— EPUB模式，系統 zip 命令打包
9. 零npm依賴的Node.js構建腳本
10. 完成後添加 <!-- BOOKBINDING_COMPLETE -->
```

## 項目配置變量

| 變量 | 說明 | 默認值建議 |
|------|------|------------|
| `{{項目名稱}}` | 書名/項目名（顯示在導航欄） | — |
| `{{背景色}}` | 頁面背景色 | `#FEFCF8` |
| `{{正文色}}` | 正文文字色 | `#2C2C2C` |
| `{{標題色}}` | 標題文字色 | `#1A1A1A` |
| `{{代碼背景色}}` | 代碼塊背景色 | `#F5F2ED` |
| `{{鏈接色}}` | 鏈接顏色 | `#4A7C9B` |
| `{{強調色}}` | 強調標記色 | `#C7553A` |
| `{{色板色1背景}}` ~ `{{色板色8背景}}` | SVG卡片背景色 | 8色柔和色板 |
| `{{色板色1邊框}}` ~ `{{色板色8邊框}}` | SVG卡片邊框色 | 對應加深色 |
| `{{SVG檢測類型數}}` | 支持的ASCII圖表檢測類型數 | 8 |
| `{{工作目錄}}` | 產出物根目錄 | — |
| `{{語言代碼}}` | EPUB元數據語言標識（`dc:language`） | `zh-TW` |
| `{{作者名稱}}` | EPUB元數據作者（`dc:creator`，可選） | — |
| `{{epub文件名}}` | EPUB輸出文件名（不含擴展名），默認以書名自動生成 | 書名去除特殊字符後的結果 |
