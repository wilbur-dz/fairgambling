# Casinos（Ranking）页面模块与数据来源

本文档对照参考实现 `CasinosView`（`3y3noe8bca745.js`）列出 `/casinos` 页各模块、职责，以及线上数据来源。  
本仓库已按此表落地：`app/(main)/casinos/page.tsx` → `CasinosView` + `lib/casinos/*`；失败时回退 Mock（`CASINOS_API_FALLBACK_MOCK` / `HOME_API_FALLBACK_MOCK`）。

参考入口：

```js
CasinosView({ initialBundle, initialRatingsMap })
// useCasinoOverviewData({ initialBundle, initialRatingsMap, defaultSortKey: 'fgRating' })
// → casinos / loading / search / sort / filters
```

基础 API Host：`API_URL`（参考站为 `https://api.fairgambling.com`）。

---

## 模块一览（渲染顺序）

| # | 参考符号 | 建议组件（本仓库） | 模块名称 | 数据从哪来 |
|---|----------|-------------------|----------|------------|
| 0 | `CasinosView` | `CasinosView` | 页面壳：状态 + 组装 | SSR：`initialBundle` + `initialRatingsMap`；客户端：`useCasinoOverviewData` |
| 1 | `N` | `CasinosToolbar` | 搜索 / Rating↔Compare / 排序 Tab / 视图切换 / 赌场多选 | **UI 状态为主**；Tab 常量见下；赌场选项来自 hook 内 `casinos` |
| 2 | `H` | `CasinosGrid` | Grid 列表（可展开卡片） | `useCasinoOverviewData().casinos`（已搜索/排序/过滤） |
| 3 | `Y` | `CasinoGridCard` | 单卡摘要行（rank / logo / rating / reviews / vol / tags） | 单条 casino 行数据（见「行模型」） |
| 4 | `B` | `CasinoGridCardExpanded` | 展开区：存款量 / Games / 评分条 / Review CTA | 行数据 + `lookupCasinoRating(slug)` / `_ratingData` |
| 5 | `M` | `CasinosAffiliateBanner` | 「Earn Wager Share」横幅（插在 Grid 第 8 条后） | **无 API**，静态文案；CTA → `/affiliate` |
| 6 | `eo` | `CasinosCompareTable` | Table 对比视图（多列、横向滚动与 Tab 联动） | 同上 `casinos`；列定义来自前端常量 + `categories` / `majorHouseGames` / `majorGameProviders` |
| 7 | `P` | （grid skeleton） | Grid 加载骨架 | `loading === true` 时本地生成 |
| — | （table skeleton） | （table skeleton） | Table 加载骨架 | 同上 |

布局与参考一致：

1. `CasinosToolbar` 全宽  
2. `viewMode === 'grid'` → `CasinosGrid`（卡片列表，index `7` 后插入 Affiliate Banner）  
3. `viewMode === 'table'` → `CasinosCompareTable`

---

## 1. `CasinosToolbar`（参考 `N`，源码约 L24–187）

控件与数据：

| 控件 | 行为 | 数据/常量来源 |
|------|------|----------------|
| Search input | `searchValue` / `onSearchChange` | 客户端状态；过滤 `casinos` 名称 |
| Rating / Compare Tabs | `activeId: 'rating'`；选 Compare → `router.push('/casinos/compare')` | **无列表数据**；路由跳转 |
| Grid 排序 Tabs | `fgRating` / `depositVolume30d` / `userReviews` | 前端常量 `v`（L46–50） |
| Table 分类 Tabs | `basicInfo` / `gamesInfo` / `bonusing` / `complianceRG` / `games` | 前端常量 `categories`（模块 `839128`） |
| Grid / Table 视图切换 | `viewMode`: `grid` \| `table` | 前端常量 `w` + lucide `LayoutGrid` / `List` |
| All Casinos Dropdown | 多选过滤（仅 table 模式） | `casinoOptions`：由当前 `casinos` 按 `fgRating` 排序映射 `{ value, label: name }` |

本模块**不直接打 API**，只消费 hook 状态。

---

## 2. `CasinosGrid` + `CasinoGridCard` + Expanded（参考 `H` / `Y` / `B`）

### 列表数据流

```
SSR initialBundle / initialRatingsMap
        │
        ▼
useCasinoOverviewData
  ├─ getCasinosBundle()          → GET /api/analytics/casinos-bundle
  │     fallback:
  │       getMarketBreakdown(period) → GET /api/analytics/market-breakdown?period=
  │       getCasinos({ limit: 100 }) → GET /api/casinos?limit=100
  ├─ fetchCasinoRatingsMapClient → GET /api/casinos/:slug/rating（缺 slug 补齐）
  └─ 合并 meta + rating + breakdown → OverviewCasino 行
        │
        ▼
search / sort / filters → CasinosGrid / CasinosCompareTable
```

### 行模型主要字段（来自合并，非单一 endpoint）

| 字段 | 来源 |
|------|------|
| `name` / `slug` / `logoUrl` / `averageRating` / `reviewCount` / `trustScore` / `meta` | `GET /api/casinos` 或 `casinos-bundle.casinos` |
| `depositVolume7d/30d/90d/365d`（展示字符串）+ raw 数值 | `breakdown{7d,30d,90d,365d}` ← `casinos-bundle` 或 `market-breakdown` |
| `fgRating` / `founded` / `estimatedNgr` / `bonusRating` / `estRakeback*` / `leaderboardSize` / 分类分 | `GET /api/casinos/:slug/rating`（`ratingsMap` / `lookupCasinoRating`） |
| `license` / `kyc` / `provablyFair` / `houseGames` / `providers` / `sportsbook` / `avgHouseEdge` 等 | `casino.meta`（overview / fairness / compliance / games / RG）+ rating 覆盖 |
| `hasCodeFeed` | 前端硬编码 slug 集合（stake / shuffle / winna / thrill / roobet / razed / rainbet / goated / gamba） |
| `hasSeedAnalyzer` | `meta.overview.hasSeedAnalyzer` 或本地 `CASINO_GAMES[slug]` |
| 展开区类别分条 | `CATEGORY_ORDER` + `CATEGORY_LABELS` + `CATEGORY_WEIGHTS` + `rating.categories[id].score` |

### 展开区评分权重（参考常量）

| Category key | Label | Weight |
|--------------|-------|--------|
| `analytics` | Analytics | 15% |
| `fairnessRtp` | Fairness & RTP | 15% |
| `financialTransparency` | Financial Transparency | 10% |
| `bonus` | Bonus | 22% |
| `customerSupport` | Customer Support | 5% |
| `compliance` | Compliance | 7% |
| `responsibleGambling` | Responsible Gambling | 8% |
| `security` | Security | 4% |
| `games` | Games | 5% |
| `thirdPartyRatings` | Third Party Ratings | 9% |

KYC / Provably Fair 颜色与 `badgeLabel` 为前端映射；License 图标来自 `LICENSE_IMAGES`（静态资源）。

---

## 3. `CasinosAffiliateBanner`（参考 `M`）

- **无 API**  
- 静态卖点：Wager Share / Weekly Leaderboard / Bonus Codes / Wager Tracking  
- CTA：`/affiliate`

---

## 4. `CasinosCompareTable`（参考 `eo`）

| 部分 | 说明 | 数据来源 |
|------|------|----------|
| 行 | 与 Grid 同一 `casinos` 列表 | hook 合并结果 |
| Sticky 列 | `#` + Casino 名/图标 | 行数据 + `AnalyticsCasinoIcon` |
| `basicInfo` 列 | Founded / 30d Vol / Est. NGR / Reviews / Rating / License | 行模型 |
| `gamesInfo` 列 | Originals / PF / House Edge / Slots / Providers / Sportsbook / Sports Edge / Seed Analyzer | 行模型；Logo 路径 `/logos/casinos/light/{slug}.svg` 或 `/logos/betby.svg` |
| `bonusing` 列 | Bonus Rating / Rakeback / Lossback / Code Feed / Leaderboard·Raffle | 行模型（rating + 硬编码 code feed） |
| `complianceRG` 列 | KYC / Responsible Gambling | 行模型 |
| `games` 列 | 各 house game RTP + 主流 provider 游戏 RTP/maxBet | 前端 `majorHouseGames` / `majorGameProviders` + `casino.houseGames` / `slotGameData` |
| 表头排序 | `onSort(columnKey)` | 客户端 sort（同 hook） |
| Tab ↔ 横向滚动 | `tableTab` / `onTableTabChange` | 前端 `categories` + 列宽累加偏移 |

`categories` 常量：

```js
[
  { id: "basicInfo", label: "Basic Info" },
  { id: "gamesInfo", label: "Games Info" },
  { id: "bonusing", label: "Bonusing" },
  { id: "complianceRG", label: "Compliance & RG" },
  { id: "games", label: "Games" },
]
```

---

## Props / API 明细

### 1. `initialBundle` — Casinos analytics bundle

- **Loader（参考）**：`getCasinosBundle(signal?)`
- **Endpoint**：`GET ${API_URL}/api/analytics/casinos-bundle`
- **用途字段**：
  - `breakdown30d` / `breakdown7d` / `breakdown90d` / `breakdown365d`：各赌场存款量（合并进行模型）
  - `casinos`：赌场列表（含 `meta`）；会过滤非展示类目
- **与 home-bundle 区别**：casinos 页用 **casinos-bundle**（含 90d/365d）；首页用 `home-bundle`（30d/7d + 精简列表）

回退路径（bundle 失败时）：

1. `GET /api/analytics/market-breakdown?period=30D`（及 7D / 90D / 365D）  
2. `GET /api/casinos?limit=100`（可带 `page` / `status` / `sortBy` / `sortOrder` / `includeCommunity`）

### 2. `initialRatingsMap` / 客户端补齐 — Casino ratings

- **Endpoint**：`GET ${API_URL}/api/casinos/:slug/rating`
- **客户端**：`fetchCasinoRatingsMapClient(slugs, existingMap)` 只请求 `slugsMissingFromRatingsMap`
- **用法**：`lookupCasinoRating(slug, map)` → totalScore、分类分、bonus、rakeback、license、founded 等  
- **回退**：无 rating 时 `fgRating ≈ trustScore * 10`

相关辅助 endpoint（详情页，非本列表必需）：

- `GET /api/casinos/slug/:slug`  
- `GET /api/casinos/slug/:slug/details`

### 3. 纯前端常量 / 静态资源

| 资源 | 用途 |
|------|------|
| `categories` / `majorHouseGames` / `majorGameProviders` | Table Tab 与 Games 列 |
| `CATEGORY_*` | Grid 展开评分条 |
| `LICENSE_IMAGES` | License 图标 |
| `/logos/casinos/{light\|dark}/…` | 赌场 Logo |
| Affiliate Banner 文案 | 无后端 |

---

## 建议本仓库文件映射

| 路径 | 作用 |
|------|------|
| `app/(main)/casinos/page.tsx` | SSR 组装：`loadCasinosPageData()` → `CasinosView` |
| `components/casinos/casinos-view.tsx` | 参考 `CasinosView` |
| `components/casinos/casinos-toolbar.tsx` | 参考 `N` |
| `components/casinos/casinos-grid.tsx` | 参考 `H` + `Y` + `B` + `M` |
| `components/casinos/casinos-compare-table.tsx` | 参考 `eo` |
| `lib/casinos/data.ts` | 类型、Mock、行合并 helpers |
| `lib/casinos/loaders.ts` | `getCasinosBundle` / ratings / fallbacks |
| `lib/casinos/client-api.ts` | 浏览器端 bundle / breakdown / ratings 请求 |
| `lib/casinos/use-casino-overview-data.ts` | 移植 `useCasinoOverviewData` |
| `lib/casinos/categories.ts` | `categories` / house games / providers / `CATEGORY_*` |
| `lib/casinos/score-color.ts` | 已有 `getTotalScoreColor` / `getCategoryScoreColor` |
| `lib/casinos/logos.ts` | 已有 logo helpers |
| `CASINOS_MODULES.md` | 本文档 |

复用：`components/ui/tabs`、`card`、`button`、`rating-gauge`、`analytics-casino-icon`、`watermark` 等。

---

## 接真数据（落地步骤）

1. `page.tsx` 服务端并行：`casinos-bundle` + 所需 ratings（或先 bundle，客户端补 rating）。  
2. 将结果作为 `initialBundle` / `initialRatingsMap` 注入 `CasinosView`。  
3. 客户端 hook：无 SSR 数据时再请求 `casinos-bundle`；失败则 `market-breakdown` + `/api/casinos`。  
4. Host：`API_URL`（服务端）/ `NEXT_PUBLIC_API_URL`（浏览器），与首页一致。  
5. 失败可回退 Mock（建议环境变量如 `CASINOS_API_FALLBACK_MOCK`，对齐 `HOME_API_FALLBACK_MOCK`）。
