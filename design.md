# Design — Permamap

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

<!-- Hallmark · route: custom (tuned) · vibe: "green light, fresh, nature-mimetizing, textured, strong typo"
     axes: light / roman-serif / chromatic-green ~145° · designed-as-app -->

## Genre

editorial — voz canônica anti-slop: hairlines, whitespace generoso, tipografia
que carrega o design, motion quieto.

## Macrostructure family

- **Marketing pages** (futuro): Marquee Hero — hero é a página acima da fold;
  abaixo vira lista/prosa. Archetypes variam: H1–H5, Ft1/Ft2/Ft6.
- **App pages** (Mapa, Auth): Workbench — a função carrega a tela. O mapa é o
  workbench; painéis são instrumentos. Auth é split-screen: painel de marca à
  esquerda, formulário à direita. Sem enrichment.
- **Content pages** (Permamap U): Long Document no CourseViewer (prosa contínua,
  measure 65ch) · Catalogue na listagem (grid uniforme de CourseCards, hairline
  entre seções).

## Theme

Tudo em OKLCH, tingido para o verde (hue ~130–145). Sem `#000`/`#fff` puros,
sem neutros de croma zero.

- `--color-paper`      oklch(96.5% 0.015 130)  — fundo, branco-esverdeado fresco
- `--color-paper-2`    oklch(93.5% 0.020 130)  — elevação 1 (sidebar, painéis)
- `--color-paper-3`    oklch(90% 0.022 128)    — elevação 2 (cards, inputs)
- `--color-ink`        oklch(21% 0.012 140)    — texto primário, quase-preto musgo
- `--color-ink-2`      oklch(38% 0.012 140)    — texto secundário
- `--color-muted`      oklch(52% 0.012 135)    — texto terciário / placeholder
- `--color-rule`       oklch(80% 0.016 132)    — hairlines
- `--color-rule-2`     oklch(72% 0.016 134)    — hairline forte (bordas de input)
- `--color-accent`     oklch(56% 0.15 145)     — verde-folha "luz verde"
- `--color-accent-deep` oklch(42% 0.13 145)    — texto/links em accent sobre papel (≥ 4.5:1)
- `--color-accent-ink` oklch(21% 0.012 140)    — texto escuro sobre accent
- `--color-accent-soft` oklch(91% 0.045 140)   — superfície ativa (opaco, não alpha)
- `--color-focus`      oklch(52% 0.19 145)     — anel de foco
- `--color-danger`     oklch(55% 0.19 25)      — funcional
- `--color-danger-deep` oklch(45% 0.16 25)     — texto danger sobre danger-soft
- `--color-warn`       oklch(72% 0.14 85)      — funcional
- `--color-warn-deep`  oklch(48% 0.12 80)      — texto warn sobre warn-soft
- `--color-accent-on-dark` oklch(78% 0.16 145) — accent sobre superfície escura (brand panel)

**Funcionais, fora do tema (renderizam sobre tiles do Leaflet, não sobre o
papel):** cores de zona `--z0`–`--z5` e o azul de geolocalização `#2563eb`.
Não re-tintar.

## Typography

- **Display:** Fraunces (variable, opsz 9–144), peso 600–700, **roman apenas**
  (itálico em headings é banido), tracking -0.02em, line-height 1.05–1.2.
- **Body/UI:** Manrope (variable), peso 400; ênfase 600–700. UI 13–15px,
  body copy ≥ 14px, line-height 1.5–1.65, measure ≤ 65ch.
- **Outlier (mono):** Syne Mono — um papel só: coordenadas e dados tabulares
  (lat/lng, áreas). Máximo 2 slots por tela.
- Escala: razão 1.25 (major third) do base 16px.
- Type scale anchor: `--text-display` = `clamp(2.75rem, 5vw + 1rem, 5.25rem)`.
- `font-variant-numeric: tabular-nums` em qualquer dado numérico.

## Spacing

4-point named scale (valores em `index.css` / Exports). Páginas usam tokens
nomeados (`var(--space-md)`), nunca valores crus. `gap` para irmãos; `margin`
só para ajuste óptico.

## Motion

- Easings: `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` · `--ease-in:
  cubic-bezier(0.7, 0, 0.84, 0)` · `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)`.
  Nunca `ease` default, nunca bounce em UI.
- Durations: `--dur-micro` 120ms · `--dur-short` 220ms · `--dur-long` 420ms.
  Saídas ≈ 75% da entrada.
- Reveal pattern: fade + translateY(4–8px), stagger por `--i` (cap 500ms total).
  Uma sequência orquestrada por tela, não dez.
- Anima-se só `transform` e `opacity`.
- Reduced-motion: colapsa para crossfade de opacity ≤ 150ms. Loaders funcionais
  (progress, skeleton, geo-pulse) continuam rodando.
- Framer Motion é a lib do projeto; variantes vivem em `packages/ui/src/motion`.

## Texture

- Grain `feTurbulence` global via `body::after`, `mix-blend-mode: multiply`,
  opacidade 0.04–0.05 — papel, não verniz. É a assinatura "textured" do sistema.
- Divisores são hairlines 1px `var(--color-rule)`. Sem card-in-card, sem
  glassmorphism, sem glow colorido.

## Microinteractions stance

- Silent success — nunca toast celebratório.
- Optimistic update + Undo em vez de confirmation dialog.
- Tooltip: delay 800ms no hover, 0ms no focus.
- `:focus-visible` com anel `--color-focus` 2px, contraste ≥ 3:1, aparece
  instantaneamente (nunca animar o anel).
- Todo componente interativo cobre os 8 estados: default · hover ·
  focus-visible · active · disabled · loading · error · success.

## CTA voice

- **Primary:** fill `--color-accent`, texto `--color-accent-ink`, radius 8px
  (não pill), peso 600, sentence case, verbo imperativo ("Mapear propriedade").
- **Secondary:** outline hairline 1px `--color-rule-2`, texto `--color-ink`,
  hover com fill `--color-paper-3`.
- **Danger:** herda ghost, texto `--color-danger`.

## Per-page allowances

- Marketing pages MAY use enrichment (Tier-A CSS art, Tier-B SVG hand-built).
- App pages MUST NOT use enrichment — a função carrega a tela.
- Content pages: typography only; o grain global já é a textura.

## What pages MUST share

- O wordmark Permamap (Fraunces 600, tracking -0.015em).
- O accent verde e seu footprint (≤ 5% por viewport).
- Fraunces + Manrope + Syne Mono (2+1 — teto de três famílias).
- A voz de CTA (shape, radius, padding rhythm).
- Hairlines como linguagem de divisor + grain global.
- Namespaces: telas de app usam `--pm-*`; marketing usa `--ds-*`. Nunca misturar
  os dois na mesma tela. Os `--pm-*` agora são aliases dos tokens canônicos
  `--color-*` deste arquivo.

## What pages MAY differ on

- Macrostructure dentro da família do tipo de página.
- Hero archetype (dentro do allowance da família).
- Enrichment — só marketing, só Tier-A/B.

## Exports

Drop-in formats para reusar o sistema. Fonte de verdade: `tokens.css` (abaixo);
os `--pm-*` do app são aliases desses valores.

### tokens.css

```css
:root {
  --color-paper:       oklch(96.5% 0.015 130);
  --color-paper-2:     oklch(93.5% 0.020 130);
  --color-paper-3:     oklch(90% 0.022 128);
  --color-ink:         oklch(21% 0.012 140);
  --color-ink-2:       oklch(38% 0.012 140);
  --color-muted:       oklch(52% 0.012 135);
  --color-rule:        oklch(80% 0.016 132);
  --color-rule-2:      oklch(72% 0.016 134);
  --color-accent:      oklch(56% 0.15 145);
  --color-accent-deep: oklch(42% 0.13 145);
  --color-accent-ink:  oklch(21% 0.012 140);
  --color-accent-soft: oklch(91% 0.045 140);
  --color-focus:       oklch(52% 0.19 145);
  --color-danger:      oklch(55% 0.19 25);
  --color-danger-deep: oklch(45% 0.16 25);
  --color-warn:        oklch(72% 0.14 85);
  --color-warn-deep:   oklch(48% 0.12 80);
  --color-accent-on-dark: oklch(78% 0.16 145);

  --font-display: "Fraunces", ui-serif, Georgia, serif;
  --font-body:    "Manrope", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: "Syne Mono", ui-monospace, monospace;

  --tracking-display: -0.02em;
  --tracking-label:   0.10em;

  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-md:   1.25rem;
  --text-lg:   1.5625rem;
  --text-xl:   1.9531rem;
  --text-2xl:  2.4414rem;
  --text-3xl:  3.0518rem;
  --text-display:   clamp(2.75rem, 5vw + 1rem, 5.25rem);
  --text-display-s: clamp(2rem, 3.5vw + 1rem, 3.5rem);

  --space-3xs: 0.125rem;
  --space-2xs: 0.25rem;
  --space-xs:  0.5rem;
  --space-sm:  0.75rem;
  --space-md:  1rem;
  --space-lg:  1.5rem;
  --space-xl:  2.5rem;
  --space-2xl: 4rem;
  --space-3xl: 6rem;
  --space-4xl: 9rem;

  --rule-hair: 1px;
  --rule-fine: 2px;
  --radius-card:  10px;
  --radius-input: 8px;
  --radius-pill:  999px;

  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in:     cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-micro: 120ms;
  --dur-short: 220ms;
  --dur-long:  420ms;

  --shadow-whisper: 0 1px 2px oklch(21% 0.012 140 / 0.06);
}
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper:       oklch(96.5% 0.015 130);
  --color-paper-2:     oklch(93.5% 0.020 130);
  --color-paper-3:     oklch(90% 0.022 128);
  --color-ink:         oklch(21% 0.012 140);
  --color-ink-2:       oklch(38% 0.012 140);
  --color-muted:       oklch(52% 0.012 135);
  --color-rule:        oklch(80% 0.016 132);
  --color-accent:      oklch(56% 0.15 145);
  --color-accent-soft: oklch(91% 0.045 140);
  --color-focus:       oklch(52% 0.19 145);

  --font-display: "Fraunces", ui-serif, Georgia, serif;
  --font-body:    "Manrope", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: "Syne Mono", ui-monospace, monospace;

  --spacing-xs:  0.5rem;
  --spacing-sm:  0.75rem;
  --spacing-md:  1rem;
  --spacing-lg:  1.5rem;
  --spacing-xl:  2.5rem;
  --spacing-2xl: 4rem;

  --text-sm: 0.875rem;
  --text-md: 1.25rem;
  --text-lg: 1.5625rem;
  --text-xl: 1.9531rem;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### DTCG `tokens.json`

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "paper":       { "$value": "oklch(96.5% 0.015 130)", "$type": "color" },
    "paper-2":     { "$value": "oklch(93.5% 0.020 130)", "$type": "color" },
    "paper-3":     { "$value": "oklch(90% 0.022 128)",   "$type": "color" },
    "ink":         { "$value": "oklch(21% 0.012 140)",   "$type": "color" },
    "ink-2":       { "$value": "oklch(38% 0.012 140)",   "$type": "color" },
    "muted":       { "$value": "oklch(52% 0.012 135)",   "$type": "color" },
    "rule":        { "$value": "oklch(80% 0.016 132)",   "$type": "color" },
    "accent":      { "$value": "oklch(56% 0.15 145)",    "$type": "color" },
    "accent-deep": { "$value": "oklch(42% 0.13 145)",    "$type": "color" },
    "accent-ink":  { "$value": "oklch(21% 0.012 140)",   "$type": "color" },
    "accent-soft": { "$value": "oklch(91% 0.045 140)",   "$type": "color" },
    "focus":       { "$value": "oklch(52% 0.19 145)",    "$type": "color" }
  },
  "font": {
    "display": { "$value": "Fraunces, ui-serif, Georgia, serif", "$type": "fontFamily" },
    "body":    { "$value": "Manrope, ui-sans-serif, system-ui, sans-serif", "$type": "fontFamily" },
    "outlier": { "$value": "Syne Mono, ui-monospace, monospace", "$type": "fontFamily" }
  },
  "space": {
    "xs":  { "$value": "0.5rem",  "$type": "dimension" },
    "sm":  { "$value": "0.75rem", "$type": "dimension" },
    "md":  { "$value": "1rem",    "$type": "dimension" },
    "lg":  { "$value": "1.5rem",  "$type": "dimension" },
    "xl":  { "$value": "2.5rem",  "$type": "dimension" },
    "2xl": { "$value": "4rem",    "$type": "dimension" }
  },
  "duration": {
    "micro": { "$value": "120ms", "$type": "duration" },
    "short": { "$value": "220ms", "$type": "duration" },
    "long":  { "$value": "420ms", "$type": "duration" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background:           96.5% 0.015 130;   /* paper */
  --foreground:           21%   0.012 140;   /* ink */
  --card:                 93.5% 0.020 130;   /* paper-2 */
  --card-foreground:      21%   0.012 140;
  --popover:              93.5% 0.020 130;
  --popover-foreground:   21%   0.012 140;
  --primary:              56%   0.15  145;   /* accent */
  --primary-foreground:   21%   0.012 140;   /* accent-ink */
  --secondary:            90%   0.022 128;   /* paper-3 */
  --secondary-foreground: 38%   0.012 140;   /* ink-2 */
  --muted:                80%   0.016 132;   /* rule */
  --muted-foreground:     52%   0.012 135;   /* muted */
  --accent:               56%   0.15  145;
  --accent-foreground:    21%   0.012 140;
  --destructive:          55%   0.19  25;
  --destructive-foreground: 96.5% 0.015 130;
  --border:               80%   0.016 132;
  --input:                72%   0.016 134;   /* rule-2 */
  --ring:                 52%   0.19  145;   /* focus */
  --radius:               10px;
}
```
