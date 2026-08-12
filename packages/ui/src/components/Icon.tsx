import React from 'react';

export type IconName =
  // Social
  | 'facebook' | 'twitter' | 'youtube' | 'instagram'
  // UI
  | 'user' | 'message' | 'arrow-right' | 'growth'
  // Map / App
  | 'hexagon' | 'map-pin' | 'fence' | 'layers' | 'trash' | 'check' | 'x' | 'menu'
  | 'chevron-left' | 'chevron-right' | 'save' | 'plus' | 'locate' | 'edit'
  | 'circle';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
}

const iconPaths: Record<IconName, React.ReactNode> = {
  // ── Social ────────────────────────────────────────────────────────────────
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  twitter:  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />,
  youtube: (
    <>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </>
  ),
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </>
  ),

  // ── UI ────────────────────────────────────────────────────────────────────
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  'arrow-right': (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </>
  ),
  growth: (
    <>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </>
  ),

  // ── Map / App ─────────────────────────────────────────────────────────────
  hexagon: <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />,
  circle:  <circle cx="12" cy="12" r="9" />,
  'map-pin': (
    <>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  fence: (
    <>
      <line x1="3"  y1="6"  x2="3"  y2="18" />
      <line x1="9"  y1="6"  x2="9"  y2="18" />
      <line x1="15" y1="6"  x2="15" y2="18" />
      <line x1="21" y1="6"  x2="21" y2="18" />
      <line x1="3"  y1="9"  x2="21" y2="9"  />
      <line x1="3"  y1="15" x2="21" y2="15" />
    </>
  ),
  layers: (
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>
  ),
  trash: (
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </>
  ),
  check: <polyline points="20 6 9 17 4 12" />,
  x: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6"  y1="6" x2="18" y2="18" />
    </>
  ),
  menu: (
    <>
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6"  x2="21" y2="6"  />
      <line x1="3" y1="18" x2="21" y2="18" />
    </>
  ),
  'chevron-left':  <polyline points="15 18 9 12 15 6" />,
  'chevron-right': <polyline points="9 18 15 12 9 6" />,
  save: (
    <>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </>
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5"  y1="12" x2="19" y2="12" />
    </>
  ),
  locate: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  edit: (
    <>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </>
  ),
};

export function Icon({ name, size = 24, color = 'var(--ds-golden)', className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}

// Ícone com círculo de fundo (Feature cards, Feature list, etc.)
export function IconCircle({
  name,
  size = 50,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const containerSize = Math.round(size * 1.8);
  return (
    <div
      className={className}
      style={{
        width:          containerSize,
        height:         containerSize,
        borderRadius:   '50%',
        background:     'var(--ds-green-primary)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
      }}
    >
      <Icon name={name} size={size} color="var(--ds-golden)" />
    </div>
  );
}

// Grupo de ícones sociais
export function SocialIcons({ className }: { className?: string }) {
  const socials: IconName[] = ['facebook', 'twitter', 'youtube', 'instagram'];
  return (
    <div className={className} style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
      {socials.map(name => (
        <a key={name} href="#" aria-label={name} style={{ color: 'var(--ds-golden)', display: 'flex' }}>
          <Icon name={name} size={24} />
        </a>
      ))}
    </div>
  );
}
