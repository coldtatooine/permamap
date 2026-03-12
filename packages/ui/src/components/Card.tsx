import React from 'react';

export type CardVariant = 'default' | 'blog' | 'project' | 'feature' | 'service';

export interface CardProps {
  variant?: CardVariant;
  image?: string;
  tag?: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

// ── Default ────────────────────────────────────────────────────────────────

function DefaultCard({ title, description, className = '', onClick }: CardProps) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: 'var(--ds-green-secondary)',
        borderRadius: 'var(--ds-radius-md)',
        padding: '30px',
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      <h3 style={{
        fontFamily: 'var(--ds-font-heading)',
        fontWeight: 600,
        fontSize: '22px',
        color: 'var(--ds-white)',
        marginBottom: '15px',
      }}>{title}</h3>
      {description && (
        <p style={{
          fontFamily: 'var(--ds-font-body)',
          fontSize: '16px',
          lineHeight: '25px',
          color: 'var(--ds-white-80)',
        }}>{description}</p>
      )}
    </div>
  );
}

// ── Blog ───────────────────────────────────────────────────────────────────

function BlogCard({ image, tag, title, description, className = '', onClick }: CardProps) {
  return (
    <article
      className={className}
      onClick={onClick}
      style={{
        background: 'var(--ds-green-secondary)',
        borderRadius: 'var(--ds-radius-md)',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      {image && (
        <div style={{ height: '300px', overflow: 'hidden' }}>
          <img
            src={image}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 300ms',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
          />
        </div>
      )}
      <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {tag && (
          <span style={{
            display: 'inline-block',
            background: 'var(--ds-golden)',
            color: 'var(--ds-black)',
            padding: '8px 15px',
            borderRadius: 'var(--ds-radius-sm)',
            fontFamily: 'var(--ds-font-heading)',
            fontSize: '12px',
            fontWeight: 500,
            textTransform: 'uppercase',
            alignSelf: 'flex-start',
          }}>{tag}</span>
        )}
        <h3 style={{
          fontFamily: 'var(--ds-font-heading)',
          fontWeight: 600,
          fontSize: '22px',
          lineHeight: '30px',
          color: 'var(--ds-white)',
        }}>{title}</h3>
        {description && (
          <p style={{
            fontFamily: 'var(--ds-font-body)',
            fontSize: '15px',
            lineHeight: '25px',
            color: 'var(--ds-white-80)',
          }}>{description}</p>
        )}
      </div>
    </article>
  );
}

// ── Project ────────────────────────────────────────────────────────────────

function ProjectCard({ image, tag, title, className = '', onClick }: CardProps) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        position: 'relative',
        height: '300px',
        borderRadius: 'var(--ds-radius-md)',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      {image && (
        <img
          src={image}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--ds-gradient-overlay)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        {tag && (
          <span style={{
            display: 'inline-block',
            background: 'var(--ds-golden)',
            color: 'var(--ds-black)',
            padding: '6px 12px',
            borderRadius: 'var(--ds-radius-sm)',
            fontFamily: 'var(--ds-font-heading)',
            fontSize: '11px',
            fontWeight: 500,
            textTransform: 'uppercase',
            alignSelf: 'flex-start',
          }}>{tag}</span>
        )}
        <h3 style={{
          fontFamily: 'var(--ds-font-heading)',
          fontWeight: 600,
          fontSize: '20px',
          color: 'var(--ds-white)',
        }}>{title}</h3>
      </div>
    </div>
  );
}

// ── Feature ────────────────────────────────────────────────────────────────

function FeatureCard({ icon, title, description, className = '', onClick }: CardProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      className={className}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--ds-green-primary)' : 'var(--ds-green-secondary)',
        borderRadius: 'var(--ds-radius-lg)',
        padding: '40px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '25px',
        transition: 'background 300ms',
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      {icon && (
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'var(--ds-green-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--ds-golden)',
          flexShrink: 0,
        }}>
          {icon}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3 style={{
          fontFamily: 'var(--ds-font-heading)',
          fontWeight: 600,
          fontSize: '20px',
          color: 'var(--ds-white)',
        }}>{title}</h3>
        {description && (
          <p style={{
            fontFamily: 'var(--ds-font-body)',
            fontSize: '15px',
            lineHeight: '25px',
            color: 'var(--ds-white-80)',
          }}>{description}</p>
        )}
      </div>
    </div>
  );
}

// ── Service ────────────────────────────────────────────────────────────────

function ServiceCard({ icon, title, className = '', onClick }: CardProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      className={className}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--ds-green-primary)',
        borderRadius: 'var(--ds-radius-md)',
        padding: '30px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 300ms',
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      {icon && (
        <div style={{ color: 'var(--ds-golden)', width: '30px', height: '30px' }}>
          {icon}
        </div>
      )}
      <h3 style={{
        fontFamily: 'var(--ds-font-heading)',
        fontWeight: 600,
        fontSize: '16px',
        color: 'var(--ds-white)',
      }}>{title}</h3>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

const variants: Record<CardVariant, React.FC<CardProps>> = {
  default: DefaultCard,
  blog:    BlogCard,
  project: ProjectCard,
  feature: FeatureCard,
  service: ServiceCard,
};

export function Card({ variant = 'default', ...props }: CardProps) {
  const Component = variants[variant];
  return <Component variant={variant} {...props} />;
}
