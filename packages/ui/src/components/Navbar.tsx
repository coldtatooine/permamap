import React from 'react';
import { SocialIcons } from './Icon';

// ── Navbar ─────────────────────────────────────────────────────────────────

export interface NavbarProps {
  logo?: React.ReactNode;
  links: Array<{ href: string; label: string; active?: boolean }>;
  actions?: React.ReactNode;
  className?: string;
}

export function Navbar({ logo, links, actions, className }: NavbarProps) {
  return (
    <nav
      className={className}
      style={{
        background: 'var(--ds-green-primary)',
        padding: '0 var(--ds-section-pad)',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '40px',
      }}
    >
      {logo && <div>{logo}</div>}

      <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
        {links.map(link => (
          <a
            key={link.href}
            href={link.href}
            style={{
              fontFamily: 'var(--ds-font-body)',
              fontSize: '15px',
              color: link.active ? 'var(--ds-golden)' : 'var(--ds-white)',
              textDecoration: 'none',
              transition: 'color 200ms',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ds-golden)'; }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.color =
                link.active ? 'var(--ds-golden)' : 'var(--ds-white)';
            }}
          >
            {link.label}
          </a>
        ))}
      </div>

      {actions && <div>{actions}</div>}
    </nav>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────

export interface FooterProps {
  logo?: React.ReactNode;
  description?: string;
  links?: Array<{ label: string; href: string }>;
  newsletter?: boolean;
  onNewsletterSubmit?: (email: string) => void;
  className?: string;
}

export function Footer({ logo, description, links, newsletter, onNewsletterSubmit, className }: FooterProps) {
  const [email, setEmail] = React.useState('');

  return (
    <footer
      className={className}
      style={{
        background: 'var(--ds-black)',
        borderTop: '1px solid var(--ds-white-20)',
        padding: '90px var(--ds-section-pad)',
      }}
    >
      {/* Grid principal */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '100px',
      }}>
        {/* Coluna 1: Logo + Descrição */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '34px' }}>
          {logo && <div>{logo}</div>}
          {description && (
            <p style={{
              fontFamily: 'var(--ds-font-body)',
              fontSize: '16px',
              lineHeight: '25px',
              color: 'var(--ds-white)',
            }}>{description}</p>
          )}
          <hr style={{ border: 'none', borderTop: '1px solid var(--ds-white-20)' }} />
          <SocialIcons />
        </div>

        {/* Coluna 2: Links */}
        {links && links.length > 0 && (
          <div>
            <h4 style={{
              fontFamily: 'var(--ds-font-heading)',
              fontWeight: 600,
              fontSize: '22px',
              color: 'var(--ds-white)',
              marginBottom: '30px',
            }}>Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {links.map(link => (
                <a
                  key={link.href}
                  href={link.href}
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
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Coluna 3: Newsletter */}
        {newsletter && (
          <div>
            <h4 style={{
              fontFamily: 'var(--ds-font-heading)',
              fontWeight: 600,
              fontSize: '22px',
              color: 'var(--ds-white)',
              marginBottom: '15px',
            }}>Newsletter</h4>
            <p style={{
              fontFamily: 'var(--ds-font-body)',
              fontSize: '16px',
              lineHeight: '25px',
              color: 'var(--ds-white)',
              marginBottom: '20px',
            }}>Receba novidades sobre permacultura e o Permamap.</p>
            <form
              onSubmit={e => {
                e.preventDefault();
                onNewsletterSubmit?.(email);
                setEmail('');
              }}
              style={{ position: 'relative' }}
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Seu e-mail"
                style={{
                  width: '100%',
                  background: 'var(--ds-green-secondary)',
                  border: 'none',
                  borderRadius: 'var(--ds-radius-2xl)',
                  padding: '18px 60px 18px 20px',
                  fontFamily: 'var(--ds-font-body)',
                  fontSize: '14px',
                  color: 'var(--ds-white)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: '5px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  background: 'var(--ds-golden)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ds-black)',
                }}
              >
                →
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Copyright */}
      <div style={{
        marginTop: '60px',
        paddingTop: '30px',
        borderTop: '1px solid var(--ds-white-20)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: 'var(--ds-font-body)',
        fontSize: '15px',
        color: 'var(--ds-white)',
      }}>
        <span>© {new Date().getFullYear()} Permamap. Todos os direitos reservados.</span>
        <div style={{ display: 'flex', gap: '30px' }}>
          {['Privacidade', 'Termos'].map(item => (
            <a
              key={item}
              href="#"
              style={{ color: 'var(--ds-white)', textDecoration: 'none', transition: 'color 200ms' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ds-golden)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ds-white)'; }}
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
