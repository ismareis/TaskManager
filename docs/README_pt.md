# Documentação do Projeto - TaskManager

> Também disponível em [Inglês (en-US)](../README.md)

## Conteúdos do Documento

<details>
<summary><b>1. Visão Geral</b></summary>

- [1.1. Objetivo do Sistema](#11-objetivo-do-sistema)
- [1.2. Contexto de Uso](#12-contexto-de-uso)
- [1.3. Instalação](#13-instalação)

</details>

<details>
<summary><b>2. Decisões Arquiteturais</b></summary>

- [2.1. Arquitetura Adotada](#21-arquitetura-adotada)
- [2.2. Justificativa](#22-justificativa)
  - [2.2.1. Justificativa da Abordagem Arquitetural (Clean Architecture)](#221-justificativa-da-abordagem-arquitetural-clean-architecture)
  - [2.2.2. Justificativa da Pilha Tecnológica](#222-justificativa-da-pilha-tecnológica)
- [2.3. Padrões Aplicados](#23-padrões-aplicados)
  - [2.3.1. Camada de Domínio (Domain) e Práticas de DDD](#231-camada-de-domínio-domain-e-práticas-de-ddd)
  - [2.3.2. Camada de Aplicação (Application)](#232-camada-de-aplicação-application)
  - [2.3.3. Camada de Infraestrutura (Infra)](#233-camada-de-infraestrutura-infra)
- [2.4. Camadas do Projeto](#24-camadas-do-projeto)
  - [2.4.1. Camada: Domain](#241-camada-domain)
  - [2.4.2. Camada: Application](#242-camada-application)
  - [2.4.3. Camada: Infra (Infrastructure)](#243-camada-infra-infrastructure)
- [2.5. Visualização das Camadas](#25-visualização-das-camadas)

</details>

<details>
<summary><b>3. Modelagem de Dados</b></summary>

- [3.1. Diagrama](#31-diagrama)
- [3.2. Descrição das Tabelas](#32-descrição-das-tabelas)
  - [3.2.1. users](#321-users)
  - [3.2.1. tasks](#321-tasks)

</details>

<details>
<summary><b>4. Fluxo de Requisições</b></summary>

- [4.1. Autenticação](#41-autenticação)
  - [4.1.1. POST /auth/login](#411-post-authlogin)
  - [4.1.2. POST /auth/logout](#412-post-authlogout)

- [4.2. Google Calendar](#42-google-calendar)
  - [4.2.1. GET /auth/google/login](#421-get-authgooglelogin)
  - [4.2.2. GET /auth/google/callback](#422-get-authgooglecallback)
  - [4.2.3. POST /auth/google/logout](#423-post-authgooglelogout)

- [4.3. Usuários](#43-usuários)
  - [4.3.1. POST /users](#431-post-users)
  - [4.3.2. GET /users/:id](#432-get-usersid)
  - [4.3.3. PUT /users/:id](#433-put-usersid)
  - [4.3.4. DELETE /users/:id](#434-delete-usersid)

- [4.4. Tarefas](#44-tarefas)
  - [4.4.1. POST /tasks](#441-post-tasks)
  - [4.4.2. GET /tasks](#442-get-tasks)
  - [4.4.3. GET /tasks/:id](#443-get-tasksid)
  - [4.4.4. PUT /tasks/:id](#444-put-tasksid)
  - [4.4.5. DELETE /tasks/:id](#445-delete-tasksid)

- [4.5. Códigos de Resposta](#45-códigos-de-resposta)

</details>

<details>
<summary><b>5. Configuração e Deploy</b></summary>

- [5.1. Passo a Passo](#51-passo-a-passo)
- [5.2. Google Calendar - Como obter as credenciais](#52-google-calendar---como-obter-as-credenciais)
- [5.3. Variáveis de ambiente completas](#53-variáveis-de-ambiente-completas)

</details>

<details>
<summary><b>6. Testes Automatizados</b></summary>

- [6.1. Estratégia](#61-estratégia)
  - [6.1.1. Testes Unitários](#611-testes-unitários)
  - [6.1.2. Testes de Integração](#612-testes-de-integração)
- [6.2. Execução](#62-execução)
- [6.3. Cobertura](#63-cobertura)

</details>

## 1. Visão Geral


### 1.1. Objetivo do Sistema

O **TaskManager** é uma aplicação de gerenciamento de tarefas desenvolvida como um projeto prático para a disciplina de Engenharia de Software. O seu propósito central não é operar num cenário de produção real, mas sim servir como uma plataforma prática para aplicar e demonstrar conceitos de **arquitetura de software, desenvolvimento de APIs REST e garantia de qualidade**.

Para atingir esse objetivo, o sistema resolve o problema da organização de rotinas entregando as seguintes funcionalidades principais:
* **Controle de Acesso:** Cadastro e autenticação segura de utilizadores.
* **CRUD de Tarefas e Usuários:** Criação, consulta, atualização e exclusão de atividades e usuários.
* **Organização:** Mecanismos de filtragem e ordenação das tarefas.
* **Sincronização Externa:** Integração das tarefas com o Google Calendar para gestão de compromissos.

Do ponto de vista técnico e educacional, o sistema objetiva evidenciar a capacidade dos alunos em implementar boas práticas de mercado, tais como organização em camadas, separação de responsabilidades, padronização de rotas, tratamento de erros e alta cobertura de testes automatizados.

---

### 1.2. Contexto de Uso

O **TaskManager** opera num ambiente controlado e académico, estruturado sob as seguintes características de uso e operação:

* **Tipo de Utilizador Final:** Estudantes e avaliadores da disciplina de Engenharia de Software (que interagem com o sistema para validar os critérios de qualidade do código), além do utilizador comum fictício que procura gerenciar as suas tarefas diárias.
* **Frequência de Uso Esperada:** Intermitente e focada em ciclos de desenvolvimento, validação e testes automatizados durante o período letivo.
* **Integrações Externas:** O sistema conecta-se diretamente com o **Google Calendar**, permitindo a sincronização das tarefas criadas na plataforma com a agenda externa do utilizador.
* **Restrições de Domínio e Produto:** O sistema é estritamente guiado por um conjunto de requisitos funcionais e não funcionais previamente definidos pela disciplina. Possui restrições arquiteturais rígidas voltadas para a **manutenibilidade, testabilidade e qualidade**, priorizando o conhecimento ao invés da uma viabilidade comercial ou de larga escala.

---

### 1.3. Instalação

**Pré-requisitos**
- Node.js >= `18.x`
- PostgreSQL >= `14.x`


**Passos**

```bash
git clone https://github.com/ismareis/TaskManager.git
npm install
cp .env.example .env
# Preencha as variáveis de ambiente no arquivo .env
npm run migrate
npm run start
```

## 2. Decisões Arquiteturais

### 2.1. Arquitetura Adotada

O **TaskManager** foi projetado seguindo os princípios da *Clean Architecture* (Arquitetura Limpa), um padrão de design de software que prioriza a separação estrita de preocupações e a independência tecnológica. O objetivo central desta arquitetura é isolar as regras de negócio mais puras do sistema de detalhes operacionais e técnicos, como frameworks web, drivers de bancos de dados e ferramentas de terceiros. Isso garante que a aplicação seja altamente testável, fácil de manter e resiliente a mudanças tecnológicas ao longo do tempo.

O pilar fundamental da Clean Architecture é a **Regra da Dependência**, que estabelece que o código das camadas internas nunca deve conhecer ou depender do código das camadas externas. No TaskManager, isso se traduz em um fluxo onde a camada de Domínio (*Domain*) ocupa o núcleo mais isolado, sendo envolvida pela camada de Aplicação (*Application*), que por sua vez é envolvida pela camada de Infraestrutura (*Infra*). As dependências apontam exclusivamente de fora para dentro, permitindo que a lógica de negócios permaneça intacta mesmo se o banco de dados ou o framework HTTP forem completamente substituídos.

Ao adotar essa estrutura, o projeto resolve problemas comuns do desenvolvimento de software, como o acoplamento excessivo e a dificuldade de escrita de testes unitários. Os casos de uso da aplicação comunicam-se com o mundo externo por meio de interfaces (abstrações), permitindo o uso de inversão de dependência. Como resultado, o TaskManager torna-se um sistema modular, onde cada componente possui uma responsabilidade única, bem definida e isolada de efeitos colaterais externos.

---

### 2.2. Justificativa

A concepção do **TaskManager** foi guiada por decisões estratégicas que visaram alinhar as exigências acadêmicas da disciplina de Engenharia de Software com as melhores práticas de mercado. Abaixo são detalhadas as justificativas para a arquitetura adotada e para a pilha tecnológica escolhida.

---

#### 2.2.1 Justificativa da Abordagem Arquitetural (Clean Architecture)

A opção pela estruturação do sistema em três camadas principais (**Domain, Application e Infra**) baseou-se na necessidade de mitigar o acoplamento e garantir uma separação clara de responsabilidades. Cada camada desempenha um papel estratégico para a sustentabilidade do software:

* **Isolamento do Domínio (*Domain*):** Sendo a camada mais interna, o domínio foi blindado contra qualquer dependência externa (como frameworks ou drivers de banco de dados). Sua responsabilidade limita-se a validar as estruturas das entidades e declarar os erros semânticos do sistema. Esse isolamento garante que alterações em tecnologias de infraestrutura não interfiram nas regras de negócio fundamentais.
* **Orquestração e Fluxo (*Application*):** Através dos Casos de Uso (*Use Cases*), esta camada centraliza a execução do fluxo de negócio com responsabilidade única por função. A decisão de separar a validação estrutural das entidades (feita no *Domain*) da validação baseada em contexto e permissões externas (como checar se um usuário possui perfil de administrador, feita na *Application*) eleva a clareza do código e reduz o acoplamento do sistema.
* **Segregação Tecnológica (*Infra*):** Ao concentrar o Express, o banco de dados, os serviços de terceiros e as ferramentas de testes na camada de Infraestrutura, garante-se que os detalhes de implementação fiquem restritos à periferia do sistema. Por ser a camada com maior acoplamento tecnológico, seu isolamento impede que a volatilidade das ferramentas externas contamine as regras centrais da aplicação.

---

#### 2.2.2. Justificativa da Pilha Tecnológica

A seleção das ferramentas e bibliotecas foi realizada após a análise do escopo do projeto, dos requisitos de engenharia e do perfil técnico da equipe de desenvolvimento.

| Tecnologia / Ferramenta | Opção Adotada | Justificativa da Escolha |
| :--- | :--- | :--- |
| **Ambiente e Framework** | `Node.js` + `Express` | Escolhidos devido à familiaridade prévia de membros da equipe com a plataforma e pela simplicidade do Express no gerenciamento de rotas. Essa combinação permitiu agilidade no desenvolvimento, adequando-se perfeitamente à proposta de escopo do trabalho. |
| **Paradigma do Banco de Dados** | `Banco Relacional` | Deliberado em detrimento do NoSQL. Bancos relacionais são amplamente consolidados no mercado e mostraram-se ideais para o projeto devido ao número reduzido de entidades, que demandavam alta consistência de dados e relacionamentos bem estruturados. |
| **Acesso a Dados** | `Knex.js` + `Mappers` | Avaliou-se o uso de ORMs (como *TypeORM*), porém optou-se pelo construtor de consultas Knex devido à simplicidade das operações de banco necessárias e à natureza não tipada do JavaScript. Para manter a aderência à *Clean Architecture*, implementou-se o padrão **Mapper**, que converte as linhas brutas do banco em instâncias das classes de entidades de domínio. |
| **Garantia de Qualidade** | `Jest` + `SuperTest` | Ferramentas escolhidas para viabilizar a cobertura de testes automatizados (unitários e de integração), permitindo validar de ponta a ponta o comportamento dos casos de uso e a confiabilidade das rotas HTTP da API. |
| **Segurança** | `bcrypt` | Adotado para realizar o hash seguro das senhas dos utilizadores antes do armazenamento no banco de dados, atendendo aos requisitos de qualidade e segurança da aplicação. |

---

### 2.3. Padrões Aplicados

### 2.3. Padrões de Projeto (Design Patterns) Aplicados

Para garantir a sustentabilidade, a testabilidade e o desacoplamento propostos pela arquitetura, o **TaskManager** utiliza padrões de projeto consolidados e conceitos inspirados em *Domain-Driven Design* (DDD). A aplicação destes padrões resolve problemas específicos de isolamento de recursos externos e comunicação entre as camadas.

---

#### **2.3.1. Camada de Domínio (Domain) e Práticas de DDD**

A camada de domínio utiliza padrões táticos do **Domain-Driven Design (DDD)** para garantir que o coração do sistema seja rico, expressivo e auto-validável.

* **Entities (`domain/entities/`):** Representam os objetos centrais do negócio que possuem uma identidade única ao longo do tempo (ex: ID do Usuário ou da Tarefa). Elas encapsulam o estado e contêm as regras de negócio estruturais, garantindo que um objeto nunca fique num estado inválido.
* **Value Objects / Enums (`domain/enums/`):** Centralizam os tipos, categorias e estados do domínio. A utilização de Enums evita o uso de *magic strings* ou números espalhados pelo código, padronizando atributos como o status de uma tarefa.
* **Domain Errors (`domain/errors/`):** Os erros são tratados como cidadãos de primeira classe no domínio. Em vez de lançar strings genéricas ou códigos HTTP (que o domínio desconhece), são criadas classes de erro semânticas e específicas do negócio.

---

#### **2.3.2. Camada de Aplicação (Application)**

* **Use Case Pattern / Command Pattern (`application/use-cases/`):** Cada arquivo nesta pasta encapsula uma única operação ou intenção de negócio (ex: `CriarTarefa.js`). Ele atua como um *Command* ou *Interactor*, seguindo estritamente o Princípio de Responsabilidade Única (SRP) ao ditar o fluxo exato daquela funcionalidade.

---

#### **2.3.3. Camada de Infraestrutura (Infra)**

A camada de Infraestrutura adota padrões de mercado para isolar o ecossistema tecnológico (banco de dados e protocolo HTTP) das regras de negócio.

* **Repository Pattern (`infra/database/repositories/`):** Abstrai completamente o acesso aos dados, funcionando como uma coleção em memória para a aplicação. O *Domain* e a *Application* não sabem (e não precisam saber) se os dados vêm do PostgreSQL, MySQL ou de uma API externa; eles apenas interagem com o repositório.
* **Mapper Pattern (`infra/database/mappers/`):** Responsável por converter os dados entre as duas realidades do sistema. Ele transforma os modelos de persistência (ex: colunas em `snake_case` vindas do banco) em entidades ricas do domínio (em `camelCase`), impedindo que detalhes do banco contaminem o negócio.
* **Middleware Pipeline / Chain of Responsibility (`infra/http/middleware/`):** Implementa o comportamento de uma cadeia de responsabilidades para o protocolo HTTP. Cada middleware (autenticação, logs, validação) processa a requisição sequencialmente. Se um falhar ou barrar o acesso, a corrente é interrompida antes de chegar ao controlador.
* **Query Builder Abstraction (`infra/database/knex/`):** Isola a ferramenta de construção de consultas (Knex.js) em uma camada própria. Esse isolamento delimita as responsabilidades de gerenciamento do esquema, mantendo as pastas de `migrations/` e `seeds/` organizadas e focadas apenas na evolução do banco de dados.

---

### 2.4. Camadas do Projeto

#### **2.4.1. Camada: Domain**
O coração do sistema. Contém a lógica de negócios e as regras mais puras do domínio. É uma camada completamente isolada, que não possui qualquer dependência externa, seja de frameworks, bibliotecas de persistência ou APIs.

- ``entities/``: Classes que representam os conceitos e objetos de negócio centrais (ex: Usuário, Tarefa). Elas encapsulam o estado e o comportamento básico do domínio.

- ``enums/``: Enumeradores globais utilizados pelas entidades para padronizar estados, categorias ou tipos (ex: Status da Tarefa como PENDENTE, CONCLUÍDO).

- ``errors/``: Classes de erro personalizadas e padronizadas do domínio. Permitem que a aplicação lance exceções de negócio claras sem depender de códigos de status HTTP nesta camada.

---

#### **2.4.2. Camada: Application**
Responsável por orquestrar e ditar o comportamento do sistema. Atua como uma ponte intermediária, consumindo as entidades do domínio e definindo o fluxo exato do que deve acontecer em cada funcionalidade.

- ``use-cases/``: Implementação dos casos de uso do sistema (ex: CriarTarefa, AutenticarUsuario). Cada caso de uso representa uma ação que o usuário pode realizar, determinando quais repositórios ou serviços externos devem ser chamados para concluir a operação.

---

#### **2.4.3. Camada: Infra (Infrastructure)**
A camada mais externa da arquitetura. Contém tudo o que dá suporte operacional à aplicação e que interage com o ambiente externo, englobando frameworks, bancos de dados, servidores web e ferramentas de terceiros.

- `services/`: Implementações concretas de integrações com serviços externos. No contexto do projeto, gerencia a comunicação com a API do Google Calendar para sincronização de compromissos e as rotinas de criptografia/emissão de tokens com JWT.

- `database/`: Concentra toda a lógica de persistência e armazenamento de dados.

  - `repositories`: Classes responsáveis por consultas (queries) e operações de leitura/escrita no banco de dados, implementando as interfaces exigidas pelos casos de uso.

  - ``mappers/``: Responsáveis pela conversão de dados. Transformam linhas brutas retornadas do banco de dados em instâncias de entidades do domínio, mantendo as camadas desacopladas.

  - ``knex/``: Configurações específicas do query builder Knex.js.

    - ``migrations/``: Arquivos de histórico e evolução do esquema do banco de dados (criação e alteração de tabelas).

    - ``seeds/``: Dados de exemplo populados no banco para facilitar testes automatizados e validações em ambiente de desenvolvimento.

- ``http/``: Centraliza o protocolo de comunicação da API REST, construído sobre o Express.js.

  - ``middleware/``: Funções de interceptação executadas antes dos controladores, responsáveis por validações prévias como autenticação, autorização e validação de dados.

  - ``controllers/``: Recebem a requisição HTTP, extraem dados (body, params, query), chamam os use cases e retornam respostas formatadas (JSON) ao cliente.

  - ``routes/``: Definição dos endpoints da API, mapeando rotas e métodos HTTP (GET, POST, PUT, DELETE) para seus respectivos controllers e middlewares.  

-----

### 2.5. Visualização das Camadas

---

```text
└── src/
    ├── infra/
    │   ├── services/
    │   ├── database/
    │   │   ├── repositories/
    │   │   ├── mappers/
    │   │   └── knex/
    │   │       ├── migrations/
    │   │       └── seeds/
    │   └── http/
    │       ├── middleware/
    │       ├── controllers/
    │       └── routes/
    ├── domain/
    │   ├── enums/
    │   ├── errors/
    │   └── entities/
    └── application/
        └── use-cases/
```

## 3. Modelagem de Dados

### 3.1. Diagrama

```
┌────────────────────────────────────────┐        ┌────────────────────────────────────────────────┐
│                 users                  │        │                    tasks                       │
├────────────────────────────────────────┤        ├────────────────────────────────────────────────┤
│ id              INTEGER  PK            │        │ id              INTEGER  PK                    │
│ name            VARCHAR(100)           │◄───────│ user_id         INTEGER  FK → users.id         │
│ username        VARCHAR(20)  UNIQUE    │        │ title           VARCHAR(100)                   │
│ password        VARCHAR(255)           │        │ description     VARCHAR(1000)                  │
│ role            VARCHAR(100)           │        │ status          INTEGER                        │
│ access_level    INTEGER                │        │ priority        INTEGER                        │
│ disabled        BOOLEAN  DEFAULT false │        │ due_date        TIMESTAMP                      │
│ token_version   INTEGER  DEFAULT 1     │        │ completion_date TIMESTAMP                      │
│ google_access_token  VARCHAR(512)      │        │ disabled        BOOLEAN  DEFAULT false         │
│ google_refresh_token VARCHAR(512)      │        │ google_event_id VARCHAR                        │
│ google_token_expiry  DATETIME          │        └────────────────────────────────────────────────┘
└────────────────────────────────────────┘
```

---

### 3.2. Descrição das Tabelas


#### **3.2.1 `users`**

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `INTEGER` PK | Identificador único do usuário. |
| `name` | `VARCHAR(100)` | Nome completo do usuário. |
| `username` | `VARCHAR(20)` UNIQUE | Identificador de login. |
| `password` | `VARCHAR(255)` | Hash da senha. |
| `role` | `VARCHAR(100)` | Papel ou cargo do usuário no sistema. |
| `access_level` | `INTEGER` | Nível de acesso; valores controlados pelo enum `AccessLevel`. |
| `disabled` | `BOOLEAN` | Indica se o usuário está desativado. |
| `token_version` | `INTEGER` | Versão do token de autenticação; usada para invalidar sessões. |
| `google_access_token` | `VARCHAR(512)` | Token de acesso OAuth do Google. |
| `google_refresh_token` | `VARCHAR(512)` | Token de renovação OAuth do Google. |
| `google_token_expiry` | `DATETIME` | Data de expiração do token de acesso do Google. |

---

#### **3.2.1. `tasks`**

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `INTEGER` PK | Identificador único da tarefa. |
| `user_id` | `INTEGER` FK | Referência ao usuário dono da tarefa. |
| `title` | `VARCHAR(100)` | Título da tarefa. |
| `description` | `VARCHAR(1000)` | Descrição opcional. |
| `status` | `INTEGER` | Status atual; valores controlados pelo enum `TaskStatus`. |
| `priority` | `INTEGER` | Prioridade; valores controlados pelo enum `TaskPriority`. |
| `due_date` | `TIMESTAMP` | Data limite de conclusão. |
| `completion_date` | `TIMESTAMP` | Data em que a tarefa foi concluída. |
| `disabled` | `BOOLEAN` | Indica se a tarefa foi removida logicamente. |
| `google_event_id` | `VARCHAR` | ID do evento correspondente no Google Calendar. |


## 4. Fluxo de Requisições

> Ver documentação [OpenAPI](OpenAPI.yaml)

Todos os endpoints que exigem autenticação devem incluir o header:

```
Authorization: Bearer <token>
```

Erros seguem o formato padrão:

```json
{
  "message": "Descrição do erro",
  "code": "ERROR_CODE"
}
```

---

### 4.1. Autenticação

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `POST` | `/auth/login` | Autentica o usuário e retorna um JWT. | Não |
| `POST` | `/auth/logout` | Invalida o token da sessão atual. | Sim |

---

#### **4.1.1. POST /auth/login**

Request:
```json
{
  "username": "test_user",
  "password": "123456"
}
```

Response `200`:
```json
{
  "token": "<jwt>"
}
```

Erros: `400` quando `username` ou `password` não são informados. `401` quando as credenciais são inválidas.

---

#### **4.1.2. POST /auth/logout**

Sem body. Invalida o `token_version` do usuário autenticado, tornando o token atual inválido para requisições futuras.

Response `200`:
```json
{
  "message": "Logged out successfully"
}
```

Erros: `401` quando o token não é fornecido ou é inválido. `404` quando o usuário não é encontrado.

---

### 4.2. Google Calendar

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `POST` | `/auth/google/login` | Gera a URL de autenticação OAuth do Google. | Sim |
| `GET` | `/auth/google/callback` | Recebe o código de autorização do Google e salva os tokens. | Não |
| `POST` | `/auth/google/logout` | Remove os tokens do Google Calendar do usuário. | Sim |

---

#### **4.2.1. GET /auth/google/login**

Sem body. Retorna a URL para que o usuário autorize o acesso ao Google Calendar.

Response `200`:
```json
{
  "message": "Access the URL to log into your google account",
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

Erros: `401` quando o token não é fornecido ou é inválido.

---

#### **4.2.2. GET /auth/google/callback**

Chamado automaticamente pelo Google após a autorização do usuário. Não deve ser chamado diretamente.

Query parameters:

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `code` | `string` | Sim | Código de autorização retornado pelo Google. |
| `state` | `string` | Sim | Identificador do usuário autenticado. |

Response `200`: página HTML confirmando a conexão.

Erros: `400` para dados inválidos. `404` quando o usuário não é encontrado.

---

#### **4.2.3. POST /auth/google/logout**

Sem body. Remove os tokens do Google Calendar do usuário autenticado.

Response `200`:
```json
{
  "message": "Logged out successfully"
}
```

Erros: `401` quando o token não é fornecido ou é inválido. `404` quando o usuário não é encontrado.

---

### 4.3. Usuários

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `POST` | `/users` | Cria um novo usuário. | Não |
| `GET` | `/users/:id` | Retorna as informações de um usuário. | Sim |
| `PUT` | `/users/:id` | Atualiza as informações de um usuário. | Sim |
| `DELETE` | `/users/:id` | Remove logicamente um usuário (soft delete). | Sim |

---

#### **4.3.1. POST /users**

Request:
```json
{
  "name": "Test User",
  "username": "test_user",
  "password": "123456",
  "role": "test"
}
```

Campos obrigatórios: `name`, `username`, `password`, `role`.

Response `201`:
```json
{
  "id": 1
}
```

Erros: `400` para dados inválidos. `409` quando o `username` já existe.

---

#### **4.3.2. GET /users/:id**

Response `200`:
```json
{
  "id": 1,
  "username": "test_user",
  "name": "Test User",
  "role": "test",
  "accessLevel": "1 (User)"
}
```

Erros: `400`, `401`, `404`.

---

#### **4.3.3. PUT /users/:id**

Permitido pelo próprio usuário ou por um administrador.

Request:
```json
{
  "name": "Gabriel Pacheco",
  "username": "gabriel.pacheco",
  "role": "developer"
}
```

Todos os campos são opcionais.

Response `200`: mesmo formato de `GET /users/:id`.

Erros: `400`, `401`, `403`, `404`, `409` quando o novo `username` já existe.

---

#### **4.3.4. DELETE /users/:id**

Sem body. Realiza soft delete definindo `disabled = true`.

Response `204`: sem body.

Erros: `400`, `401`, `403`, `404`.

---

### 4.4. Tarefas

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `POST` | `/tasks` | Cria uma nova tarefa. | Sim |
| `GET` | `/tasks` | Lista as tarefas do usuário autenticado com filtros opcionais. | Sim |
| `GET` | `/tasks/:id` | Retorna os detalhes de uma tarefa. | Sim |
| `PUT` | `/tasks/:id` | Atualiza uma tarefa existente. | Sim |
| `DELETE` | `/tasks/:id` | Remove logicamente uma tarefa (soft delete). | Sim |

---

#### **4.4.1. POST /tasks**

Se o usuário tiver o Google Calendar conectado, a API tenta criar um evento correspondente automaticamente.

Request:
```json
{
  "title": "Implement JWT authentication",
  "description": "Create login with token generation and validation",
  "dueDate": "2026-06-20T18:00:00.000Z",
  "priority": 3
}
```

Campos obrigatórios: `title`, `dueDate`. Quando `completionDate` é informado, o `status` é automaticamente definido como `3 (Completed)`.

Valores aceitos para `status`: `1 (Pending)`, `2 (In Progress)`, `3 (Completed)`. Padrão: `1 (Pending)`.

Valores aceitos para `priority`: `1 (Low)`, `2 (Medium)`, `3 (High)`. Padrão: `1 (Low)`.

Response `201`:
```json
{
  "id": 1
}
```

Erros: `400`, `401`.

---

#### **4.4.2. GET /tasks**

Suporta os seguintes query parameters:

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `status` | `string` | Filtra pelo status: `pending`, `in_progress`, `completed`. |
| `priority` | `string` | Filtra pela prioridade: `low`, `medium`, `high`. |
| `dueBefore` | `ISO 8601` | Retorna tarefas com `dueDate` anterior ou igual à data informada. |
| `dueAfter` | `ISO 8601` | Retorna tarefas com `dueDate` posterior ou igual à data informada. |
| `completed` | `boolean` | `true`/`1`/`yes` retorna tarefas concluídas; `false`/`0`/`no`, pendentes. |
| `title` | `string` | Busca parcial e insensível a maiúsculas/minúsculas no título. |
| `sortBy` | `string` | Campo de ordenação: `id`, `title`, `status`, `priority`, `dueDate`, `completionDate`. Padrão: `dueDate`. |
| `order` | `asc` \| `desc` | Direção da ordenação. Padrão: `asc`. |

Exemplo:
```
GET /tasks?status=in_progress&priority=high&dueAfter=2026-06-01&sortBy=title&order=desc
```

Response `200`:
```json
{
  "tasks": [
    {
      "id": 1,
      "userId": 1,
      "title": "Implement JWT authentication",
      "description": "Create login with token generation and validation",
      "dueDate": "2026-06-20T18:00:00.000Z",
      "completionDate": null,
      "priority": "3 (High)",
      "status": "1 (In Progress)"
    }
  ]
}
```

Erros: `400`, `401`.

---

#### **4.4.3. GET /tasks/:id**

Acessível pelo dono da tarefa ou por um administrador.

Response `200`:
```json
{
  "id": 1,
  "userId": 1,
  "title": "Implement JWT authentication",
  "description": "Create login with token generation and validation",
  "dueDate": "2026-06-20T18:00:00.000Z",
  "completionDate": null,
  "priority": "3 (High)",
  "status": "1 (In Progress)"
}
```

Erros: `400`, `401`, `403`, `404`.

---

#### **4.4.4. PUT /tasks/:id**

Permitido pelo dono da tarefa ou por um administrador. Quando `completionDate` é preenchido, o `status` é automaticamente definido como `completed`.

Request:
```json
{
  "title": "Implement JWT authentication",
  "description": "Create login with token generation and validation",
  "status": "in_progress",
  "priority": 3,
  "dueDate": "2026-06-20T18:00:00.000Z"
}
```

Todos os campos são opcionais.

Response `200`: mesmo formato de `GET /tasks/:id`.

Erros: `400`, `401`, `403`, `404`.

---

#### **4.4.5. DELETE /tasks/:id**

Realiza soft delete definindo `disabled = true`. Se a tarefa possuir um evento vinculado no Google Calendar, a API tenta removê-lo automaticamente.

Response `204`: sem body.

Erros: `400`, `401`, `403`, `404`.

---

### 4.5. Códigos de Resposta

| Código | Significado |
|---|---|
| `200` | Requisição bem-sucedida. |
| `201` | Recurso criado com sucesso. |
| `204` | Requisição bem-sucedida sem conteúdo de retorno. |
| `400` | Erro de validação nos dados enviados. |
| `401` | Não autenticado ou credenciais inválidas. |
| `403` | Sem permissão para acessar o recurso. |
| `404` | Recurso não encontrado. |
| `409` | Conflito com dado já existente (ex: `username` duplicado). |
| `500` | Erro interno do servidor. |

---

## 5. Configuração e Deploy

### 5.1. Passo a Passo

#### **1. Clonar e instalar dependências**
```bash
git clone https://github.com/ismareis/TaskManager.git
npm install
```

#### **2. Configurar variáveis de ambiente**
```bash
cp .env.example .env
```
Preencher o `.env` com os valores reais — detalhado na seção de variáveis abaixo.

#### **3. Criar os bancos de dados**

Criar dois bancos no PostgreSQL: um para desenvolvimento e um para testes (o projeto usa `NODE_ENV=test` para alternar).
```sql
CREATE DATABASE taskmanager;
CREATE DATABASE taskmanager_test;
```

#### **4. Rodar as migrations**
```bash
npm run migrate
```

#### **5. (Opcional) Popular o banco com dados iniciais**
```bash
npm run seed
```

#### **6. Iniciar o servidor**
```bash
npm run start
```

---

### 5.2. Google Calendar - Como obter as credenciais

1. Acessar o [Google Cloud Console](https://console.cloud.google.com).
2. Criar um projeto (ou selecionar um existente).
3. Ir em **APIs & Services → Library** e habilitar a **Google Calendar API**.
4. Acessar **APIs & Services → OAuth consent screen**, e você será redirecionado para o Google Auth Platform.
5. Ir em **Visão Geral → Vamos Começar**, e cadastrar as informações de configuração. (Garantir que **Público** esteja como **Externo**)
6. Ir em **Público-alvo → Usuários de Teste**, e cadastrar todos e-mails que vão ser usados na autenticação
7. Acessar **APIs e Serviços → Credenciais → Criar credenciais → ID do cliente OAuth**
8. Selecionar o tipo **Web application** e adicionar a URI de redirecionamento autorizado (ex: `http://localhost:3000/auth/google/callback` em desenvolvimento).
9. Copiar o **Client ID** e o **Client Secret** gerados para o `.env`.

---

### 5.3. Variáveis de ambiente completas

| Variável | Descrição | Exemplo |
|---|---|---|
| `PORT` | Porta do servidor. | `3000` |
| `DB_HOST` | Host do banco de dados. | `localhost` |
| `DB_PORT` | Porta do PostgreSQL. | `5432` |
| `DB_USER` | Usuário do banco. | `postgres` |
| `DB_PASSWORD` | Senha do banco. | — |
| `DB_NAME` | Nome do banco de desenvolvimento. | `taskmanager` |
| `DB_NAME_TEST` | Nome do banco de testes. | `taskmanager_test` |
| `JWT_SECRET` | Segredo para assinatura dos JWTs. | string longa e aleatória |
| `GOOGLE_CLIENT_ID` | Client ID gerado no Google Cloud. | — |
| `GOOGLE_CLIENT_SECRET` | Client Secret gerado no Google Cloud. | — |
| `GOOGLE_REDIRECT_URI` | URI de redirecionamento OAuth. | `http://localhost:3000/auth/google/callback` |

## 6. Testes Automatizados

### 6.1. Estratégia

O projeto adota dois níveis de testes:

#### **6.1.1. Testes Unitários**

Todos os repositórios e serviços externos são substituídos por mocks via `jest.mock()`, de forma que os testes validam exclusivamente o comportamento de cada ferramenta sem dependências de infraestrutura. Foram feitos testes de:

#### Use Cases (`tests/application/use-cases/`):
- `auth/LoginUseCase.test.js`
- `auth/LogOutUseCase.test.js`
- `google/ClearGoogleTokensUseCase.test.js`
- `google/SaveGoogleTokensUseCase.test.js`
- `users/CreateUserUseCase.test.js`
- `users/DeleteUserUseCase.test.js`
- `users/GetUserUseCase.test.js`
- `users/UpdateUserUseCase.test.js`
- `tasks/CreateTaskUseCase.test.js`
- `tasks/DeleteTaskUseCase.test.js`
- `tasks/GetTaskUseCase.test.js`
- `tasks/ListTaskUseCase.test.js`
- `tasks/UpdateTaskUseCase.test.js`

#### Persistência e Funcionamento do BD (`tests/infra/database/`):
- `repositories/TaskRepository.test.js`
- `repositories/UsrRepository.test.js`
- `knex/migrations.test.js`

---

#### **6.1.2. Testes de Integração**

Executam contra um banco de dados PostgreSQL de teste real, garantindo que os repositórios, mappers e migrations funcionam corretamente em conjunto.

Arquivos:
- `UserRepository.test.js`
- `TaskRepository.test.js`
- `AuthController.test.js`

Os testes de integração rodam em série (`--runInBand`) para evitar condições de corrida entre suites que compartilham o mesmo banco.

---

### 6.2. Execução

```bash
# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Todos os testes
npm run test

# Cobertura dos testes
npm run test:coverage
```

---

### 6.3. Cobertura

Métricas obtidas com `npm run test:coverage` (Jest, base: statements/lines):

| Camada | Statements | Branches | Funcs | Lines | 
|---|---|---|---|---| 
| Use Cases | 98.36% | 96.55% | 100% | 99.61% | 
| Repositories | 100% | 100% | 100% | 100% | 
| Entities / Validators | 89.53% | 81.66% | 100% | 89.53% | 
| Controllers | 83.09% | 100% | 78.57% | 83.09% | 
| Middleware | 78.12% | 60% | 80% | 78.12% | 
| Services | 96.49% | 100% | 93.75% | 96.49% | 
| Enums | 100% | 66.66% | 100% | 100% | 
| Errors | 100% | 0% | 100% | 100% | 
| **Total** | **94.67%** | **89.41%** | **93.81%** | **95.68%** | 

---