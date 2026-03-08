# Justificativa de Arquitetura — POC de Copiloto Conversacional de Estoque

## Objetivo

Este documento justifica exclusivamente a arquitetura adotada para a POC de copiloto conversacional de estoque.

O foco aqui é explicar como a aplicação foi estruturada em alto nível para atender os requisitos funcionais e não funcionais do produto.

Este documento não tem como objetivo justificar banco de dados nem detalhar padrões de projeto individualmente.

---

## Decisão principal

A arquitetura adotada para a POC é **hexagonal/modular**, com separação explícita entre:

- interface conversacional;
- orquestração da interação com IA;
- domínio da aplicação;
- infraestrutura e integrações.

---

## Motivo central da escolha

O problema desta POC não é apenas exibir um chat que gera texto.

O sistema precisa conciliar duas necessidades diferentes ao mesmo tempo:

1. **experiência conversacional fluida**, com linguagem natural, streaming e renderização progressiva;
2. **execução segura e controlada**, com validação, draft interativo, confirmação explícita, auditoria e histórico.

Essas duas necessidades possuem responsabilidades distintas e não devem ficar acopladas em uma única camada confusa.

Por isso, a arquitetura foi desenhada para separar claramente:

- a parte que conversa;
- a parte que interpreta;
- a parte que decide regras de negócio;
- a parte que persiste e integra.

---

## Regra central da arquitetura

A arquitetura foi definida a partir da seguinte regra central:

> **IA interpreta e propõe; domínio valida; usuário confirma; sistema executa.**

Essa regra determina a divisão de responsabilidades do sistema.

### Implicações práticas

- a IA não executa operações diretamente;
- o domínio continua sendo a fonte de verdade das regras de negócio;
- a confirmação explícita do usuário é obrigatória;
- a execução acontece apenas após validação do domínio;
- a rastreabilidade do fluxo precisa ser preservada.

---

## Por que arquitetura hexagonal/modular

### 1. Separação clara de responsabilidades

A arquitetura hexagonal/modular favorece isolamento entre camadas com naturezas diferentes.

Na POC, isso é importante porque:

- o frontend precisa focar em experiência e interação;
- a integração com LLM precisa ser controlada;
- o domínio precisa ficar protegido de decisões do provider de IA;
- a infraestrutura precisa poder mudar sem contaminar a regra de negócio.

### 2. Proteção do domínio

O domínio não deve depender diretamente de:

- provider de LLM;
- banco específico;
- formato do streaming;
- detalhes da interface.

A arquitetura escolhida preserva o núcleo de negócio como centro da aplicação.

### 3. Facilidade de evolução

Com essa separação, o sistema pode evoluir sem reescrever o núcleo sempre que houver troca em:

- provider de IA;
- estratégia de streaming;
- tecnologia de persistência;
- canais de interface.

### 4. Melhor aderência ao fluxo controlado

A POC não foi desenhada como “agente autônomo que decide tudo”.

Ela foi desenhada como fluxo controlado, no qual a interpretação da IA é apenas uma etapa de uma cadeia maior.

A arquitetura hexagonal/modular encaixa bem nesse tipo de sistema porque ajuda a manter fronteiras claras entre proposta, validação e execução.

---

## Papel do Nest e do Next dentro da arquitetura

### Nest

O **Nest** foi escolhido como núcleo do backend por favorecer:

- organização modular;
- composição por casos de uso;
- serviços de aplicação;
- controllers e providers bem definidos;
- injeção de dependência;
- separação clara entre domínio e infraestrutura.

Na arquitetura da POC, o Nest concentra principalmente:

- orquestração da interação;
- casos de uso;
- validação de domínio;
- persistência;
- auditoria;
- integração com provider de IA.

### Next

O **Next** foi escolhido para a camada de interface porque favorece:

- construção component-based;
- experiência declarativa;
- renderização progressiva;
- integração fluida com streaming;
- composição de interface conversacional.

Na arquitetura da POC, o Next concentra principalmente:

- experiência do chat;
- renderização incremental da resposta;
- exibição do draft interativo;
- captura de revisão, confirmação e rejeição.

---

## Separação entre experiência conversacional e execução operacional

A POC exige que o sistema seja natural na interface, mas rigoroso na operação.

Por isso, a arquitetura separa duas responsabilidades principais.

### 1. Camada conversacional

Responsável por:

- receber mensagens em linguagem natural;
- entregar respostas em linguagem natural;
- fazer streaming;
- renderizar progressivamente;
- apresentar drafts interativos.

### 2. Camada operacional

Responsável por:

- validar a proposta estruturada;
- verificar o estado atual;
- exigir confirmação explícita;
- executar a mudança aprovada;
- registrar auditoria e histórico.

Essa separação é essencial para impedir que fluidez de interface seja confundida com autorização de execução.

---

## Por que o LLM é orquestrador controlado

O LLM foi posicionado como **orquestrador controlado**, não como executor direto.

Essa decisão existe porque o modelo é útil para:

- interpretar intenção;
- estruturar proposta;
- montar respostas naturais;
- ajudar no fluxo conversacional.

Mas ele não deve ser a autoridade final para:

- validar regra de negócio;
- alterar estado crítico;
- executar CRUD diretamente;
- garantir integridade transacional.

A arquitetura, portanto, usa o LLM como apoio inteligente dentro de um fluxo governado pelo domínio.

---

## Por que não adotar arquitetura agent-first

A arquitetura não foi desenhada como um agente autônomo com liberdade ampla para decidir e executar operações.

Essa opção foi evitada porque a POC exige:

- previsibilidade;
- revisão humana;
- confirmação explícita;
- rastreabilidade;
- controle fino do que será executado.

Em vez disso, foi adotado um fluxo **workflow-first**, em que a IA participa da interpretação e da proposta, mas a efetivação depende do restante do sistema.

---

## Papel do event-driven na arquitetura

O estilo event-driven não é o núcleo desta POC.

Ele entra apenas como suporte para:

- auditoria;
- integração futura;
- processamento complementar;
- emissão de eventos relevantes do ciclo de vida.

A consistência operacional principal permanece concentrada no fluxo controlado do domínio.

---

## Benefícios da arquitetura escolhida

A arquitetura adotada traz vantagens diretas para a POC:

- reduz acoplamento entre IA, domínio e infraestrutura;
- protege regras de negócio de decisões do modelo;
- facilita manutenção e evolução;
- preserva previsibilidade operacional;
- favorece auditoria e rastreabilidade;
- sustenta streaming sem comprometer a segurança da execução;
- permite escalar a solução por camadas no futuro.

---

## Resumo executivo

A arquitetura da POC foi definida para conciliar **experiência conversacional fluida** com **execução operacional segura**.

Por isso, foi adotada uma arquitetura **hexagonal/modular**, na qual:

- o **Next** cuida da experiência conversacional;
- o **Nest** concentra orquestração, casos de uso, domínio e integrações;
- o **LLM** atua como orquestrador controlado;
- o **domínio** continua sendo a autoridade de validação;
- a **execução** só acontece após confirmação explícita;
- a **infraestrutura** permanece isolada do núcleo de negócio.

Em síntese, a arquitetura foi escolhida para garantir que a aplicação seja natural no uso, mas rigorosa no controle operacional.

