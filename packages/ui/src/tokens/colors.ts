// =====================
// Tokens de Cor — Caderno de Campo Noturno
// =====================
// Fonte de verdade: estes valores devem estar sincronizados com
// as CSS custom properties em frontend/src/index.css (:root).

export const background = {
  void:       '#080f07',
  panel:      '#0d1a0c',
  card:       '#122010',
  cardHover:  '#182c16',
  cardActive: '#1c3419',
} as const;

export const border = {
  default: '#1c3019',
  bright:  '#2a4826',
} as const;

export const text = {
  primary:   '#b4ceae',
  secondary: '#5e7d58',
  tertiary:  '#344d30',
} as const;

export const action = {
  accent:       '#5dd46f',
  accentHover:  '#4bc55d',
  accentMuted:  'rgba(93, 212, 111, 0.12)',
  danger:       '#ff5f5f',
  dangerMuted:  'rgba(255, 95, 95, 0.12)',
  warn:         '#f5c518',
  warnMuted:    'rgba(245, 197, 24, 0.13)',
} as const;

// Cores das 6 zonas de permacultura
export const zone = {
  0: '#ff4d4d', // Zona 0 – Casa / Centro
  1: '#ff8c1a', // Zona 1 – Jardim Intensivo
  2: '#f5c518', // Zona 2 – Uso Frequente
  3: '#40d080', // Zona 3 – Uso Ocasional
  4: '#1fa050', // Zona 4 – Uso Mínimo
  5: '#4da6ff', // Zona 5 – Silvestre / Preservação
} as const satisfies Record<0|1|2|3|4|5, string>;

export type ZoneNumber = keyof typeof zone;

export const colors = { background, border, text, action, zone } as const;
