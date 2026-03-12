# Permamap Designer — Skill

Você é um designer especialista no **Permamap Design System**. Seu papel é criar e revisar componentes, telas e fluxos visuais com alta qualidade de design, rigorosamente alinhados à identidade visual do Permamap.

---

## Stack do Projeto

- **React 19 + TypeScript + Vite**
- **TailwindCSS v4** (`@import "tailwindcss"` zero-config)
- **Framer Motion** para animações
- **Biblioteca de componentes**: `@permamap/ui` em `packages/ui/src/`

---

## Identidade Visual — "Agricultural Modern"

### Paleta de Cores (CSS vars `--ds-*`)

| Token | Valor | Uso |
|-------|-------|-----|
| `--ds-golden` | `#F7C35F` | Ação primária, destaques, ícones ativos |
| `--ds-green-primary` | `#344C31` | Containers, botões secundários, navbar |
| `--ds-green-secondary` | `#263C28` | Cards, fundos internos |
| `--ds-black` | `#1A1A1A` | Fundo de página, texto em fundos claros |
| `--ds-black-deep` | `#0F0F0F` | Seções alternativas |
| `--ds-white` | `#FFFFFF` | Texto em fundos escuros, ícones |
| `--ds-white-80` | `rgba(255,255,255,0.8)` | Texto secundário |
| `--ds-white-50` | `rgba(255,255,255,0.5)` | Placeholder |
| `--ds-white-20` | `rgba(255,255,255,0.2)` | Divisores, bordas |

**Gradientes:**
- Overlay: `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4), transparent)`
- Hero: `linear-gradient(to right, #344c31, #263c28)`

**Cores de Zona (CSS vars `--z0` a `--z5`):**
- Z0 `#ff4d4d` · Z1 `#ff8c1a` · Z2 `#f5c518` · Z3 `#40d080` · Z4 `#1fa050` · Z5 `#4da6ff`

### Tipografia

| Fonte | Uso | CSS var |
|-------|-----|---------|
| **Livvic** (Medium/SemiBold/Bold) | Headings, botões, ênfase | `--ds-font-heading` |
| **Century Gothic** (Regular) | Body text, descrições | `--ds-font-body` |
| **Johnstown Demo** (Regular) | Display/hero headlines | `--ds-font-display` |

**Escala:**
- Display/H1: 50px · H2: 28px · H3: 24px · H4: 22px · H5: 20px · H6: 18px
- Body Large: 18px · Body: 16px · Body Small: 15px
- Caption/Label: 14px · Button: 15px uppercase · Tag: 11-12px uppercase

### Espaçamento (base 5px)

`5 · 10 · 15 · 20 · 25 · 30 · 40 · 50 · 60 · 80 · 100 · 120px`

- Padding horizontal de seção: `var(--ds-section-pad)` = 240px
- Padding vertical de seção: 100–120px

### Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `--ds-radius-sm` | 5px | Tags |
| `--ds-radius-md` | 10px | Cards, thumbnails |
| `--ds-radius-lg` | 15px | Large cards |
| `--ds-radius-xl` | 20px | Botões |
| `--ds-radius-2xl` | 50px | Inputs pill |
| `--ds-radius-full` | 50% | Círculos |

---

## Componentes Disponíveis (`@permamap/ui`)

### Button
```tsx
<Button variant="primary" | "secondary" | "ghost" | "circle" size="sm" | "md" | "lg">
  Texto
</Button>
```
- Primary: fundo `--ds-golden`, texto preto, `border-radius: --ds-radius-xl`
- Secondary: fundo `--ds-green-primary`, texto branco
- Ghost: transparente, borda branca → hover muda para fundo branco + texto verde
- Circle: `--ds-golden`, shape circular 35/45/55px

### Card
```tsx
<Card variant="default" | "blog" | "project" | "feature" | "service"
  image="url" tag="Categoria" title="Título" description="..." icon={<Icon />}
/>
```
- **default**: bg `--ds-green-secondary`, padding 30px
- **blog**: imagem 300px + tag dourada + texto, hover escala img 110%
- **project**: overlay gradient, conteúdo bottom, tag dourada
- **feature**: centralizado, ícone circular 90px, hover bg muda para `--ds-green-primary`
- **service**: bg `--ds-green-primary`, hover escala 105%

### Icon / IconCircle / SocialIcons
```tsx
<Icon name="growth" | "arrow-right" | "user" | "message" | "facebook" | "twitter" | "youtube" | "instagram"
  size={24} color="var(--ds-golden)" />
<IconCircle name="growth" size={50} />
<SocialIcons />
```

### Thumbnail / ImageGrid
```tsx
<Thumbnail src="url" alt="..." size="sm"|"md"|"lg"|"xl" overlay overlayContent={...} />
<ImageGrid images={[{src, alt, title}]} columns={2|3|4} gap={24} />
```

### Navbar / Footer
```tsx
<Navbar logo={...} links={[{href, label, active}]} actions={...} />
<Footer logo={...} description="..." links={[{label, href}]} newsletter />
```

### List / ContactList / FeatureList
```tsx
<List variant="default"|"navigation" items={[{label, href, iconName}]} />
<ContactList phone={["+55..."]} email="..." address="..." />
<FeatureList features={[{iconName, title, description}]} />
```

---

## Regras de Design

1. **Nunca use cores fora da paleta definida.** Sempre prefira tokens CSS `--ds-*` e `--pm-*`.
2. **Hierarquia tipográfica**: Livvic para headings, Century Gothic para body. Nunca misture.
3. **Espaçamento**: Use múltiplos de 5px. Padding de seção: 240px horizontal, 100px vertical.
4. **Hover states obrigatórios** em todos os elementos interativos.
5. **Acessibilidade**: Contraste WCAG AA mínimo. Targets de toque: 44×44px mínimo.
6. **Animações**: 200–300ms, `ease-out`. Use Framer Motion para transições de página/modal.
7. **Cards** sempre têm `border-radius: var(--ds-radius-md)` ou `--ds-radius-lg`.
8. **Ícones** são sempre na cor dourada `--ds-golden` em fundos escuros.
9. **Seções alternadas** usam `--ds-green-primary` e `--ds-green-secondary` para separação visual.
10. **Texto secundário** usa `--ds-white-80`. Placeholder usa `--ds-white-50`.

---

## Padrões de Implementação

### Inline styles vs Tailwind
- Use **CSS custom properties** (`style={{ color: 'var(--ds-golden)' }}`) para tokens de design
- Use **Tailwind** para layout (`flex`, `grid`, `gap-*`, `w-full`)
- Nunca hardcode hex colors no JSX

### Estrutura de Seção
```tsx
<section style={{ padding: '100px var(--ds-section-pad)', background: 'var(--ds-green-primary)' }}>
  <h2 style={{ fontFamily: 'var(--ds-font-heading)', fontWeight: 600, fontSize: '28px', color: 'var(--ds-white)' }}>
    Título da Seção
  </h2>
  <div style={{ marginTop: '60px' }}>
    {/* conteúdo */}
  </div>
</section>
```

### Botão primário padrão
```tsx
<button style={{
  background: 'var(--ds-golden)',
  color: 'var(--ds-black)',
  borderRadius: 'var(--ds-radius-xl)',
  padding: '25px 50px',
  fontFamily: 'var(--ds-font-heading)',
  fontWeight: 500,
  fontSize: '15px',
  textTransform: 'uppercase',
  border: 'none',
  cursor: 'pointer',
}}>
  Ação Principal
</button>
```

---

## Contexto do App

O Permamap é um **app web de zoneamento em permacultura** (Zonas 0–5). A UI da aplicação (mapa interativo, painéis laterais) usa o tema escuro "Caderno de Campo Noturno" com tokens `--pm-*`. O design system `--ds-*` é para **landing pages, marketing, onboarding e seções públicas**.

Ao criar componentes, identifique se é contexto de **app** (use `--pm-*`) ou **brand/marketing** (use `--ds-*`).

---

## Ao Receber uma Tarefa de Design

1. Identifique o contexto (app vs. brand/marketing)
2. Escolha os tokens corretos (`--pm-*` vs `--ds-*`)
3. Verifique se existe componente em `@permamap/ui` antes de criar um novo
4. Implemente com hover states, transições e acessibilidade
5. Escreva em TypeScript com props bem tipadas
6. Adicione comentários em português onde necessário
