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

---

## Alinhamento dos padrões com o modelo de entidades

Com a modelagem relacional consolidada, os padrões escolhidos ficam ainda mais justificáveis.

A POC não precisa apenas “fazer CRUD”. Ela precisa coordenar um fluxo composto por:

- sessão;
- mensagens;
- draft;
- itens do draft;
- decisão explícita;
- execução;
- auditoria;
- produto afetado.

Esse encadeamento exige padrões que organizem o comportamento do sistema em torno de uma sequência controlada de estados e ações, em vez de misturar tudo em endpoints com lógica procedural difusa.

---

## Como os padrões se distribuem nas camadas do Nest

A definição de responsabilidades do Nest ajuda a aplicar os padrões com mais precisão.

### `controller` como borda de transporte

A controller deve receber entrada HTTP ou SSE, delegar para a aplicação e devolver a resposta adequada. Ela não deve decidir regra de confirmação, validação de draft ou execução de operação.

### `service` como orquestração de regra de negócio

A service deve concentrar a regra de negócio e aplicar os padrões principais da POC. Em outras palavras, é dentro dos services que Command, Strategy, State Machine e Pipeline se articulam de verdade.

### `repository` e adapters como infraestrutura

Repositories e adapters implementam persistência, integração com IA, streaming e outros detalhes externos sem contaminar o núcleo do fluxo.

Essa distribuição é importante porque evita aplicar padrões no lugar errado. O objetivo não é “usar pattern por usar”, mas posicioná-lo na camada que realmente precisa dele.

---

## Releitura dos padrões à luz da camada service

### Command na camada service

O Command ganha força porque o service precisa transformar a solicitação em um objeto estruturado que sobreviva ao texto livre.

Não basta a controller receber um body ou uma mensagem. O service precisa converter isso em uma representação explícita da ação, passível de persistência, revisão e comparação com o estado atual.

### Strategy na camada service

A seleção da estratégia correta também deve ocorrer no service, e não na controller.

A controller pode identificar o endpoint ou o canal, mas não deve decidir a regra operacional. Quem escolhe a estratégia de create, read, update ou delete deve ser a camada de aplicação, com base na intenção estruturada e no contexto do draft.

### State Machine no ciclo de vida do draft

A State Machine faz ainda mais sentido quando observamos as entidades persistidas.

Um draft pode transitar por estados como:

- recebido;
- interpretado;
- estruturado;
- em revisão;
- aguardando confirmação;
- confirmado;
- rejeitado;
- executado;
- falho.

Esses estados não são apenas abstrações em memória. Eles representam a própria semântica da POC e podem ser persistidos ou auditados. Por isso, modelá-los explicitamente reduz ambiguidade.

### Pipeline na orquestração do fluxo

O Pipeline também se torna mais natural quando visto pela perspectiva do service. O caso de uso pode ser lido como uma cadeia de etapas:

1. receber a solicitação;
2. interpretar a intenção;
3. estruturar o command;
4. validar o draft;
5. enriquecer a proposta;
6. apresentar para revisão;
7. receber decisão;
8. executar;
9. auditar.

Esse pipeline não precisa ser necessariamente implementado com uma biblioteca específica. O ponto é preservar a linearidade explícita do fluxo.

### Adapter nas bordas técnicas

O Adapter continua sendo essencial para:

- provider de LLM;
- persistência em MongoDB com Mongoose;
- emissão de streaming;
- integrações futuras.

Ele permite que a camada service trabalhe com portas e contratos, não com SDKs ou detalhes de banco.

---

## Padrões complementares que passam a fazer sentido

Sem mudar a decisão principal, a maturidade do desenho também sugere dois complementos úteis.

### Repository

Embora muitas vezes seja tratado como padrão de persistência e não listado entre os cinco principais, aqui ele ganha valor claro.

Como a controller não deve falar direto com o banco e a service precisa operar sobre abstrações, o **Repository** ajuda a encapsular consultas e operações sobre:

- produtos;
- drafts;
- decisões;
- execuções;
- auditoria.

### Unit of Work ou coordenação transacional explícita

Mesmo que não seja formalizado como um pattern isolado no documento principal, a POC se beneficia de uma coordenação transacional clara.

Ao confirmar uma operação, o service pode precisar executar várias escritas relacionadas dentro de uma mesma unidade lógica. Essa necessidade conversa fortemente com a escolha do MongoDB, com o uso de transações quando necessário e com a separação entre aplicação e infraestrutura.

---

## Anti-padrões que a POC deve evitar

A definição atual do projeto também deixa mais claro o que não deve ser feito.

### Controller anêmica virando service disfarçada

Colocar regras de negócio diretamente na controller apenas porque “é um projeto pequeno” quebraria a separação central da POC.

### Service monolítica com muitos `if/else`

Ignorar Strategy e concentrar toda a lógica operacional em um único bloco condicional aumentaria complexidade e reduziria previsibilidade.

### Execução baseada em texto livre

Pular Command e executar diretamente a partir da fala do usuário destruiria a garantia de proposta estruturada e confirmação explícita.

### Persistência acoplada ao fluxo conversacional

Misturar SDK de banco, chamadas a provider de IA e regra de negócio no mesmo ponto tornaria o sistema difícil de testar, evoluir e auditar.

---

## Conclusão complementar

Os padrões escolhidos continuam corretos e ficam mais robustos quando observados junto com o modelo de entidades e com a definição explícita das camadas do Nest.

A controller deve adaptar transporte. A service deve concentrar regra de negócio. Repositories e adapters devem encapsular persistência e integrações. Dentro dessa distribuição, Command, Strategy, State Machine, Pipeline e Adapter deixam de ser conceitos abstratos e passam a estruturar o fluxo real da POC.

Em síntese, os padrões foram escolhidos porque ajudam a sustentar um sistema em que a conversa é natural, mas a operação é formal, validada, confirmada e auditável.
