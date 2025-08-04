# Guia de Deploy - Ranking Unidade

## Visão Geral

Este guia fornece instruções completas para fazer o deploy da aplicação Ranking Unidade em diferentes ambientes.

## Pré-requisitos

### Desenvolvimento Local
- **Node.js** 18.0+ 
- **npm** 8.0+ ou **yarn** 1.22+
- **Git** para controle de versão
- **Supabase CLI** (opcional, mas recomendado)

### Produção
- Conta no **Supabase** (Free tier suficiente para início)
- Plataforma de deploy (**Vercel**, **Netlify**, ou similar)
- Domínio personalizado (opcional)

## Configuração do Supabase

### 1. Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma nova organização (se necessário)
4. Clique em "New project"
5. Preencha os dados:
   - **Name**: ranking-unidade
   - **Database Password**: Uma senha forte
   - **Region**: Escolha a região mais próxima dos usuários

### 2. Configurar Banco de Dados

#### Opção A: Via Interface Web
1. Vá para "SQL Editor" no painel do Supabase
2. Execute os scripts das migrações em ordem:

```sql
-- 1. Executar: supabase/migrations/20250609164841-26c6878f-da30-49ca-a692-2d3563b35133.sql
-- 2. Executar: supabase/migrations/20250615044849-635c7067-c7d5-4fdb-80f1-e0f780106029.sql
-- 3. Executar: supabase/migrations/20250724195938-ee722acc-d783-46e5-9000-672514863506.sql
-- 4. Executar: supabase/migrations/20250724212438-20b72bbc-8d59-4d54-8752-695495759a08.sql
-- 5. Executar: supabase/migrations/20250725132159-b4bfaa4c-eaf1-4fc6-8d1a-4367827418bf.sql
-- 6. Executar: supabase/migrations/20250725133352-850949b5-f535-4dd7-87ba-bba598996e28.sql
```

#### Opção B: Via CLI (Recomendado)
```bash
# Instalar Supabase CLI
npm install -g supabase

# Fazer login
supabase login

# Inicializar projeto local
supabase init

# Linkar com projeto remoto
supabase link --project-ref SEU_PROJECT_REF

# Aplicar migrações
supabase db push
```

### 3. Obter Credenciais

1. Vá para "Settings" > "API"
2. Copie:
   - **Project URL**
   - **anon public key**

### 4. Configurar Row Level Security

As migrações devem ter habilitado RLS automaticamente. Para verificar:

```sql
-- Verificar se RLS está ativo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

### 5. Criar Dados Iniciais

#### Admin Padrão
O admin padrão é criado automaticamente:
- **Username**: admin
- **Password**: SecureAdmin123!

⚠️ **IMPORTANTE**: Altere esta senha após o primeiro deploy!

#### Unidades de Exemplo
```sql
INSERT INTO units (name, password, score) VALUES
  ('Águias', 'senha123', 0),
  ('Falcões', 'senha456', 0),
  ('Leões', 'senha789', 0);
```

## Configuração da Aplicação

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY

# Optional: Analytics, Error Tracking, etc.
# VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
# VITE_SENTRY_DSN=SENTRY_DSN
```

### 2. Configuração de Build

#### package.json
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "preview": "vite preview",
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  }
}
```

#### vite.config.ts
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'Ranking Unidade',
        short_name: 'Ranking Unidade',
        description: 'Sistema de pontuação para unidades',
        theme_color: '#f8100e',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'https://i.imgur.com/KYU3KX5.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://i.imgur.com/KYU3KX5.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/tmhkprlaefcqlgxjgkqp\.supabase\.co\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 horas
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
}));
```

## Deployment

### Opção 1: Vercel (Recomendado)

#### Deploy Automático via GitHub

1. **Conectar Repositório**
   - Vá para [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Conecte seu repositório GitHub

2. **Configurar Projeto**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Variáveis de Ambiente**
   ```
   VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY
   ```

4. **Deploy**
   - Clique em "Deploy"
   - O deploy será automático a cada push na branch main

#### Deploy Manual

```bash
# Instalar Vercel CLI
npm install -g vercel

# Build da aplicação
npm run build

# Deploy
vercel --prod
```

#### Configuração Avançada

Crie `vercel.json` na raiz:

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { 
        "distDir": "dist" 
      }
    }
  ],
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ],
  "headers": [
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Opção 2: Netlify

#### Deploy via Interface

1. **Conectar Repositório**
   - Vá para [netlify.com](https://netlify.com)
   - Clique em "New site from Git"
   - Conecte seu repositório

2. **Configurações de Build**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

3. **Variáveis de Ambiente**
   - Vá para "Site settings" > "Environment variables"
   - Adicione as mesmas variáveis do Vercel

#### Configuração Avançada

Crie `netlify.toml` na raiz:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Content-Type = "application/json"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Opção 3: GitHub Pages

#### Configuração de Workflow

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## Configuração de Domínio Personalizado

### 1. Vercel

1. Vá para "Settings" > "Domains"
2. Adicione seu domínio
3. Configure DNS:
   ```
   Type: CNAME
   Name: www (ou @)
   Value: cname.vercel-dns.com
   ```

### 2. Netlify

1. Vá para "Domain settings"
2. Adicione domínio personalizado
3. Configure DNS:
   ```
   Type: CNAME
   Name: www
   Value: seu-site.netlify.app
   ```

## SSL/HTTPS

### Automático
- **Vercel** e **Netlify** fornecem SSL automático
- **GitHub Pages** também oferece SSL gratuito

### Manual (outros provedores)
- Use **Let's Encrypt** para certificados gratuitos
- Configure renovação automática

## Monitoramento e Analytics

### 1. Google Analytics

```typescript
// src/lib/analytics.ts
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
  }
}

export const GA_TRACKING_ID = process.env.VITE_GOOGLE_ANALYTICS_ID;

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_location: url,
    });
  }
};

export const event = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
```

### 2. Error Tracking (Sentry)

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/react';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.VITE_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
}
```

### 3. Performance Monitoring

```typescript
// src/lib/performance.ts
export const reportWebVitals = (metric: any) => {
  if (process.env.NODE_ENV === 'production') {
    console.log(metric);
    // Enviar para serviço de analytics
  }
};
```

## Backup e Restauração

### 1. Backup do Banco de Dados

```bash
# Via Supabase CLI
supabase db dump --file backup.sql

# Via pg_dump (se tiver acesso direto)
pg_dump "postgresql://..." > backup.sql
```

### 2. Backup Automático

Configure backups automáticos no Supabase:
1. Vá para "Settings" > "Database"
2. Configure "Point in Time Recovery"
3. Defina retenção de backups

### 3. Restauração

```bash
# Restaurar via Supabase CLI
supabase db reset --linked
psql "postgresql://..." < backup.sql
```

## Segurança

### 1. Variáveis de Ambiente

- ✅ Use variáveis de ambiente para todas as chaves
- ✅ Nunca commite credenciais no código
- ✅ Use diferentes chaves para dev/prod

### 2. Headers de Segurança

```javascript
// Headers recomendados
{
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
}
```

### 3. Content Security Policy

```javascript
{
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co"
}
```

## Otimizações de Performance

### 1. Build Otimizado

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

### 2. Lazy Loading

```typescript
// Lazy load de páginas
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UnitDashboard = lazy(() => import('./pages/UnitDashboard'));

// No App.tsx
<Suspense fallback={<div>Carregando...</div>}>
  <Route path="/admin" element={<AdminDashboard />} />
</Suspense>
```

### 3. Service Worker Customizado

```typescript
// public/sw.js
const CACHE_NAME = 'ranking-unidade-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

## Troubleshooting de Deploy

### Problemas Comuns

#### 1. Build Failure
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install

# Verificar TypeScript
npm run type-check

# Build local
npm run build
```

#### 2. Environment Variables não Funcionam
- Verifique se as variáveis começam com `VITE_`
- Confirme se estão configuradas na plataforma de deploy
- Teste localmente com `.env.local`

#### 3. PWA não Instala
- Verifique se está servindo via HTTPS
- Confirme se o manifest.json está acessível
- Valide o service worker no DevTools

#### 4. Supabase Connection Issues
- Verifique URL e chave anon
- Confirme se RLS está configurado corretamente
- Teste conexão via cliente REST

### Debug em Produção

```typescript
// Logs condicionais
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}

// Error boundary
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === 'production') {
      // Enviar erro para serviço de tracking
      Sentry.captureException(error);
    }
  }
}
```

## Checklist de Deploy

### Pré-Deploy
- [ ] Testes passando localmente
- [ ] Build funcionando sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados com dados iniciais
- [ ] SSL configurado
- [ ] Domínio configurado (se aplicável)

### Pós-Deploy
- [ ] Site acessível via HTTPS
- [ ] PWA instalável em dispositivos móveis
- [ ] Funcionalidades principais testadas
- [ ] Performance verificada (Lighthouse)
- [ ] Error tracking configurado
- [ ] Backup automático ativo
- [ ] Monitoramento configurado

### Segurança
- [ ] Senha admin alterada
- [ ] Headers de segurança configurados
- [ ] RLS ativo no banco
- [ ] Variáveis sensíveis não expostas
- [ ] Rate limiting configurado

---

## Conclusão

Este guia fornece todos os passos necessários para fazer o deploy da aplicação Ranking Unidade em produção. Sempre teste em ambiente de staging antes de publicar em produção.

Para suporte adicional, consulte:
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Vercel](https://vercel.com/docs)
- [Documentação do Vite](https://vitejs.dev/guide/)

---

*Guia de Deploy atualizado em: Janeiro 2025* 