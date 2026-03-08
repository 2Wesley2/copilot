# Justificativa de Banco de Dados — POC de Copiloto Conversacional de Estoque

## Objetivo

Este documento justifica exclusivamente a escolha do banco de dados para a POC de copiloto conversacional de estoque.

O foco aqui não é arquitetura geral da aplicação, padrões de projeto ou experiência de interface, mas sim explicar qual banco melhor sustenta os requisitos operacionais e de persistência do sistema.

---

## Decisão principal

O banco principal escolhido para a POC é **PostgreSQL**.

---

## Motivo central da escolha

O problema principal desta POC não é apenas armazenar mensagens, textos livres ou payloads flexíveis.

O núcleo mais sensível do sistema está em garantir, com segurança, o fluxo de:

1. interpretar uma intenção do usuário;
2. estruturar uma proposta de operação;
3. permitir revisão do draft;
4. validar o draft contra o estado atual;
5. exigir confirmação explícita;
6. executar exatamente o que foi confirmado;
7. registrar histórico e auditoria.

Esse tipo de fluxo exige principalmente:

- **integridade transacional**;
- **consistência de dados**;
- **controle de concorrência**;
- **rastreabilidade**;
- **preservação de histórico**.

Por isso, a escolha do banco foi orientada mais pela necessidade de segurança operacional do que pela flexibilidade de schema isoladamente.

---

## Requisitos que orientaram a decisão

### 1. Confirmação explícita antes da execução

Nenhuma operação pode ser executada implicitamente.

Isso significa que o sistema precisa persistir com clareza:

- a proposta de operação;
- o estado revisado pelo usuário;
- a confirmação explícita;
- a execução correspondente.

Esse encadeamento exige consistência forte entre registros relacionados.

### 2. Execução transacional

Quando o usuário confirma uma operação, o sistema precisa conseguir tratar de forma coerente, na mesma unidade lógica:

- validação do estado atual;
- aplicação da mudança;
- atualização de versões ou status;
- registro da execução;
- registro da auditoria.

Esse é um cenário clássico de aderência a banco relacional com suporte transacional sólido.

### 3. Controle de concorrência

É possível que o estado de um produto mude enquanto um draft está sendo revisado.

O banco precisa suportar mecanismos para evitar:

- confirmação sobre estado vencido;
- sobrescrita indevida;
- dupla execução;
- efeitos inconsistentes em operações concorrentes.

### 4. Soft delete obrigatório

O sistema adota como regra que não haverá delete físico.

Toda deleção deve preservar histórico por meio de campos como:

- `deleted_at`;
- `deleted_by`;
- `status`.

Essa abordagem funciona muito bem com modelagem relacional, constraints e índices bem definidos.

### 5. Auditoria completa

O sistema precisa responder com segurança:

- quem pediu;
- o que foi interpretado;
- o que foi proposto;
- o que foi revisado;
- o que foi confirmado;
- o que foi executado;
- qual foi o resultado.

A persistência precisa favorecer encadeamento confiável entre esses registros.

---

## Leitura pelo PACELC

A decisão também pode ser lida à luz do teorema **PACELC**.

Para esta POC, no núcleo operacional, o trade-off priorizado é:

- **consistência acima de disponibilidade irrestrita em situações de partição**;
- **consistência acima de latência mínima no momento de confirmação e execução**.

Isso porque, no ponto crítico do sistema, o requisito dominante não é responder o mais rápido possível a qualquer custo, mas garantir que a operação aprovada seja aplicada de forma correta, íntegra e auditável.

---

## Por que PostgreSQL se encaixa bem

### 1. Forte suporte transacional

O PostgreSQL é uma boa escolha para fluxos que dependem de coerência entre múltiplos passos relacionados.

Na confirmação de uma operação, o sistema pode precisar, no mesmo fluxo lógico:

- validar versão;
- persistir execução;
- atualizar entidades de negócio;
- registrar auditoria.

Esse tipo de requisito combina bem com transações ACID.

### 2. Bom controle de concorrência

O PostgreSQL oferece recursos sólidos para lidar com concorrência, como:

- transações ACID;
- MVCC;
- locking quando necessário;
- versionamento e controle otimista.

Isso ajuda a garantir que confirmações só sejam aceitas sobre um estado ainda válido.

### 3. Relacional no núcleo, flexível no complementar

A POC possui duas naturezas de dado:

**Estrutura rígida:**
- produto;
- posição de estoque;
- execução;
- auditoria.

**Estrutura variável:**
- intenção interpretada;
- filtros de leitura;
- before/proposed/diff do draft;
- metadados conversacionais.

O PostgreSQL permite atender bem os dois lados com:

- tabelas relacionais para o núcleo;
- `JSONB` para payloads variáveis.

### 4. Boa aderência a rastreabilidade e histórico

Como o sistema exige auditoria e soft delete, faz sentido usar um banco que ofereça boa base para:

- chaves e relações claras;
- constraints;
- índices;
- versionamento;
- histórico preservado.

---

## Resumo executivo

O PostgreSQL foi escolhido como banco principal porque o núcleo da POC exige:

- confirmação explícita antes da execução;
- integridade transacional;
- consistência forte no momento crítico da operação;
- controle de concorrência;
- auditoria completa;
- preservação de histórico com soft delete;
- combinação equilibrada entre modelagem relacional e payloads variáveis via `JSONB`.

Em síntese, a escolha do banco foi orientada por **segurança operacional, rastreabilidade e consistência**, e não apenas por flexibilidade documental ou menor esforço inicial de modelagem.

