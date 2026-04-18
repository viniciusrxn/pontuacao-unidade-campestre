

## Análise Mobile - Pontos Críticos Identificados

### Problemas Encontrados (em ordem de impacto)

**1. Header Mobile Sobrecarregado**
- Header ocupa 64px fixo + título da página truncado
- Logo + título "Ranking Unidade" + subtítulo competem por espaço
- Sem indicação visual de qual página está ativa

**2. Tabs do Dashboard com 5 Colunas em Mobile**
- `grid-cols-5` força ícones e labels muito apertados (~75px cada em tela 360px)
- Texto `text-[10px]` ilegível para usuários idosos
- Badges de contagem se sobrepõem aos ícones
- Solução: scroll horizontal ou bottom-navigation

**3. Falta de Bottom Navigation (padrão mobile)**
- Usuário precisa abrir menu hamburger para qualquer navegação
- Ações principais (Início, Dashboard, Presença) deveriam estar sempre acessíveis
- Padrão esperado em apps mobile modernos

**4. Card de Tarefa Não Otimizado**
- Botão "Completar Esta Tarefa" pequeno (`size="sm"` em mobile)
- Textarea de prova com apenas 3 rows — difícil digitar em mobile
- Sem suporte a anexar foto/imagem (apenas texto)
- Footer e padding inconsistentes

**5. Pódio Quebra em Telas Pequenas**
- 3 colunas lado a lado em tela <360px ficam apertadas
- Nome longo de unidade quebra layout
- Falta versão "stack vertical" para mobile pequeno

**6. Login Mobile com Excesso Visual**
- 4 elementos animados de fundo (blur + pulse + bounce) consomem GPU
- Card faz `hover:scale-[1.02]` desnecessário em touch
- Padding muito grande reduz área visível em telas pequenas

**7. Performance em Mobile**
- Animações Framer Motion com `delay: index * 0.05` em listas grandes travam scroll
- Sem `will-change` ou otimizações de repaint
- PWA não tem skeleton loading — só spinner genérico
- Imagens externas (imgur) sem lazy loading

**8. Acessibilidade Touch**
- `min-height: 44px` global quebra layout de badges/labels pequenos
- Falta feedback visual de toque (active states)
- Sem suporte a "pull-to-refresh" no ranking

**9. Formulário de Presença**
- 546 linhas, muitos campos sem agrupamento visual
- Inputs numéricos sem botões +/- (difícil em mobile)
- Upload de foto sem preview otimizado

**10. UX Geral**
- Sem indicador de loading skeleton (só spinner full-screen)
- Sem toast de "offline mode" quando PWA perde conexão
- Sem haptic feedback em ações importantes
- Pull-to-refresh ausente

---

## Plano de Melhorias Mobile

### **Fase 1: Navegação Mobile (Maior Impacto)**

1. **Bottom Navigation Bar fixa**
   - Componente `MobileBottomNav` com 4-5 ícones principais
   - Visível apenas em mobile (`md:hidden`)
   - Indicador visual da rota ativa
   - Ícones: Início, Dashboard, Presença, Notícias, Menu

2. **Header simplificado em mobile**
   - Reduzir altura para 56px
   - Mostrar apenas título da página atual + avatar
   - Logo apenas no ícone do app instalado

3. **Tabs do Dashboard reorganizadas**
   - Scroll horizontal em vez de grid-cols-5
   - Aumentar texto para `text-xs` legível
   - Badges sem sobreposição

### **Fase 2: Componentes Touch-Friendly**

4. **Card de Tarefa otimizado**
   - Botão full-width em mobile
   - Textarea com 5 rows + auto-resize
   - Suporte a colar imagem da câmera/galeria
   - Swipe actions (deslizar para completar)

5. **Pódio responsivo**
   - Layout stack vertical em telas <380px
   - Truncate de nomes longos com tooltip

6. **Formulário de Presença**
   - Steppers numéricos com botões +/-
   - Wizard multi-step (membros → uniforme → extras → foto)
   - Preview de foto otimizado

### **Fase 3: Performance & PWA**

7. **Loading states melhorados**
   - Skeleton loaders em vez de spinners
   - Suspense boundaries por seção

8. **Otimizações de animação**
   - Reduzir delays escalonados em listas
   - Adicionar `will-change-transform` em elementos animados
   - Respeitar `prefers-reduced-motion`

9. **Pull-to-refresh** no ranking principal

10. **Indicador de Offline** (toast quando perde conexão)

### **Fase 4: Polish & Acessibilidade**

11. **Active states em todos os botões touch**
12. **Haptic feedback** via Vibration API em ações importantes
13. **Lazy loading** de imagens externas
14. **Login mobile simplificado** (remover animações pesadas de fundo)

---

### Recomendação de Início

Sugiro começar pela **Fase 1 (Navegação)** porque resolve o maior atrito UX e é o que usuários mobile sentem imediatamente. Após aprovação, implemento:

1. `MobileBottomNav` component
2. Header simplificado mobile
3. Tabs com scroll horizontal no UnitDashboard

Tempo estimado: 1 iteração para Fase 1 completa.

