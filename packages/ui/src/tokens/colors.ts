// =====================
// Tokens de Cor — zonas de permacultura
// =====================
// As cores de superfície/texto/ação vivem em frontend/src/index.css (:root)
// como custom properties --color-* / --pm-* (fonte de verdade: design.md).
// Aqui ficam apenas as cores funcionais de zona, renderizadas sobre tiles
// do Leaflet — não re-tintar (design.md § Theme).

export const zone = {
  0: '#ff4d4d', // Zona 0 – Casa / Centro
  1: '#ff8c1a', // Zona 1 – Jardim Intensivo
  2: '#f5c518', // Zona 2 – Uso Frequente
  3: '#40d080', // Zona 3 – Uso Ocasional
  4: '#1fa050', // Zona 4 – Uso Mínimo
  5: '#4da6ff', // Zona 5 – Silvestre / Preservação
} as const satisfies Record<0|1|2|3|4|5, string>;

export type ZoneNumber = keyof typeof zone;
