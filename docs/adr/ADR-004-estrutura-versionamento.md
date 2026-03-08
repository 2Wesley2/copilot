# ADR-005 — Estrutura de Versionamento da POC do Copiloto Conversacional de Estoque

## Objetivo

Este ADR justifica a estrutura de versionamento recomendada para o repositório da POC do copiloto conversacional de estoque.

O nome definitivo deste arquivo no repositório é `ADR-005-estrutura-versionamento.md`, e ele passa a integrar formalmente o conjunto de decisões arquiteturais versionadas em `docs/adr/`.

O foco aqui não é redefinir a arquitetura funcional do produto, mas explicar por que a organização do código, da documentação e dos artefatos do projeto deve refletir diretamente os requisitos do EPIC e as decisões técnicas já adotadas.

---

## Contexto

A POC não é apenas uma aplicação de chat com backend e frontend genéricos.

Ela foi concebida para operar sobre produtos em estoque por linguagem natural, com resposta em linguagem natural, streaming, renderização progressiva, draft interativo, confirmação explícita obrigatória, rastreabilidade ponta a ponta e deleção exclusivamente lógica.

Além disso, as decisões técnicas já definidas para o projeto estabeleceram que:

- a arquitetura é **hexagonal/modular**;
- o backend em **Nest** concentra orquestração, casos de uso, domínio, persistência e integrações;
- o frontend em **Next** concentra a experiência conversacional, a renderização progressiva e a interação com a tabela de draft;
- o banco principal é **PostgreSQL**, priorizando integridade transacional, consistência, concorrência, auditoria e soft delete;
- os padrões principais são **Command**, **Strategy**, **Adapter**, **State Machine** e **Pipeline**.

Essas decisões fazem com que a estrutura do repositório não possa ser improvisada nem centrada apenas em conveniência de pastas.

Ela precisa sustentar o fluxo central do produto:

> **IA interpreta e propõe; domínio valida; usuário confirma; sistema executa.**

---

## Decisão principal

A estrutura de versionamento recomendada para a POC é um **monorepo simples e modular**, organizado para separar de forma explícita:

- aplicações executáveis;
- contratos e elementos compartilhados;
- documentação de produto e arquitetura;
- decisões arquiteturais versionadas;
- artefatos de persistência e rastreabilidade;
- automações de qualidade do repositório.

A estrutura recomendada é a seguinte:

```txt
copilot/
├─ apps/
│  ├─ api/
│  └─ web/
├─ packages/
│  ├─ contracts/
│  ├─ shared/
│  └─ config/
├─ docs/
│  ├─ product/
│  ├─ architecture/
│  ├─ adr/
│  ├─ api/
│  └─ data/
├─ .github/
│  ├─ workflows/
│  ├─ ISSUE_TEMPLATE/
│  └─ pull_request_template.md
├─ .gitignore
├─ .editorconfig
├─ .gitattributes
├─ .env.example
├─ eslint.config.mjs
├─ prettier.config.mjs
├─ package.json
├─ pnpm-workspace.yaml
├─ turbo.json
└─ README.md
```

---

## Por que a estrutura deve separar `apps/api` e `apps/web`

A POC possui duas responsabilidades de natureza muito diferente.

### 1. Camada conversacional

A interface precisa:

- receber mensagens em linguagem natural;
- exibir respostas em linguagem natural;
- renderizar conteúdo em streaming;
- atualizar a interface progressivamente;
- apresentar e editar a tabela interativa de draft.

### 2. Camada operacional

O backend precisa:

- interpretar a intenção em fluxo controlado;
- estruturar a proposta operacional;
- validar dados e regras;
- persistir draft, confirmação, execução e auditoria;
- garantir que nenhuma operação seja executada sem confirmação explícita.

Como essas responsabilidades têm ritmos, dependências e motivos de mudança diferentes, o repositório deve espelhar essa separação.

Por isso, `apps/web` e `apps/api` devem existir como unidades distintas de versionamento dentro do mesmo monorepo.

Essa escolha reduz acoplamento, facilita a evolução por camada e preserva clareza entre experiência conversacional e execução operacional.

---

## Por que manter tudo no mesmo monorepo

Apesar da separação entre frontend e backend, a POC ainda possui um núcleo funcional único.

Os fluxos de interpretação, proposta, revisão, confirmação e execução dependem fortemente de alinhamento entre:

- contrato do draft;
- contrato dos payloads estruturados;
- regras de confirmação;
- estados da operação;
- semântica de streaming;
- critérios de auditoria e rastreabilidade.

Separar esses elementos cedo demais em múltiplos repositórios aumentaria custo de sincronização, duplicação de contratos e risco de divergência entre interface e backend.

Como a POC ainda está em fase de validação, o monorepo oferece melhor equilíbrio entre:

- isolamento lógico;
- simplicidade operacional;
- consistência entre aplicações;
- facilidade de evolução incremental.

Ou seja, a escolha não é por centralização indiscriminada, mas por preservar coesão de um produto que ainda está consolidando seu fluxo principal.

---

## Por que criar `packages/contracts`

O projeto exige consistência entre o que é interpretado, o que é mostrado no draft e o que é executado.

Isso torna perigoso depender apenas de contratos implícitos entre frontend e backend.

Um pacote compartilhado de contratos ajuda a versionar de forma explícita:

- tipos de intenção;
- formatos de proposta estruturada;
- payloads de create, read, update e delete;
- estados do draft;
- modelos de confirmação;
- formatos de resposta em streaming;
- objetos de auditoria e rastreabilidade.

Isso é especialmente importante porque o sistema precisa garantir que o que for executado corresponda exatamente ao draft aprovado.

Portanto, `packages/contracts` não é um detalhe de conveniência; é uma proteção estrutural para previsibilidade, integridade e alinhamento entre camadas.

---

## Por que criar `packages/shared` e `packages/config`

A POC deve evoluir de forma consistente sem espalhar duplicação de utilitários e configuração.

### `packages/shared`

Deve concentrar elementos reutilizáveis que não pertencem ao domínio de uma aplicação específica, como:

- helpers neutros;
- tipos utilitários;
- normalizadores;
- formatações comuns;
- abstrações reutilizáveis que não acoplem `web` e `api`.

### `packages/config`

Deve concentrar padronização de ferramentas como:

- ESLint;
- Prettier;
- TypeScript base config;
- convenções compartilhadas do workspace.

Esse arranjo reduz divergência entre apps, melhora governança do repositório e evita que decisões de tooling fiquem fragmentadas.


### Por que `eslint.config.mjs` e `prettier.config.mjs` devem ficar explícitos na raiz

Como o repositório foi proposto como monorepo simples, a presença explícita de `eslint.config.mjs` e `prettier.config.mjs` na raiz é importante por três razões.

Primeiro, porque essas configurações deixam claro que as regras de qualidade e formatação pertencem ao workspace como um todo, e não apenas a uma aplicação isolada.

Segundo, porque isso reduz o risco de `apps/api` e `apps/web` divergirem em convenções básicas de lint, estilo e organização do código, o que seria especialmente ruim em um projeto que depende de coerência entre contratos, camadas e naming.

Terceiro, porque a raiz do repositório é o ponto mais natural para scripts como `lint`, `lint:fix`, `format` e `format:check`, fazendo com que CI, onboarding e rotina local usem a mesma fonte de verdade.

Em outras palavras, `packages/config/` pode concentrar presets compartilhados, mas `eslint.config.mjs` e `prettier.config.mjs` devem aparecer de forma visível na raiz como porta de entrada do tooling do workspace.

---

## Por que a documentação deve ser versionada dentro de `docs/`

Neste projeto, a documentação não é acessória.

Ela faz parte da própria governança funcional da POC.

O EPIC define um fluxo operacional altamente normativo, com requisitos funcionais, não funcionais, regras de negócio, critérios de aceite, riscos, premissas e restrições.

Como a POC exige previsibilidade e rastreabilidade, esses artefatos precisam evoluir com o código e permanecer auditáveis no mesmo histórico de Git.

Por isso, `docs/` deve conter pelo menos os seguintes grupos:

### `docs/product/`

Para versionar artefatos de produto, como:

- visão do produto;
- EPIC consolidado;
- requisitos funcionais;
- requisitos não funcionais;
- regras de negócio;
- critérios de aceite;
- matriz de rastreabilidade.

### `docs/architecture/`

Para versionar artefatos explicativos da solução, como:

- visão arquitetural;
- diagramas de contexto;
- diagramas de contêineres;
- diagramas de sequência por fluxo CRUD;
- explicações de fronteiras entre camadas.

### `docs/api/`

Para versionar contratos externos e comportamentos observáveis, como:

- endpoints;
- contrato de streaming;
- modelo de erro;
- exemplos de request e response.

### `docs/data/`

Para versionar a visão de dados operacionais, como:

- modelo de produto;
- modelo de draft;
- modelo de auditoria;
- política de soft delete;
- versionamento de estados persistidos.

Essa organização evita que documentação crítica fique dispersa, informal ou desalinhada da evolução do sistema.

---

## Por que transformar as justificativas técnicas em ADRs

As justificativas de arquitetura, banco de dados e padrões de projeto já representam decisões técnicas relevantes e estruturantes.

Em vez de mantê-las como arquivos soltos sem papel formal no repositório, o ideal é tratá-las como **ADRs — Architecture Decision Records**.

Isso traz benefícios diretos:

- formaliza a decisão tomada;
- registra contexto, motivação e consequências;
- facilita revisão futura;
- reduz rediscussão improdutiva;
- melhora onboarding técnico;
- deixa claro o que foi decidido e por quê.

Por isso, é recomendável mover esses documentos para `docs/adr/`, com nomes como:

```txt
ADR-001-hexagonal-modular.md
ADR-002-postgresql.md
ADR-003-patterns-command-strategy-adapter.md
ADR-004-soft-delete-only.md
```

A adoção de ADR é especialmente adequada neste projeto porque a POC possui forte dependência de decisões explícitas para manter previsibilidade operacional.

---

## Por que versionar migrations e artefatos de persistência

A escolha do PostgreSQL foi motivada por integridade transacional, controle de concorrência, auditoria e preservação de histórico.

Esses requisitos não vivem apenas no código da aplicação. Eles também se materializam em:

- schema do banco;
- migrations;
- índices;
- constraints;
- políticas de soft delete;
- estruturas de auditoria;
- mecanismos de versionamento de estado.

Por isso, a pasta da API deve incluir um espaço explícito para persistência versionada, como:

```txt
apps/api/db/
  migrations/
  seeds/
```

Sem isso, o repositório perde rastreabilidade sobre mudanças estruturais que impactam diretamente os requisitos críticos da POC.

---

## Por que a estrutura deve refletir os padrões adotados

Os padrões definidos para a POC não são decorativos.

Eles indicam como a aplicação deve ser organizada internamente.

### Command

Como a intenção do usuário precisa virar proposta estruturada e revisável, o código deve favorecer representação formal de operações.

### Strategy

Como create, read, update e delete possuem regras diferentes, a estrutura deve permitir especialização por fluxo, e não um bloco único repleto de condicionais.

### Adapter

Como LLM, streaming, banco e auditoria são dependências externas ao domínio, a estrutura precisa isolar infraestrutura do núcleo de negócio.

### State Machine

Como a operação possui estados como intenção recebida, proposta estruturada, draft em revisão, aguardando confirmação, confirmada, executada, rejeitada e falha, a organização do código deve facilitar modelagem explícita do ciclo de vida.

### Pipeline

Como o fluxo é sequencial e controlado, a estrutura deve favorecer leitura por etapas: receber, interpretar, estruturar, validar, montar draft, apresentar, confirmar, executar e auditar.

Em termos de versionamento, isso significa que o repositório precisa ser organizado para revelar o fluxo real do sistema, em vez de escondê-lo atrás de diretórios genéricos e sem significado operacional.

---

## Por que a raiz precisa ter `.github/`, templates e automações

Como o projeto já está versionado e deve evoluir por incrementos, é importante que o repositório também versione seu próprio processo de qualidade.

A pasta `.github/` deve concentrar:

- workflows de CI;
- templates de issue;
- template de pull request;
- políticas de revisão e padronização de contribuição.

Isso é coerente com a própria natureza da POC, que exige governança explícita e previsibilidade.

A qualidade do fluxo de desenvolvimento deve seguir a mesma lógica do produto: mudanças controladas, revisáveis e rastreáveis.

---

## Estratégia de branches recomendada

Para esta POC, a estratégia recomendada é manter uma abordagem simples e disciplinada:

- `main` como branch protegida;
- branches curtas por objetivo;
- pull request obrigatório;
- squash merge;
- convenção de nomes vinculada à tarefa.

Padrão sugerido:

```txt
feat/<JIRA-KEY>-nome-curto
fix/<JIRA-KEY>-nome-curto
docs/<JIRA-KEY>-nome-curto
refactor/<JIRA-KEY>-nome-curto
test/<JIRA-KEY>-nome-curto
```

Essa estratégia é suficiente para a fase de POC e evita o peso operacional de modelos mais complexos, como Git Flow completo.

O objetivo aqui é maximizar clareza, rastreabilidade e cadência de entrega.

---

## Estratégia de commits recomendada

A convenção de commits deve facilitar leitura histórica do repositório.

Por isso, recomenda-se o uso de **Conventional Commits** com escopo, por exemplo:

```txt
feat(api): estruturar pipeline de proposta operacional
feat(web): renderizar resposta em streaming no chat
fix(api): bloquear execução sem confirmação explícita
docs(adr): registrar decisão de PostgreSQL
test(e2e): validar consistência entre draft aprovado e execução
refactor(domain): separar estratégias de create/read/update/delete
```

Essa convenção melhora revisão, geração de changelog, entendimento do histórico e governança do projeto.

---

## Estrutura sugerida em mais detalhe

```txt
copilot/
├─ apps/
│  ├─ api/
│  │  ├─ src/
│  │  │  ├─ modules/
│  │  │  │  ├─ conversation/
│  │  │  │  ├─ product/
│  │  │  │  ├─ draft/
│  │  │  │  ├─ execution/
│  │  │  │  ├─ audit/
│  │  │  │  └─ shared/
│  │  │  ├─ infra/
│  │  │  │  ├─ llm/
│  │  │  │  ├─ persistence/
│  │  │  │  │  └─ postgres/
│  │  │  │  ├─ streaming/
│  │  │  │  └─ observability/
│  │  │  ├─ config/
│  │  │  └─ main.ts
│  │  ├─ test/
│  │  │  ├─ unit/
│  │  │  ├─ integration/
│  │  │  └─ e2e/
│  │  ├─ db/
│  │  │  ├─ migrations/
│  │  │  └─ seeds/
│  │  └─ package.json
│  │
│  └─ web/
│     ├─ src/
│     │  ├─ app/
│     │  ├─ features/
│     │  │  ├─ chat/
│     │  │  ├─ draft-table/
│     │  │  ├─ product-read/
│     │  │  └─ product-write/
│     │  ├─ components/
│     │  ├─ hooks/
│     │  ├─ services/
│     │  └─ lib/
│     ├─ public/
│     └─ package.json
│
├─ packages/
│  ├─ contracts/
│  ├─ shared/
│  └─ config/
│
├─ docs/
│  ├─ product/
│  │  ├─ vision.md
│  │  ├─ epic-poc-copiloto-estoque.md
│  │  ├─ functional-requirements.md
│  │  ├─ non-functional-requirements.md
│  │  ├─ business-rules.md
│  │  ├─ acceptance-criteria.md
│  │  └─ traceability-matrix.md
│  ├─ architecture/
│  │  ├─ overview.md
│  │  ├─ context-diagram.md
│  │  ├─ container-diagram.md
│  │  ├─ sequence-create.md
│  │  ├─ sequence-read.md
│  │  ├─ sequence-update.md
│  │  └─ sequence-delete.md
│  ├─ adr/
│  │  ├─ ADR-001-hexagonal-modular.md
│  │  ├─ ADR-002-postgresql.md
│  │  ├─ ADR-003-patterns-command-strategy-adapter.md
│  │  ├─ ADR-004-soft-delete-only.md
│  │  └─ ADR-005-estrutura-versionamento.md
│  ├─ api/
│  │  ├─ endpoints.md
│  │  ├─ streaming-contract.md
│  │  └─ error-model.md
│  └─ data/
│     ├─ product-model.md
│     ├─ draft-model.md
│     ├─ audit-model.md
│     ├─ entity-relationship-model.md
│     └─ delete-policy.md
│
├─ .github/
│  ├─ workflows/
│  │  ├─ ci.yml
│  │  └─ release.yml
│  ├─ ISSUE_TEMPLATE/
│  └─ pull_request_template.md
│
├─ .gitignore
├─ .editorconfig
├─ .gitattributes
├─ .env.example
├─ eslint.config.mjs
├─ prettier.config.mjs
├─ package.json
├─ pnpm-workspace.yaml
├─ turbo.json
└─ README.md
```

---

## Benefícios esperados dessa estrutura

A adoção dessa estrutura traz ganhos objetivos para a POC:

- melhora a separação entre experiência conversacional e execução operacional;
- protege o domínio de detalhes de interface, banco e provider de IA;
- reduz risco de divergência entre frontend e backend;
- facilita versionamento de contratos críticos;
- fortalece rastreabilidade técnica e funcional;
- deixa decisões arquiteturais auditáveis no próprio Git;
- favorece evolução incremental sem ruptura do fluxo central;
- melhora testabilidade e clareza de ownership por área;
- prepara o projeto para crescer além da POC sem reestruturar tudo cedo demais.

---

## Conclusão

A estrutura de versionamento proposta não foi definida por preferência estética nem por replicar um template genérico de monorepo.

Ela foi derivada das exigências concretas da POC.

Como o projeto depende de fluxo controlado, confirmação explícita, consistência entre draft e execução, auditoria, soft delete, streaming e separação clara entre conversa e operação, o repositório precisa refletir essas fronteiras desde o início.

Por isso, a recomendação é adotar um monorepo modular com separação entre `apps`, `packages`, `docs` e automações de repositório, tratando documentação crítica e decisões técnicas como artefatos de primeira classe.

Em síntese, a estrutura recomendada existe para sustentar um produto que precisa ser conversacional na interface, rigoroso na operação e auditável em toda a sua evolução.


---

## Alinhamento com o documento de relacionamento de entidades

Com a definição do modelo de relacionamento de entidades, a estrutura de versionamento precisa deixar explícito onde ficam os artefatos de modelagem de dados e de persistência operacional.

A recomendação é que o repositório passe a tratar o modelo de entidades como documentação de primeira classe, e não como detalhe implícito do banco ou do código do ORM.

Por isso, além das pastas já sugeridas, a estrutura deve consolidar em `docs/data/` documentos como:

- `entity-relationship-model.md`;
- `product-model.md`;
- `draft-model.md`;
- `audit-model.md`;
- `delete-policy.md`.

Esse agrupamento ajuda porque a POC não possui apenas estrutura de produto. Ela depende de modelagem operacional para sessão, mensagens, draft, decisão, execução e auditoria.

---

## Por que a responsabilidade das camadas do Nest impacta o versionamento

A decisão de que a `controller` do Nest deve ser de transporte e que a `service` deve concentrar regra de negócio muda diretamente a organização do código versionado.

Essa fronteira precisa aparecer no repositório, e não só no discurso técnico.

Por isso, no backend, a árvore deve favorecer algo próximo de:

```txt
apps/api/src/
  modules/
    conversation/
    draft/
    product/
    execution/
    audit/
  infra/
    persistence/
    llm/
    streaming/
```

E dentro de cada módulo, a separação deve deixar claro o papel de cada camada:

```txt
product/
  controllers/
  services/
  domain/
  repositories/
  dto/
```

ou, se preferir um estilo mais enxuto:

```txt
product/
  product.controller.ts
  product.service.ts
  product.repository.ts
  product.domain.ts
```

O ponto principal é que o versionamento reflita a responsabilidade real do sistema:

- controller adaptando HTTP/SSE;
- service coordenando regra de negócio;
- repository/adapters encapsulando infraestrutura.

---

## Estrutura recomendada para documentação técnica consolidada

Com todos os documentos já produzidos, a organização mais coerente de `docs/` fica assim:

```txt
docs/
  product/
    vision.md
    epic-poc-copiloto-estoque.md
    functional-requirements.md
    non-functional-requirements.md
    business-rules.md
    acceptance-criteria.md
    traceability-matrix.md
  architecture/
    overview.md
    context-diagram.md
    container-diagram.md
    sequence-create.md
    sequence-read.md
    sequence-update.md
    sequence-delete.md
  data/
    entity-relationship-model.md
    product-model.md
    draft-model.md
    audit-model.md
    delete-policy.md
  adr/
    ADR-001-hexagonal-modular.md
    ADR-002-postgresql.md
    ADR-003-patterns-command-strategy-adapter.md
    ADR-004-soft-delete-only.md
    ADR-005-estrutura-versionamento.md
```

Essa estrutura evita dois problemas comuns:

- documentação de dados misturada com documentação de arquitetura;
- justificativas técnicas perdidas em arquivos soltos na raiz de `docs/`.

---

## Versionamento de migrations e do modelo físico

Como a POC já possui uma modelagem relacional mais explícita, o versionamento também deve contemplar a diferença entre:

- modelo conceitual;
- modelo lógico;
- modelo físico.

Na prática:

- `docs/data/` guarda o modelo conceitual e as justificativas;
- `apps/api/db/migrations/` guarda a evolução física do schema;
- `apps/api/db/seeds/` guarda dados mínimos de inicialização quando necessário.

Isso importa porque o projeto exige rastreabilidade. Se o modelo muda, a migração correspondente também precisa ficar rastreável no mesmo histórico do Git.

---

## Relação entre Jira, branch e artefatos versionados

Como o projeto já está sendo conduzido com EPIC e tarefas no Jira, o versionamento precisa sustentar vínculo entre demanda e entrega.

O fluxo recomendado continua sendo:

1. requisito ou decisão nasce no Jira;
2. branch é aberta com a chave da issue;
3. alteração de código, documentação e migração são feitas na mesma unidade de trabalho;
4. PR registra contexto e revisão;
5. merge preserva histórico de decisão.

Isso é especialmente importante quando uma mudança não é apenas de código, mas também de documentação técnica e modelagem de dados. Em muitos casos, uma única issue pode exigir alteração simultânea em:

- `docs/architecture/`;
- `docs/data/`;
- `apps/api/src/`;
- `apps/api/db/migrations/`;
- `packages/contracts/`.

O monorepo facilita justamente essa entrega coerente.

---

## Recomendações adicionais para a raiz do repositório

Para suportar a evolução da POC com mais governança, a raiz do projeto também deve conter:

- `.editorconfig` para padronização básica de formatação;
- `.gitattributes` para consistência entre ambientes;
- `.env.example` para onboarding;
- `pnpm-workspace.yaml` para o workspace;
- `README.md` com visão geral e links para docs;
- scripts de qualidade e build no `package.json` raiz.

Além disso, o `README.md` deve deixar claro:

- o objetivo da POC;
- a estrutura do repositório;
- onde estão as decisões arquiteturais;
- onde está o modelo de entidades;
- como subir `api` e `web`;
- como executar testes e lint.

Nessa mesma camada de governança da raiz, `eslint.config.mjs` e `prettier.config.mjs` devem ser tratados como artefatos versionados de primeira classe, porque eles formalizam a convenção de qualidade do monorepo e evitam que a padronização fique dependente apenas de configuração local de editor.

---

## Conclusão complementar

A estrutura de versionamento proposta continua válida e fica mais forte depois da formalização do modelo de entidades e da definição explícita de responsabilidades do Nest.

Ela não organiza apenas arquivos. Ela organiza a evolução rastreável de um sistema em que arquitetura, modelagem, contratos, migrations, interface conversacional e regra de negócio precisam caminhar juntos.

Em síntese, a estrutura do repositório deve espelhar o produto real: conversacional na experiência, relacional na persistência, modular na arquitetura e rigoroso na governança.


---

## Nome final e caminho recomendado deste documento

Como este artefato deixou de ser apenas uma justificativa solta e passou a compor formalmente o conjunto de ADRs do projeto, o nome e o caminho recomendados ficam assim:

```txt
copilot/docs/adr/ADR-005-estrutura-versionamento.md
```

Esse ajuste é importante porque o próprio repositório deve refletir, na prática, a decisão de tratar documentação arquitetural como artefato versionado, rastreável e revisável.
