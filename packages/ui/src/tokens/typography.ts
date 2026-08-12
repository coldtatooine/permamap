// =====================
// Tokens de Tipografia
// =====================

export const fontFamily = {
  display: "'Fraunces', ui-serif, Georgia, serif",        // Headings, títulos (roman apenas)
  ui:      "'Manrope', ui-sans-serif, system-ui, sans-serif", // Labels, botões, texto geral
  mono:    "'Syne Mono', ui-monospace, monospace",        // Coordenadas, dados tabulares
} as const;

export const fontSize = {
  xs:   '0.7rem',    // labels uppercase
  sm:   '0.8rem',    // tool buttons
  base: '0.875rem',  // inputs, botões, texto padrão
  md:   '1rem',
  lg:   '1.25rem',
  xl:   '1.5rem',
  '2xl': '2rem',
} as const;

export const fontWeight = {
  normal:    400,
  semibold:  600,
  bold:      700,
  extrabold: 800,
} as const;

export const letterSpacing = {
  tight:   '-0.02em',
  normal:  '0em',
  ui:      '0.02em',   // botões
  label:   '0.08em',   // labels uppercase
} as const;

export const typography = { fontFamily, fontSize, fontWeight, letterSpacing } as const;
