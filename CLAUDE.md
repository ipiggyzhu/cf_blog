# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **VitePress-based personal technical blog** built with Vue 3 and the vitepress-theme-teek theme. The site features custom components, analytics integration, comments, and is deployed to Cloudflare Pages with automatic CI/CD.

**Tech Stack:**
- VitePress 1.6.3 with Vue 3.5.16
- vitepress-theme-teek 1.4.6 (professional blog theme)
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

### Theme Extension Pattern

The project extends vitepress-theme-teek through a **three-layer architecture**:

1. **Theme Entry** (`docs/.vitepress/theme/index.ts`):
   - Registers all custom components globally
   - Configures Vue error handlers and warnings
   - Initializes NProgress router transitions
   - Sets up Service Worker for PWA functionality
   - Wraps layout with `TeekLayoutProvider` for dependency injection

2. **Modular Configuration** (`docs/.vitepress/ConfigHyde/`):
   - `Comment.ts` - Twikoo comment system
   - `Cover.ts` & `Wallaper.ts` - Image assets
   - `Nav.ts`, `SocialLinks.ts` - Navigation structure
   - `Head.ts` - HTML head tags and meta

3. **Custom Components** (`docs/.vitepress/theme/components/`):
   - 29+ Vue 3 components using Composition API
   - Notable: `NavWeather.vue`, `DynamicWallpaperManager.vue`, `CoupleAlbum/`
   - All components auto-registered in theme/index.ts

4. **Composables** (`docs/.vitepress/theme/composables/`):
   - `useTransform.ts` - URL transformation engine
   - `useRuntime.ts` - Site runtime calculations
   - `useRibbon.ts` - Canvas animations
   - `useServiceWorker.ts`, `useWeatherAPI.ts`, `useGeolocation.ts` - Feature integrations

**Component Registration Pattern**: Add to `theme/index.ts` using `app.component('ComponentName', ComponentFile)` for global availability.

### Cloudflare Pages Functions

Serverless edge functions in `/functions/` (deployed automatically with Pages):

- `geo.js` & `api/geo.js` - Geolocation API using Cloudflare request headers with ipapi.co fallback
- `api/images.js` - Image handling endpoint
- **R2 Storage**: Bound via `wrangler.toml` (binding: `R2_BUCKET`, bucket: `cf-blog`)

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

**Deployment**: Push to `master` branch triggers automatic Cloudflare Pages deployment (configured via `.cnb/web_trigger.yml`).

### Vue Component Architecture

Vue 3 Composition API patterns:
- **Props/Events**: Parent-child communication
- **Provide/Inject**: Theme-wide settings via `TeekLayoutProvider`
- **Composables**: Shared logic in `theme/composables/` (see list above)
- **Error Handling**: Global Vue error handler in `theme/index.ts` + `utils/errorHandler.ts`

### Analytics & Tracking

Multiple analytics configured in `docs/.vitepress/config.ts` (lines 332-345):
- **Busuanzi** (Chinese visitor counter) - Custom endpoint with retry logic
- **Google Analytics** (G-K5GNDW3L7K)
- **Baidu Analytics** (d5ee872d9aa1ef8021f4a3921b2e9c2a)
- **Vercel Analytics** & Speed Insights (via npm packages)

Note: `ERR_BLOCKED_BY_CLIENT` errors are expected (ad blockers), don't affect site functionality.

## Key Configuration Files

- **`docs/.vitepress/config.ts`** (624 lines) - Master configuration
  - Lines 1-360: Teek theme config (blogger info, post style, cards, analytics, code blocks)
  - Lines 363-623: VitePress config (rewrites, markdown, sitemap, themeConfig, Vite, plugins)
  - Lines 564-612: AutoFrontmatter plugin with URL transformation rules
- **`package.json`** - Dependencies and scripts
- **`wrangler.toml`** - Cloudflare Workers and R2 binding
- **`docs/index.md`** - Homepage with YAML frontmatter for theme features
- **`docs/.vitepress/theme/composables/useTransform.ts`** - URL transformation engine

## Notable Custom Features

**NavWeather.vue** (Weather Widget):
- Geolocation via Cloudflare Workers → Weather API
- Displays in navigation bar with error handling

**DynamicWallpaperManager.vue**:
- Sources configured in `ConfigHyde/Wallaper.ts`
- Smooth transitions, dark mode support

**CoupleAlbum/** (Photo Gallery):
- `CoupleAlbum.vue` + `PhotoCard.vue` components
- Registered globally for use in markdown

**Comment System**:
- Twikoo provider (Chinese, two-way comments)
- Config in `ConfigHyde/Comment.ts`

**Search**:
- Local search (not Algolia) - configured lines 437-460 in config.ts
- Fuzzy matching, Chinese translations

**PWA Features**:
- Service Worker via `useServiceWorker.ts` composable
- Registered in theme/index.ts for offline support

## Development Workflow

### Adding Content
1. Create `.md` files in category folders (e.g., `docs/10.运维/`, `docs/20.编程/`)
2. Frontmatter is auto-generated by `vitepress-plugin-auto-frontmatter`
3. URLs transform automatically based on folder rules (see useTransform.ts)

### Adding Components
1. Create Vue SFC in `docs/.vitepress/theme/components/`
2. Register globally in `docs/.vitepress/theme/index.ts`:
   ```ts
   import MyComponent from './components/MyComponent.vue'
   app.component('MyComponent', MyComponent)
   ```
3. Use in markdown: `<MyComponent />`
4. Test with `pnpm docs:dev` (hot reload enabled)

### Modifying Configuration
- **Theme settings**: Edit `docs/.vitepress/config.ts` (lines 1-360 for Teek config)
- **Navigation/URLs**: Edit `docs/.vitepress/ConfigHyde/Nav.ts` or config.ts lines 564-612
- **Analytics/Comments**: Edit respective ConfigHyde modules
- **Styles**: Add/edit SCSS in `docs/.vitepress/theme/styles/`

### Deployment
- Automatic: Push to `master` branch → Cloudflare Pages auto-deploys
- Manual: Run `pnpm docs:build` → Upload `docs/.vitepress/dist/`

## Critical Constraints

- **Primary Language**: Chinese (UI, content, comments, search translations)
- **URL Transformation**: Never hardcode article URLs - they're auto-generated from folder structure
- **Frontmatter**: Auto-generated by plugin; manual additions preserved if not in `exclude` list
- **Cover Images**: Auto-assigned from `Cover.ts` if not specified in frontmatter
- **Date Timezone**: Dates automatically adjusted -8 hours in useTransform.ts (China timezone compensation)
- **Build Output**: Always `docs/.vitepress/dist/` (configured in wrangler.toml line 4)
- **SSR Compatibility**: Theme and canvas-confetti bundled via `vite.ssr.noExternal`
- **Component Styles**: Use SCSS with theme variables from vitepress-theme-teek (imported in theme/index.ts)
- **Branch**: Deployment branch is `master` (not `main`)