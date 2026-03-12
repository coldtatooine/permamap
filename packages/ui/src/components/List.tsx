import React from 'react';
import { Icon } from './Icon';
import type { IconName } from './Icon';

// ── Tipos ──────────────────────────────────────────────────────────────────

export interface ListItem {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  iconName?: IconName;
  href?: string;
  onClick?: () => void;
}

export interface ListProps {
  items: ListItem[];
  variant?: 'default' | 'navigation' | 'contact';
  className?: string;
}

// ── Navigation List ────────────────────────────────────────────────────────

function NavigationList({ items, className }: ListProps) {
  return (
    <ul className={className} style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {items.map((item, i) => (
        <li key={i}>
          <a
            href={item.href || '#'}
            onClick={item.onClick}
            style={{
              fontFamily: 'var(--ds-font-body)',
              fontSize: '15px',
              color: 'var(--ds-white)',
              textDecoration: 'none',
              transition: 'color 200ms',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ds-golden)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ds-white)'; }}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

// ── Contact List ───────────────────────────────────────────────────────────

export interface ContactListProps {
  phone?: string[];
  email?: string;
  address?: string;
  className?: string;
}

export function ContactList({ phone, email, address, className }: ContactListProps) {
  const items = [
    phone && { label: 'Telefone', value: phone.join(' / ') },
    email && { label: 'E-mail', value: email },
    address && { label: 'Endereço', value: address },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <ul className={className} style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <span style={{
            fontFamily: 'var(--ds-font-body)',
            fontSize: '14px',
            color: 'var(--ds-white)',
            textTransform: 'uppercase',
            lineHeight: '30px',
          }}>{item.label}</span>
          <span style={{
            fontFamily: 'var(--ds-font-heading)',
            fontWeight: 500,
            fontSize: '20px',
            color: 'var(--ds-white)',
            lineHeight: '27px',
          }}>{item.value}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Feature List ───────────────────────────────────────────────────────────

export interface FeatureListItem {
  iconName?: IconName;
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

export interface FeatureListProps {
  features: FeatureListItem[];
  className?: string;
}

export function FeatureList({ features, className }: FeatureListProps) {
  return (
    <ul className={className} style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '25px' }}>
      {features.map((feature, i) => (
        <li key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'var(--ds-green-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {feature.icon ?? (feature.iconName
              ? <Icon name={feature.iconName} size={24} color="var(--ds-golden)" />
              : null
            )}
          </div>
          <div>
            <h4 style={{
              fontFamily: 'var(--ds-font-heading)',
              fontWeight: 600,
              fontSize: '18px',
              color: 'var(--ds-white)',
              marginBottom: '8px',
            }}>{feature.title}</h4>
            {feature.description && (
              <p style={{
                fontFamily: 'var(--ds-font-body)',
                fontSize: '15px',
                lineHeight: '24px',
                color: 'var(--ds-white-80)',
              }}>{feature.description}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

// ── Default List ───────────────────────────────────────────────────────────

function DefaultList({ items, className }: ListProps) {
  return (
    <ul className={className} style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {items.map((item, i) => (
        <li
          key={i}
          onClick={item.onClick}
          style={{
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            padding: '10px 0',
            cursor: item.onClick ? 'pointer' : undefined,
          }}
        >
          {(item.icon ?? (item.iconName
            ? <Icon name={item.iconName} size={20} color="var(--ds-golden)" />
            : null
          ))}
          <span style={{
            fontFamily: 'var(--ds-font-body)',
            fontSize: '15px',
            color: 'var(--ds-white)',
            transition: 'color 200ms',
          }}>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────

export function List({ variant = 'default', ...props }: ListProps) {
  if (variant === 'navigation') return <NavigationList {...props} />;
  return <DefaultList {...props} />;
}
