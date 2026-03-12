import React from 'react';

const sizeMap = { sm: '150px', md: '200px', lg: '300px', xl: '400px' } as const;
type ThumbnailSize = keyof typeof sizeMap;

export interface ThumbnailProps {
  src: string;
  alt: string;
  size?: ThumbnailSize;
  rounded?: boolean;
  overlay?: boolean;
  overlayContent?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Thumbnail({
  src,
  alt,
  size = 'md',
  rounded = true,
  overlay = false,
  overlayContent,
  className,
  onClick,
}: ThumbnailProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      className={className}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        height: sizeMap[size],
        borderRadius: rounded ? 'var(--ds-radius-md)' : undefined,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 300ms',
        }}
      />
      {overlay && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--ds-gradient-overlay)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 300ms',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '20px',
          }}
        >
          {overlayContent}
        </div>
      )}
    </div>
  );
}

// ── Image Grid ─────────────────────────────────────────────────────────────

export interface ImageGridProps {
  images: Array<{ src: string; alt: string; title?: string }>;
  columns?: 2 | 3 | 4;
  gap?: number;
  className?: string;
}

export function ImageGrid({ images, columns = 3, gap = 24, className }: ImageGridProps) {
  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
      }}
    >
      {images.map((img, i) => (
        <Thumbnail
          key={i}
          src={img.src}
          alt={img.alt}
          size="lg"
          overlay={!!img.title}
          overlayContent={
            img.title ? (
              <span style={{
                fontFamily: 'var(--ds-font-heading)',
                fontWeight: 600,
                fontSize: '16px',
                color: 'var(--ds-white)',
              }}>{img.title}</span>
            ) : undefined
          }
        />
      ))}
    </div>
  );
}
