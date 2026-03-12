import React from 'react';

// =====================
// Input — campo de texto dark-themed
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
          error ? 'border-[var(--pm-danger)] focus:shadow-[0_0_0_3px_var(--pm-danger-muted)]' : '',
          className,
        ].filter(Boolean).join(' ')}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error && (
        <span
          id={`${inputId}-error`}
          role="alert"
          className="text-[var(--pm-danger)] text-xs font-[var(--font-ui)]"
        >
          {error}
        </span>
      )}
      {!error && hint && (
        <span
          id={`${inputId}-hint`}
          className="text-[var(--pm-text-3)] text-xs font-[var(--font-ui)]"
        >
          {hint}
        </span>
      )}
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
        aria-invalid={error ? true : undefined}
        {...props}
      >
        {children}
      </select>
      {error && (
        <span role="alert" className="text-[var(--pm-danger)] text-xs">
          {error}
        </span>
      )}
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
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error && (
        <span role="alert" className="text-[var(--pm-danger)] text-xs">
          {error}
        </span>
      )}
    </div>
  );
}
