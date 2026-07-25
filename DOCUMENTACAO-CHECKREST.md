# Documentação do Sistema Checkrest

> Documentação elaborada a partir da análise de prints e vídeos de uso real da plataforma (app.checkrest.com), incluindo operação em unidades Bob's / LS Company Comércio de Alimentos LTDA.

---

## 1. Visão Geral

O **Checkrest** é uma plataforma SaaS de **gestão de checklists operacionais** voltada para operações com múltiplas unidades — especialmente food service (restaurantes, franquias, cozinhas industriais). O sistema padroniza rotinas operacionais (abertura, fechamento, troca de turno, limpeza, contagem de estoque, validades etc.), acompanha a execução em tempo real e transforma as respostas em indicadores de desempenho.

A plataforma é dividida em dois ambientes:

| Ambiente | Público | Função |
|---|---|---|
| **Painel Web** (app.checkrest.com) | Gestores/administradores | Criar e configurar checklists, gerenciar unidades/setores/usuários, acompanhar dashboards e relatórios |
| **App Mobile "Checkrest 360"** | Operadores (linha de frente) | Executar os checklists agendados, anexar evidências (fotos), assinar, responder itens |

O painel web sempre exibe um **preview em tempo real do app mobile** durante a criação de checklists, mostrando exatamente como o operador verá cada item no celular.

---

## 2. Arquitetura Lógica (Modelo de Dados Conceitual)

A hierarquia de entidades observada no sistema:

```
Conta / Workspace
├── Unidades (lojas/restaurantes — ex.: "Restaurante Matriz PA", "Pantaneira", "Checkrest Sul")
│   └── Cidade/UF associada, restrições próprias de horário/localização
├── Setores (ex.: Cozinha, Salão, Estoque, Bar, Caixa, Administrativo, Compras)
├── Usuários
│   ├── Gestor (acesso ao painel web)
│   └── Operador (acesso ao app, com PIN de troca rápida)
└── Checklists
    ├── Itens (perguntas/atividades, de vários tipos)
    ├── Configuração (unidade, setor, momento, responsável, agendamento, restrições)
    └── Respostas / Execuções (uma por agendamento, com métricas calculadas)
```

### 2.1 Momentos

Todo checklist é vinculado a um **Momento** operacional, que classifica quando ele acontece na rotina: **Abertura**, **Fechamento**, **Troca de turno** e **Outros**.

### 2.2 Ciclo de vida de uma execução (Situação)

Cada execução agendada de checklist passa por estados observáveis no dashboard:

- **Não iniciado** — agendado, operador ainda não abriu
- **Iniciado** — em andamento (iniciado não finalizado)
- **Em tempo** — concluído dentro do prazo
- **Atrasado** — passou do horário sem conclusão
- **Concluído / Finalizado** — respondido por completo
- **Não executado** — janela de execução expirou sem resposta

### 2.3 Métricas de desempenho (KPIs)

O sistema calcula, por execução e de forma agregada, quatro indicadores:

| Métrica | O que mede |
|---|---|
| **Pontualidade (P)** | Se a execução ocorreu dentro do horário agendado |
| **Esforço (E)** | Grau de preenchimento/dedicação na execução (itens respondidos) |
| **Qualidade (Q)** | Conformidade das respostas com as metas/valores-alvo definidos nos itens |
| **Score** | Indicador composto que consolida os três anteriores |

Essas métricas alimentam rankings (por usuário, unidade, setor e checklist), gráficos de evolução temporal e o detalhamento linha a linha.

### 2.4 URLs e rotas observadas

- `app.checkrest.com/checklists/` — listagem de checklists
- `app.checkrest.com/checklist/setup/{id}/` — editor/configuração de um checklist (ex.: 22416, 26311)

---

## 3. Estrutura de Navegação (Painel Web)

Menu lateral (sidebar escura, retrátil):

- **Dashboard** — indicadores e acompanhamento
- **Checklists** — listagem e criação/edição
- **Ideias** — canal de sugestões
- **Atualizações** — novidades da plataforma (com badge de notificação)
- **Notificações**
- **Configurações** — preferências do workspace
- **Cursos** — conteúdo educacional
- **Central de Ajuda**
- **Sair**

---

## 4. Módulo Dashboard

Tela inicial do gestor ("Bom dia, Yan"), com botão **Personalizar** no topo.

### 4.1 Cards de situação geral

Faixa superior com totais do período filtrado, cada card com barra de progresso e percentual:

| Card | Exemplo observado |
|---|---|
| Agendados (total) | 415 |
| Não iniciado | 77 (19%) |
| Iniciado não finalizado | 75 (18%) |
| Atrasado | 171 (41%) |
| Finalizado | 92 (22%) |

### 4.2 Filtros globais

Barra de filtros com botão "Limpar": **Período** (intervalo de datas), **Unidade**, **Setor**, **Usuário** e **Momento**. Todos os widgets respondem aos filtros.

### 4.3 Widgets disponíveis

- **Taxa de conclusão** — gráfico donut com % de finalizados vs. pendentes no período (ex.: 22,2% finalizados, 77,8% pendentes)
- **Ranking por usuários** — pontuação consolidada de cada integrante, com detalhamento P/E/Q
- **Ranking por unidades** — desempenho entre as unidades (ex.: Pantaneira 46,7%)
- **Ranking por setores** — resultado operacional de cada setor (ex.: Bar 61,7%)
- **Ranking de checklists** — checklists com melhor taxa de conclusão
- **Evolução dos indicadores de desempenho** — gráfico de linhas temporal com as 4 séries (Score, Pontualidade, Esforço, Qualidade); tooltip por dia com os valores exatos
- **Comparativo entre períodos** — variação de Pontualidade, Esforço e Qualidade vs. período anterior, em pontos percentuais (ex.: Pontualidade 42,3% ↑ +8,4pp)
- **Mapa de calor diário** — matriz dia da semana × hora do dia com intensidade de execução
- **Comparativo por dia da semana** — barras de concluídos vs. total por dia
- **Alertas de pendência** — lista de checklists pendentes ("Hoje"), com usuário e unidade
- **KPIs Médios**

### 4.4 Personalizar Dashboard

Painel lateral "Personalizar Dashboard" com dois recursos:

1. **Predefinições** (layouts prontos): **Padrão** (visão geral essencial), **Operacional** (foco no dia a dia), **Estratégico** (tendências e comparações) e **Multi-Unidades** (comparação entre unidades).
2. **Widgets ativos** — lista reordenável (drag handle) mostrando a largura de cada widget em colunas (1col, 2col, 4col).
3. **Catálogo de widgets** — toggles liga/desliga agrupados por categoria: *Situação Operacional* (Situação Geral, Taxa de Conclusão, Alertas de Pendência), *Desempenho (KPIs)* (KPIs Médios, Evolução de Desempenho) e *Rankings* (Usuários, Unidades, Setores).

### 4.5 Detalhamento (tabela analítica)

Tabela paginada com todas as execuções (ex.: 415 registros), colunas: **Data, Checklist, Unidade, Setor, Momento, Usuário, Situação, Pontualidade, Esforço, Qualidade**. Cada coluna tem filtro próprio e ordenação. Ações no topo: **Colunas** (configurar visíveis) e **Exportar CSV**.

### 4.6 Detalhe da Resposta

Clicando em uma linha do detalhamento, abre um painel lateral com a execução completa:

- Cabeçalho: operador, data/hora, status (ex.: "Concluída"), score (ex.: ★ 67%)
- Cards com **Pontualidade, Esforço e Qualidade** individuais
- Informações: checklist, unidade, setor, momento, agendado para, início, conclusão e **duração**
- Barra de **preenchimento** (ex.: "6 de 6 itens")
- **Respostas item a item**, incluindo evidências fotográficas anexadas pelo operador
- Botão **Exportar PDF**

---

## 5. Módulo Checklists

### 5.1 Listagem

Tabela com filtro por unidade, busca por nome e botão **Adicionar Checklist +**. Colunas: **ID, Título, Momento, Setor, Status (toggle Ativo/Inativo), Recorrência, Horário, Ações**.

Menu de ações por checklist: **Renomear**, **Editar Checklist**, **Duplicar Checklist**, **Ver respostas** e **Excluir Checklist**.

### 5.2 Editor de Checklist (`/checklist/setup/{id}/`)

O editor tem duas áreas principais: **construção de itens** e **configuração do checklist** (botões "Ver itens" / "Avançar" alternam entre elas). À direita, painel com **Preview** (simulação do app mobile em tempo real) e **Checkrest IA** (assistente de IA para geração de conteúdo).

#### 5.2.1 Tipos de item

Menu "Adicionar item" oferece 10 tipos:

| Tipo | Uso |
|---|---|
| **Check** | Feito / Não Feito (rótulos personalizáveis) |
| **Avaliativo** | Escala de estrelas (rótulos das extremidades personalizáveis, ex.: Ruim → Excelente) |
| **Texto** | Resposta livre |
| **Data/Hora** | Registro de data e hora |
| **Numérico** | Número, com subtipo: Inteiro, Decimal (0.00), Porcentagem ou Dinheiro |
| **Lista de Seleção** | Escolha entre opções |
| **GPS** | Captura de localização |
| **Código de Barras/QR Code** | Leitura de código |
| **Separador (Sem interação)** | Divisor visual/organizacional |
| **Assinatura** | Assinatura digital |

#### 5.2.2 Campos de cada item

- **Título do item** (a atividade a realizar) e **Peso** (valor do item no relatório — influencia o cálculo das métricas)
- **Descrição da atividade** — editor rich text (negrito, itálico, sublinhado, tachado, listas, link, desfazer/refazer)
- **Rótulos** — nos itens Check: Rótulo Negativo / Rótulo Positivo (textos dos botões); nos avaliativos: Rótulo Inferior / Rótulo Superior (extremidades da escala)
- **Evidências** — "+ Adicionar Evidência": exige do operador anexos comprobatórios (ex.: foto)
- **Recursos adicionais**:
  - **Tornar obrigatório** — item precisa ser respondido
  - **Notificar item crítico** — dispara notificação quando a resposta indica problema
  - **Definir meta** — define o "valor alvo": **Mínimo aceitável** (valor ≥ escolhido é válido) e **Máximo aceitável** (valor ≤ escolhido é válido), com opções "Sem limite mínimo/máximo". Alimenta a métrica de **Qualidade**

#### 5.2.3 Ações sobre itens

Cada item da lista possui: visualizar (olho), mover para baixo/cima (setas), **duplicar**, configurações e **excluir**. Os itens também podem ser reordenados por drag-and-drop (handle à esquerda).

#### 5.2.4 Configuração do Checklist

- **Unidade** — a qual unidade o checklist pertence (com botão de sincronizar/replicar)
- **Momento** — Abertura, Fechamento ou Troca de turno
- **Responsável** — usuário ou equipe encarregada (ex.: "EquipeBobs", usuários individuais)
- **Setor** — ex.: Cozinha
- **Descrição** — informações sobre o processo de execução (opcional, "+ Adicionar Descrição")

**Agendamento** (recorrência):

- "O checklist é recorrente? Se sim, qual a frequência?" — **Não se repete, Diário, Semanal, Mensal**
- "Se repete a cada" N dias/semanas/meses
- **Horário de execução** (em UTC-3)
- **Data de início** e **data de término** (opcional)

**Configurações avançadas:**

- **Exceções** — datas em que o checklist não será exibido para os operadores (ex.: feriados)
- **Restrição de execução** — regras de tempo e local:
  - **Restrição de localização** — só executa no local cadastrado (botão "Atualizar localização"; opção "Respeitar restrição na unidade")
  - **Restrição de horário** — só executa na janela de horário (também pode herdar da unidade)
  - **Restrição de ordem** — obriga responder os itens na sequência definida

Botão **Salvar Checklist** finaliza.

---

## 6. Módulo Configurações

Tela "Configurações — Preferências do workspace", organizada em abas: **Perfil, Unidades, Setores, Usuários, Notificações, Financeiro**.

### 6.1 Unidades

Lista das unidades da conta (com sigla, nome e cidade/UF — ex.: "Checkrest Sul / João Pessoa - PB", "Pantaneira / Campo Grande - MS") e botão **+ Nova Unidade**. Cada unidade abre para edição (onde ficam as restrições de horário/localização herdáveis pelos checklists).

### 6.2 Usuários

Modal **"Adicionar novo usuário"**:

- **Dados pessoais**: Nome completo, E-mail (com sufixo de domínio da conta e opção "usar meu próprio e-mail"), Telefone (com DDI), **Senha temporária** (com gerador)
- **Troca rápida**: **PIN de 5 dígitos** — PIN inicial que o operador usa para alternar contas rapidamente no app (vários operadores no mesmo dispositivo), com "Gerar aleatório"
- **Configurações do gestor**: toggle "Esse usuário é Gestor?" — define o papel (Gestor = acesso web; Operador = app)
- **Configurações de setor**: "+ Adicionar Setor" — vincula o usuário aos setores em que atua

---

## 7. App Mobile (Checkrest 360) — visão pelo Preview

O preview no editor demonstra a experiência do operador:

- Tela com nome do checklist no topo e **barra de progresso** do preenchimento
- Itens apresentados um a um em cards: título, descrição e controles conforme o tipo (botões "Não Feito"/"Feito", estrelas, campo numérico com placeholder etc.)
- Indicador de item **obrigatório**
- Navegação **Anterior / Próximo**
- Anexo de evidências (fotos) diretamente na resposta

---

## 8. Fluxos Principais

### 8.1 Fluxo do gestor — criar um checklist

1. Checklists → **Adicionar Checklist +**
2. Adicionar itens (escolher tipo, título, peso, descrição, rótulos, evidências, obrigatoriedade/criticidade/meta), conferindo o **preview mobile** ao lado (ou usar **Checkrest IA**)
3. **Avançar** → configurar unidade, momento, responsável, setor
4. Definir **agendamento** (recorrência, horário, início/término)
5. Configurações avançadas (exceções, restrições de local/horário/ordem)
6. **Salvar Checklist** → passa a ser gerado automaticamente conforme a recorrência

### 8.2 Fluxo do operador — executar

1. Abre o app **Checkrest 360** (login ou **troca rápida por PIN**)
2. Vê os checklists agendados do seu setor/unidade no momento correto
3. Responde item a item (respeitando restrições de ordem/local/horário, se ativas), anexa evidências
4. Conclui → sistema calcula Pontualidade, Esforço, Qualidade e Score

### 8.3 Fluxo de acompanhamento — gestor

1. Dashboard → filtra por período/unidade/setor/usuário/momento
2. Analisa cards de situação, rankings e evolução dos KPIs
3. Detalhamento → abre **Detalhe da Resposta** de qualquer execução (com evidências)
4. Exporta **CSV** (tabela) ou **PDF** (resposta individual)
5. Itens críticos disparam **notificações** automáticas

---

## 9. Identidade Visual e Padrões de Interface

- **Cores**: sidebar em gradiente verde-escuro/petróleo; fundo claro (off-white); **verde-menta (#2EE6A8 aprox.)** como cor primária de ação (botões, toggles, gráficos); vermelho/rosa para negativo (Não Feito, atrasado); âmbar para intermediário (iniciado)
- **Tipografia** arredondada e amigável; cards com cantos arredondados e sombras suaves
- **Padrões**: toggles para ativar/desativar, painéis laterais (drawers) para detalhes e personalização, modais para cadastros, tabelas com filtros por coluna e paginação, badges coloridos de status, tooltips informativos (ícone ⓘ)
- **Feedback em tempo real**: preview mobile espelha cada alteração do editor instantaneamente

---

## 10. Resumo Funcional

| Capacidade | Descrição |
|---|---|
| Multi-unidade e multi-setor | Estrutura hierárquica com restrições herdáveis |
| Construtor de checklists | 10 tipos de item, pesos, metas, evidências, IA assistiva |
| Agendamento recorrente | Diário/semanal/mensal com exceções e janelas de execução |
| Controle de execução | Restrições de localização (GPS), horário e ordem |
| Papéis | Gestor (web) e Operador (app, com PIN de troca rápida) |
| Indicadores | Pontualidade, Esforço, Qualidade e Score, em tempo real |
| Dashboards personalizáveis | Predefinições, catálogo de widgets, larguras configuráveis |
| Auditoria | Detalhe de resposta com evidências, duração e exportação PDF/CSV |
| Notificações | Alertas de pendência e itens críticos |
