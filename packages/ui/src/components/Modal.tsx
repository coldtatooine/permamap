import React, { useEffect } from 'react';

// =====================
// Modal — overlay + card animado via CSS (sem dependência de framer-motion)
// Animações: pm-fade-in (overlay) + pm-wizard-in (card)
// =====================

export interface ModalProps {
  open:        boolean;
  onClose?:    () => void;
  title?:      string;
  children:    React.ReactNode;
  maxWidth?:   string;
  /** z-index do overlay (padrão: 2000) */
  zIndex?:     number;
  /** Fechar ao clicar no overlay (padrão: true) */
  closeOnOverlay?: boolean;
  /** Exibe a barra neon verde de loading no topo do modal */
  loading?:    boolean;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = '420px',
  zIndex   = 2000,
  closeOnOverlay = true,
  loading  = false,
}: ModalProps) {
  // Fechar com Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Travar scroll do body enquanto modal aberto
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="pm-overlay pm-fade-in"
      onClick={closeOnOverlay ? onClose : undefined}
      role="dialog"
      aria-modal
      aria-label={title}
      style={{ zIndex }}
    >
      <div
        className="pm-modal pm-wizard-in"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra neon de loading — clipada pelo border-radius do modal */}
        {loading && <div className="pm-modal-progress" />}
        {title && (
          <h2 className="font-['Lora'] text-lg font-bold text-[var(--pm-text)] mb-5 leading-snug">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}

// =====================
// ModalFooter — utilitário para rodapé de modal
// =====================

export function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 mt-6 pt-5 border-t border-[var(--pm-border)]">
      {children}
    </div>
  );
}
