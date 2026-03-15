// =====================
// Tipos de Zona
// =====================

export type ZoneNumber = 0 | 1 | 2 | 3 | 4 | 5;

export const ZONE_COLORS: Record<ZoneNumber, string> = {
  0: '#ef4444', // Vermelho   – Casa / Centro
  1: '#f97316', // Laranja    – Jardim intensivo
  2: '#eab308', // Amarelo    – Uso frequente
  3: '#22c55e', // Verde      – Uso ocasional
  4: '#15803d', // Verde esc. – Uso mínimo
  5: '#3b82f6', // Azul       – Silvestre / preservação
};

export const ZONE_LABELS: Record<ZoneNumber, string> = {
  0: 'Zona 0 – Casa',
  1: 'Zona 1 – Jardim Intensivo',
  2: 'Zona 2 – Uso Frequente',
  3: 'Zona 3 – Uso Ocasional',
  4: 'Zona 4 – Uso Mínimo',
  5: 'Zona 5 – Silvestre',
};

// =====================
// Entidades do domínio
// =====================

export interface Property {
  id: string;
  name: string;
  location: GeoJSONPoint | null;
  created_at: string;
  user_id?: string;
}

export interface Zone {
  id: string;
  property_id: string;
  zone_number: ZoneNumber;
  name: string;
  color: string;
  polygon_geojson: GeoJSONPolygon;
  created_at: string;
}

export type ElementType = 'poi' | 'culture' | 'animal' | 'fence';

// =====================
// POI Types — Vocabulário de Permacultura
// =====================

export const POI_CATEGORIES = [
  'Estruturas',
  'Água',
  'Alimentos',
  'Fertilidade',
  'Animais',
  'Pastagem',
  'Agroflorestas',
] as const;

export type POICategory = typeof POI_CATEGORIES[number];

export interface POITypeDefinition {
  label:       string;
  description: string;
  category:    POICategory;
  zones:       string;
  emoji:       string;
}

export const POI_TYPE_DEFINITIONS = {
  // ── Estruturas ──────────────────────────────────────────────────────────
  'Casa': {
    label:       'Casa',
    description: 'Moradia principal e centro de todo o design. Todos os elementos irradiam a partir daqui. Recebe a maior densidade de energia humana.',
    category:    'Estruturas',
    zones:       'Zona 0',
    emoji:       '🏠',
  },
  'Estufa': {
    label:       'Estufa',
    description: 'Ambiente controlado para propagação de mudas, extensão da estação de cultivo e proteção de espécies sensíveis ao frio.',
    category:    'Estruturas',
    zones:       'Zona 0–1',
    emoji:       '🪴',
  },
  'Galpão': {
    label:       'Galpão',
    description: 'Armazenamento de ferramentas, maquinário e espaço de processamento de colheitas. Hub logístico da propriedade.',
    category:    'Estruturas',
    zones:       'Zona 1–2',
    emoji:       '🔧',
  },
  'Celeiro': {
    label:       'Celeiro',
    description: 'Abrigo para animais de médio e grande porte; armazenamento de ração, feno e grãos. Localizado próximo aos piquetes.',
    category:    'Estruturas',
    zones:       'Zona 2–3',
    emoji:       '🌾',
  },
  'Cozinha Externa': {
    label:       'Cozinha Externa',
    description: 'Fogão a lenha, forno de barro ou fogueira ao ar livre para processamento de colheitas e convívio comunitário.',
    category:    'Estruturas',
    zones:       'Zona 0–1',
    emoji:       '🔥',
  },
  'Infraestrutura': {
    label:       'Infraestrutura',
    description: 'Elemento de suporte geral: caminhos, acessos, energia solar, poço artesiano ou qualquer estrutura de apoio ao sistema.',
    category:    'Estruturas',
    zones:       'Todas as zonas',
    emoji:       '⚙️',
  },
  // ── Água ────────────────────────────────────────────────────────────────
  'Cisterna': {
    label:       'Cisterna',
    description: 'Reservatório para coleta e armazenamento de água de chuva. Essencial em regiões com estação seca prolongada.',
    category:    'Água',
    zones:       'Zona 0–1',
    emoji:       '🪣',
  },
  'Captação de Chuva': {
    label:       'Captação de Chuva',
    description: 'Sistema calha-para-tanque de coleta de água do telhado. Reduz dependência de fontes externas e desperdício de água pluvial.',
    category:    'Água',
    zones:       'Zona 0–1',
    emoji:       '🌧️',
  },
  'Águas Cinzas': {
    label:       'Águas Cinzas',
    description: 'Sistema de tratamento e reúso de águas residuais domésticas de pias, chuveiros e lavadoras. Não inclui efluente de vaso sanitário.',
    category:    'Água',
    zones:       'Zona 0–1',
    emoji:       '♻️',
  },
  'Vala de Infiltração': {
    label:       'Vala de Infiltração',
    description: 'Trincheira em nível (swale) que captura a chuva, desacelera o escoamento e infiltra a água no solo, recarregando o lençol freático.',
    category:    'Água',
    zones:       'Zona 2–4',
    emoji:       '〰️',
  },
  'Açude': {
    label:       'Açude / Lago',
    description: 'Reservatório de água para irrigação, criação de peixes e biodiversidade. Elemento de borda altamente produtivo; espelha e acumula energia solar.',
    category:    'Água',
    zones:       'Zona 2–3',
    emoji:       '🏞️',
  },
  'Represa': {
    label:       'Represa',
    description: 'Grande estrutura de contenção de água construída no curso de um córrego. Fonte primária de irrigação por gravidade e aquicultura extensiva.',
    category:    'Água',
    zones:       'Zona 3',
    emoji:       '💧',
  },
  // ── Alimentos ───────────────────────────────────────────────────────────
  'Horta': {
    label:       'Horta',
    description: 'Canteiro de hortaliças e legumes de alta rotatividade. Exige atenção diária: rega, colheita e manejo de pragas.',
    category:    'Alimentos',
    zones:       'Zona 1–2',
    emoji:       '🥬',
  },
  'Espiral de Ervas': {
    label:       'Espiral de Ervas',
    description: 'Jardim vertical em espiral que cria múltiplos microclimas em pequeno espaço — seco e bem drenado no topo, úmido e sombreado na base.',
    category:    'Alimentos',
    zones:       'Zona 1',
    emoji:       '🌀',
  },
  'Canteiro Fechadura': {
    label:       'Canteiro Fechadura',
    description: 'Canteiro em ferradura com cesto de compostagem no centro. Maximiza produção em área mínima; tudo alcançável sem pisar no solo.',
    category:    'Alimentos',
    zones:       'Zona 1',
    emoji:       '🔑',
  },
  'Pomar': {
    label:       'Pomar',
    description: 'Área de produção de frutas e nozes em árvores. Requer visitas semanais para colheita, poda e manejo integrado de pragas.',
    category:    'Alimentos',
    zones:       'Zona 2',
    emoji:       '🍎',
  },
  'Viveiro': {
    label:       'Viveiro',
    description: 'Área de propagação, germinação e produção de mudas para o sistema. Coração da multiplicação e expansão do design.',
    category:    'Alimentos',
    zones:       'Zona 1',
    emoji:       '🌱',
  },
  // ── Fertilidade ─────────────────────────────────────────────────────────
  'Compostagem': {
    label:       'Compostagem',
    description: 'Sistema de compostagem quente ou fria que transforma resíduos orgânicos em adubo. Pilar fundamental do ciclo de fertilidade.',
    category:    'Fertilidade',
    zones:       'Zona 1–2',
    emoji:       '🍂',
  },
  'Minhocário': {
    label:       'Minhocário',
    description: 'Vermicompostagem com minhocas. Produz húmus sólido e chorume líquido — fertilizantes altamente biodisponíveis para as plantas.',
    category:    'Fertilidade',
    zones:       'Zona 0–1',
    emoji:       '🪱',
  },
  'Biodigestor': {
    label:       'Biodigestor',
    description: 'Fermentação anaeróbica de resíduos orgânicos gerando biogás para cozinha e biofertilizante líquido rico em nutrientes.',
    category:    'Fertilidade',
    zones:       'Zona 2–3',
    emoji:       '⚗️',
  },
  'Forno de Biochar': {
    label:       'Forno de Biochar',
    description: 'Pirólise de biomassa produzindo carvão vegetal. Incorporado ao solo aumenta CTC, retém umidade e sequestra carbono por centenas de anos.',
    category:    'Fertilidade',
    zones:       'Zona 2–3',
    emoji:       '🔥',
  },
  'Banheiro Seco': {
    label:       'Banheiro Seco',
    description: 'Banheiro de compostagem (humanure) que fecha o ciclo de nutrientes humanos sem uso de água e sem gerar efluente poluente.',
    category:    'Fertilidade',
    zones:       'Zona 0',
    emoji:       '🌿',
  },
  // ── Animais ─────────────────────────────────────────────────────────────
  'Galinheiro': {
    label:       'Galinheiro',
    description: 'Abrigo para galinhas integrado ao sistema. Fornece ovos, carne, controle de pragas, fertilidade do solo e revolvimento de camadas.',
    category:    'Animais',
    zones:       'Zona 1–2',
    emoji:       '🐔',
  },
  'Trator de Galinha': {
    label:       'Trator de Galinha',
    description: 'Galinheiro móvel deslocado rotacionalmente pelo terreno. As galinhas trabalham o solo, fertilizam e controlam pragas antes do plantio.',
    category:    'Animais',
    zones:       'Zona 2',
    emoji:       '🐓',
  },
  'Apiário': {
    label:       'Apiário / Colmeia',
    description: 'Produção de mel e cera com serviços de polinização para todo o sistema produtivo. Pode ser com abelhas nativas ou apis melífera.',
    category:    'Animais',
    zones:       'Zona 1–4',
    emoji:       '🐝',
  },
  'Caprino': {
    label:       'Caprino / Ovino',
    description: 'Cabras ou ovelhas para leite, queijo e lã. Excelentes no manejo de vegetação arbustiva em sistema de pastoreio rotativo.',
    category:    'Animais',
    zones:       'Zona 2–3',
    emoji:       '🐐',
  },
  'Aquicultura': {
    label:       'Aquicultura',
    description: 'Tanque ou açude para criação de peixes, tilápias ou outros organismos aquáticos integrados ao ciclo de nutrientes da propriedade.',
    category:    'Animais',
    zones:       'Zona 2–3',
    emoji:       '🐟',
  },
  // ── Pastagem ────────────────────────────────────────────────────────────
  'Pasto': {
    label:       'Pasto',
    description: 'Área de pastagem para bovinos, equinos ou outros animais de grande porte. Manejo rotativo regenera o solo e sequestra carbono.',
    category:    'Pastagem',
    zones:       'Zona 3',
    emoji:       '🌾',
  },
  'Silvipastoril': {
    label:       'Silvipastoril',
    description: 'Integração de árvores, pastagem e animais. Árvores fornecem sombra e forragem; animais fertilizam e controlam a vegetação.',
    category:    'Pastagem',
    zones:       'Zona 3',
    emoji:       '🌳',
  },
  // ── Agroflorestas ───────────────────────────────────────────────────────
  'Agrofloresta': {
    label:       'Agrofloresta',
    description: 'Sistema de múltiplos estratos imitando a floresta natural. Integra árvores produtivas, arbustos, herbáceas, trepadeiras e cobertura de solo.',
    category:    'Agroflorestas',
    zones:       'Zona 2–3',
    emoji:       '🌳',
  },
  'Quebra-Vento': {
    label:       'Quebra-Vento',
    description: 'Plantio linear de árvores e arbustos bloqueando os ventos dominantes. Protege cultivos, reduz evapotranspiração e cria microclima favorável.',
    category:    'Agroflorestas',
    zones:       'Zona 2–4',
    emoji:       '💨',
  },
  'Reflorestamento': {
    label:       'Reflorestamento',
    description: 'Área de produção de madeira em rotação longa (coppice), reserva de biodiversidade e captura de carbono a longo prazo.',
    category:    'Agroflorestas',
    zones:       'Zona 4',
    emoji:       '🌲',
  },
  'Cerca Viva': {
    label:       'Cerca Viva',
    description: 'Seto denso de espécies úteis (frutíferas, forrageiras, espinhosas) para divisão de parcelas, abrigo para fauna e contenção de animais.',
    category:    'Agroflorestas',
    zones:       'Zona 2–4',
    emoji:       '🌿',
  },
} satisfies Record<string, POITypeDefinition>;

export type POIType = keyof typeof POI_TYPE_DEFINITIONS;
export const POI_TYPES = Object.keys(POI_TYPE_DEFINITIONS) as POIType[];

export interface Element {
  id: string;
  zone_id: string;
  type: ElementType;
  geometry_geojson: GeoJSONGeometry;
  metadata_json: ElementMetadata;
  created_at: string;
}

export interface ElementMetadata {
  name?: string;
  poi_type?: POIType;
  notes?: string;
  area_m2?: number;
  // cultura
  culture?: string;
  intercrop?: string;
  planted_at?: string;
  cycle?: string;
  irrigated?: boolean;
  estimated_yield?: string;
  // animal
  species?: string;
  quantity?: number;
  system?: 'rotativo' | 'livre' | 'confinamento';
  // cerca
  fence_type?: 'viva' | 'elétrica' | 'madeira';
}

// =====================
// GeoJSON simplificado
// =====================

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: [number, number][][];
}

export type GeoJSONGeometry = GeoJSONPoint | GeoJSONPolygon | {
  type: 'LineString';
  coordinates: [number, number][];
};
