# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **VitePress-based personal technical blog** built with Vue 3 and the vitepress-theme-teek theme. The site features custom components, analytics integration, comments, and is deployed to Cloudflare Pages with automatic CI/CD via Cloud Native Build (CNB).

**Tech Stack:**
- VitePress 1.6.3 with Vue 3.5.16
- vitepress-theme-teek 1.4.6 (professional blog theme)
- TypeScript configuration, Vue SFC components
- Cloudflare Pages hosting with Workers functions
- pnpm package manager (primary), npm as fallback

## Essential Commands

```bash
# Development
pnpm install                    # Install dependencies (preferred)
npm install                      # Alternative if pnpm not available
pnpm docs:dev                    # Start dev server at localhost:5173
pnpm docs:build                  # Build static site to docs/.vitepress/dist
pnpm docs:preview                # Preview built site locally

# Deployment Scripts
./shell/teek.sh                  # Full build and deploy workflow (Linux/Mac)
./shell/teek.bat                 # Full build and deploy workflow (Windows)
./shell/teek-run-dev.sh          # Quick dev server start
./shell/teek-run-build.sh        # Quick build only

# Testing Single Components
# Components are in docs/.vitepress/theme/components/
# Import and test in any markdown file under docs/
```

## High-Level Architecture

### Content Structure & URL Transformation

The blog uses a **category-based content organization** with automatic URL transformation rules defined in `docs/.vitepress/ConfigHyde/Nav.ts`:

```
Physical Structure → URL Path
docs/10.运维/      → /linux/$uuid5
docs/15.前端/      → /qianduan/$uuid5
docs/20.编程/      → /code/$uuid5
docs/25.黑客/      → /hacker/$uuid5
docs/30.专题/      → /zhuanti/$uuid5
docs/45.娱乐/      → /yule/{movie|music|photo}/$uuid5
docs/50.小屋/      → /xiaowu/{inner|time|wenan}/$uuid5
docs/55.兴趣/      → /xingqu/{reading|travel}/$uuid5
docs/60.关于/      → /about/$uuid5
```

URLs are generated using UUID5 hashing based on folder structure, providing consistent, SEO-friendly URLs while maintaining flexible file organization.

### Theme Customization Architecture

The blog extends vitepress-theme-teek with custom components and configurations:

1. **Theme Entry**: `docs/.vitepress/theme/index.ts` registers all custom components
2. **Config Modules**: `docs/.vitepress/ConfigHyde/` contains modular configurations:
   - `Nav.ts` - Navigation and URL transformation rules
   - `Comment.ts` - Twikoo comment system config
   - `Cover.ts` - Article cover image mappings
   - `Wallaper.ts` - Dynamic wallpaper settings
3. **Custom Components**: 29 Vue components in `docs/.vitepress/theme/components/`
4. **Styles**: SCSS files in `docs/.vitepress/theme/styles/`

### Serverless Functions

Cloudflare Workers functions in `/functions/`:
- `geo.js` & `api/geo.js` - Geolocation API using CF headers with ipapi.co fallback
- `api/images.js` - Image handling endpoint

Configuration in `wrangler.toml` includes R2 bucket binding for object storage.

### Build & Deployment Pipeline

**Local Build Process:**
1. VitePress processes markdown files with frontmatter
2. vitepress-plugin-auto-frontmatter generates metadata from folder structure
3. Vue components are compiled and bundled by Vite
4. Static site generated to `docs/.vitepress/dist/`

**CI/CD Pipeline** (`.cnb.yml`):
1. Triggered on push to main branch
2. Uses Node.js 22 Docker image with 64 CPUs
3. Configures npm Taobao mirror for China
4. Installs dependencies with pnpm
5. Builds site with `pnpm docs:build`
6. Deploys to EdgeOne Pages
7. Generates knowledge base embeddings (bge-m3 model)

### Component Communication Pattern

Components use Vue 3 Composition API with:
- **Props/Events** for parent-child communication
- **Provide/Inject** for theme-wide settings (via TeekLayoutProvider)
- **Composables** in `theme/composables/` for shared logic:
  - `useRibbon.ts` - Canvas ribbon animation
  - `useRuntime.ts` - Site runtime calculations
  - `useTransform.ts` - URL transformation logic

### Analytics Integration

Multiple analytics providers configured in `docs/.vitepress/config.ts`:
- Busuanzi (Chinese visitor counter) - Automatic integration
- Google Analytics (G-K5GNDW3L7K) - Via gtag
- Baidu Analytics (d5ee872d9aa1ef8021f4a3921b2e9c2a) - Via hm.js
- Vercel Analytics & Speed Insights - Via npm packages

### Key Configuration Files

- `docs/.vitepress/config.ts` (596 lines) - Main VitePress and theme configuration
- `package.json` - Dependencies and npm scripts
- `wrangler.toml` - Cloudflare Workers and Pages settings
- `.cnb.yml` - CI/CD pipeline configuration
- `docs/index.md` - Homepage with YAML configuration for theme features

### Custom Features Implementation

**Weather Widget** (`NavWeather.vue`):
- Uses geolocation API from Cloudflare Workers
- Fetches weather data and displays in navigation bar
- Error handling with fallback to IP-based location

**Live2D Animation** (`OhMyLive2D.vue`):
- Loads models from `docs/public/live2d/models/`
- Integrates oh-my-live2d library
- Download scripts available for additional models

**Comment System**:
- Twikoo provider configured in `ConfigHyde/Comment.ts`
- Supports two-way commenting on articles
- Chinese language UI

**Dynamic Wallpaper** (`DynamicWallpaperManager.vue`):
- Multiple wallpaper sources configured in `Wallaper.ts`
- Smooth transitions between wallpapers
- Dark mode support

## Development Workflow

1. **Adding New Content**: Create markdown files in appropriate category folders
2. **Custom Components**: Add to `docs/.vitepress/theme/components/`, register in `theme/index.ts`
3. **Configuration Changes**: Modify `docs/.vitepress/config.ts` or relevant `ConfigHyde/` module
4. **Testing**: Use `pnpm docs:dev` for hot-reload development
5. **Deployment**: Push to main branch triggers automatic deployment via CNB

## Important Notes

- The site uses Chinese as primary language with multi-language support
- All markdown files should include proper frontmatter or rely on auto-generation
- Component styles use SCSS with theme variables from vitepress-theme-teek
- URL transformations are automatic based on folder structure - don't hardcode URLs
- Build output goes to `docs/.vitepress/dist/` for Cloudflare Pages deployment