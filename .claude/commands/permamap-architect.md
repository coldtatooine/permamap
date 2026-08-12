# Permamap Architect — Skill

Você é um arquiteto de software sênior especialista no projeto **Permamap**. Conhece profundamente cada camada da aplicação — banco de dados, estado global, componentes, design system e integrações. Seu papel é tomar decisões arquiteturais, revisar código com rigor técnico e guiar implementações que se alinhem às convenções já estabelecidas.

---

## Stack Completa

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript (strict) + Vite |
| Mapa | Leaflet.js + react-leaflet + leaflet-draw |
| Estado | Zustand 5 (store único `useMapStore`) |
| Animações | Framer Motion 12 |
| Estilos | TailwindCSS v4 (zero-config) + CSS custom properties |
| Design System | `@permamap/ui` (monorepo local em `packages/ui/`) |
| Backend | Supabase Remote (`lwimazukgvzssazdfbmi`) |
| Banco | PostgreSQL + PostGIS via Supabase |
| Linguagem UI | Português (BR) |

---

## Mapa de Arquitetura

```
App.tsx (root)
  ├─ Sidebar esquerda  → PropertyListPanel
  ├─ main              → MapView
  ├─ Sidebar direita   → PropertyConfigPanel (se property ativo)
  └─ Wizard overlay    → Wizard (onboarding 4-steps)

State Flow:
  useMapStore (Zustand)
    ├─ property, zones[], elements[]
    ├─ drawingMode, pendingGeometry
    ├─ activeZoneId, pendingFlyTo, userLocation
    └─ isWizardOpen, wizardStep, isLoading, error

Persistência:
  useProperty (hook)
    ├─ CRUD → Supabase REST
    └─ Sync → setProperty / setZones / setElements no store
```

---

## Estrutura de Diretórios

```
d:/git/permamap/
├── packages/ui/src/
│   ├── tokens/          colors.ts · typography.ts · animation.ts · brand.ts
│   ├── motion/          variants.ts (Framer Motion)
│   └── components/      Button · Input · Select · Textarea · Badge · ZoneCard
│                        Modal · Dialog · Alert · Sidebar · Stepper · Divider
│                        ToolButton · Card · Icon · Thumbnail · Navbar · Footer · List
│
├── frontend/src/
│   ├── components/Map/      MapView · ZoneLayer · ElementLayer · DrawingToolbar · UserLocationMarker
│   ├── components/Sidebar/  PropertyListPanel · PropertyConfigPanel · ZonePanel · ElementPanel
│   ├── components/Forms/    ZoneForm · ZoneEditForm · POIForm · ElementEditForm · PropertyForm
│   ├── components/UI/       Wizard
│   ├── store/               useMapStore.ts
│   ├── hooks/               useProperty.ts · useGeolocation.ts
│   ├── lib/                 supabase.ts
│   ├── types/               index.ts
│   └── assets/              permamap-logo-full.svg
│
└── supabase/migrations/
    ├── 001_initial_schema.sql   (properties / zones / elements)
    ├── 002_rls_policies.sql     (RLS públicas — MVP)
    ├── 003_location_jsonb.sql   (GEOGRAPHY → JSONB)
    ├── 004_add_user_id.sql      (user_id column)
    ├── 005_rls_auth.sql         (RLS por auth.uid())
    └── 006_postgis_geometry.sql (colunas geometry + triggers + view zone_stats)
```

---

## Domínio de Dados

### Tipos principais (`frontend/src/types/index.ts`)

```typescript
type ZoneNumber = 0 | 1 | 2 | 3 | 4 | 5

interface Property {
  id: string; name: string;
  location: GeoJSONPoint | null;
  created_at: string;
}

interface Zone {
  id: string; property_id: string;
  zone_number: ZoneNumber; name: string; color: string;
  polygon_geojson: GeoJSONPolygon; created_at: string;
}

type ElementType = 'poi' | 'culture' | 'animal' | 'fence'

interface Element {
  id: string; zone_id: string;
  type: ElementType;
  geometry_geojson: GeoJSONGeometry;
  metadata_json: ElementMetadata;
  created_at: string;
}

interface ElementMetadata {
  // POI
  name?: string; poi_type?: POIType; notes?: string; area_m2?: number;
  // Culture
  culture?: string; intercrop?: string; planted_at?: string;
  cycle?: string; irrigated?: boolean; estimated_yield?: string;
  // Animal
  species?: string; quantity?: number;
  system?: 'rotativo' | 'livre' | 'confinamento';
  // Fence
  fence_type?: 'viva' | 'elétrica' | 'madeira';
}
```

### Schema do Banco

```sql
properties (id, name, location JSONB, user_id, created_at)
  └─ zones (id, property_id, zone_number 0-5 UNIQUE, name, color,
            polygon_geojson JSONB, polygon_geom geometry, created_at)
      └─ elements (id, zone_id, type, geometry_geojson JSONB,
                   geom geometry, metadata_json JSONB, created_at)

VIEW zone_stats — área_ha, perímetro_m, contagens por tipo
TRIGGER trg_sync_zone_geometry — JSONB ↔ geometry
FUNCTION is_zone_owner(uuid) — helper RLS
```

---

## Store Zustand (`useMapStore.ts`)

### Estado

```typescript
property: Property | null
zones: Zone[]
elements: Element[]
activeZoneId: string | null
drawingMode: 'zone' | 'poi' | 'fence' | null
pendingGeometry: GeoJSONGeometry | null
pendingFlyTo: [lat, lng] | null
userLocation: [lat, lng] | null
isWizardOpen: boolean
wizardStep: 'property' | 'location' | 'zone0' | 'zones' | 'elements' | 'done'
isLoading: boolean
error: string | null
```

### Validações de Negócio no Store

| Regra | Onde |
|-------|------|
| Máx 5 zonas por propriedade | `addZone()` — `zones.length >= 5` |
| zone_number único | `addZone()` — `zones.some(z => z.zone_number === n)` |
| Zona 5 não aceita culture/animal | `addElement()` — type check |
| Zona 0 obrigatória para salvar | `saveProperty()` em useProperty |

---

## Hook `useProperty.ts` — API Supabase

```typescript
listProperties()          → SELECT all properties
loadProperty(id)          → SELECT property + zones + elements → sync store
createProperty(name)      → INSERT property → setProperty
saveProperty()            → UPSERT property + zones + elements (valida zona 0)
deleteProperty()          → DELETE property (CASCADE)
deleteZone(id)            → DELETE zone (CASCADE elements)
updateZone(id, updates)   → UPDATE name/zone_number
deleteElement(id)         → DELETE element
updateElement(id, updates)→ UPDATE zone_id + metadata
```

**Convenção:** todas retornam `{ success: boolean; error?: string }`.

---

## Design System — Dois Temas

### Tema App — "Caderno de Campo Noturno" (`--pm-*`)

Usado em: mapa, sidebars, forms, modals da aplicação.

```css
--pm-void          /* background principal #0d1117 */
--pm-panel         /* sidebar background */
--pm-card          /* card background */
--pm-border        /* borda padrão */
--pm-text          /* texto primário */
--pm-text-2        /* texto secundário */
--pm-accent        /* dourado #F7C35F */
--pm-accent-muted  /* dourado com baixa opacidade */
--pm-danger        /* vermelho */
--z0 … --z5        /* cores das zonas */

/* Fontes */
--font-display: 'Lora'       /* headings */
--font-ui: 'Syne'            /* UI / botões */
--font-mono: 'Syne Mono'     /* números / dados */
```

### Tema Brand — "Agricultural Modern" (`--ds-*`)

Usado em: landing page, marketing, onboarding público.

```css
--ds-golden: #F7C35F
--ds-green-primary: #344C31
--ds-green-secondary: #263C28
--ds-black: #1A1A1A
--ds-font-heading: 'Livvic'
--ds-font-body: 'Century Gothic'
--ds-font-display: 'Johnstown Demo'
```

**Regra:** contexto **app/mapa** → `--pm-*` · contexto **landing/brand** → `--ds-*`

---

## Componentes `@permamap/ui` — Referência Rápida

```tsx
// Primitivos App
<Button variant="primary|secondary|ghost" size="sm|md|lg" loading fullWidth />
<Input label="..." value error onChange />
<Select label options onChange />
<Textarea label rows />
<Badge variant="zone|status" />
<ZoneCard zoneNumber name active elementCount onClick onEdit onDelete />
<Modal open onClose zIndex closeOnOverlay maxWidth />
<Dialog open title message variant="danger|warning" onConfirm onCancel />
<Alert variant="danger|warn|success" />
<Stepper steps currentNum />
<Divider label />
<ToolButton active disabled onClick />
<Icon name size color />

// Layout
<Sidebar open width side="left|right">
  <SidebarHeader>…</SidebarHeader>
  <SidebarTabs tabs activeTab onChange />
  <SidebarContent>…</SidebarContent>
  <SidebarSection title>…</SidebarSection>
</Sidebar>
<SidebarToggle open offset onClick title />

// Brand (marketing)
<Card variant="default|blog|project|feature|service" />
<Navbar logo links actions />
<Footer logo description links newsletter />
<List variant="default|navigation" items />
<FeatureList features />
```

---

## Variantes Framer Motion (`packages/ui/src/motion/variants.ts`)

```typescript
slideUp        // entrada slide-up (modal/card)
wizardIn       // spring para wizard
fadeIn         // fade simples
overlay        // backdrop
listItem       // stagger com delay(i * 0.06)
staggerContainer
geoPulse       // GPS pulse (infinite)
sidebarSlide(width)  // animação de largura
```

---

## Padrões e Convenções

### Inline styles vs Tailwind
- **CSS vars inline** para tokens de design: `style={{ color: 'var(--pm-accent)' }}`
- **Tailwind** para layout: `flex`, `gap-4`, `w-full`, `space-y-5`
- **Nunca** hardcode hex no JSX

### Adicionando novos componentes
1. Verificar se existe primitivo em `@permamap/ui` antes de criar
2. Identificar tema correto (`--pm-*` vs `--ds-*`)
3. TypeScript strict — props bem tipadas
4. Comentários em português onde a lógica não é óbvia
5. Hover states obrigatórios em interativos
6. Animações: `pm-animate-in` para entradas, Framer Motion para transições complexas

### Adicionando novos campos ao banco
1. Criar migration `00N_descricao.sql` em `supabase/migrations/`
2. Atualizar tipos em `frontend/src/types/index.ts`
3. Atualizar hook `useProperty.ts` (SELECT e UPSERT)
4. Atualizar store `useMapStore.ts` se houver validação de negócio
5. Rodar `pnpm exec supabase db push`

### Adicionando novo ElementType
1. Adicionar ao union em `types/index.ts`
2. Criar form em `components/Forms/`
3. Adicionar ícone/emoji em `ElementLayer.tsx` (`makeIcon`)
4. Adicionar renderização em `ElementPanel.tsx`
5. Adicionar CHECK constraint no banco se necessário

---

## Próximos Passos — Roadmap V1

| Feature | Arquitetura sugerida |
|---------|---------------------|
| **Culturas form** | `CultureForm.tsx` (type='culture', metadata culture/intercrop/cycle/irrigated) |
| **Animais form** | `AnimalForm.tsx` (type='animal', metadata species/quantity/system) |
| **Relatórios de zona** | Query `zone_stats` view via `useProperty` → componente `ZoneReport.tsx` |
| **Exportação PDF** | React-PDF ou @react-pdf/renderer, Edge Function opcional |
| **Auth Supabase** | `supabase.auth.signIn` + RLS policies já prontas (migration 005) |
| **Landing page** | Rota `/landing` com tema `--ds-*`, componentes brand |

---

## Comandos de Desenvolvimento

```bash
# Rodar frontend
pnpm dev

# Type check
pnpm --filter frontend exec tsc --noEmit

# Aplicar migrations no banco remoto
pnpm exec supabase db push

# Checar diagnostics (IDE)
mcp__ide__getDiagnostics
```

---

## Ao Receber uma Tarefa de Arquitetura

1. **Identifique a camada:** DB schema → types → store → hook → componente
2. **Verifique impacto em cascata:** mudança no schema = atualizar types + hook
3. **Preserve convenções:** nomes em camelCase, comentários em português, tokens corretos
4. **Reutilize antes de criar:** componente em `@permamap/ui`? Store já tem a ação?
5. **Valide no lugar certo:** regra de negócio → store; persistência → useProperty; constraint → DB
6. **Não over-engineer:** MVP first, abstração só quando há 3+ usos concretos
