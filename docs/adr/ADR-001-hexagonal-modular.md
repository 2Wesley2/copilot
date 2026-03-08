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


---

## Alinhamento com o modelo de entidades e com a fronteira das camadas do Nest

Com a consolidação do modelo de relacionamento de entidades da POC, a arquitetura passa a ficar ainda mais explícita.

O sistema não lida apenas com uma entidade `product` isolada. Ele precisa coordenar, em um mesmo fluxo controlado, o encadeamento entre:

- ator que interage com o sistema;
- sessão conversacional;
- mensagens trocadas;
- draft operacional;
- itens do draft;
- decisão explícita do usuário;
- execução da operação;
- evento de auditoria.

Esse encadeamento confirma que a arquitetura não pode ser centrada em controllers “inteligentes” ou em acesso direto do transporte HTTP/SSE ao banco. O desenho correto exige um backend em que o Nest funcione como composição de fronteiras bem definidas.

### Papel da `controller` no Nest

Na POC, a **controller** não deve concentrar regra de negócio.

A controller existe para cumprir responsabilidades de entrada e saída, como:

- receber requisições HTTP;
- expor endpoints REST;
- abrir ou coordenar streaming por SSE quando aplicável;
- validar formato de entrada em nível de transporte;
- delegar o caso de uso para a camada apropriada;
- devolver resposta, status e contrato adequados.

Ou seja, a controller deve ser uma camada de adaptação de transporte, e não o lugar onde ficam regras de confirmação, rastreabilidade, soft delete ou consistência entre draft e execução.

### Papel da `service` no Nest

Na POC, a **service** é a camada onde deve ficar a regra de negócio e a orquestração de caso de uso.

É nela que devem viver responsabilidades como:

- interpretar o tipo de intenção;
- selecionar a estratégia de operação;
- estruturar a proposta;
- validar obrigatórios;
- conferir estado atual versus estado proposto;
- verificar confirmação explícita;
- coordenar execução transacional;
- emitir auditoria;
- garantir que o executado corresponda ao draft aprovado.

Em termos práticos, o Nest entra como shell de aplicação: controller adaptando transporte, service coordenando regra de negócio, e adapters/repositories isolando infraestrutura.

### Papel de `repository` e adapters

A camada de persistência não deve ser acessada diretamente pela controller.

O acesso a dados deve acontecer por repositories e adapters de infraestrutura, acionados a partir dos services, para que o domínio permaneça protegido de decisões de banco, provider de IA ou mecanismo de streaming.

Isso reforça a separação que já estava implícita na arquitetura hexagonal/modular:

- **controller**: borda de entrada/saída;
- **service**: caso de uso e regra de negócio;
- **repository/adapter**: infraestrutura e integração;
- **domínio**: invariantes e validações centrais.

---

## Desdobramento arquitetural por módulo

A partir dessa leitura, a decomposição arquitetural mais coerente para o backend é:

- `conversation`: entrada conversacional, parsing da solicitação e vínculo com sessão e mensagens;
- `draft`: construção, manutenção, revisão e atualização do draft;
- `product`: regras do agregado de produto;
- `execution`: aplicação segura da operação confirmada;
- `audit`: rastreabilidade ponta a ponta;
- `shared`: contratos e abstrações comuns;
- `infra`: persistência, IA, streaming e observabilidade.

Essa separação modular não é apenas organizacional. Ela existe porque os requisitos do EPIC pedem um fluxo em que interpretação, proposta, revisão, confirmação e execução sejam etapas distintas e auditáveis.

---

## Efeito direto dessa arquitetura sobre a experiência conversacional

A interface pode transmitir sensação de fluidez e progressão em tempo real, mas essa fluidez não deve colapsar as fronteiras do backend.

Em outras palavras:

- o streaming pode ser progressivo na experiência;
- a resposta pode ser incremental na interface;
- mas a execução continua bloqueada até existir proposta estruturada, validação e confirmação explícita.

Isso evita que a camada conversacional pareça “autônoma” no sentido operacional. O sistema pode conversar de forma natural, mas opera de forma estrita e controlada.

---

## Conclusão complementar

Com a definição do modelo de entidades e da responsabilidade explícita das camadas do Nest, a decisão arquitetural fica ainda mais sólida.

A arquitetura hexagonal/modular continua sendo a mais adequada porque:

- preserva a separação entre conversa e operação;
- protege o domínio do transporte e da infraestrutura;
- acomoda o modelo relacional orientado a draft, decisão, execução e auditoria;
- permite que a controller adapte HTTP/SSE sem capturar regra de negócio;
- concentra nos services a orquestração real do fluxo operacional.

Em síntese, a arquitetura não foi escolhida apenas para “organizar melhor o código”, mas para tornar possível um produto que precisa ser simultaneamente conversacional na interface e rigoroso na execução.
