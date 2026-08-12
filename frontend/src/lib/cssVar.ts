/**
 * Lê um token CSS em runtime. Leaflet não consome var() em pathOptions,
 * então cores de camadas do mapa resolvem assim — nunca hex solto no componente.
 */
export function cssVar(name: string, fallback: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}
