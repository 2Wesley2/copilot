# Justificativa de Padrões de Projeto — POC de Copiloto Conversacional de Estoque

## Objetivo

Este documento justifica exclusivamente os padrões de projeto adotados na POC de copiloto conversacional de estoque.

O foco aqui é explicar por que determinados padrões foram escolhidos e qual papel cada um desempenha dentro da solução.

Este documento não trata da escolha do banco de dados nem da justificativa arquitetural em alto nível.

---

## Premissa da escolha dos padrões

Os padrões de projeto não foram escolhidos por preferência estética ou por tentar “encaixar patterns” artificialmente no código.

Eles foram escolhidos para resolver problemas concretos da POC, especialmente:

- interpretação de intenções em linguagem natural;
- transformação de intenção em proposta estruturada;
- separação entre proposta e execução;
- controle do fluxo de revisão e confirmação;
- isolamento entre domínio, IA e integrações externas;
- evolução segura da aplicação.

A lógica central da POC é:

> **IA interpreta e propõe; domínio valida; usuário confirma; sistema executa.**

Os padrões escolhidos servem para sustentar esse fluxo com clareza, isolamento e previsibilidade.

---

## Padrões adotados

Os padrões principais adotados na POC são:

- **Command**
- **Strategy**
- **Adapter**
- **State Machine**
- **Pipeline**

---

## 1. Command

### O que resolve

O sistema recebe intenções em linguagem natural, mas não pode executar diretamente com base em texto livre.

É necessário transformar a intenção do usuário em uma proposta estruturada, explícita e rastreável.

### Por que foi escolhido

O padrão **Command** permite representar uma operação pretendida como um objeto formal de ação.

Na POC, isso é útil para transformar algo como:

- “atualiza o preço do produto X”
- “remove esses itens”
- “mostra os produtos com estoque baixo”

em uma estrutura operacional clara, com tipo de ação, alvo, parâmetros, payload e estado.

### Benefícios na POC

- separa linguagem natural de ação estruturada;
- permite revisão antes da execução;
- facilita persistência do draft;
- melhora rastreabilidade;
- evita execução implícita baseada apenas em texto.

### Onde aparece

- draft de operação;
- payload estruturado da intenção;
- representação formal de create, read, update e delete.

---

## 2. Strategy

### O que resolve

Nem toda intenção do usuário deve seguir o mesmo fluxo.

Criar, ler, atualizar e deletar possuem regras, validações e comportamentos diferentes.

### Por que foi escolhido

O padrão **Strategy** permite selecionar a lógica adequada conforme o tipo de intenção identificada.

Em vez de concentrar muitos `if/else` ou `switch` em um fluxo único, a aplicação delega o comportamento para estratégias específicas.

### Benefícios na POC

- reduz complexidade condicional concentrada;
- melhora legibilidade;
- facilita evolução por tipo de operação;
- permite regras específicas por intenção;
- reduz acoplamento entre fluxos diferentes.

### Onde aparece

- estratégia de create;
- estratégia de read;
- estratégia de update;
- estratégia de delete;
- possíveis estratégias de validação ou confirmação.

---

## 3. Adapter

### O que resolve

A POC depende de elementos externos ao domínio, como:

- provider de LLM;
- banco de dados;
- mecanismo de streaming;
- serviços complementares.

O domínio não deve depender diretamente do detalhe tecnológico dessas integrações.

### Por que foi escolhido

O padrão **Adapter** permite isolar detalhes de implementação e expor interfaces compatíveis com a necessidade da aplicação.

Isso ajuda a proteger o núcleo do sistema contra acoplamento excessivo com tecnologia específica.

### Benefícios na POC

- facilita trocar provider de LLM no futuro;
- isola persistência do domínio;
- desacopla streaming da regra de negócio;
- melhora testabilidade;
- reduz impacto de mudança tecnológica.

### Onde aparece

- adapter do provider de IA;
- adapter do repositório;
- adapter de streaming;
- adapter de auditoria ou integrações complementares.

---

## 4. State Machine

### O que resolve

A POC possui um fluxo com estados bem definidos.

Uma operação não nasce pronta para executar. Ela passa por estágios intermediários, como:

- intenção recebida;
- proposta estruturada;
- draft em revisão;
- aguardando confirmação;
- confirmada;
- executada;
- rejeitada;
- falha.

Sem um controle claro de estados, a aplicação corre o risco de permitir transições inválidas ou ambíguas.

### Por que foi escolhido

O uso de **State Machine** ajuda a formalizar o ciclo de vida da operação e da interação.

### Benefícios na POC

- evita transições inválidas;
- deixa o fluxo explícito;
- melhora previsibilidade;
- facilita auditoria;
- reduz risco de dupla execução ou confirmação indevida.

### Onde aparece

- status do draft;
- status da execução;
- estados relevantes da interação operacional.

---

## 5. Pipeline

### O que resolve

A POC não é um sistema de passo único. A interação precisa seguir uma sequência controlada de etapas.

### Por que foi escolhido

O padrão **Pipeline** ajuda a organizar o processamento em fases bem delimitadas, permitindo que cada etapa tenha responsabilidade específica.

### Benefícios na POC

- organiza melhor o fluxo da operação;
- facilita observabilidade;
- melhora legibilidade do processamento;
- simplifica manutenção;
- permite validação entre etapas.

### Onde aparece

O fluxo geral pode ser lido como pipeline:

1. receber mensagem;
2. interpretar intenção;
3. estruturar proposta;
4. validar dados;
5. montar draft;
6. apresentar revisão;
7. receber confirmação;
8. executar;
9. auditar resultado.

---

## Por que esses padrões juntos fazem sentido

Os padrões não foram escolhidos isoladamente. Eles se complementam.

- **Command** transforma intenção em proposta estruturada;
- **Strategy** escolhe o fluxo correto para cada tipo de operação;
- **Adapter** isola dependências externas;
- **State Machine** controla o ciclo de vida da operação;
- **Pipeline** organiza a sequência completa do processamento.

Juntos, eles tornam a aplicação mais clara, modular, previsível e evolutiva.

---

## Por que não centralizar tudo em um “agente” único

Uma abordagem possível seria concentrar toda a lógica em um fluxo único comandado por um agente conversacional com muita autonomia.

Essa abordagem foi evitada porque a POC exige:

- revisão humana;
- confirmação explícita;
- previsibilidade operacional;
- separação entre interpretar e executar;
- rastreabilidade detalhada.

Os padrões escolhidos ajudam justamente a impedir que o sistema vire uma caixa-preta difícil de validar e manter.

---

## Benefícios gerais dos padrões escolhidos

A adoção desses padrões traz vantagens diretas para a POC:

- reduz acoplamento;
- melhora manutenção;
- facilita testes;
- explicita o fluxo operacional;
- fortalece rastreabilidade;
- protege o domínio da influência direta do provider de IA;
- facilita evolução futura sem reescrever o núcleo.

---

## Resumo executivo

Os padrões de projeto escolhidos para a POC foram definidos para sustentar um fluxo em que linguagem natural precisa ser convertida em operação controlada, revisável e auditável.

Por isso:

- **Command** formaliza a proposta de ação;
- **Strategy** separa comportamentos por tipo de intenção;
- **Adapter** isola integrações externas;
- **State Machine** controla estados e transições;
- **Pipeline** organiza o processamento em etapas.

Em síntese, esses padrões foram escolhidos porque ajudam a transformar um copiloto conversacional em um sistema previsível, seguro e evolutivo, sem permitir execução implícita a partir de texto livre.

