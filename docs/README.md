# Decisões Técnicas — POC de Copiloto Conversacional de Estoque

## Objetivo

Este documento registra as principais decisões técnicas da POC de copiloto conversacional de estoque, com foco em:

- entendimento de intenções em linguagem natural;
- respostas em linguagem natural;
- streaming e renderização progressiva na interface;
- operações seguras de create, read, update e delete;
- confirmação explícita antes de qualquer execução;
- rastreabilidade completa das ações;
- preservação de histórico por meio de soft delete.

O objetivo deste README é explicar não apenas **o que foi escolhido**, mas principalmente **por que foi escolhido**.

---

## Visão geral da arquitetura

A POC foi desenhada com **arquitetura hexagonal/modular**, separando claramente responsabilidades de interface, orquestração por IA, domínio e infraestrutura.

A estratégia arquitetural adotada é:

- **LLM como orquestrador controlado**, e não como executor direto da regra de negócio;
- **backend em Nest** com abordagem **OO pragmática**, modular e orientada a casos de uso;
- **frontend em Next** com abordagem **component-based/declarativa**, responsável pela experiência conversacional, streaming e renderização progressiva;
- **funções puras** nas transformações, normalizações, parsing, diffs e validações auxiliares;
- **event-driven apenas como suporte** para auditoria, integração e processamento complementar, e não como núcleo da execução transacional.

Além disso, a POC adota como base de desenho os seguintes padrões:

- **Command** para representar propostas estruturadas de operação;
- **Strategy** para selecionar fluxos conforme a intenção identificada;
- **Adapter** para isolar banco, provider de LLM, streaming e demais integrações;
- **State Machine** para controlar o ciclo de vida da interação e do draft;
- **Pipeline** para organizar as etapas da interpretação até a execução.

Dentro dessa arquitetura, a POC separa claramente duas responsabilidades:

1. **Experiência conversacional**
   - interpretação da intenção do usuário;
   - geração de resposta em linguagem natural;
   - entrega em streaming;
   - renderização progressiva na interface;
   - montagem de draft interativo para revisão.

2. **Execução transacional e auditável**
   - validação da proposta estruturada;
   - comparação entre estado atual e estado proposto;
   - confirmação explícita do usuário;
   - execução da operação aprovada;
   - gravação de auditoria e histórico.

Essa separação existe porque a camada conversacional e a camada transacional possuem requisitos diferentes. A primeira busca fluidez e boa experiência de uso. A segunda exige segurança, integridade e previsibilidade.

A regra central da POC é:

> **IA interpreta e propõe; domínio valida; usuário confirma; sistema executa.**

Essa regra é o principal critério de alinhamento para as decisões de modelagem, persistência e banco de dados descritas neste documento.

---

## Decisão principal de banco de dados

### Banco escolhido

O banco principal da POC é **PostgreSQL**.

### Motivação central

A decisão foi guiada pelo fato de que o núcleo do problema não é apenas armazenar mensagens ou payloads flexíveis, mas sim sustentar corretamente a estratégia arquitetural definida para a aplicação.

Como o sistema foi desenhado para que a **IA apenas interprete e proponha**, enquanto o **domínio valida**, o **usuário confirma** e o **sistema executa**, a persistência precisa garantir que:

- nenhuma operação seja executada implicitamente;
- toda intenção do usuário seja transformada em um draft estruturado;
- o usuário consiga revisar e editar esse draft;
- o domínio consiga validar o draft contra o estado atual do sistema;
- o sistema execute exatamente o que foi aprovado;
- o histórico seja preservado;
- deleções sejam sempre soft delete.

Esse tipo de requisito é mais sensível a **integridade transacional**, **controle de concorrência**, **consistência** e **rastreabilidade** do que à flexibilidade de schema por si só.

Por esse motivo, o PostgreSQL foi definido como banco principal da POC.

Em outras palavras: o banco foi escolhido para sustentar com segurança a estratégia **draft → revisão → confirmação → execução**, e não apenas para armazenar dados da conversa.

---

## Leitura da decisão pela lente do PACELC

A escolha foi analisada com base no teorema **PACELC**.

Em termos simples:

- em caso de partição de rede, um sistema distribui o trade-off entre **Consistência (C)** e **Disponibilidade (A)**;
- fora de partições, ainda existe o trade-off entre **Latência (L)** e **Consistência (C)**.

Para esta POC, o caminho crítico não é a menor latência possível em qualquer situação. O caminho crítico é a **segurança da operação confirmada** dentro do fluxo arquitetural adotado.

Como o sistema só pode executar após interpretação, estruturação, validação e confirmação explícita, o momento mais sensível não é a geração da resposta conversacional, mas sim o ponto em que o usuário aprova a proposta e o domínio precisa transformar essa aprovação em efeito real no sistema.

Por isso, no núcleo transacional do sistema, a decisão foi:

- **preferir consistência em vez de disponibilidade irrestrita durante partições**;
- **preferir consistência em vez de latência mínima no momento de confirmação e execução**.

Isso significa que, no ponto em que o usuário clica em confirmar, o sistema deve priorizar a integridade do dado e a coerência da operação acima da redução máxima de latência.

---

## Por que PostgreSQL encaixa bem nesta POC

### 1. Forte aderência ao problema transacional

A POC precisa garantir que múltiplos passos relacionados pertençam à mesma unidade lógica de operação:

- registrar a confirmação do draft;
- validar estado atual;
- aplicar a mudança;
- registrar execução;
- registrar auditoria.

Esses passos precisam acontecer de forma coerente. O PostgreSQL oferece um modelo transacional sólido para esse tipo de fluxo.

Isso está diretamente alinhado à arquitetura da POC, na qual o LLM não executa ações de negócio e a execução real depende de uma transição controlada do estado proposto para o estado efetivado.

### 2. Bom suporte a concorrência

Em um cenário real, dois usuários ou duas interações podem tentar atuar sobre o mesmo produto quase ao mesmo tempo. A solução precisa impedir que o estado final fique inconsistente ou que uma alteração seja aplicada sobre uma base já desatualizada.

O PostgreSQL oferece recursos adequados para isso, como:

- transações ACID;
- MVCC;
- locking explícito quando necessário;
- controle otimista via versionamento.

Isso também conversa com o uso de **State Machine** e com a regra de que a confirmação só pode valer sobre um estado ainda válido.

### 3. Modelagem relacional para o núcleo e flexibilidade para o resto

A POC possui partes com estruturas mais rígidas e partes naturalmente flexíveis.

Exemplos de estrutura rígida:

- produto;
- posição de estoque;
- execução;
- auditoria.

Exemplos de estrutura flexível:

- payload de intenção interpretada;
- filtros e query de leitura;
- before/proposed/diff de drafts;
- metadados conversacionais.

O PostgreSQL permite combinar esses dois mundos de forma equilibrada usando:

- tabelas relacionais para o núcleo transacional;
- `JSONB` para partes variáveis e semiestruturadas.

Esse desenho é compatível com a arquitetura hexagonal/modular: o núcleo relacional preserva integridade do domínio, enquanto partes variáveis continuam possíveis sem deslocar a fonte de verdade do sistema.

### 4. Melhor aderência a soft delete e rastreabilidade

Como a regra do sistema é **nunca realizar delete físico**, o banco precisa favorecer uma estratégia baseada em:

- `deleted_at`;
- `deleted_by`;
- `status`;
- auditoria de eventos;
- preservação de histórico.

Esse desenho funciona muito bem em um banco relacional com constraints, índices e regras claras de integridade.

Além disso, como event-driven foi adotado apenas como apoio para auditoria e integração, e não como mecanismo principal de consistência operacional, faz sentido que o **source of truth** continue sendo um núcleo transacional forte.

---

## Por que o streaming não definiu o banco principal

Embora o streaming seja um requisito importante de experiência, ele **não é o principal critério de escolha do banco transacional**.

O streaming pertence majoritariamente à camada de aplicação e interface.

Na prática:

- o copiloto gera a resposta progressivamente;
- a interface renderiza o texto em tempo real;
- o usuário acompanha a construção da resposta;
- a persistência final da interação acontece de forma controlada.

Ou seja, o banco principal não foi escolhido por “fazer streaming”, e sim por garantir segurança no momento da **confirmação e execução**.

Isso reforça a separação arquitetural entre:

- **experiência conversacional fluida** no Next;
- **execução controlada e auditável** no Nest e no domínio.

---

## Por que não usar MongoDB como banco principal nesta POC

MongoDB é uma alternativa viável para cenários documentais e payloads flexíveis. Ele seria especialmente confortável para armazenar:

- mensagens da conversa;
- drafts conversacionais;
- estruturas sem schema rígido.

No entanto, nesta POC, o núcleo mais importante não é apenas o documento em si, mas a coerência entre diferentes entidades relacionadas, como:

- produto;
- draft;
- linhas do draft;
- execução;
- auditoria.

Quando esse tipo de consistência entre múltiplas entidades passa a ser central, a modelagem começa a exigir mecanismos transacionais mais explícitos. Nesse contexto, o PostgreSQL tende a oferecer uma aderência mais natural para o problema.

Em resumo: MongoDB continua sendo tecnicamente possível, mas não foi escolhido como **source of truth** desta POC, porque a estratégia da aplicação prioriza consistência operacional no momento em que o domínio valida e executa a operação confirmada.

---

## Por que não usar DynamoDB como banco principal nesta POC

DynamoDB é forte em escala e performance previsível, especialmente em cenários orientados a chave de acesso e alta distribuição.

Porém, nesta POC, há exigências que tornam o problema menos aderente a esse modelo como primeira escolha:

- comparação entre estado atual e estado proposto;
- validação transacional de confirmação;
- rastreabilidade detalhada;
- necessidade de representar drafts interativos e consultas estruturadas;
- potencial necessidade de múltiplas visões coerentes sobre o mesmo dado.

Para a fase atual da POC, isso aumenta a complexidade da modelagem e das projeções. Por essa razão, DynamoDB não foi escolhido como banco principal.

A estratégia desta POC não prioriza escala distribuída extrema como requisito dominante. Ela prioriza segurança operacional, confirmação explícita e consistência no núcleo transacional.

---

## Estratégia de modelagem de dados

A modelagem foi dividida entre **estado operacional atual**, **estado proposto**, **execução** e **histórico**.

Essa separação está alinhada à estratégia arquitetural da POC:

- a **IA interpreta** a mensagem do usuário e ajuda a estruturar uma proposta;
- o **domínio valida** a proposta contra regras e estado atual;
- o **usuário confirma** ou rejeita;
- o **sistema executa** a operação aprovada e registra seus efeitos.

### Entidades principais

#### `products`
Representa o estado atual do produto.

Responsabilidades principais:
- identidade do produto;
- atributos de negócio;
- status atual;
- metadados de criação, atualização e soft delete;
- versionamento para controle de concorrência.

#### `stock_positions`
Representa a posição atual de estoque por produto.

Responsabilidades principais:
- quantidade disponível;
- quantidade reservada;
- saldo operacional;
- atualização coerente com as operações aprovadas.

#### `conversations`
Representa a conversa como unidade de contexto.

#### `conversation_messages`
Armazena as mensagens trocadas ao longo da conversa.

#### `operation_drafts`
É a entidade central da proposta estruturada.

Responsabilidades principais:
- registrar a intenção interpretada;
- manter status do draft;
- guardar payload estruturado da operação;
- servir como ponte entre conversa e execução.

Essa entidade materializa o uso de **Command** dentro do fluxo da aplicação: a intenção em linguagem natural deixa de ser texto solto e passa a existir como proposta formal, revisável e rastreável.

#### `operation_draft_rows`
Representa as linhas da tabela interativa apresentada ao usuário.

Responsabilidades principais:
- manter dados revisáveis na mesma interação;
- guardar estado atual, estado proposto e diferenças;
- apontar pendências por item;
- permitir edição sem recriar a tabela.

#### `operation_executions`
Representa a execução efetiva do draft confirmado.

Responsabilidades principais:
- registrar início e fim da execução;
- preservar o payload executado;
- guardar resultado e status final.

Essa entidade marca a transição entre proposta e efeito real no sistema, reforçando a separação entre orquestração por IA e execução de negócio.

#### `audit_events`
Garante rastreabilidade completa.

Responsabilidades principais:
- registrar eventos relevantes do ciclo de vida;
- preservar contexto da operação;
- permitir reconstrução histórica.

---

## Decisão sobre soft delete

Toda deleção do domínio deve ser exclusivamente **soft delete**.

Isso significa que:

- o registro não é removido fisicamente do banco;
- o sistema marca o item como deletado;
- o histórico permanece disponível;
- a rastreabilidade não é perdida.

Essa decisão foi tomada porque o domínio da POC exige segurança operacional e histórico de mudanças.

Na prática, a deleção deve atualizar campos como:

- `deleted_at`;
- `deleted_by`;
- `status`.

Além disso, a ação deve gerar um evento de auditoria correspondente.

Essa escolha também preserva a coerência com a estratégia arquitetural: como a IA não executa diretamente e toda operação precisa ser verificável depois, o sistema não pode perder evidência histórica daquilo que foi proposto, confirmado e aplicado.

---

## Decisão sobre o draft interativo

O draft interativo é uma entidade de negócio da POC, e não apenas um detalhe de UI.

Isso significa que ele foi tratado como parte formal da arquitetura.

### Motivos

- a POC exige que a operação seja estruturada antes da execução;
- a proposta precisa ser editável;
- a mesma tabela deve continuar existindo durante a revisão;
- a execução precisa refletir exatamente o draft aprovado.

Por isso, o draft e suas linhas são persistidos explicitamente.

Essa abordagem também favorece:

- recuperação de contexto;
- auditoria;
- comparação entre proposta e execução;
- reprodutibilidade da operação.

Em termos arquiteturais, o draft é o artefato que materializa a regra central da POC: a IA pode ajudar a interpretar e propor, mas a operação só ganha efeito depois de validada, revisada e confirmada.

---

## Decisão sobre controle de concorrência

Como a POC lida com revisão de estado e confirmação explícita, existe risco de concorrência entre:

- duas sessões alterando o mesmo produto;
- o estado atual mudar enquanto o usuário revisa o draft;
- múltiplas confirmações do mesmo draft.

Para reduzir esse risco, a estratégia definida inclui:

- versionamento do agregado principal;
- validação de versão no momento da confirmação;
- transação para confirmação + aplicação + auditoria;
- chave única ou idempotência por execução baseada no draft confirmado.

Assim, o sistema evita que o usuário aprove uma proposta baseada em um estado que já não é mais válido.

Isso mantém coerência com a combinação de **State Machine**, **Pipeline** e persistência transacional: cada etapa importante da operação precisa avançar de forma controlada, sem permitir efeitos duplicados ou aprovações sobre estado vencido.

---

## Decisão sobre auditoria

A auditoria foi considerada requisito estrutural, não opcional.

Cada operação relevante deve deixar rastros suficientes para responder perguntas como:

- quem pediu a operação;
- qual foi a intenção original;
- qual draft foi gerado;
- o que o usuário alterou na revisão;
- o que foi efetivamente confirmado;
- o que foi executado;
- qual foi o resultado.

Essa decisão existe porque a proposta da POC exige segurança operacional, confiança do usuário e histórico verificável.

A auditoria também é o principal ponto em que o estilo **event-driven** aparece nesta POC: não como substituto da consistência transacional do domínio, mas como apoio para rastreabilidade, integração e evolução futura.

---

## Decisão sobre uso de JSONB

O uso de `JSONB` foi adotado de forma intencional e limitada.

### Onde JSONB é adequado nesta POC

- payload estruturado da intenção interpretada;
- filtros de leitura;
- parâmetros livres da consulta;
- before/proposed/diff de linhas do draft;
- conteúdo de mensagens;
- payloads de auditoria.

### Onde JSONB não substitui modelagem relacional

- identidade do produto;
- integridade do estado atual;
- posição de estoque;
- execução formal da operação;
- vínculos essenciais entre entidades.

A decisão, portanto, não foi “usar JSON para tudo”, mas sim combinar:

- **relacional no núcleo**;
- **JSONB nas partes variáveis**.

Essa combinação é coerente com a arquitetura definida: flexibilidade onde a conversa e a interpretação exigem variabilidade, e estrutura forte onde a validação de domínio e a execução exigem consistência.

---

## Fluxo operacional adotado

O fluxo padrão da POC segue esta sequência:

1. usuário expressa uma intenção em linguagem natural;
2. o copiloto interpreta a intenção;
3. o sistema estrutura uma proposta formal de operação;
4. o sistema valida os dados disponíveis;
5. o sistema apresenta um draft interativo em tabela;
6. o usuário revisa, edita, confirma ou rejeita;
7. apenas após confirmação explícita a operação é executada;
8. o sistema grava auditoria, histórico e resultado.

Esse fluxo existe para impedir que uma instrução ambígua ou incompleta seja tratada como autorização imediata de execução.

Em termos de arquitetura, esse fluxo também pode ser lido como um **Pipeline controlado por estado**, no qual cada transição relevante precisa ser validada antes da próxima.

---

## Limites intencionais desta POC

Algumas escolhas foram feitas para simplificar a primeira versão sem comprometer a segurança do núcleo.

### Decisões intencionais de escopo

- o banco principal é centralizado em um núcleo transacional consistente;
- streaming é responsabilidade da camada de aplicação;
- deletes físicos não fazem parte do escopo;
- o draft persiste durante a mesma interação, em vez de ser recriado a cada ajuste;
- o foco está em confiabilidade operacional, não em escala distribuída extrema.

Esses limites são compatíveis com a estratégia arquitetural adotada: primeiro garantir um fluxo confiável e auditável de interpretação, validação, confirmação e execução; depois evoluir o sistema em direção a mecanismos adicionais de integração, leitura especializada ou processamento assíncrono.

---

## Evoluções futuras possíveis

Com a POC validada, a arquitetura pode evoluir para incluir:

- projeções de leitura especializadas;
- mecanismos de busca mais avançados;
- replicação para relatórios e analytics;
- outbox/eventos para integrações assíncronas;
- fila para processamento complementar não crítico;
- trilhas de observabilidade mais detalhadas.

Essas evoluções devem ser adicionadas sem comprometer o princípio central desta POC: **nenhuma operação executa sem draft estruturado, revisão e confirmação explícita**.

Também devem respeitar a regra de base da arquitetura: o **LLM continua como orquestrador controlado**, enquanto a fonte de verdade operacional permanece no domínio e no núcleo transacional.

---

## Resumo executivo

As decisões técnicas desta POC foram orientadas por um princípio central: **segurança operacional com experiência conversacional fluida**.

Por isso:

- a arquitetura foi definida como **hexagonal/modular**;
- o **LLM atua como orquestrador controlado**, e não como executor direto;
- o Nest organiza o backend em abordagem **OO pragmática** e orientada a casos de uso;
- o Next entrega a experiência **component-based/declarativa** com streaming e renderização progressiva;
- a experiência de chat foi separada da execução transacional;
- o streaming foi tratado na aplicação e na interface;
- o PostgreSQL foi escolhido como banco principal;
- o modelo usa relacional para o núcleo e `JSONB` para partes variáveis;
- o draft interativo foi tratado como entidade formal do domínio;
- deleções são exclusivamente soft delete;
- auditoria e histórico são obrigatórios;
- a confirmação explícita é a única porta de entrada para execução.

Em síntese, a POC foi desenhada para provar que um copiloto conversacional pode ser útil, progressivo e natural na interface, sem abrir mão de controle, consistência e rastreabilidade no núcleo do sistema.

Em uma frase: **a IA interpreta e propõe; o domínio valida; o usuário confirma; o sistema executa.**

