# Design System: QuantDinger — 量化交易平台

## 1. Visual Theme & Atmosphere

A cockpit-dense trading interface with clinical precision and asymmetric energy. The atmosphere evokes a Bloomberg terminal reimagined through the lens of modern Swiss design — data-forward, ruthlessly legible, with deliberate negative space breathing between dense metric clusters.

- **Density:** 7/10 — Cockpit mode for data screens, Daily App for settings/profile
- **Variance:** 8/10 — Asymmetric grids, offset KPI cards, varied aspect ratios
- **Motion:** 6/10 — Fluid CSS transitions, staggered reveals, spring physics on interactions

Dark theme is the default for trading interfaces. Light theme serves settings and administrative views.

## 2. Color Palette & Roles

### Dark Theme (Primary)

- **Obsidian Canvas** (#0A0A0B) — Page background, Zinc-950 adjacent
- **Charcoal Surface** (#141416) — Content areas, sidebar
- **Raised Panel** (#1C1C1F) — Cards, elevated containers
- **Hover State** (#252528) — Interactive hover backgrounds
- **Whisper Border** (rgba(255,255,255,0.06)) — 1px structural lines
- **Bright Border** (rgba(255,255,255,0.12)) — Active/highlighted borders

### Light Theme (Settings/Admin)

- **Mist Canvas** (#FAFAFA) — Page background
- **Pure Surface** (#FFFFFF) — Cards, content areas
- **Fog Border** (#E4E4E7) — Structural borders, Zinc-200
- **Smoke Border** (#F4F4F5) — Light dividers, Zinc-100

### Text Hierarchy

- **Primary Text** — `rgba(255,255,255,0.88)` dark / `rgba(0,0,0,0.88)` light
- **Secondary Text** — `#888893` dark / `rgba(0,0,0,0.50)` light
- **Tertiary Text** — `rgba(255,255,255,0.30)` dark / `rgba(0,0,0,0.25)` light

### Accent (Single)

- **Emerald Pulse** (#10B981) — Profit, success, active states, CTAs
- Saturation: 64% — well below 80% threshold
- No purple, no neon blue, no gradient text

### Semantic (Desaturated)

- **Profit Green** (#22C55E) — Positive PnL, winning trades
- **Loss Rose** (#F43F5E) — Negative PnL, losing trades (not pure red)
- **Warning Amber** (#F59E0B) — Alerts, pending states
- **Info Slate** (#64748B) — Neutral information badges

### Banned Colors

- Pure black `#000000` — use Obsidian Canvas instead
- Purple/violet neon — strictly forbidden
- Blue gradient buttons — use flat Emerald Pulse
- Oversaturated reds — use Loss Rose (#F43F5E)

## 3. Typography Rules

- **Display/Headlines:** `"Geist", "Satoshi", system-ui, sans-serif` — Track-tight (`letter-spacing: -0.02em`), weight-driven hierarchy (600 → 400), controlled scale
- **Body:** `"Geist", "Satoshi", system-ui, sans-serif` — Relaxed leading (`1.6`), max 65ch, neutral secondary color
- **Mono (Mandatory for all numbers):** `"JetBrains Mono", "Geist Mono", "SF Mono", monospace` — Tabular figures for all financial data, prices, percentages
- **Banned:** `Inter` (generic AI tell), generic serif fonts in dashboards, `Times New Roman`, `Georgia`

### Type Scale

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `--text-display` | `clamp(2rem, 3vw, 2.75rem)` | 600 | Page titles (rare) |
| `--text-h1` | `1.5rem` | 600 | Section headers |
| `--text-h2` | `1.25rem` | 600 | Card titles |
| `--text-h3` | `1rem` | 600 | Subsections |
| `--text-body` | `0.875rem` | 400 | Body text |
| `--text-caption` | `0.75rem` | 400 | Labels, metadata |
| `--text-mono` | `0.8125rem` | 500 | All numeric data |

## 4. Component Stylings

### Buttons
- **Primary:** Flat Emerald Pulse fill, white text, `border-radius: 0.5rem`, no outer glow
- **Active state:** `transform: translateY(1px)` tactile push, no scale
- **Secondary:** Ghost/outline with Whisper Border, transparent fill
- **Hover:** Background tint to `rgba(16,185,129,0.08)` for secondary
- **Disabled:** `opacity: 0.4`, `cursor: not-allowed`
- **No:** Neon glows, gradient fills, custom cursors

### Cards
- **Border radius:** `1rem` for major containers, `0.75rem` for nested
- **Shadow:** Diffused tint shadow `0 4px 24px -8px rgba(0,0,0,0.12)` (dark: `rgba(0,0,0,0.4)`)
- **Border:** 1px Whisper Border on all cards
- **Padding:** `1.5rem` standard, `2rem` spacious
- **Hover:** Border brightens to Bright Border, shadow deepens slightly
- **Cockpit Mode (density > 7):** Replace card containers with `border-top: 1px solid Whisper Border` dividers + negative space

### Inputs/Forms
- **Label:** Above input, `--text-caption` size, Secondary Text color
- **Input:** Raised Panel background, 1px Whisper Border, `0.5rem` radius
- **Focus:** 2px Emerald Pulse ring (`box-shadow: 0 0 0 2px rgba(16,185,129,0.3)`)
- **Error:** Loss Rose border + error text below input
- **Helper text:** Optional, `--text-caption` Tertiary Text
- **No:** Floating labels, inset shadows

### KPI Cards (Dashboard specific)
- **Layout:** Asymmetric grid, not 3-column equal
- **Numbers:** JetBrains Mono, `font-size: 1.75rem`, `font-weight: 600`, tabular figures
- **Labels:** `--text-caption`, uppercase, `letter-spacing: 0.05em`
- **Delta indicators:** Emerald Pulse (positive) / Loss Rose (negative), arrow optional
- **Progress rings:** 2px stroke, Emerald Pulse fill, Whisper Border track

### Loading States
- **Skeleton:** Shimmer animation on Raised Panel colored blocks matching layout dimensions
- **Shimmer keyframe:** `background: linear-gradient(90deg, #1C1C1F 0%, #252528 50%, #1C1C1F 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite`
- **No:** Generic circular spinners (only for button-internal loading)

### Empty States
- Composed illustration + action prompt
- Never just "No data" text
- Include a CTA button to populate data

## 5. Layout Principles

- **Grid-first:** CSS Grid (`grid-template-columns`) for all multi-column layouts
- **No flexbox percentage math:** Never use `calc(33% - 1rem)` patterns
- **Max-width containment:** `max-width: 1600px; margin: 0 auto` for page content
- **Asymmetric KPI grid:** `grid-template-columns: 2fr 1fr 1fr 1.5fr` for dashboard metrics
- **Full-height sections:** `min-height: 100dvh` — never `height: 100vh`
- **Mobile collapse:** All multi-column layouts → single column below 768px, no exceptions
- **Spacing system:** Base unit `0.25rem`, scale: `0.5rem → 0.75rem → 1rem → 1.5rem → 2rem → 3rem → 4rem`

### Navigation
- **Sidebar:** Fixed left, Charcoal Surface background, `width: 240px` desktop
- **Collapsible:** Icon-only mode (`width: 64px`) with tooltip labels
- **Mobile:** Drawer overlay, hamburger trigger
- **Active item:** Emerald Pulse left border (2px), raised background

## 6. Motion & Interaction

- **Spring physics default:** `cubic-bezier(0.16, 1, 0.3, 1)` for all transitions (CSS approximation)
- **Duration scale:** Fast `150ms`, Normal `300ms`, Slow `500ms`
- **Staggered reveals:** List items mount with `animation-delay: calc(var(--index) * 60ms)` cascade
- **Perpetual micro-interactions (density < 8):**
  - Status dots: Pulse animation (opacity 0.4 → 1 → 0.4, 2s infinite)
  - Live data: Shimmer sweep on values during update
  - Progress rings: Smooth stroke-dasharray transition on data change
- **Hover:** Border brighten + slight shadow deepening, `transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1)`
- **Active:** `translateY(1px)` tactile feedback
- **Performance:** Animate only `transform` and `opacity`. Never `top`, `left`, `width`, `height`
- **Grain/noise:** Fixed `pointer-events: none` pseudo-element only, never on scroll containers

## 7. Chart & Data Visualization

- **Chart background:** Transparent (inherit container)
- **Grid lines:** `var(--chart-grid)` — barely visible Whisper Border
- **Axis labels:** JetBrains Mono, `--text-caption`, Tertiary Text
- **Candlestick colors:** Profit Green (#22C55E) bullish, Loss Rose (#F43F5E) bearish
- **Line charts:** 2px stroke, Emerald Pulse primary, Slate secondary
- **Area fills:** Gradient to transparent, low opacity (`0.1`)
- **Tooltips:** Raised Panel background, JetBrains Mono numbers, Bright Border
- **Crosshair:** 1px dashed Whisper Border

## 8. Anti-Patterns (Banned)

### Visual
- NO pure black (`#000000`) — use Obsidian Canvas (#0A0A0B)
- NO purple/violet neon aesthetic
- NO gradient text on headers
- NO oversaturated accent colors
- NO outer glow shadows on buttons
- NO custom mouse cursors
- NO emojis anywhere

### Typography
- NO `Inter` font family
- NO generic serif fonts (`Times New Roman`, `Georgia`, `Garamond`)
- NO oversized screaming H1s
- NO non-monospace numbers in financial contexts

### Layout
- NO 3-column equal card grids — use asymmetric layouts
- NO `height: 100vh` — use `min-height: 100dvh`
- NO `calc()` percentage hacks in flexbox
- NO centered hero sections (variance > 4)
- NO overlapping elements

### Content
- NO generic placeholder names ("John Doe", "Acme", "Nexus")
- NO fake round numbers (`99.99%`, `50%`)
- NO AI copywriting clichés ("Elevate", "Seamless", "Unleash", "Next-Gen")
- NO "Scroll to explore" filler text
- NO broken Unsplash links — use `picsum.photos`

### Architecture
- NO hardcoded color values in components — always use CSS variables from `tokens.css`
- NO inline styles for themeable properties
- NO `!important` overrides (use proper specificity)

## 9. Implementation Notes (Vue 2 + Ant Design)

This design system targets a **Vue 2.7 + Ant Design Vue 1.x** codebase.

- **CSS Variables:** All tokens defined in `src/styles/tokens.css`, overridden per-theme in `src/styles/themes/*.css`
- **Theme switching:** `.theme-dark` / `.theme-light` class on root container
- **Ant Design overrides:** `src/styles/overrides/antd.css` for component-level customization
- **Layout override:** `src/qd-layout-dark-override.less` for sidebar/header dark theme
- **Scoped styles:** Vue `<style scoped>` uses `var(--token-name)` references
- **Less variables:** Bridge legacy Less mixins to CSS variables where refactoring is too costly
