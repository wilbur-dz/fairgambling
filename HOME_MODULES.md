# Home 页面模块与数据来源

本文档对照参考实现 `HomeView`（`0yqpr0v_0y__w.js`）列出首页各模块、职责，以及线上数据来源。  
当前仓库使用 `lib/home/data.ts` 中的 **Mock** 数据；接入后端时按下表替换即可。

参考入口：

```js
HomeView({ bundle, reviews, leaderboard, ratingsMap })
// bundle → computeHomeAnalytics(breakdown30d, breakdown7d)
// casinos ← bundle.casinos
```

基础 API Host：`API_URL`（参考站为 `https://api.fairgambling.com`）。

---

## 模块一览（渲染顺序）

| # | 参考符号 | 组件（本仓库） | 模块名称 | 数据从哪来 |
|---|----------|----------------|----------|------------|
| 1 | `d` | `HomeHero` | Hero「Your Crypto Gambling Hub」 | **无 API**，静态文案 + CTA → `/casinos` |
| 2 | `u` | `HomeAnalyticsCard` | Analytics（Biggest / Trending / Newcomers） | `bundle` → `GET /api/analytics/home-bundle`，再经 `computeHomeAnalytics(breakdown30d, breakdown7d)` |
| 3 | `j` | `TransparencyNotice` | Transparency Notice | **无 API**，静态文案 |
| 4 | `em` | `AnalyzeYourSeedSection` | Analyze Your Seed | **无 API**，静态运营卡片；跳转 `/provably-fair` |
| 5 | `$` | `TopRatedCasinos` | Rating（Top casinos） | `bundle.casinos`（同上 home-bundle）+ `ratingsMap`（见下） |
| 6 | `_` | `LatestReviews` | Latest Reviews | `reviews` → `GET /api/reviews/?…`（列表查询） |
| 7 | `D` | `ExploreOurTools` | Explore Our Tools | **无 API**，前端常量 `HOME_TOOLS`（Stake Stats / Blackjack / Seed Insights） |
| 8 | `eb` | `CodeDropFeed` | Code Drop Feed | 优先 `useLiveCodesSSE` → `EventSource ${API_URL}/api/codes/live`；空数据时用 mock；亦可 `GET /api/codes` |
| 9 | `G` | `ComplaintsSnapshot` | Complaints 指标卡 | 客户端 `getGlobalStats()` → `GET /api/analytics/global-stats?period=`（参考默认 `365d`） |
| 10 | `K` | `LatestContent` | Latest Content / Investigations | CMS / `SECTION_PATH`（news / research）；参考里多为占位文案 |
| 11 | `ee` | `HighRollerOffer` | High Roller Offer CTA | **无 API**，静态；CTA → `/highroller-club`（参考另有 `/highroller-club/get-offer`） |
| 12 | `ez` | `AffiliateRewards` | Start earning extra rewards | **无 API**，静态步骤；「View All」→ `/affiliate` |
| 13 | `ed` | `LeaderboardPreview` | Leaderboard 预览 | `leaderboard` → `GET /api/leaderboard/current?limit=&offset=` |
| 14 | `te` / `eW` | `HomeActivityTabs` | Live Bets / Deposit Feed / Leaderboard Tabs | Live Bets / Deposits：`GET /api/analytics/feed-recent?…`；Leaderboard Tab 复用 leaderboard API |

布局网格与参考一致：

1. Hero 全宽  
2. `lg:grid-cols-[7fr_5fr]` → Analytics \| Transparency  
3. Analyze Your Seed 全宽  
4. `lg:grid-cols-[584fr_480fr]` → Rating \| Reviews  
5. Explore Our Tools 全宽  
6. Code Drop Feed 全宽  
7. `lg:grid-cols-2` → Complaints \| Latest Content  
8. High Roller Offer 全宽  
9. `lg:grid-cols-2` → Affiliate \| Leaderboard  
10. Activity Tabs 全宽  

---

## Props / API 明细

### 1. `bundle` — Home Analytics Bundle

- **Loader（参考）**：`getHomeBundle()`
- **Endpoint**：`GET ${API_URL}/api/analytics/home-bundle`
- **用途字段**：
  - `breakdown30d` / `breakdown7d`：赌场存款量与涨跌，喂给 `computeHomeAnalytics`
  - `casinos`：赌场列表，喂给 Rating 模块
- **衍生计算**：`computeHomeAnalytics` 产出：
  - `biggest`：30d 体量 Top 5  
  - `trending`：`depositVolumeChange > 0` 且按涨幅排序 Top 5  
  - `newcomers`：新盘集合过滤后 Top 5  

本仓库 Mock：`MOCK_HOME_BUNDLE` + `computeHomeAnalytics`（`lib/home/data.ts`）。

### 2. `ratingsMap` — Casino ratings

- **Endpoint（单赌场）**：`GET ${API_URL}/api/casinos/:slug/rating`
- **用法**：`fgTotalScore100(slug, trustScore, ratingsMap)`  
  - 优先 `ratingsMap[slug].totalScore`  
  - 否则回退 `trustScore * 10`（来自 bundle 赌场对象）
- **本仓库 Mock**：`MOCK_RATINGS_MAP`

### 3. `reviews` — Latest reviews

- **Endpoint**：`GET ${API_URL}/api/reviews/?…`（另有 casino / vote / my-reviews 等）
- **Home 用法**：取最新若干条（参考 slice 到 9，UI 分页/轮播）
- **本仓库 Mock**：`MOCK_REVIEWS`

### 4. `leaderboard` — Wager leaderboard

- **Endpoint**：`GET ${API_URL}/api/leaderboard/current?limit=&offset=`
- **Home 用法**：`payload.entries` 取前 5 行
- **本仓库 Mock**：`MOCK_LEADERBOARD`

### 5. Complaints global stats（模块内自取）

- **Loader（参考）**：`getGlobalStats(period?)`
- **Endpoint**：`GET ${API_URL}/api/analytics/global-stats?period=365d`
- **字段映射（本仓库）**：`totalDisputes` / `resolutionRate` / `fundsRecoveredUsd` / `avgResponseHours`
- **本仓库 Mock**：`MOCK_COMPLAINT_STATS`

### 6. Code drops（模块内自取）

- **Realtime**：`EventSource(${API_URL}/api/codes/live?casino=…)`
- **REST**：`GET ${API_URL}/api/codes`
- **空数据**：参考使用 `mockCodeDropOffers`
- **本仓库 Mock**：`MOCK_CODE_DROPS`

### 7. Live activity feeds（Tabs）

- **Endpoint**：`GET ${API_URL}/api/analytics/feed-recent?…`（`getFeedSnapshot`）
- **Tabs**：`live-bets` / `deposits` / `leaderboard`
- **本仓库 Mock**：`MOCK_LIVE_BETS`（其余 Tab 提示接 API）

### 8. Latest Content / Investigations

- **来源**：CMS / 路由常量 `SECTION_PATH['news-posts']`、research / investigations
- **参考现状**：多为 “Coming soon” 占位
- **本仓库 Mock**：`MOCK_CONTENT` → `/news`

### 9. 纯静态模块（无后端）

| 模块 | 说明 |
|------|------|
| Hero | 标题、副文案、Discover CTA |
| Transparency Notice | 品牌透明度声明 |
| Analyze Your Seed | Provably fair 导流 |
| Explore Our Tools | 常量工具列表 + 图片 `/images/tools/*` |
| High Roller Offer | High roller CTA |
| Affiliate Rewards | 三步引导 |

---

## 本仓库文件映射

| 路径 | 作用 |
|------|------|
| `components/home/home-view.tsx` | `HomeView` 与各模块 UI |
| `lib/home/data.ts` | 类型、Mock、`computeHomeAnalytics` / `fgTotalScore100` |
| `lib/api/client.ts` / `lib/api/config.ts` | API Host + `apiFetch` / `handleResponse` |
| `lib/home/normalize.ts` | 线上响 → 本仓库类型 |
| `lib/home/loaders.ts` | SSR loaders（`loadHomePageData`） |
| `lib/home/use-live-codes-sse.ts` | Code Drop SSE |
| `lib/home/client-feeds.ts` | Activity Tabs 客户端刷新 |
| `app/(main)/page.tsx` | 首页组装，注入 loader props |
| `components/ui/card.tsx` | 面板容器（对齐参考 `Card`） |
| `.env.example` | `API_URL` / `NEXT_PUBLIC_API_URL` / `HOME_API_FALLBACK_MOCK` |
| `HOME_MODULES.md` | 本文档 |

---

## 接真数据（已落地）

1. `page.tsx` 通过 `loadHomePageData()` 并行请求：  
   `home-bundle` + `reviews` + `leaderboard/current` + ratings + codes + feeds  
2. `CodeDropFeed` 优先 SSE；`HomeActivityTabs` 切 Tab 时客户端刷新 feed。  
3. Host：`API_URL`（服务端）/ `NEXT_PUBLIC_API_URL`（浏览器）。  
4. 失败或空响应时默认回退 Mock（`HOME_API_FALLBACK_MOCK=0` 可关闭）。  
5. Complaints：`global-stats` 若无 `totalDisputes` 等字段则继续用 Mock（线上目前是存款分析）。
