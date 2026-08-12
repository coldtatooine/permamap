// =====================
// Brand Tokens — Permamap
// Sincronizado com design.md (Hallmark custom "green light" — light / roman-serif / chromatic-green ~145°)
// Fonte de verdade das CSS vars: frontend/src/index.css (:root)
// Chaves legadas (golden, greenPrimary…) preservadas como aliases p/ compat.
// =====================

export const brandColors = {
  // Canônicas (design.md)
  paper:      'oklch(96.5% 0.015 130)',
  paper2:     'oklch(93.5% 0.020 130)',
  paper3:     'oklch(90% 0.022 128)',
  ink:        'oklch(21% 0.012 140)',
  ink2:       'oklch(38% 0.012 140)',
  muted:      'oklch(52% 0.012 135)',
  rule:       'oklch(80% 0.016 132)',
  rule2:      'oklch(72% 0.016 134)',
  accent:     'oklch(56% 0.15 145)',
  accentDeep: 'oklch(42% 0.13 145)',
  accentInk:  'oklch(21% 0.012 140)',
  accentSoft: 'oklch(91% 0.045 140)',
  focus:      'oklch(52% 0.19 145)',

  // Legadas (aliases — não usar em código novo)
  golden:         'oklch(56% 0.15 145)',   // → accent
  greenPrimary:   'oklch(35% 0.06 142)',   // superfície escura de marketing
  greenSecondary: 'oklch(28% 0.05 142)',
  black:          'oklch(21% 0.012 140)',  // → ink
  blackDeep:      'oklch(16% 0.01 140)',
  white:          'oklch(96.5% 0.015 130)', // → paper

  // Overlays sobre imagem (alpha é modificador, não cor)
  white80: 'oklch(96.5% 0.015 130 / 0.8)',
  white50: 'oklch(96.5% 0.015 130 / 0.5)',
  white20: 'oklch(96.5% 0.015 130 / 0.2)',
  black80: 'oklch(21% 0.012 140 / 0.8)',
  black40: 'oklch(21% 0.012 140 / 0.4)',
  black30: 'oklch(21% 0.012 140 / 0.3)',
} as const;

export const brandGradients = {
  /** Gradiente de overlay em cards (bottom → top) */
  overlay: 'linear-gradient(to top, oklch(21% 0.012 140 / 0.8), oklch(21% 0.012 140 / 0.4), transparent)',
  /** Gradiente hero de fundo (left → right) — dois stops apenas */
  hero:    'linear-gradient(to right, oklch(35% 0.06 142), oklch(28% 0.05 142))',
} as const;

export const brandTypography = {
  fontFamily: {
    /** Fraunces — headers, display, wordmark (roman apenas; itálico nunca em heading) */
    heading: "'Fraunces', ui-serif, Georgia, serif",
    /** Manrope — body, UI, descrições */
    body:    "'Manrope', ui-sans-serif, system-ui, sans-serif",
    /** Fraunces — display / hero headlines */
    display: "'Fraunces', ui-serif, Georgia, serif",
    /** Syne Mono — outlier: coordenadas e dados tabulares */
    mono:    "'Syne Mono', ui-monospace, monospace",
  },
  fontSize: {
    tag:     '11px',
    sm:      '13px',
    base:    '15px',
    md:      '16px',
    lg:      '18px',
    xl:      '20px',
    '2xl':   '22px',
    '3xl':   '24px',
    '4xl':   '28px',
    h1:      '50px',
    display: 'clamp(2.75rem, 5vw + 1rem, 5.25rem)',
  },
} as const;

export const brandSpacing = {
  '3xs': '2px',
  '2xs': '4px',
  xs:   '8px',
  sm:   '12px',
  md:   '16px',
  lg:   '24px',
  xl:   '40px',
  '2xl': '64px',
  '3xl': '96px',
  '4xl': '144px',
  section: '240px',   // padding horizontal de seções (marketing)
} as const;

export const brandRadius = {
  sm:   '5px',    // tags, elementos pequenos
  md:   '10px',   // cards, thumbnails
  lg:   '15px',   // large cards
  xl:   '20px',   // botões
  '2xl': '50px',  // inputs pill, full-rounded
  full: '50%',    // círculos, ícones
} as const;

export const brandShadows = {
  sm:  '0 1px 2px oklch(21% 0.012 140 / 0.06)',   // whisper
  md:  '0 4px 8px oklch(21% 0.012 140 / 0.10)',
  lg:  '0 8px 16px oklch(21% 0.012 140 / 0.14)',
} as const;

export const brand = {
  colors:     brandColors,
  gradients:  brandGradients,
  typography: brandTypography,
  spacing:    brandSpacing,
  radius:     brandRadius,
  shadows:    brandShadows,
} as const;
