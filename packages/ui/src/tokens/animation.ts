// =====================
// Tokens de Animação
// =====================
// Sincronizados com os @keyframes em frontend/src/index.css

export const duration = {
  instant:  100,
  fast:     150,
  normal:   200,
  medium:   220,
  slow:     320,
  verySlow: 400,
} as const;

export const easing = {
  easeOut:   [0, 0, 0.2, 1]       as [number, number, number, number],
  easeIn:    [0.4, 0, 1, 1]       as [number, number, number, number],
  easeInOut: [0.4, 0, 0.2, 1]     as [number, number, number, number],
  spring:    [0.34, 1.4, 0.64, 1] as [number, number, number, number], // pm-wizard-in
} as const;

export const animation = { duration, easing } as const;
