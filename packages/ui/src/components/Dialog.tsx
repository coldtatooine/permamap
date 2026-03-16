import type { ReactNode } from 'react';
import { Modal, ModalFooter } from './Modal';
import { Button } from './Button';

export interface DialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  maxWidth?: string;
  zIndex?: number;
}

export function Dialog({
  open,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
  maxWidth = '420px',
  zIndex = 2000,
}: DialogProps) {
  return (
    <Modal open={open} onClose={loading ? undefined : onCancel} title={title} maxWidth={maxWidth} zIndex={zIndex} loading={loading}>
      {typeof description === 'string' ? (
        <p style={{
          color:      'var(--pm-text-2)',
          fontSize:   '0.875rem',
          fontFamily: 'var(--font-ui)',
          lineHeight: 1.6,
        }}>
          {description}
        </p>
      ) : (
        description
      )}

      <ModalFooter>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            fullWidth
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={loading}
            fullWidth
          >
            {confirmText}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
