# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **VitePress-based personal technical blog** built with Vue 3 and the vitepress-theme-teek theme. The site features custom components, analytics integration, comments, and is deployed to Cloudflare Pages with automatic CI/CD.

**Tech Stack:**
- VitePress 1.6.x with Vue 3.5.16
- vitepress-theme-teek 1.5.x (professional blog theme) — check `pnpm-lock.yaml` for the exact resolved version
- TypeScript, Vue SFC components, SCSS styling
- Cloudflare Pages hosting with Workers functions
- pnpm package manager (primary), npm as fallback
- Node.js >=18.0.0, pnpm >=8.0.0

## Essential Commands

```bash
# Development
pnpm install                    # Install dependencies (preferred)
pnpm docs:dev                   # Start dev server at localhost:5173 with hot reload
pnpm docs:build                 # Build static site to docs/.vitepress/dist
pnpm docs:preview               # Preview built site locally

# Component Testing
# Components are in docs/.vitepress/theme/components/
# To test: import and use in any markdown file under docs/
# Dev server supports hot reload for Vue components and markdown
```

## High-Level Architecture

### Content Organization & URL System

The blog uses **category-based folders** with **automatic URL transformation** via UUID5 hashing. This separates physical file structure from public URLs.

**Key Pattern**: Physical folders → Friendly URL paths (defined in `docs/.vitepress/ConfigHyde/Nav.ts` and `docs/.vitepress/config.ts` lines 573-596)

```
docs/10.运维/       → /linux/$uuid5
docs/15.前端/       → /qianduan/$uuid5
docs/20.编程/       → /code/$uuid5
docs/25.黑客/       → /hacker/$uuid5
docs/30.专题/       → /zhuanti/$uuid5
docs/45.娱乐/10.电影/ → /yule/movie/$uuid5
docs/50.小屋/10.精神小屋/ → /xiaowu/inner/$uuid5
docs/55.兴趣/10.读书/ → /xingqu/reading/$uuid5
docs/60.关于/       → /about/$uuid5
```

**Critical**: The transformation logic is in `docs/.vitepress/theme/composables/useTransform.ts`:
- `$uuidN` placeholders generate random N-character strings (max 10)
- `removeLevel: 99` clears all path prefixes before adding new ones
- Date handling: automatically subtracts 8 hours to compensate for timezone conversion
- Rules are processed in order; first match wins

**The generated permalink is written back into the markdown file's frontmatter by `vitepress-plugin-auto-frontmatter` during build.** That write-back is what makes URLs stable — the random `$uuid5` is only rolled once. Consequences:

- `pnpm docs:build` **modifies files under `docs/`**. Always check `git status` after a build and commit any generated `permalink:` fields.
- A markdown file committed *without* a `permalink` gets a brand-new random URL on every CI build, so each deploy silently changes that article's address. Every article must have its permalink committed (only `docs/index.md` is exempt).

### Theme Configuration: Single Source of Truth

**`docs/.vitepress/theme/config/teekConfig.ts` exports `teekThemeConfig`, and it is the ONLY place to put Teek runtime settings.** It is consumed twice:

1. `config.ts` → `defineTeekConfig({ ...teekThemeConfig, vitePlugins, markdown })` (site-level `themeConfig`)
2. `TeekLayoutProvider.vue` → `provide(teekConfigContext, ref(teekThemeConfig))` (runtime inject)

Teek resolves config with priority `inject > frontmatter > themeConfig` (see `useTeekConfig` in the theme package): object-valued keys are shallow-merged, scalar keys are overridden outright by the injected value. Historically these two sources were maintained separately, so scalar settings written in `config.ts` were silently dead (e.g. `homeCardListPosition: "right"` while the injected `"left"` actually applied). Never reintroduce a second config object.

Only build-time config (`vitePlugins`, `markdown`) belongs in `config.ts`.

### Theme Extension Pattern

The project extends vitepress-theme-teek through a **three-layer architecture**:

1. **Theme Entry** (`docs/.vitepress/theme/index.ts`):
   - Registers global components (`About`, `friend-link`)
   - Configures Vue error handlers and warnings
   - Initializes NProgress router transitions
   - Sets up Service Worker for PWA functionality
   - Wraps layout with `TeekLayoutProvider` for dependency injection

2. **Modular Configuration** (`docs/.vitepress/ConfigHyde/`):
   - `Comment.ts` - Twikoo comment system
   - `Cover.ts` & `Wallaper.ts` - Image assets (`Wallaper.ts` also owns the single `FALLBACK_WALLPAPERS` list and the `/api/images` client)
   - `Nav.ts`, `SocialLinks.ts`, `SocialDate.ts` - Navigation & social
   - `FooterInfo.ts`, `FriendLink.ts`, `HitokotoDate.ts` - Footer, friend links, banner copy
   - `Head.ts` - HTML head tags and meta

3. **Custom Components** (`docs/.vitepress/theme/components/`):
   - Vue 3 components using Composition API
   - Notable: `NavWeather.vue`, `DynamicWallpaperManager.vue`, `About/`, `SLink/`
   - All slot wiring lives in `TeekLayoutProvider.vue`

4. **Composables** (`docs/.vitepress/theme/composables/`):
   - `useTransform.ts` - URL transformation engine
   - `useRuntime.ts` - Site runtime calculations
   - `useRibbon.ts` - Canvas animations
   - `useServiceWorker.ts`, `useWeatherAPI.ts`, `useGeolocation.ts`, `useLocalStorage.ts` - Feature integrations

**Component Registration Pattern**: Components used inside markdown must be registered in `theme/index.ts` via `app.component(...)`. Components only used in layout slots are imported directly by `TeekLayoutProvider.vue` — do not register those globally.

### HTTP / Timeout Conventions

- Browser side: `theme/utils/helpers.ts` → `fetchJsonWithTimeout()` is the **only** timeout helper. It aborts via `AbortController`. Never write `Promise.race([fetch(url), timeout])` — the caller gets an early reject but the request keeps running and the connection is never released.
- Edge side: `functions/_lib/http.js` → `withTimeout()`, `jsonResponse()`, `corsPreflightResponse()`.

Geolocation deliberately uses only: browser Geolocation API → `/api/geo` (Cloudflare edge) → international IP services. Amap/Baidu IP lookup was removed because their web-service keys must be shipped in plaintext to the client, and they return GCJ-02/BD-09 coordinates that need conversion before use.

### Cloudflare Pages Functions

Serverless edge functions in `/functions/` (deployed automatically with Pages):

- `geo.js` re-exports `api/geo.js` - Geolocation API using Cloudflare request headers with ipapi.co fallback
- `api/images.js` - Lists the R2 `WallPaper/` prefix, with Cache API caching and multi-level fallback
- `_lib/http.js` - Shared `withTimeout` / `jsonResponse` / CORS helpers
- **R2 Storage**: Bound via `wrangler.toml` (binding: `R2_BUCKET`, bucket: `cf-blog`)

Note: `_headers` and `_redirects` must live in the **build output root**, which means `docs/public/`. A `_headers` in `functions/` is dead — Cloudflare never reads it there.

### VitePress Build Pipeline

**Local Build Flow**:
1. VitePress processes markdown + frontmatter → HTML pages
2. `vitepress-plugin-auto-frontmatter` injects metadata from folder structure
3. Vue components compiled by Vite (esbuild minification, ES2015 target)
4. Output: Static site in `docs/.vitepress/dist/`

**Critical Build Configs** (in `docs/.vitepress/config.ts`):
- `rewrites`: Uses `createRewrites()` from teek theme for URL mapping
- `vite.ssr.noExternal`: Bundles `vitepress-theme-teek` and `canvas-confetti` for SSR
- `vite.build.minify: 'esbuild'` - Faster than terser
- `vite.build.sourcemap: false` - Disabled for performance
- `vite.optimizeDeps.exclude`: Prevents pre-bundling theme and core libs

**Deployment**: Cloudflare Pages' Git integration builds on push to `master`. That wiring lives in the Cloudflare dashboard, **not** in this repo — `.cnb/web_trigger.yml` only declares a manual "构建＆部署" button for the CNB platform and contains no build steps. There is no CI pipeline definition in the repository.

### Vue Component Architecture

Vue 3 Composition API patterns:
- **Props/Events**: Parent-child communication
- **Provide/Inject**: Theme-wide settings via `TeekLayoutProvider`
- **Composables**: Shared logic in `theme/composables/` (see list above)
- **Error Handling**: Global Vue error handler in `theme/index.ts` + `utils/errorHandler.ts`

Composables return `state: readonly(state)`. Callers must not assign to it — writes are silently dropped in production. Expose an action on the composable instead.

### Analytics & Tracking

Configured in `theme/config/teekConfig.ts` → `siteAnalytics` / `docAnalysis`:
- **Busuanzi** (Chinese visitor counter) - Custom endpoint with retry logic
- **Google Analytics** (G-K5GNDW3L7K)
- **Baidu Analytics** (d5ee872d9aa1ef8021f4a3921b2e9c2a)

Vercel Analytics was removed (Vercel-only, this site is on Cloudflare Pages).

Note: `ERR_BLOCKED_BY_CLIENT` errors are expected (ad blockers), don't affect site functionality.

## Key Configuration Files

- **`docs/.vitepress/theme/config/teekConfig.ts`** - All Teek **runtime** theme config (single source of truth, see above)
- **`docs/.vitepress/config.ts`** - VitePress config + Teek **build-time** config (`rewrites`, `vitePlugins`, `markdown`, `sitemap`, `themeConfig`, Vite options, AutoFrontmatter URL rules)
- **`package.json`** - Dependencies and scripts
- **`wrangler.toml`** - Cloudflare Pages output dir and R2 binding
- **`docs/public/_headers` / `_redirects`** - Edge caching & security headers (must stay in `public/`)
- **`docs/index.md`** - Homepage with YAML frontmatter for theme features
- **`docs/.vitepress/theme/composables/useTransform.ts`** - URL transformation engine

## Notable Custom Features

**NavWeather.vue** (Weather Widget):
- `useGeolocation` (browser → `/api/geo` → international IP) then `useWeatherAPI` (Caiyun if `VITE_CAIYUN_TOKEN` is set, else Open-Meteo)
- Results cached in localStorage; clicking the icon clears both caches and refetches
- Rendered via the `nav-bar-content-after` slot in `TeekLayoutProvider.vue`

**DynamicWallpaperManager.vue**:
- Renderless component, homepage only. Swaps the `.tk-banner` background through two CSS-variable layers (`--layer-a/b-*`) for seamless crossfade
- Image library from `/api/images` (R2), falling back to `FALLBACK_WALLPAPERS` in `ConfigHyde/Wallaper.ts`
- `startWallpaperSystem()` / `stopWallpaperSystem()` are the only entry points; all timers and the `visibilitychange` listener must be registered and torn down there

**Comment System**:
- Twikoo provider (Chinese, two-way comments)
- Config in `ConfigHyde/Comment.ts`

**Search**:
- Local search (not Algolia) - `themeConfig.search` in config.ts
- Fuzzy matching, Chinese translations

**PWA Features**:
- Service Worker via `useServiceWorker.ts` composable + `docs/public/sw.js`
- `sw.js` calls `skipWaiting()` + `clients.claim()`, so `controllerchange` fires on first visit too; the composable only reloads when a controller already existed (a real update)

## Development Workflow

### Adding Content
1. Create `.md` files in category folders (e.g., `docs/10.运维/`, `docs/20.编程/`)
2. Frontmatter is auto-generated by `vitepress-plugin-auto-frontmatter`
3. URLs transform automatically based on folder rules (see useTransform.ts)
4. Run a build, then **commit the generated `permalink:`** — otherwise the URL changes on every deploy

### Adding Components
1. Create Vue SFC in `docs/.vitepress/theme/components/`
2. If it will be used **in markdown**, register it in `docs/.vitepress/theme/index.ts`:
   ```ts
   import MyComponent from './components/MyComponent.vue'
   app.component('MyComponent', MyComponent)
   ```
   If it only fills a **layout slot**, import it directly in `TeekLayoutProvider.vue` instead — don't register it globally.
3. Use in markdown: `<MyComponent />`
4. Test with `pnpm docs:dev` (hot reload enabled)

### Modifying Configuration
- **Theme settings**: Edit `docs/.vitepress/theme/config/teekConfig.ts` (single source of truth)
- **Navigation/URLs**: Edit `docs/.vitepress/ConfigHyde/Nav.ts`, or the AutoFrontmatter rules in `config.ts`
- **Analytics/Comments**: `teekConfig.ts` (`siteAnalytics`) / `ConfigHyde/Comment.ts`
- **Styles**: Add/edit SCSS in `docs/.vitepress/theme/style/` (note: singular `style/`; `styles/` holds only two legacy files)

### Deployment
- Automatic: Push to `master` branch → Cloudflare Pages auto-deploys
- Manual: Run `pnpm docs:build` → Upload `docs/.vitepress/dist/`

## Critical Constraints

- **Primary Language**: Chinese (UI, content, comments, search translations)
- **File Encoding**: All markdown must be valid UTF-8 (no BOM). Commit `9eadff8` corrupted three articles by truncating the last byte of multi-byte characters to `0x3F` — the damage is invisible in `git diff` stats and only shows up as `�?` in rendered HTML. After bulk-editing content with Windows tooling, verify with:
  ```bash
  find docs -name '*.md' -exec file -b --mime-encoding {} +   # everything must be utf-8 / us-ascii
  grep -rl $'�' docs --include=*.md                      # only 20.Git中文乱码解决方案.md may match (deliberate examples)
  ```
- **URL Transformation**: Never hardcode article URLs - they're auto-generated from folder structure
- **Frontmatter**: Auto-generated by plugin; manual additions preserved if not in `exclude` list
- **Cover Images**: Auto-assigned from `Cover.ts` if not specified in frontmatter
- **Date Timezone**: Dates automatically adjusted -8 hours in useTransform.ts (China timezone compensation)
- **Build Output**: Always `docs/.vitepress/dist/` (configured in wrangler.toml line 4)
- **SSR Compatibility**: Theme and canvas-confetti bundled via `vite.ssr.noExternal`
- **Component Styles**: Use SCSS with theme variables from vitepress-theme-teek (imported in theme/index.ts)
- **Branch**: Deployment branch is `master` (not `main`)