# Justificativa de Banco de Dados — POC de Copiloto Conversacional de Estoque

## Objetivo

Este documento justifica a adoção de **MongoDB com Mongoose** como base de persistência da POC.

O foco aqui é a escolha do banco e da integração com o backend Nest, não o restante da arquitetura.

---

## Decisão principal

O banco principal escolhido para a POC é **MongoDB**, com **Mongoose** como biblioteca de modelagem, validação e integração com o NestJS.

---

## Motivo central da escolha

O fluxo principal da POC combina dois tipos de dado:

1. dados operacionais que precisam de rastreabilidade;
2. payloads conversacionais que mudam com frequência;
3. drafts e eventos de auditoria com estrutura parcialmente variável;
4. snapshots de proposta, diff e resultado de execução.

Esse perfil é mais aderente a um modelo documental do que a um modelo rigidamente relacional.

A decisão, portanto, foi guiada por:

- **flexibilidade de schema** para a camada conversacional;
- **evolução rápida da POC** sem custo alto de migração estrutural;
- **agregados por documento** mais naturais para sessão, draft, execução e auditoria;
- **integração direta com NestJS** por meio do `@nestjs/mongoose`;
- **preservação de integridade operacional** com índices, versionamento, idempotência e transações quando necessário.

---

## Requisitos que orientaram a decisão

### 1. Payloads variáveis fazem parte do núcleo da POC

O sistema precisa persistir dados como:

- intenção interpretada;
- filtros e parâmetros derivados da conversa;
- snapshots do estado proposto;
- diffs entre before e after;
- metadados de auditoria produzidos pela IA.

Esses artefatos tendem a mudar ao longo da POC. Um banco documental reduz o atrito para acomodar essa evolução.

### 2. O modelo é mais orientado a agregados do que a joins pesados

Os principais agrupamentos naturais são:

- sessão e suas mensagens;
- draft e seus itens;
- execução e seu resultado;
- evento de auditoria e seu payload.

Mesmo quando há referência entre coleções, o consumo da aplicação tende a acontecer por agregado e por fluxo de negócio, não por grandes composições relacionais ad hoc.

### 3. Auditoria continua obrigatória

O sistema precisa responder com clareza:

- quem pediu;
- o que foi interpretado;
- o que foi proposto;
- o que foi confirmado;
- o que foi executado;
- qual foi o resultado.

MongoDB atende esse requisito desde que a modelagem preserve referências, timestamps, versionamento e índices coerentes.

### 4. Confirmação explícita segue sendo mandatória

Nenhuma operação pode ser executada implicitamente.

Por isso, a persistência continua precisando deixar explícitos:

- o draft;
- os itens do draft;
- a decisão do usuário;
- a execução correspondente;
- a trilha de auditoria.

### 5. Consistência forte continua localizada no fluxo crítico

A escolha por MongoDB não elimina a necessidade de integridade no ponto de confirmação e execução.

Ela apenas desloca a estratégia:

- operações simples ficam atômicas no nível do documento;
- operações distribuídas entre coleções usam transações do MongoDB quando necessário;
- conflitos são tratados com versionamento, checks de estado e idempotência na camada de aplicação.

---

## Leitura pelo PACELC

Para esta POC, a leitura pelo PACELC muda de ênfase:

- fora de partição, priorizamos **flexibilidade de modelagem e baixa fricção de evolução**;
- no fluxo crítico de confirmação, priorizamos **consistência operacional**, mesmo com custo adicional de transação ou validação;
- em situações normais, a latência percebida na camada conversacional é melhor atendida por agregados documentais do que por normalização rígida.

Em outras palavras: a POC não abre mão de consistência onde ela importa, mas deixa de impor rigidez relacional ao restante do sistema.

---

## Por que MongoDB se encaixa bem

### 1. Modelagem documental combina com a camada conversacional

Mensagens, payloads interpretados, metadados de IA e snapshots de draft têm natureza variável. MongoDB acomoda isso sem transformar cada ajuste de contrato em uma migração estrutural do banco.

### 2. Agregados ficam mais simples de persistir

Coleções como `operation_drafts`, `operation_draft_items`, `operation_executions` e `audit_events` podem carregar documentos ricos, com campos opcionais e payloads heterogêneos, sem penalizar a evolução da POC.

### 3. Há suporte suficiente para integridade operacional

MongoDB oferece os mecanismos necessários para a POC quando bem usados:

- índices únicos e compostos;
- atualizações atômicas por documento;
- sessões e transações para fluxos multi-coleção;
- controle de versão e checks condicionais;
- referências entre coleções com `ObjectId`.

### 4. O desenho conversa bem com auditoria e histórico

Auditoria em MongoDB funciona bem quando cada evento preserva:

- tipo do evento;
- referências relevantes;
- payload original;
- data do acontecimento;
- contexto complementar de execução.

Isso é especialmente adequado para uma POC em que o payload auditável pode mudar conforme o fluxo conversacional amadurece.

---

## Papel do Mongoose nesta decisão

MongoDB é o banco escolhido. Mongoose é a camada de integração escolhida para a API Nest.

O papel do Mongoose é:

- definir schemas explícitos por coleção;
- validar campos essenciais na borda de persistência;
- registrar índices e restrições;
- padronizar timestamps;
- facilitar a injeção de modelos no NestJS;
- manter a infraestrutura preparada para evolução incremental.

Ou seja, a escolha não é "MongoDB sem contrato". O contrato existe, mas fica expresso em schemas Mongoose, não em tabelas relacionais com Prisma.

---

## Alinhamento com o modelo de entidades

O banco precisa continuar sustentando o relacionamento entre:

- `actor`;
- `conversation_session`;
- `conversation_message`;
- `operation_draft`;
- `operation_draft_item`;
- `draft_decision`;
- `operation_execution`;
- `audit_event`;
- `product`.

A diferença é que esse relacionamento deixa de depender de foreign keys rígidas e passa a ser modelado com:

- `ObjectId` entre coleções;
- referências explícitas quando o vínculo é importante para navegação;
- snapshots quando a rastreabilidade do estado vale mais que a normalização;
- validações e transações na camada de aplicação para o fluxo crítico.

### Relações críticas que continuam existindo

- uma sessão contém várias mensagens;
- uma sessão pode originar múltiplos drafts;
- um draft contém um ou mais itens;
- uma decisão explícita aprova ou rejeita o draft;
- uma execução só pode existir para um draft válido;
- a auditoria precisa apontar para sessão, draft, execução, ator e produto quando aplicável.

MongoDB atende esse grafo desde que o backend trate explicitamente os invariantes relevantes.

---

## Impacto direto no desenho físico

Com MongoDB e Mongoose, o desenho físico passa a privilegiar:

- coleções por agregado principal;
- `ObjectId` como identificador nativo;
- índices compostos por status, ator, sessão e timestamps;
- unicidade para evitar dupla decisão ou dupla execução;
- payloads mistos para auditoria, intenção e resultado;
- versionamento lógico em `product` para concorrência e histórico.

Essa estratégia reduz o custo de adaptação da POC sem abrir mão da rastreabilidade.

---

## Estratégia de consistência no fluxo crítico

O service do Nest continua sendo o coordenador da operação.

Na confirmação de um draft, a aplicação ainda precisa:

1. ler o estado atual;
2. validar se o draft continua aplicável;
3. verificar a decisão explícita;
4. aplicar a mudança no produto;
5. registrar a execução;
6. registrar a auditoria.

Com MongoDB, isso deve ser sustentado por uma combinação de:

- transações quando houver múltiplas coleções envolvidas;
- updates condicionais por versão ou status;
- idempotência para evitar dupla execução;
- modelagem com snapshots para preservar evidência histórica.

---

## Índices recomendados

### Em `product`

- índice por `sku`;
- índice composto por `sku` e `isCurrent`;
- índice por `deletedAt`;
- unicidade por `lineageKey` e `version`.

### Em `operation_draft`

- índice por `sessionId` e `createdAt`;
- índice por `actorId` e `createdAt`;
- índice por `status` e `createdAt`.

### Em `operation_execution`

- unicidade por `draftId`;
- índice por `status` e `startedAt`.

### Em `audit_event`

- índice por `kind` e `createdAt`;
- índice por `sessionId` e `createdAt`;
- índice por `draftId` e `createdAt`;
- índice por `operationExecutionId` e `createdAt`;
- índice por `actorId` e `createdAt`.

Esses índices mantêm o banco orientado às consultas reais da POC: trilha por sessão, auditoria por ator, execução por draft e leitura do estado atual do produto.

---

## Por que não manter Prisma e banco relacional nesta fase

Prisma e um banco relacional continuariam sendo uma opção válida em um cenário mais estabilizado e fortemente normalizado.

Mas, para esta POC, isso imporia custo maior em pontos que ainda estão mudando:

- contratos de payload;
- estrutura de auditoria;
- forma do draft;
- snapshots de interpretação e execução;
- adaptação do fluxo conversacional.

Como o repositório ainda está no início da camada de persistência, a troca agora tem custo baixo e evita carregar rigidez desnecessária para os próximos ciclos.

---

## Conclusão

**MongoDB com Mongoose** foi escolhido porque equilibra melhor os requisitos atuais da POC:

- flexibilidade para payloads conversacionais;
- rapidez de evolução do modelo;
- aderência a agregados documentais;
- integração direta com NestJS;
- possibilidade de preservar rastreabilidade, histórico e consistência no fluxo crítico.

Em síntese, a persistência da POC passa a ser orientada por **modelagem documental com integridade operacional explícita**, em vez de uma base relacional com normalização rígida desde o início.
