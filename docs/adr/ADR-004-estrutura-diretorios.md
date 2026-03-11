# ADR-004 — Estrutura de Diretórios da POC do Copiloto Conversacional de Estoque

## Objetivo

Este ADR define a estrutura de diretórios recomendada para o repositório da POC do copiloto conversacional de estoque.

O foco deste documento é transformar a organização do repositório em uma consequência explícita das decisões já tomadas sobre:

- arquitetura hexagonal/modular;
- uso de Nest no backend e Next no frontend;
- MongoDB como banco principal, com Mongoose na camada de infraestrutura;
- soft delete obrigatório;
- streaming e renderização progressiva;
- confirmação explícita antes de qualquer operação CRUD;
- modelo de relacionamento de entidades já consolidado.

Este ADR substitui a versão anterior da justificativa de estrutura, corrigindo dois problemas:

1. o arquivo anterior estava numerado internamente como `ADR-005`, embora tivesse sido enviado como `ADR-004`;
2. a árvore de diretórios ainda não refletia, de forma explícita, todas as entidades definidas no ADR de relacionamento.

---

## Contexto

Com a consolidação do relacionamento de entidades, a POC passou a ter um núcleo estrutural mais claro.

O fluxo do produto não gira apenas em torno de `product`.

Ele depende de nove entidades centrais:

1. `actor`
2. `conversation_session`
3. `conversation_message`
4. `operation_draft`
5. `operation_draft_item`
6. `draft_decision`
7. `operation_execution`
8. `audit_event`
9. `product`

Essas entidades existem para materializar o princípio já adotado pelo projeto:

> **IA interpreta e propõe; domínio valida; usuário confirma; sistema executa.**

Como consequência, a estrutura de diretórios não pode continuar genérica demais.

Ela precisa evidenciar, no próprio repositório, onde vivem:

- as entidades centrais do fluxo;
- os módulos de aplicação que operam sobre essas entidades;
- os contratos compartilhados entre backend e frontend;
- os artefatos físicos de persistência, conexão e seed;
- a documentação por entidade e por relacionamento;
- os pontos de integração com streaming, LLM, auditoria e transporte.

---

## Decisão principal

A estrutura de diretórios da POC deve continuar em um **monorepo simples e modular**, porém agora com uma organização **orientada pelas entidades centrais e pelos fluxos do domínio**.

A árvore do repositório precisa deixar explícito que a aplicação possui:

- duas apps principais: `api` e `web`;
- contratos compartilhados versionados;
- documentação técnica e de dados versionada;
- persistência documental rastreável;
- módulos backend que contemplem todas as entidades do ADR de relacionamento.

A estrutura recomendada passa a ser a seguinte:

```txt
copilot/
├─ apps/
│  ├─ api/
│  │  ├─ src/
│  │  │  ├─ modules/
│  │  │  │  ├─ actor/
│  │  │  │  ├─ conversation-session/
│  │  │  │  ├─ conversation-message/
│  │  │  │  ├─ operation-draft/
│  │  │  │  ├─ operation-draft-item/
│  │  │  │  ├─ draft-decision/
│  │  │  │  ├─ operation-execution/
│  │  │  │  ├─ audit-event/
│  │  │  │  └─ product/
│  │  │  ├─ mongodb/
│  │  │  │  ├─ mongodb.environment.ts
│  │  │  │  ├─ mongodb.errors.ts
│  │  │  │  ├─ mongodb.module.ts
│  │  │  │  ├─ mongodb.runtime.ts
│  │  │  │  ├─ mongoose.schemas.ts
│  │  │  │  └─ seed.ts
│  │  │  ├─ infra/
│  │  │  │  ├─ llm/
│  │  │  │  ├─ streaming/
│  │  │  │  ├─ transport/
│  │  │  │  └─ observability/
│  │  │  ├─ config/
│  │  │  ├─ app.module.ts
│  │  │  └─ main.ts
│  │  ├─ test/
│  │  │  ├─ unit/
│  │  │  ├─ integration/
│  │  │  └─ e2e/
│  │  └─ package.json
│  ├─ packages/
│  │  ├─ contracts/
│  │  └─ shared/
│  └─ web/
│     ├─ src/
│     │  ├─ app/
│     │  ├─ features/
│     │  │  ├─ chat/
│     │  │  ├─ session/
│     │  │  ├─ messages/
│     │  │  ├─ draft-table/
│     │  │  ├─ decision-controls/
│     │  │  ├─ execution-history/
│     │  │  ├─ audit-timeline/
│     │  │  └─ product/
│     │  ├─ components/
│     │  ├─ hooks/
│     │  ├─ services/
│     │  └─ lib/
│     ├─ public/
│     └─ package.json
├─ docs/
│  ├─ product/
│  ├─ architecture/
│  ├─ adr/
│  ├─ api/
│  ├─ data/
│  │  ├─ actor-model.md
│  │  ├─ conversation-session-model.md
│  │  ├─ conversation-message-model.md
│  │  ├─ operation-draft-model.md
│  │  ├─ operation-draft-item-model.md
│  │  ├─ draft-decision-model.md
│  │  ├─ operation-execution-model.md
│  │  ├─ audit-event-model.md
│  │  ├─ product-model.md
│  │  └─ delete-policy.md
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

## Por que a árvore precisa contemplar explicitamente todas as entidades

O ADR de relacionamento tornou inequívoco que a POC não é apenas um CRUD de produtos com chat por cima.

Ela é um fluxo operacional completo que envolve autoria, sessão, mensagens, proposta estruturada, itens de proposta, decisão explícita, execução e auditoria.

Se a estrutura de diretórios destacasse apenas `conversation`, `product`, `draft` e `audit` de forma ampla, ainda existiria risco de esconder entidades relevantes dentro de módulos genéricos demais.

Por isso, este ADR recomenda explicitar no backend diretórios próprios para:

- `actor`;
- `conversation-session`;
- `conversation-message`;
- `operation-draft`;
- `operation-draft-item`;
- `draft-decision`;
- `operation-execution`;
- `audit-event`;
- `product`.

Essa escolha melhora:

- rastreabilidade da modelagem no código;
- clareza de ownership por entidade;
- legibilidade da persistência;
- facilidade para evoluir schemas, seed e testes por contexto;
- alinhamento entre documentação e implementação.

---

## Organização recomendada dos módulos da API

Cada entidade central deve ter um módulo backend próprio ou, no mínimo, um espaço explícito dentro de `modules/`.

A estrutura interna de cada módulo pode seguir a separação por responsabilidade do Nest, deixando claro que:

- `controller` adapta transporte;
- `service` coordena caso de uso e regra de negócio;
- `domain` preserva invariantes;
- `repository` e adapters encapsulam persistência.

Exemplo recomendado:

```txt
apps/api/src/modules/product/
├─ controllers/
├─ services/
├─ domain/
├─ repositories/
├─ dto/
├─ mappers/
└─ product.module.ts
```

O mesmo raciocínio vale para os demais módulos:

```txt
apps/api/src/modules/operation-draft/
apps/api/src/modules/operation-draft-item/
apps/api/src/modules/draft-decision/
apps/api/src/modules/operation-execution/
apps/api/src/modules/audit-event/
apps/api/src/modules/conversation-session/
apps/api/src/modules/conversation-message/
apps/api/src/modules/actor/
```

Quando houver pouco volume de código, a estrutura também pode ser mais enxuta:

```txt
product/
  product.controller.ts
  product.service.ts
  product.repository.ts
  product.entity.ts
  product.mapper.ts
```

O ponto decisivo não é o nível de granularidade interna, e sim o fato de que a entidade exista de forma explícita na árvore do projeto.

---

## Entidade por entidade: como a estrutura deve refletir o ADR de relacionamento

### `actor`

Deve possuir diretório próprio porque autoria e responsabilização são parte da rastreabilidade exigida.

Sugestão:

```txt
apps/api/src/modules/actor/
apps/packages/contracts/actor/
docs/data/actor-model.md
```

### `conversation_session`

Deve existir de forma explícita porque a sessão é o eixo de contexto da conversa e o vínculo entre mensagens, drafts, decisões e auditoria.

Sugestão:

```txt
apps/api/src/modules/conversation-session/
apps/packages/contracts/conversation/session/
docs/data/conversation-session-model.md
```

### `conversation_message`

Deve ter diretório explícito porque a POC precisa persistir e reconstruir a conversa, inclusive no fluxo de streaming e rastreabilidade.

Sugestão:

```txt
apps/api/src/modules/conversation-message/
apps/packages/contracts/conversation/message/
docs/data/conversation-message-model.md
```

### `operation_draft`

É a entidade central do fluxo operacional e, por isso, deve ter um módulo próprio fortemente destacado.

Sugestão:

```txt
apps/api/src/modules/operation-draft/
apps/packages/contracts/draft/
docs/data/operation-draft-model.md
```

### `operation_draft_item`

Mesmo sendo subordinada ao draft, deve aparecer explicitamente na estrutura porque a POC exige tabela interativa, granularidade por item e validação fina.

Sugestão:

```txt
apps/api/src/modules/operation-draft-item/
apps/packages/contracts/draft/items/
docs/data/operation-draft-item-model.md
```

### `draft_decision`

Precisa de módulo próprio porque a confirmação explícita não pode ser apenas um estado implícito do draft. Ela é um registro formal do domínio.

Sugestão:

```txt
apps/api/src/modules/draft-decision/
apps/packages/contracts/draft/decision/
docs/data/draft-decision-model.md
```

### `operation_execution`

Deve ficar explícita porque proposta aprovada e execução realizada não são a mesma coisa.

Sugestão:

```txt
apps/api/src/modules/operation-execution/
apps/packages/contracts/execution/
docs/data/operation-execution-model.md
```

### `audit_event`

Precisa de diretório próprio porque auditoria é requisito estrutural e transversal da POC, não apenas logging periférico.

Sugestão:

```txt
apps/api/src/modules/audit-event/
apps/packages/contracts/audit/
docs/data/audit-event-model.md
```

### `product`

Continua sendo a entidade de negócio central do escopo atual e, portanto, deve manter módulo próprio, contratos próprios e documentação própria.

Sugestão:

```txt
apps/api/src/modules/product/
apps/packages/contracts/product/
docs/data/product-model.md
```

---

## Por que `apps/packages/contracts` deve espelhar os mesmos núcleos

Como a interface e a API precisam concordar sobre drafts, itens, decisões, mensagens, streaming e auditoria, `apps/packages/contracts` deve refletir os mesmos núcleos semânticos do backend.

Não é necessário copiar exatamente a mesma árvore de `modules/`, mas os contratos compartilhados precisam cobrir pelo menos:

- ator;
- conversa;
- draft;
- item de draft;
- decisão;
- execução;
- auditoria;
- produto;
- streaming.

Isso reduz o risco de:

- payload divergente entre web e api;
- estado de draft interpretado de forma diferente na UI e no backend;
- inconsistência entre o que foi aprovado e o que foi executado.

---

## Por que a documentação em `docs/data` deve crescer por entidade

Depois do ADR de relacionamento, `docs/data/` não deve conter apenas um arquivo genérico de modelo de dados.

A documentação precisa permitir leitura incremental e rastreável por entidade.

Por isso, este ADR recomenda:

```txt
docs/data/
├─ actor-model.md
├─ conversation-session-model.md
├─ conversation-message-model.md
├─ operation-draft-model.md
├─ operation-draft-item-model.md
├─ draft-decision-model.md
├─ operation-execution-model.md
├─ audit-event-model.md
├─ product-model.md
├─ ADR-005-relacionamento-entidades.md
└─ delete-policy.md
```

Essa divisão ajuda porque:

- evita superdocumentos difíceis de manter;
- separa visão por entidade da visão global de relacionamento;
- aproxima documentação do desenho efetivo do banco e do domínio;
- melhora onboarding e revisão arquitetural.

O artefato global de relacionamento deve seguir a convenção já consolidada pelos ADRs do projeto.

Por isso, o nome recomendado para esse documento é:

```txt
docs/data/ADR-005-relacionamento-entidades.md
```

Se a equipe optar futuramente por renumeração sequencial estrita dos ADRs, esse nome deve ser atualizado de forma consistente em todos os documentos correlatos, sem voltar para um nome genérico como `entity-relationship-model.md`.

---

## Estrutura física de persistência recomendada

Como o banco principal passa a ser MongoDB e a integração da API é feita por Mongoose, a estrutura do backend deve deixar evidente onde ficam os artefatos de conexão, environment, erro, runtime, schemas e seed.

Por isso, a API deve conter:

```txt
apps/api/
├─ src/
│  ├─ mongodb/
│  │  ├─ mongodb.environment.ts
│  │  ├─ mongodb.errors.ts
│  │  ├─ mongodb.module.ts
│  │  ├─ mongodb.runtime.ts
│  │  ├─ mongoose.schemas.ts
│  │  └─ seed.ts
```

A configuração de ambiente, os erros específicos da conexão, a seleção de runtime, os schemas Mongoose e o seed ficam agrupados em `apps/api/src/mongodb/`, junto da infraestrutura de persistência usada pela API.

Esse agrupamento ajuda a separar claramente:

- leitura e validação de variáveis de ambiente;
- construção de erros específicos da conexão;
- escolha do modo de execução do banco;
- definição dos schemas/documentos;
- inicialização de dados de desenvolvimento.

Esse desenho ajuda a sustentar, de forma limpa, a diferença entre:

- modelo conceitual documentado;
- modelo de domínio;
- modelo físico do banco documental.

---

## Estrutura recomendada para o frontend

Embora o ADR de relacionamento seja mais centrado em dados e backend, o frontend também precisa refletir esse modelo.

A interface não consome apenas `product`.

Ela precisa lidar com:

- sessão conversacional;
- mensagens em streaming;
- tabela de draft;
- botões e ações de decisão;
- histórico de execução;
- trilha de auditoria visual quando aplicável.

Por isso, a árvore recomendada para `apps/web/src/features/` é:

```txt
apps/web/src/features/
├─ chat/
├─ session/
├─ messages/
├─ draft-table/
├─ decision-controls/
├─ execution-history/
├─ audit-timeline/
└─ product/
```

Essa estrutura preserva alinhamento entre a experiência conversacional e os objetos do domínio sem transformar a UI em uma massa única de componentes genéricos.

---

## Benefícios esperados

A reformulação da estrutura de diretórios com base no ADR de relacionamento traz ganhos objetivos:

- a árvore do repositório passa a refletir o fluxo real do produto;
- todas as entidades centrais ficam visíveis no código, nos contratos e na documentação;
- diminui o risco de esconder regra de negócio em módulos genéricos demais;
- melhora rastreabilidade entre entidade, migration, contrato, teste e documentação;
- facilita evolução incremental do backend Nest com separação clara de responsabilidades;
- prepara o frontend para lidar com draft, decisão e streaming de forma coerente;
- fortalece a governança do monorepo sem perder simplicidade.

---

## Conclusão

A estrutura de diretórios da POC não deve ser organizada apenas por conveniência técnica nem por um template genérico de monorepo.

Ela precisa ser consequência direta da modelagem do sistema.

Como o ADR de relacionamento consolidou nove entidades centrais — `actor`, `conversation_session`, `conversation_message`, `operation_draft`, `operation_draft_item`, `draft_decision`, `operation_execution`, `audit_event` e `product` — a árvore do repositório deve passar a contemplá-las explicitamente.

Em síntese, a decisão deste ADR é que a estrutura do projeto seja:

- modular no monorepo;
- explícita por entidade no backend;
- coerente por feature no frontend;
- rastreável em contratos compartilhados;
- documentada por entidade e por relacionamento;
- preparada para persistência documental auditável.

---

## Nome final e caminho recomendado

O nome e o caminho recomendados para este documento passam a ser:

```txt
copilot/docs/adr/ADR-004-estrutura-diretorios.md
```

Esse nome é mais coerente com o conteúdo atual do documento, que trata prioritariamente da organização estrutural do repositório e da distribuição dos diretórios à luz das entidades do domínio.
