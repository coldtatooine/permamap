# Permamap – Frontend

Aplicação web de zoneamento em permacultura baseada no conceito de Zonas 0–5.

## Stack

- **React 18** + **TypeScript** + **Vite**
- **Leaflet.js** + **react-leaflet** + **leaflet-draw** — mapa interativo
- **TailwindCSS v3** — estilos
- **Zustand** — estado global
- **Supabase JS** — persistência (PostgreSQL + PostGIS)

## Pré-requisitos

- Node.js 18+
- Projeto no [Supabase](https://supabase.com) com schema aplicado (ver `/supabase/migrations`)

## Configuração

1. Copie o arquivo de variáveis de ambiente:

```bash
cp .env.example .env.local
```

1. Preencha as chaves do seu projeto Supabase em `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

> As chaves estão disponíveis em: **Supabase Dashboard → Settings → API**

## Instalação e execução

Na raiz do repositório:

```bash
pnpm install
pnpm dev
```

A aplicação estará disponível em `http://localhost:5173`.

## Scripts

| Comando | Descrição |
| ------- | --------- |
| `pnpm dev` | Servidor de desenvolvimento com HMR |
| `pnpm build` | Build de produção em `/dist` |
| `pnpm preview` | Pré-visualização do build de produção |

## Estrutura de pastas

```text
src/
├── components/
│   ├── Map/
│   │   ├── MapView.tsx         # Mapa base (OpenStreetMap) + controle de desenho
│   │   ├── ZoneLayer.tsx       # Renderiza polígonos de zonas com cores automáticas
│   │   ├── ElementLayer.tsx    # Renderiza POIs e cercas
│   │   └── DrawingToolbar.tsx  # Botões: Criar Zona / Adicionar POI / Cerca
│   ├── Sidebar/
│   │   ├── PropertyPanel.tsx   # Gerencia propriedade ativa (salvar / carregar)
│   │   ├── ZonePanel.tsx       # Lista de zonas com opção de remoção
│   │   └── ElementPanel.tsx    # Lista de elementos por zona
│   ├── Forms/
│   │   ├── ZoneForm.tsx        # Formulário de criação de zona
│   │   ├── POIForm.tsx         # Formulário de ponto de interesse
│   │   └── PropertyForm.tsx    # Formulário de criação de propriedade
│   └── UI/
│       └── Wizard.tsx          # Wizard de onboarding em 4 etapas
├── store/
│   └── useMapStore.ts          # Estado global (Zustand) + validações de negócio
├── hooks/
│   └── useProperty.ts          # CRUD de propriedades, zonas e elementos no Supabase
├── lib/
│   └── supabase.ts             # Cliente Supabase
└── types/
    └── index.ts                # Tipos TypeScript + cores e labels por zona
```

## Regras de negócio

| Regra | Onde é aplicada |
| ----- | --------------- |
| Máximo de 5 zonas por propriedade | Store (Zustand) + constraint no banco |
| Zona 0 é obrigatória para salvar | Frontend + aviso no PropertyPanel |
| Zona 5 não permite culturas ou animais | Store + validação no formulário |
| Números de zona únicos por propriedade | DB `UNIQUE(property_id, zone_number)` |
| Zone number apenas entre 0 e 5 | DB `CHECK` constraint |
| Elemento sempre vinculado a uma zona | DB `FOREIGN KEY NOT NULL` |

## Cores por zona

| Zona | Cor | Significado |
| ---- | --- | ----------- |
| 0 | Vermelho | Casa / Centro |
| 1 | Laranja | Jardim Intensivo |
| 2 | Amarelo | Uso Frequente |
| 3 | Verde | Uso Ocasional |
| 4 | Verde Escuro | Uso Mínimo |
| 5 | Azul | Silvestre / Preservação |
