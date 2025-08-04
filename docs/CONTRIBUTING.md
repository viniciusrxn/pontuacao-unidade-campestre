# Guia de Contribuição - Ranking Unidade

## Bem-vindo!

Obrigado pelo interesse em contribuir com o projeto Ranking Unidade! Este guia fornece informações sobre como contribuir efetivamente.

## Índice

1. [Como Começar](#como-começar)
2. [Padrões de Desenvolvimento](#padrões-de-desenvolvimento)
3. [Estrutura de Commits](#estrutura-de-commits)
4. [Pull Requests](#pull-requests)
5. [Testes](#testes)
6. [Documentação](#documentação)
7. [Reportar Issues](#reportar-issues)

## Como Começar

### 1. Configuração do Ambiente

```bash
# Fork do repositório
git clone https://github.com/SEU_USUARIO/pontuacao-unidade.git
cd pontuacao-unidade

# Instalar dependências
npm install

# Criar branch para desenvolvimento
git checkout -b feature/nova-funcionalidade

# Iniciar servidor de desenvolvimento
npm run dev
```

### 2. Configuração do Supabase Local

```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar Supabase local
supabase start

# Aplicar migrações
supabase db reset
```

### 3. Configurar Variáveis de Ambiente

```env
# .env.local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=sua_chave_local
```

## Padrões de Desenvolvimento

### 1. Estrutura de Arquivos

```
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes base (shadcn/ui)
│   └── [Feature]Component.tsx
├── pages/               # Páginas da aplicação
│   └── [Page].tsx
├── hooks/               # Custom hooks
│   └── use[Feature].ts
├── contexts/            # Contextos React
│   └── [Feature]Context.tsx
├── lib/                 # Utilitários e configurações
│   ├── utils.ts
│   └── [feature].ts
├── types/               # Definições de tipos
│   └── index.ts
└── integrations/        # Integrações externas
    └── supabase/
```

### 2. Convenções de Nomenclatura

#### Arquivos e Pastas
- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useUserData.ts`)
- **Utilitários**: camelCase (`formatDate.ts`)
- **Tipos**: camelCase (`userTypes.ts`)
- **Constantes**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

#### Código
```typescript
// Interfaces - PascalCase
interface UserData {
  id: string;
  name: string;
}

// Componentes - PascalCase
const UserCard: React.FC<UserCardProps> = ({ user }) => {
  // Estados - camelCase
  const [isLoading, setIsLoading] = useState(false);
  
  // Funções - camelCase
  const handleUserUpdate = () => {
    // lógica
  };
  
  return <div>{user.name}</div>;
};

// Constantes - UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
```

### 3. Estrutura de Componentes

```typescript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Imports internos
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';

// Tipos locais
interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
}

// Componente principal
const Component: React.FC<ComponentProps> = ({ 
  title, 
  onSubmit 
}) => {
  // Estados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Hooks
  const { currentUser } = useAppContext();
  
  // Efeitos
  useEffect(() => {
    // lógica de inicialização
  }, []);
  
  // Handlers
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    
    try {
      // lógica
      await onSubmit(formData);
    } catch (err) {
      setError('Erro ao processar');
    } finally {
      setLoading(false);
    }
  };
  
  // Renderização condicional
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  if (error) {
    return <div>Erro: {error}</div>;
  }
  
  // Render principal
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4"
    >
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <form onSubmit={handleSubmit}>
        {/* formulário */}
        <Button type="submit" disabled={loading}>
          Enviar
        </Button>
      </form>
    </motion.div>
  );
};

export default Component;
```

### 4. Custom Hooks

```typescript
// src/hooks/useFeature.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseFeatureOptions {
  autoFetch?: boolean;
  refetchInterval?: number;
}

export const useFeature = (options: UseFeatureOptions = {}) => {
  const { autoFetch = true, refetchInterval } = options;
  
  const [data, setData] = useState<FeatureData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: result, error: fetchError } = await supabase
        .from('table_name')
        .select('*');
      
      if (fetchError) throw fetchError;
      
      setData(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch]);
  Tô aqui porque eu quero você, com tudo que faz parte de você
  useEffect(() => {
    if (refetchInterval) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetchInterval]);
  
  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};
```

### 5. Tratamento de Erros

```typescript
// src/lib/errorHandler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleSupabaseError = (error: any): AppError => {
  switch (error.code) {
    case '23505':
      return new AppError('Dados duplicados', 'DUPLICATE_ENTRY', 409);
    case '23503':
      return new AppError('Referência inválida', 'INVALID_REFERENCE', 400);
    default:
      return new AppError(
        error.message || 'Erro interno do servidor',
        'INTERNAL_ERROR',
        500
      );
  }
};

// Uso em componentes
const handleError = (error: unknown) => {
  const appError = error instanceof AppError 
    ? error 
    : new AppError('Erro inesperado');
    
  toast({
    title: "Erro",
    description: appError.message,
    variant: "destructive",
  });
  
  // Log para desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', appError);
  }
};
```

## Estrutura de Commits

### Conventional Commits

Utilizamos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos de Commit

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Documentação
- **style**: Formatação, sem mudança de lógica
- **refactor**: Refatoração de código
- **test**: Adicionar ou modificar testes
- **chore**: Tarefas de build, configuração, etc.

### Exemplos

```bash
# Nova funcionalidade
git commit -m "feat(ranking): adicionar indicador de mudança de posição"

# Correção de bug
git commit -m "fix(auth): corrigir validação de senha do admin"

# Documentação
git commit -m "docs: atualizar guia de instalação"

# Refatoração
git commit -m "refactor(components): separar lógica de ranking em hook customizado"

# Chore
git commit -m "chore: atualizar dependências do projeto"
```

### Commit Message Guidelines

#### ✅ Boas práticas
- Use o imperativo ("adicionar" não "adicionado")
- Primeira linha com até 50 caracteres
- Descreva o "o que" e "por que", não o "como"
- Use português para mensagens

#### ❌ Evitar
- Mensagens genéricas ("fix", "update", "changes")
- Commits muito grandes (faça commits atômicos)
- Misturar diferentes tipos de mudanças

## Pull Requests

### 1. Antes de Submeter

- [ ] Código segue os padrões estabelecidos
- [ ] Testes passando localmente
- [ ] Build funcionando sem erros
- [ ] Documentação atualizada (se necessário)
- [ ] Commits seguem o padrão estabelecido

### 2. Template de PR

```markdown
## Descrição
Breve descrição das mudanças implementadas.

## Tipo de Mudança
- [ ] Bug fix (mudança que corrige um problema)
- [ ] Nova funcionalidade (mudança que adiciona funcionalidade)
- [ ] Breaking change (mudança que quebra funcionalidade existente)
- [ ] Documentação (mudança na documentação)

## Como Testar
1. Vá para '...'
2. Clique em '....'
3. Role para baixo até '....'
4. Veja o erro

## Screenshots (se aplicável)
[Adicione screenshots para ajudar a explicar as mudanças]

## Checklist
- [ ] Meu código segue o guia de estilo do projeto
- [ ] Revisei meu próprio código
- [ ] Comentei o código em partes difíceis de entender
- [ ] Fiz mudanças correspondentes na documentação
- [ ] Minhas mudanças não geram novos warnings
- [ ] Adicionei testes que provam que minha correção/funcionalidade funciona
- [ ] Testes novos e existentes passam localmente
```

### 3. Processo de Review

1. **Automatizado**: Verifica build, testes, linting
2. **Manual**: Review de código por pelo menos 1 maintainer
3. **Teste**: Testar funcionalidade em ambiente de teste
4. **Merge**: Após aprovação, merge para branch main

## Testes

### 1. Estrutura de Testes

```
src/
├── __tests__/           # Testes globais
├── components/
│   └── __tests__/       # Testes de componentes
├── hooks/
│   └── __tests__/       # Testes de hooks
└── utils/
    └── __tests__/       # Testes de utilitários
```

### 2. Testes de Componentes

```typescript
// src/components/__tests__/RankingItem.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RankingItem } from '../RankingItem';

const mockUnit = {
  id: '1',
  name: 'Test Unit',
  score: 100,
  logo: 'https://example.com/logo.png'
};

describe('RankingItem', () => {
  it('renders unit name and score', () => {
    render(
      <RankingItem 
        unit={mockUnit} 
        position={1} 
        isCurrentUnit={false} 
        index={0} 
      />
    );
    
    expect(screen.getByText('Test Unit')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });
  
  it('highlights current unit', () => {
    render(
      <RankingItem 
        unit={mockUnit} 
        position={1} 
        isCurrentUnit={true} 
        index={0} 
      />
    );
    
    const item = screen.getByTestId('ranking-item');
    expect(item).toHaveClass('border-primary');
  });
  
  it('shows position change indicator', () => {
    render(
      <RankingItem 
        unit={mockUnit} 
        position={1} 
        isCurrentUnit={false} 
        index={0}
        positionChange="up"
      />
    );
    
    expect(screen.getByTestId('position-up')).toBeInTheDocument();
  });
});
```

### 3. Testes de Hooks

```typescript
// src/hooks/__tests__/useLeaderboardData.test.ts
import { renderHook } from '@testing-library/react';
import { useLeaderboardData } from '../useLeaderboardData';

describe('useLeaderboardData', () => {
  const mockUnits = [
    { id: '1', name: 'Unit A', score: 100 },
    { id: '2', name: 'Unit B', score: 200 },
    { id: '3', name: 'Unit C', score: 150 }
  ];

  it('sorts units by score descending', () => {
    const { result } = renderHook(() => useLeaderboardData(mockUnits));
    
    expect(result.current.sortedUnits[0].name).toBe('Unit B');
    expect(result.current.sortedUnits[1].name).toBe('Unit C');
    expect(result.current.sortedUnits[2].name).toBe('Unit A');
  });
  
  it('handles ties correctly', () => {
    const unitsWithTies = [
      { id: '1', name: 'Unit A', score: 100 },
      { id: '2', name: 'Unit B', score: 100 },
      { id: '3', name: 'Unit C', score: 150 }
    ];
    
    const { result } = renderHook(() => useLeaderboardData(unitsWithTies));
    
    expect(result.current.getRankWithTies(1)).toBe(2); // Unit B
    expect(result.current.getRankWithTies(2)).toBe(2); // Unit A (mesmo rank)
  });
});
```

### 4. Executar Testes

```bash
# Todos os testes
npm test

# Testes específicos
npm test -- RankingItem

# Testes com coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Documentação

### 1. Comentários no Código

```typescript
/**
 * Calcula a pontuação total baseada nos dados de presença
 * @param attendance - Dados de presença da unidade
 * @returns Pontuação total calculada
 */
const calculateAttendanceScore = (attendance: WeeklyAttendance): number => {
  const baseScore = attendance.presentMembers.length * 2;
  const bonusScore = (attendance.broughtFlag ? 5 : 0) + 
                    (attendance.broughtBible ? 5 : 0);
  
  return baseScore + bonusScore;
};

/**
 * Hook para gerenciar dados do leaderboard
 * 
 * @example
 * ```tsx
 * const { sortedUnits, getRankWithTies } = useLeaderboardData(units);
 * ```
 */
export const useLeaderboardData = (units: Unit[]) => {
  // implementação
};
```

### 2. README de Funcionalidades

Para novas funcionalidades complexas, crie um README específico:

```markdown
# Feature: Sistema de Ranking

## Visão Geral
Descrição da funcionalidade...

## Componentes
- `RankingList`: Lista principal do ranking
- `RankingItem`: Item individual do ranking
- `PodiumStep`: Componente do pódio

## Hooks
- `useLeaderboardData`: Gerencia dados do ranking
- `usePositionTracker`: Rastreia mudanças de posição

## Algoritmos
### Ordenação
```typescript
const sortedUnits = units.sort((a, b) => {
  if (b.score !== a.score) return b.score - a.score;
  return a.name.localeCompare(b.name);
});
```

## Testes
Executar: `npm test -- ranking`
```

## Reportar Issues

### 1. Template de Bug

```markdown
**Descrição do Bug**
Descrição clara e concisa do bug.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '....'
3. Role para baixo até '....'
4. Veja o erro

**Comportamento Esperado**
Descrição clara do que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Informações do Ambiente:**
- OS: [ex: iOS]
- Browser [ex: chrome, safari]
- Versão [ex: 22]

**Contexto Adicional**
Qualquer outra informação relevante.
```

### 2. Template de Feature Request

```markdown
**A funcionalidade está relacionada a um problema?**
Descrição clara do problema. Ex: Fico frustrado quando [...]

**Descreva a solução que você gostaria**
Descrição clara e concisa da solução desejada.

**Descreva alternativas consideradas**
Descrição de soluções alternativas consideradas.

**Contexto Adicional**
Qualquer outra informação relevante, mockups, etc.
```

## Code Review Guidelines

### Para Reviewers

#### ✅ Foque em:
- Lógica de negócio
- Performance
- Segurança
- Manutenibilidade
- Testes
- Documentação

#### ❌ Evite:
- Comentários sobre estilo (use linters)
- Nitpicking excessivo
- Reviews muito demorados

### Para Authors

#### ✅ Antes do Review:
- Auto-review do código
- Testes passando
- Commits limpos
- Descrição clara do PR

#### ✅ Durante o Review:
- Responda feedback rapidamente
- Faça mudanças sugeridas
- Explique decisões de design

## Configuração de IDE

### VS Code

#### Extensões Recomendadas
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

#### Settings
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Perguntas Frequentes

### Como adicionar uma nova página?

1. Crie o arquivo em `src/pages/NovaPagina.tsx`
2. Adicione a rota em `src/App.tsx`
3. Atualize navegação se necessário
4. Adicione testes
5. Documente a nova funcionalidade

### Como conectar com nova API externa?

1. Crie cliente na pasta `src/integrations/`
2. Adicione tipos em `src/types/`
3. Crie hook customizado se necessário
4. Adicione testes de integração
5. Documente configuração

### Como adicionar nova tabela no banco?

1. Crie migração em `supabase/migrations/`
2. Adicione tipos em `src/integrations/supabase/types.ts`
3. Configure RLS se necessário
4. Teste localmente
5. Documente mudanças

## Recursos Úteis

- [Documentação React](https://react.dev/)
- [Documentação TypeScript](https://www.typescriptlang.org/docs/)
- [Documentação Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação Supabase](https://supabase.com/docs)
- [Guia shadcn/ui](https://ui.shadcn.com/)

## Contato

Para dúvidas sobre contribuição:
- Abra uma issue no GitHub
- Entre em contato com os maintainers

---

Obrigado por contribuir com o Ranking Unidade! 🚀

*Guia de Contribuição atualizado em: Janeiro 2025* 