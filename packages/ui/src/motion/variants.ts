import type { Variants } from 'framer-motion';
import { duration, easing } from '../tokens/animation';

// =====================
// Variantes Framer Motion — Permamap
// =====================
// Espelham os @keyframes CSS existentes para uso em componentes React
// animados com <AnimatePresence> + motion.*

/** Entrada suave com slide para cima (ex.: cards, panels) */
export const slideUp: Variants = {
  hidden:  { opacity: 0, y: 6 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: duration.medium / 1000, ease: easing.easeOut },
  },
  exit: {
    opacity: 0, y: 6,
    transition: { duration: duration.fast / 1000 },
  },
};

/** Entrada com spring (ex.: modais, wizard) */
export const wizardIn: Variants = {
  hidden:  { opacity: 0, y: 18, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: duration.slow / 1000, ease: easing.spring },
  },
  exit: {
    opacity: 0, y: 8, scale: 0.98,
    transition: { duration: duration.normal / 1000 },
  },
};

/** Fade simples (ex.: overlays, tooltips) */
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.normal / 1000 } },
  exit:    { opacity: 0, transition: { duration: duration.fast / 1000 } },
};

/** Overlay de modal escuro */
export const overlay: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.fast / 1000 } },
  exit:    { opacity: 0, transition: { duration: duration.fast / 1000 } },
};

/**
 * Entrada em stagger para listas (ex.: ZonePanel, ElementPanel).
 * Usar com `custom={index}` em cada item.
 *
 * @example
 * <motion.li variants={listItem} custom={i} initial="hidden" animate="visible" />
 */
export const listItem: Variants = {
  hidden:  { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.06, duration: duration.medium / 1000, ease: easing.easeOut },
  }),
};

/**
 * Container para stagger automático de filhos.
 * Combinar com `listItem` nos filhos.
 */
export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06 } },
};

/** Pulso de geolocalização (escala + fade) */
export const geoPulse: Variants = {
  animate: {
    scale: [0.9, 2.2],
    opacity: [0.9, 0],
    transition: { duration: 2.4, ease: 'easeOut', repeat: Infinity },
  },
};

/** Slide horizontal da sidebar */
export const sidebarSlide = (width: number): Variants => ({
  closed: { width: 0, opacity: 0, transition: { duration: 0.3, ease: easing.easeInOut } },
  open:   { width, opacity: 1, transition: { duration: 0.3, ease: easing.easeInOut } },
});
