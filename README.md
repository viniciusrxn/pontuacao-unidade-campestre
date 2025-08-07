# Ranking Unidade 🏆

Uma Progressive Web App moderna para gerenciar competições entre unidades de desbravadores, com sistema de pontuação gamificado, ranking em tempo real e comunicação integrada.

[![Deploy Status](https://img.shields.io/badge/deploy-success-brightgreen)](https://lovable.dev/projects/9d39cee6-a2f2-4a5c-a8ff-c97f28395d93)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)

## 🚀 Visão Geral

O **Ranking Unidade** é um sistema completo de gamificação para competições entre unidades, oferecendo:

- **📊 Ranking Dinâmico**: Leaderboard com pódio 3D e rastreamento de posições
- **✅ Sistema de Tarefas**: Criação, submissão e validação de atividades
- **📅 Controle de Presença**: Formulário semanal com pontuação automática
- **📰 Comunicação**: Feed de notícias
- **📱 PWA**: Instalável em dispositivos móveis como app nativo
- **🔒 Segurança**: Row Level Security (RLS) e autenticação robusta

## 📋 Índice

- [🎯 Funcionalidades](#-funcionalidades)
- [🛠️ Tecnologias](#️-tecnologias)
- [📚 Documentação](#-documentação)
- [🚀 Início Rápido](#-início-rápido)
- [🏗️ Deploy](#️-deploy)
- [🤝 Contribuição](#-contribuição)
- [📄 Licença](#-licença)

## 🎯 Funcionalidades

### Sistema de Ranking
- **Pódio 3D** para top 3 posições
- **Indicadores de movimento** (subiu/desceu)
- **Tratamento de empates** inteligente
- **Destaque da unidade atual**

### Gestão de Tarefas
- **Criação pelo admin** com níveis de dificuldade
- **Submissão de provas** pelas unidades
- **Validação manual** com atualização automática de pontuação
- **Categorização** flexível

### Controle de Presença
- **Formulário semanal** detalhado
- **Cálculo automático** de pontuação
- **Upload de fotos** comprobatórias
- **Controle por unidade** específica

### Sistema de Comunicação
- **Feed de notícias** com posts fixados

- **Notificações** em tempo real

### Painel Administrativo
- **Gestão completa** de tarefas, unidades e usuários
- **Validação** de submissões e presenças
- **Controles de formulários** por unidade
- **Reset de estatísticas** com segurança

## 🛠️ Tecnologias

### Frontend
- **React 18** com TypeScript
- **Vite** como build tool
- **Tailwind CSS** + **shadcn/ui**
- **Framer Motion** para animações
- **TanStack Query** para estado
- **PWA** com Service Worker

### Backend
- **Supabase** como Backend as a Service
- **PostgreSQL** com Row Level Security
- **Real-time subscriptions**
- **Stored procedures** seguros

### DevOps
- **ESLint** para linting
- **TypeScript** para tipagem
- **Git** com Conventional Commits

## 📚 Documentação

A documentação completa está organizada nos seguintes arquivos:

### 📖 Documentação Principal
- **[Documentação Técnica Completa](DOCUMENTACAO_TECNICA.md)** - Visão abrangente do sistema
  - Arquitetura e componentes
  - Estrutura do banco de dados
  - Autenticação e autorização
  - Funcionalidades detalhadas

### 🔌 API e Integrações
- **[API Reference](docs/API_REFERENCE.md)** - Documentação completa da API
  - Endpoints do Supabase
  - Stored procedures
  - Real-time subscriptions
  - Exemplos de uso

### 🚀 Deploy e Configuração
- **[Guia de Deploy](docs/DEPLOYMENT_GUIDE.md)** - Instruções de deploy completas
  - Configuração do Supabase
  - Deploy em Vercel/Netlify
  - Configuração de domínio
  - Monitoramento e backup

### 🤝 Desenvolvimento
- **[Guia de Contribuição](docs/CONTRIBUTING.md)** - Como contribuir com o projeto
  - Padrões de código
  - Estrutura de commits
  - Testes e documentação
  - Code review guidelines

## 🚀 Início Rápido

### 1. Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Supabase (gratuita)

### 2. Instalação

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/pontuacao-unidade.git
cd pontuacao-unidade

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase
```

### 3. Configuração do Banco

```bash
# Instalar Supabase CLI (opcional)
npm install -g supabase

# Executar migrações via interface web ou CLI
# Veja o guia de deploy para instruções detalhadas
```

### 4. Executar

```bash
# Servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

### 5. Login Inicial

**Admin:**
- Username: `admin`
- Password: `SecureAdmin123!`

⚠️ **Importante**: Altere a senha padrão após o primeiro acesso!

## 🏗️ Deploy

O projeto pode ser facilmente deployado em várias plataformas:

### Vercel (Recomendado)
1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Netlify
1. Arraste a pasta `dist` após build
2. Configure redirecionamentos SPA
3. Adicione variáveis de ambiente

### GitHub Pages
1. Configure GitHub Actions
2. Build automático via workflow
3. Deploy na branch `gh-pages`

📖 **Instruções detalhadas**: [Guia de Deploy](docs/DEPLOYMENT_GUIDE.md)

## 🎨 Screenshots

### Ranking Principal
![Ranking](https://via.placeholder.com/800x400?text=Ranking+Principal)

### Painel Admin
![Admin](https://via.placeholder.com/800x400?text=Painel+Admin)

### Mobile PWA
![Mobile](https://via.placeholder.com/300x600?text=Mobile+PWA)

## 🏛️ Arquitetura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│   Frontend      │◄──►│    Supabase     │◄──►│   PostgreSQL    │
│   (React PWA)   │    │   (Backend)     │    │   (Database)    │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │
        ▼
┌─────────────────┐
│   Service       │
│   Worker        │
│   (Cache/PWA)   │
└─────────────────┘
```

## 📊 Estrutura do Projeto

```
pontuacao-unidade/
├── docs/                     # 📚 Documentação
├── public/                   # 🌐 Assets estáticos
├── src/
│   ├── components/          # 🧩 Componentes React
│   │   ├── ui/             # 🎨 Componentes base
│   │   └── *.tsx           # 🏗️ Componentes específicos
│   ├── contexts/           # 🔄 Contextos React
│   ├── hooks/              # 🪝 Custom hooks
│   ├── pages/              # 📄 Páginas da aplicação
│   ├── types/              # 📝 Definições TypeScript
│   └── integrations/       # 🔌 Integrações externas
├── supabase/               # 🗄️ Configurações do banco
└── docs/                   # 📖 Documentação técnica
```

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia o [Guia de Contribuição](docs/CONTRIBUTING.md) antes de começar.

### Como Contribuir

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'feat: add amazing feature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### Diretrizes

- Siga os padrões de código estabelecidos
- Adicione testes para novas funcionalidades
- Atualize a documentação conforme necessário
- Use Conventional Commits

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes com coverage
npm test -- --coverage

# Testes em modo watch
npm test -- --watch
```

## 📈 Roadmap

- [ ] **Sistema de Notificações Push**
- [ ] **Relatórios e Analytics**
- [ ] **API Rest pública**
- [ ] **Tema escuro/claro**
- [ ] **Multilíngue (i18n)**
- [ ] **Integração com redes sociais**
- [ ] **Sistema de badges/conquistas**
- [ ] **Modo offline aprimorado**

## 🐛 Reportar Issues

Encontrou um bug? Tem uma sugestão? 

1. Verifique se já não existe uma issue similar
2. Use os templates apropriados
3. Forneça o máximo de informações possível

[Criar Nova Issue](https://github.com/seu-usuario/pontuacao-unidade/issues/new)

## 📞 Suporte

- **Documentação**: [Docs completa](DOCUMENTACAO_TECNICA.md)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/pontuacao-unidade/issues)
- **Discussões**: [GitHub Discussions](https://github.com/seu-usuario/pontuacao-unidade/discussions)

## 🏆 Créditos

### Tecnologias Principais
- [React](https://reactjs.org/) - Framework UI
- [TypeScript](https://www.typescriptlang.org/) - Tipagem estática
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Supabase](https://supabase.com/) - Backend as a Service
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Framer Motion](https://www.framer.com/motion/) - Animações

### Inspirações
- Sistemas de gamificação modernos
- Interfaces mobile-first
- PWAs de alta qualidade

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🌟 Agradecimentos

- Todos os contribuidores do projeto
- Comunidade de desbravadores
- Equipe do Supabase pela plataforma incrível
- Desenvolvedores das bibliotecas open source utilizadas

---

<div align="center">

**Feito com ❤️ para a comunidade de desbravadores**

[⭐ Dar uma estrela](https://github.com/seu-usuario/pontuacao-unidade) • [🐛 Reportar Bug](https://github.com/seu-usuario/pontuacao-unidade/issues) • [💡 Sugerir Feature](https://github.com/seu-usuario/pontuacao-unidade/issues)

*Sistema de Ranking Unidade - v1.0.0*

</div>
