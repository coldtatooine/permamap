// =====================
// Brand Tokens — Permamap
// Paleta "Agricultural Modern" (marketing, landing, branding)
// =====================
// Fonte de verdade: sincronize com as CSS vars em frontend/src/index.css (--ds-*)

export const brandColors = {
  // Primárias
  golden:          '#F7C35F',   // Ação primária, destaques, ícones
  greenPrimary:    '#344C31',   // Fundo de containers, ações secundárias
  greenSecondary:  '#263C28',   // Fundo de cards, containers internos

  // Neutras
  black:           '#1A1A1A',   // Texto em fundos claros, fundo de página
  blackDeep:       '#0F0F0F',   // Seção alternativa de fundo
  white:           '#FFFFFF',   // Texto em fundos escuros, ícones

  // Opacidade (white)
  white80:  'rgba(255, 255, 255, 0.8)',  // Texto secundário
  white50:  'rgba(255, 255, 255, 0.5)',  // Placeholder
  white20:  'rgba(255, 255, 255, 0.2)',  // Divisores, bordas

  // Opacidade (black overlay)
  black80:  'rgba(0, 0, 0, 0.8)',
  black40:  'rgba(0, 0, 0, 0.4)',
  black30:  'rgba(0, 0, 0, 0.3)',
} as const;

export const brandGradients = {
  /** Gradiente de overlay em cards de projeto (bottom → top) */
  overlay: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4), transparent)',
  /** Gradiente hero de fundo (left → right) */
  hero:    'linear-gradient(to right, #344c31, #263c28)',
} as const;

export const brandTypography = {
  fontFamily: {
    /** Livvic — headers, botões, ênfase */
    heading: "'Livvic', sans-serif",
    /** Century Gothic — body, descrições */
    body:    "'Century Gothic', 'AppleGothic', sans-serif",
    /** Johnstown Demo — display / hero headlines */
    display: "'Johnstown Demo', serif",
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
    display: '50px',
  },
} as const;

export const brandSpacing = {
  xs:   '5px',
  sm:   '10px',
  md:   '15px',
  lg:   '20px',
  xl:   '25px',
  '2xl': '30px',
  '3xl': '40px',
  '4xl': '50px',
  '5xl': '60px',
  '6xl': '80px',
  '7xl': '100px',
  '8xl': '120px',
  section: '240px',   // padding horizontal de seções
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
  sm:  '0 2px 4px rgba(0, 0, 0, 0.1)',
  md:  '0 4px 8px rgba(0, 0, 0, 0.15)',
  lg:  '0 8px 16px rgba(0, 0, 0, 0.2)',
} as const;

export const brand = {
  colors:     brandColors,
  gradients:  brandGradients,
  typography: brandTypography,
  spacing:    brandSpacing,
  radius:     brandRadius,
  shadows:    brandShadows,
} as const;
