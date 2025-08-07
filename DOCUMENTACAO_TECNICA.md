# Documentação Técnica - Ranking Unidade

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Funcionalidades](#funcionalidades)
6. [Banco de Dados](#banco-de-dados)
7. [Autenticação e Autorização](#autenticação-e-autorização)
8. [APIs e Integrações](#apis-e-integrações)
9. [Configuração e Deploy](#configuração-e-deploy)
10. [Guia de Desenvolvimento](#guia-de-desenvolvimento)
11. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O **Ranking Unidade** é uma Progressive Web App (PWA) desenvolvida para gerenciar competições entre unidades de desbravadores. O sistema permite o acompanhamento de pontuações através de tarefas, controle de presença semanal, comunicação via notícias, e apresentação de ranking em tempo real.

### Características Principais
- **Mobile-first design** com suporte completo a PWA
- **Sistema de pontuação gamificado** com ranking em tempo real
- **Painel administrativo completo** para gestão
- **Interface responsiva** otimizada para dispositivos móveis
- **Segurança robusta** com Row Level Security (RLS)

---

## Arquitetura do Sistema

### Visão Geral da Arquitetura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│   Frontend      │◄──►│    Supabase     │◄──►│   PostgreSQL    │
│   (React PWA)   │    │   (Backend)     │    │   (Database)    │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Camadas da Aplicação

1. **Apresentação (Frontend)**
   - React 18 com TypeScript
   - shadcn/ui + Tailwind CSS
   - PWA com Service Worker

2. **Lógica de Negócio (Frontend)**
   - Context API para estado global
   - Custom hooks para lógica específica
   - TanStack Query para cache e sincronização

3. **Backend (Supabase)**
   - Autenticação personalizada
   - Real-time subscriptions
   - Edge functions (se necessário)

4. **Dados (PostgreSQL)**
   - Row Level Security (RLS)
   - Stored procedures para operações complexas
   - Índices otimizados

---

## Tecnologias Utilizadas

### Frontend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React | 18.3.1 | Framework principal |
| TypeScript | 5.5.3 | Tipagem estática |
| Vite | 5.4.1 | Build tool e dev server |
| Tailwind CSS | 3.4.11 | Framework CSS |
| shadcn/ui | Latest | Componentes UI |
| React Router | 6.26.2 | Roteamento |
| TanStack Query | 5.56.2 | Estado e cache |
| Framer Motion | 12.23.6 | Animações |
| React Hook Form | 7.53.0 | Formulários |
| Zod | 3.23.8 | Validação de schemas |

### Backend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Supabase | 2.49.9 | Backend as a Service |
| PostgreSQL | 15+ | Banco de dados |
| Row Level Security | - | Segurança granular |

### DevOps
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| ESLint | 9.9.0 | Linting |
| PostCSS | 8.4.47 | Processamento CSS |
| PWA Plugin | 1.0.0 | Progressive Web App |

---

## Estrutura do Projeto

```
pontuacao-unidade/
├── public/                    # Arquivos estáticos
│   ├── icons/                # Ícones PWA
│   ├── manifest.json         # Manifest PWA
│   └── robots.txt           # SEO
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes base (shadcn/ui)
│   │   ├── AdminNewsManager.tsx

│   │   ├── Layout.tsx      # Layout principal
│   │   ├── NewsFeed.tsx    # Feed de notícias

│   │   └── ...
│   ├── contexts/           # Contextos React
│   │   └── AppContext.tsx  # Estado global
│   ├── hooks/              # Custom hooks
│   │   ├── useCommunication.ts
│   │   ├── useInstallPrompt.ts
│   │   ├── useLeaderboardData.ts
│   │   └── ...
│   ├── integrations/       # Integrações externas
│   │   └── supabase/      # Cliente Supabase
│   ├── lib/               # Utilitários
│   │   ├── utils.ts       # Funções auxiliares
│   │   └── supabaseTypes.ts
│   ├── pages/             # Páginas da aplicação
│   │   ├── Index.tsx      # Ranking principal
│   │   ├── AdminDashboard.tsx
│   │   ├── UnitDashboard.tsx
│   │   ├── Login.tsx
│   │   └── ...
│   ├── types/             # Definições de tipos
│   │   └── index.ts
│   ├── App.tsx           # Componente raiz
│   └── main.tsx          # Entry point
├── supabase/             # Configurações Supabase
│   ├── migrations/       # Migrações do banco
│   └── config.toml      # Configuração local
├── package.json
├── vite.config.ts       # Configuração Vite
├── tailwind.config.ts   # Configuração Tailwind
└── tsconfig.json        # Configuração TypeScript
```

---

## Funcionalidades

### 1. Sistema de Ranking 📊

**Localização:** `src/pages/Index.tsx`, `src/hooks/useLeaderboardData.ts`

#### Características:
- **Pódio 3D** para top 3 posições
- **Classificação completa** com tratamento de empates
- **Indicadores de movimento** (subiu/desceu posições)
- **Destaque da unidade atual** (se logada)
- **Atualizações em tempo real**

#### Algoritmo de Ranking:
```typescript
// Ordenação por pontuação (decrescente) e nome (crescente)
const sortedUnits = units.sort((a, b) => {
  if (b.score !== a.score) return b.score - a.score;
  return a.name.localeCompare(b.name);
});

// Tratamento de empates
const getRankWithTies = (index: number) => {
  if (index === 0) return 1;
  const currentScore = sortedUnits[index].score;
  const previousScore = sortedUnits[index - 1].score;
  return currentScore === previousScore 
    ? getRankWithTies(index - 1) 
    : index + 1;
};
```

### 2. Sistema de Tarefas ✅

**Localização:** `src/contexts/AppContext.tsx`, `src/pages/AdminDashboard.tsx`

#### Fluxo de Tarefas:
1. **Criação** (Admin)
   - Título, descrição, pontuação
   - Categoria e dificuldade
   - Prazo de entrega
   
2. **Submissão** (Unidade)
   - Upload de prova (texto/imagem)
   - Status: `pending`
   
3. **Validação** (Admin)
   - Aprovação/rejeição
   - Atualização automática da pontuação

#### Níveis de Dificuldade:
- `easy` - Verde
- `medium` - Amarelo  
- `hard` - Laranja
- `very_hard` - Vermelho
- `legendary` - Roxo

### 3. Sistema de Presença Semanal 📅

**Localização:** `src/pages/WeeklyAttendance.tsx`

#### Cálculo de Pontuação:
```typescript
const baseScore = presentMembers.length * 2;        // 2pts por pessoa
const punctualityBonus = punctualCount * 1;         // 1pt por pontual
const neckerchiefBonus = neckerchiefCount * 1;      // 1pt por lenço
const uniformBonus = uniformCount * 1;              // 1pt por uniforme
const flagBonus = broughtFlag ? 5 : 0;              // 5pts bandeira
const bibleBonus = broughtBible ? 5 : 0;            // 5pts bíblia

const totalScore = baseScore + punctualityBonus + neckerchiefBonus + 
                   uniformBonus + flagBonus + bibleBonus;
```

#### Controles:
- **Habilitação por unidade** específica
- **Prevenção de múltiplas submissões**
- **Upload de foto comprobatória**
- **Histórico completo**

### 4. Sistema de Comunicação 📢

**Localização:** `src/hooks/useCommunication.ts`, `src/components/`

#### Notícias:
- **Criação pelo admin**
- **Posts fixados** (prioridade)
- **Status:** draft/published/archived
- **Ordenação:** fixados primeiro, depois data


- **Resultados em tempo real**
- **Prevenção de voto duplicado**

### 5. Painel Administrativo 🛠️

**Localização:** `src/pages/AdminDashboard.tsx`

#### Funcionalidades:
- **Gestão de tarefas** (criar/deletar)
- **Validação de submissões**
- **Controle de presenças**
- **Ajuste manual de pontuação**
- **Gestão de logos**
- **Controle de formulários**
- **Reset de estatísticas**
- **Gerenciamento de notícias**

---

## Banco de Dados

### Diagrama ER Simplificado

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    units    │────►│ task_submissions │◄────│     tasks       │
│             │     │                  │     │                 │
│ - id        │     │ - id             │     │ - id            │
│ - name      │     │ - task_id        │     │ - title         │
│ - password  │     │ - unit_id        │     │ - description   │
│ - score     │     │ - proof          │     │ - points        │
│ - logo      │     │ - status         │     │ - deadline      │
└─────────────┘     └──────────────────┘     │ - difficulty    │
       │                                     │ - category      │
       │                                     └─────────────────┘
       │
       ▼
┌────────────────────┐
│ weekly_attendances │
│                    │
│ - id               │
│ - unit_id          │
│ - date             │
│ - present_members  │
│ - punctual_count   │
│ - neckerchief_count│
│ - uniform_count    │
│ - brought_flag     │
│ - brought_bible    │
│ - photo_url        │
│ - score            │
│ - status           │
└────────────────────┘
```

### Tabelas Principais

#### 1. `units`
```sql
CREATE TABLE public.units (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  password text NOT NULL,
  score integer DEFAULT 0,
  logo text,
  created_at timestamp with time zone DEFAULT now()
);
```

#### 2. `tasks`
```sql
CREATE TABLE public.tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  points integer NOT NULL,
  deadline timestamp with time zone NOT NULL,
  status text DEFAULT 'active',
  difficulty text DEFAULT 'easy',
  category text DEFAULT 'geral',
  created_at timestamp with time zone DEFAULT now()
);
```

#### 3. `task_submissions`
```sql
CREATE TABLE public.task_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES units(id) ON DELETE CASCADE,
  proof text NOT NULL,
  status text DEFAULT 'pending',
  submitted_at timestamp with time zone DEFAULT now()
);
```

#### 4. `weekly_attendances`
```sql
CREATE TABLE public.weekly_attendances (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id uuid REFERENCES units(id) ON DELETE CASCADE,
  date timestamp with time zone NOT NULL,
  present_members text[] NOT NULL,
  punctual_count integer DEFAULT 0,
  neckerchief_count integer DEFAULT 0,
  uniform_count integer DEFAULT 0,
  brought_flag boolean DEFAULT false,
  brought_bible boolean DEFAULT false,
  photo_url text,
  score integer DEFAULT 0,
  status text DEFAULT 'pending',
  submitted_at timestamp with time zone DEFAULT now()
);
```

#### 5. `news_feed`
```sql
CREATE TABLE public.news_feed (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  author_type text DEFAULT 'admin',
  is_pinned boolean DEFAULT false,
  status text DEFAULT 'published',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```



### Stored Procedures

#### Autenticação
```sql
-- Autenticação de administrador
CREATE OR REPLACE FUNCTION authenticate_admin(
  username_param text, 
  password_param text
) RETURNS jsonb;

-- Autenticação de unidade
CREATE OR REPLACE FUNCTION authenticate_unit(
  unit_name_param text, 
  password_param text
) RETURNS jsonb;
```

#### Gestão de Unidades
```sql
-- Criar nova unidade
CREATE OR REPLACE FUNCTION create_new_unit(
  name_param text, 
  password_param text
) RETURNS uuid;

-- Atualizar senha da unidade
CREATE OR REPLACE FUNCTION update_unit_password(
  unit_id_param uuid, 
  new_password_param text
) RETURNS boolean;

-- Deletar unidade
CREATE OR REPLACE FUNCTION delete_unit(
  unit_id_param uuid
) RETURNS boolean;
```

### Índices e Performance

```sql
-- Índices para otimização
CREATE INDEX idx_units_score ON units(score DESC);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_task_submissions_unit_task ON task_submissions(unit_id, task_id);
CREATE INDEX idx_weekly_attendances_unit_date ON weekly_attendances(unit_id, date);
CREATE INDEX idx_news_feed_status_pinned ON news_feed(status, is_pinned, created_at);

```

---

## Autenticação e Autorização

### Sistema de Autenticação

O sistema utiliza autenticação personalizada com duas categorias de usuários:

#### 1. Administrador
- **Login:** `admin` (username fixo)
- **Senha:** Hash criptografado (bcrypt)
- **Sessão:** Persistente (localStorage)
- **Permissões:** Acesso total

#### 2. Unidades
- **Login:** Nome da unidade
- **Senha:** Texto plano (legacy, será migrado)
- **Sessão:** Por unidade
- **Permissões:** Dados próprios apenas

### Row Level Security (RLS)

Todas as tabelas possuem RLS ativado com políticas específicas:

```sql
-- Exemplo: Units
CREATE POLICY "Units can view their own data" ON units
  FOR SELECT USING (id = get_current_unit_id());

CREATE POLICY "Admins can view all units" ON units
  FOR SELECT USING (is_admin());

-- Exemplo: Task Submissions  
CREATE POLICY "Units can view their own submissions" ON task_submissions
  FOR SELECT USING (unit_id = get_current_unit_id());

CREATE POLICY "Units can create their own submissions" ON task_submissions
  FOR INSERT WITH CHECK (unit_id = get_current_unit_id());
```

### Funções de Segurança

```sql
-- Verificar se o usuário é admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean;

-- Obter ID da unidade atual
CREATE OR REPLACE FUNCTION get_current_unit_id() RETURNS uuid;

-- Verificar se formulário está habilitado para unidade
CREATE OR REPLACE FUNCTION is_form_enabled_for_unit(
  form_name text, 
  unit_id uuid
) RETURNS boolean;
```

---

## APIs e Integrações

### Cliente Supabase

**Localização:** `src/integrations/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tmhkprlaefcqlgxjgkqp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIs...";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY
);
```

### Principais Operações

#### Autenticação
```typescript
// Login de unidade
export const loginUnit = async (name: string, password: string) => {
  const { data, error } = await supabase.rpc('authenticate_unit', {
    unit_name_param: name,
    password_param: password
  });
  return { data, error };
};

// Login de admin
export const loginAdmin = async (username: string, password: string) => {
  const { data, error } = await supabase.rpc('authenticate_admin', {
    username_param: username,
    password_param: password
  });
  return { data, error };
};
```

#### CRUD Operations
```typescript
// Buscar unidades ordenadas por score
export const fetchUnits = async () => {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .order('score', { ascending: false })
    .order('name', { ascending: true });
  return { data, error };
};

// Criar tarefa
export const createTask = async (task: TaskData) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();
  return { data, error };
};

// Submeter tarefa
export const submitTask = async (submission: SubmissionData) => {
  const { data, error } = await supabase
    .from('task_submissions')
    .insert(submission)
    .select()
    .single();
  return { data, error };
};
```

### Real-time Subscriptions

```typescript
// Escutar mudanças nas unidades
const subscribeToUnits = () => {
  return supabase
    .channel('units-changes')
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'units' }, 
        (payload) => {
          // Atualizar estado local
          handleUnitsUpdate(payload);
        }
    )
    .subscribe();
};
```

---

## Configuração e Deploy

### Configuração Local

#### 1. Pré-requisitos
```bash
# Node.js 18+
node --version

# Package manager (npm/yarn/bun)
npm --version
```

#### 2. Instalação
```bash
# Clonar repositório
git clone <repository-url>
cd pontuacao-unidade

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
```

#### 3. Configuração Supabase
```bash
# Instalar CLI do Supabase
npm install -g supabase

# Inicializar projeto local
supabase init

# Linkar com projeto remoto
supabase link --project-ref <PROJECT_ID>

# Aplicar migrações
supabase db push
```

#### 4. Executar Desenvolvimento
```bash
# Servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

### Deploy em Produção

#### 1. Configuração de Ambiente
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 2. Build Otimizado
```bash
# Build para produção
npm run build

# Testar build localmente
npm run preview
```

#### 3. Deploy Automático (Vercel)
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### Configuração PWA

#### Manifest
```json
{
  "name": "Ranking Unidade",
  "short_name": "Ranking Unidade",
  "description": "Sistema de pontuação para unidades",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#f8100e",
  "background_color": "#ffffff"
}
```

#### Service Worker
```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        // configurações do manifest
      }
    })
  ]
});
```

---

## Guia de Desenvolvimento

### Estrutura de Componentes

#### 1. Componentes Base (shadcn/ui)
```typescript
// src/components/ui/button.tsx
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    return (
      <button
        className={cn("px-4 py-2 rounded-md", className)}
        ref={ref}
        {...props}
      />
    );
  }
);
```

#### 2. Componentes de Domínio
```typescript
// src/components/RankingItem.tsx
interface RankingItemProps {
  unit: Unit;
  position: number;
  isCurrentUnit: boolean;
  index: number;
  positionChange?: 'up' | 'down' | 'same';
}

const RankingItem: React.FC<RankingItemProps> = ({
  unit,
  position,
  isCurrentUnit,
  index,
  positionChange
}) => {
  // Implementação do componente
};
```

### Custom Hooks

#### 1. Hook de Estado Global
```typescript
// src/contexts/AppContext.tsx
interface AppContextType {
  currentUser: User | null;
  units: Unit[];
  tasks: Task[];
  // ... outros estados
  
  // Ações
  login: (unitId: string, password: string) => Promise<boolean>;
  createTask: (task: TaskData) => Promise<void>;
  // ... outras ações
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
```

#### 2. Hooks Específicos
```typescript
// src/hooks/useLeaderboardData.ts
export const useLeaderboardData = (units: Unit[]) => {
  const sortedUnits = useMemo(() => {
    return [...units].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.name.localeCompare(b.name);
    });
  }, [units]);

  const getRankWithTies = useCallback((index: number): number => {
    if (index === 0) return 1;
    const currentScore = sortedUnits[index].score;
    const previousScore = sortedUnits[index - 1].score;
    return currentScore === previousScore 
      ? getRankWithTies(index - 1) 
      : index + 1;
  }, [sortedUnits]);

  return { sortedUnits, getRankWithTies };
};
```

### Padrões de Código

#### 1. Nomenclatura
```typescript
// Interfaces - PascalCase
interface UnitData {
  id: string;
  name: string;
}

// Componentes - PascalCase
const RankingList: React.FC = () => { };

// Hooks - camelCase com 'use' prefix
const useUnitData = () => { };

// Funções - camelCase
const calculateScore = (attendance: AttendanceData) => { };

// Constantes - UPPER_SNAKE_CASE
const MAX_SCORE_LIMIT = 1000;
```

#### 2. Estrutura de Arquivo
```typescript
// Imports externos
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Imports internos
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import type { Unit } from '@/types';

// Interfaces locais
interface ComponentProps {
  data: Unit[];
}

// Componente principal
const Component: React.FC<ComponentProps> = ({ data }) => {
  // Estados
  const [loading, setLoading] = useState(false);
  
  // Hooks
  const navigate = useNavigate();
  const { currentUser } = useAppContext();
  
  // Efeitos
  useEffect(() => {
    // lógica
  }, []);
  
  // Handlers
  const handleClick = () => {
    // lógica
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default Component;
```

### Testes (Recomendados)

#### 1. Testes Unitários
```typescript
// src/components/__tests__/RankingItem.test.tsx
import { render, screen } from '@testing-library/react';
import { RankingItem } from '../RankingItem';

describe('RankingItem', () => {
  const mockUnit = {
    id: '1',
    name: 'Test Unit',
    score: 100
  };

  it('should render unit name', () => {
    render(
      <RankingItem 
        unit={mockUnit} 
        position={1} 
        isCurrentUnit={false} 
        index={0} 
      />
    );
    
    expect(screen.getByText('Test Unit')).toBeInTheDocument();
  });
});
```

#### 2. Testes de Integração
```typescript
// src/hooks/__tests__/useLeaderboardData.test.ts
import { renderHook } from '@testing-library/react';
import { useLeaderboardData } from '../useLeaderboardData';

describe('useLeaderboardData', () => {
  const mockUnits = [
    { id: '1', name: 'Unit A', score: 100 },
    { id: '2', name: 'Unit B', score: 200 }
  ];

  it('should sort units by score descending', () => {
    const { result } = renderHook(() => useLeaderboardData(mockUnits));
    
    expect(result.current.sortedUnits[0].name).toBe('Unit B');
    expect(result.current.sortedUnits[1].name).toBe('Unit A');
  });
});
```

---

## Troubleshooting

### Problemas Comuns

#### 1. Erro de Autenticação
```
Erro: Invalid credentials
```

**Solução:**
1. Verificar se as credenciais estão corretas
2. Checar se o usuário existe no banco
3. Validar se as políticas RLS estão corretas

```sql
-- Verificar usuário admin
SELECT * FROM admin_credentials WHERE username = 'admin';

-- Verificar unidade
SELECT * FROM units WHERE name = 'Nome da Unidade';
```

#### 2. Erro de Conexão com Supabase
```
Erro: Failed to fetch
```

**Solução:**
1. Verificar conectividade de rede
2. Validar URL e chaves do Supabase
3. Checar status do serviço

```typescript
// Testar conexão
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('units').select('count');
    console.log('Conexão OK:', data);
  } catch (err) {
    console.error('Erro de conexão:', err);
  }
};
```

#### 3. Problemas de Performance
```
Carregamento lento das páginas
```

**Solução:**
1. Otimizar queries com índices
2. Implementar paginação
3. Usar React.memo para componentes pesados

```typescript
// Otimização de componente
const ExpensiveComponent = React.memo(({ data }: Props) => {
  return <div>{/* renderização complexa */}</div>;
});

// Paginação
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .range(0, 9)  // Primeiro 10 itens
  .order('created_at', { ascending: false });
```

#### 4. Problemas PWA
```
PWA não instala no dispositivo
```

**Solução:**
1. Verificar manifest.json
2. Validar service worker
3. Checar HTTPS (necessário para PWA)

```javascript
// Debug do service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('Service Workers registrados:', registrations);
  });
}
```

### Logs e Monitoramento

#### 1. Logs de Aplicação
```typescript
// Configurar logging
const logger = {
  info: (message: string, data?: any) => {
    console.info(`[INFO] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
    // Enviar para serviço de monitoramento
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  }
};
```

#### 2. Monitoramento de Performance
```typescript
// Performance monitoring
const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};
```

### Comandos Úteis

```bash
# Desenvolvimento
npm run dev                 # Servidor de desenvolvimento
npm run build              # Build de produção
npm run preview            # Preview do build
npm run lint               # Executar linting

# Supabase
supabase status            # Status dos serviços
supabase db reset          # Reset do banco local
supabase db push           # Aplicar migrações
supabase gen types         # Gerar tipos TypeScript

# Debug
npm run dev -- --debug     # Modo debug
npm run build -- --sourcemap # Build com sourcemaps
```

---

## Conclusão

Esta documentação técnica fornece uma visão abrangente do sistema **Ranking Unidade**. O projeto demonstra boas práticas de desenvolvimento moderno com React, TypeScript e Supabase, oferecendo uma solução robusta e escalável para gerenciamento de competições.

### Próximos Passos Recomendados:

1. **Implementar testes automatizados**
2. **Adicionar monitoramento de performance**
3. **Configurar CI/CD pipeline**
4. **Implementar cache estratégico**
5. **Adicionar documentação de API**

Para dúvidas ou contribuições, consulte o repositório do projeto ou entre em contato com a equipe de desenvolvimento.

---

*Documentação atualizada em: Janeiro 2025*
*Versão do sistema: 1.0.0* 