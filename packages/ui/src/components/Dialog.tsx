import React from 'react';
import { Modal, ModalFooter } from './Modal';
import { Button } from './Button';

export interface DialogProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
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
    <Modal open={open} onClose={loading ? undefined : onCancel} title={title} maxWidth={maxWidth} zIndex={zIndex}>
      {typeof description === 'string' ? (
        <p className="text-[var(--pm-text-2)] text-[0.875rem] font-[var(--font-ui)] leading-relaxed">
          {description}
        </p>
      ) : (
        description
      )}

      <ModalFooter>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* @ts-expect-error type inference mismatch */}
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            fullWidth
          >
            {cancelText}
          </Button>
          {/* @ts-expect-error type inference mismatch */}
          <Button
            variant={variant}
            onClick={onConfirm}
            loading={loading}
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
