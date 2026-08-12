import React from 'react';

// =====================
// Input — campo de texto
// =====================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:    string;
  error?:    string;
  hint?:     string;
}

export function Input({ label, error, hint, id, className = '', ...props }: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="pm-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'pm-input',
          error ? 'border-[var(--pm-danger)]' : '',
          className,
        ].filter(Boolean).join(' ')}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {/* Slot sempre reservado (min-height: 1lh) — erro aparecendo não empurra o layout */}
      <span
        id={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        role={error ? 'alert' : undefined}
        className={`text-xs font-[var(--font-ui)] ${error ? 'text-[var(--color-danger-deep)]' : 'text-[var(--pm-text-2)]'}`}
        style={{ display: 'block', minHeight: '1lh' }}
      >
        {error ?? hint ?? ''}
      </span>
    </div>
  );
}

// =====================
// Select
// =====================

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:  string;
  error?:  string;
}

export function Select({ label, error, id, className = '', children, ...props }: SelectProps) {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="pm-label" htmlFor={selectId}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={[
          'pm-select',
          error ? 'border-[var(--pm-danger)]' : '',
          className,
        ].filter(Boolean).join(' ')}
        aria-describedby={error ? `${selectId}-error` : undefined}
        aria-invalid={error ? true : undefined}
        {...props}
      >
        {children}
      </select>
      {/* Slot sempre reservado (min-height: 1lh) — erro aparecendo não empurra o layout */}
      <span
        id={error ? `${selectId}-error` : undefined}
        role={error ? 'alert' : undefined}
        className={`text-xs font-[var(--font-ui)] ${error ? 'text-[var(--color-danger-deep)]' : 'text-[var(--pm-text-2)]'}`}
        style={{ display: 'block', minHeight: '1lh' }}
      >
        {error ?? ''}
      </span>
    </div>
  );
}

// =====================
// Textarea
// =====================

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  rows?:  number;
}

export function Textarea({ label, error, id, rows = 3, className = '', ...props }: TextareaProps) {
  const textareaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="pm-label" htmlFor={textareaId}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={[
          'pm-textarea',
          error ? 'border-[var(--pm-danger)]' : '',
          className,
        ].filter(Boolean).join(' ')}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {/* Slot sempre reservado (min-height: 1lh) — erro aparecendo não empurra o layout */}
      <span
        id={error ? `${textareaId}-error` : undefined}
        role={error ? 'alert' : undefined}
        className={`text-xs font-[var(--font-ui)] ${error ? 'text-[var(--color-danger-deep)]' : 'text-[var(--pm-text-2)]'}`}
        style={{ display: 'block', minHeight: '1lh' }}
      >
        {error ?? ''}
      </span>
    </div>
  );
}
