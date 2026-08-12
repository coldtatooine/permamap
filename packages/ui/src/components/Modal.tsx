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
  /** z-index do overlay (padrão: var(--z-modal)) */
  zIndex?:     number | string;
  /** Fechar ao clicar no overlay (padrão: true) */
  closeOnOverlay?: boolean;
  /** Exibe a barra de loading no topo do modal */
  loading?:    boolean;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = '420px',
  zIndex   = 'var(--z-modal)',
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
        {/* Barra de loading — clipada pelo border-radius do modal */}
        {loading && <div className="pm-modal-progress" />}
        {title && (
          <h2 style={{
            fontFamily:   'var(--font-display)',
            fontSize:     '1.125rem',
            fontWeight:   700,
            color:        'var(--pm-text)',
            marginBottom: '20px',
            lineHeight:   1.3,
          }}>
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
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      gap:           '8px',
      marginTop:     '24px',
      paddingTop:    '20px',
      borderTop:     '1px solid var(--pm-border)',
    }}>
      {children}
    </div>
  );
}
