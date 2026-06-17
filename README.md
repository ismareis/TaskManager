# Project Documentation - TaskManager

> Also available in [Portuguese (pt-BR)](docs/README_pt.md)

## Table of Contents

<details>
<summary><b>1. Overview</b></summary>

- [1.1. System Purpose](#11-system-purpose)
- [1.2. Usage Context](#12-usage-context)
- [1.3. Installation](#13-installation)

</details>

<details>
<summary><b>2. Architectural Decisions</b></summary>

- [2.1. Adopted Architecture](#21-adopted-architecture)
- [2.2. Rationale](#22-rationale)
  - [2.2.1. Architectural Approach Rationale (Clean Architecture)](#221-architectural-approach-rationale-clean-architecture)
  - [2.2.2. Technology Stack Rationale](#222-technology-stack-rationale)
- [2.3. Applied Patterns](#23-applied-patterns)
  - [2.3.1. Domain Layer and DDD Practices](#231-domain-layer-and-ddd-practices)
  - [2.3.2. Application Layer](#232-application-layer)
  - [2.3.3. Infrastructure Layer (Infra)](#233-infrastructure-layer-infra)
- [2.4. Project Layers](#24-project-layers)
  - [2.4.1. Layer: Domain](#241-layer-domain)
  - [2.4.2. Layer: Application](#242-layer-application)
  - [2.4.3. Layer: Infra (Infrastructure)](#243-layer-infra-infrastructure)
- [2.5. Layer Visualization](#25-layer-visualization)

</details>

<details>
<summary><b>3. Data Modeling</b></summary>

- [3.1. Diagram](#31-diagram)
- [3.2. Table Descriptions](#32-table-descriptions)
  - [3.2.1. users](#321-users)
  - [3.2.1. tasks](#321-tasks)

</details>

<details>
<summary><b>4. Request Flow</b></summary>

- [4.1. Authentication](#41-authentication)
  - [4.1.1. POST /auth/login](#411-post-authlogin)
  - [4.1.2. POST /auth/logout](#412-post-authlogout)

- [4.2. Google Calendar](#42-google-calendar)
  - [4.2.1. GET /auth/google/login](#421-get-authgooglelogin)
  - [4.2.2. GET /auth/google/callback](#422-get-authgooglecallback)
  - [4.2.3. POST /auth/google/logout](#423-post-authgooglelogout)

- [4.3. Users](#43-users)
  - [4.3.1. POST /users](#431-post-users)
  - [4.3.2. GET /users/:id](#432-get-usersid)
  - [4.3.3. PUT /users/:id](#433-put-usersid)
  - [4.3.4. DELETE /users/:id](#434-delete-usersid)

- [4.4. Tasks](#44-tasks)
  - [4.4.1. POST /tasks](#441-post-tasks)
  - [4.4.2. GET /tasks](#442-get-tasks)
  - [4.4.3. GET /tasks/:id](#443-get-tasksid)
  - [4.4.4. PUT /tasks/:id](#444-put-tasksid)
  - [4.4.5. DELETE /tasks/:id](#445-delete-tasksid)

- [4.5. Response Codes](#45-response-codes)

</details>

<details>
<summary><b>5. Configuration and Deployment</b></summary>

- [5.1. Step by Step](#51-step-by-step)
- [5.2. Google Calendar - How to obtain credentials](#52-google-calendar---how-to-obtain-credentials)
- [5.3. Complete environment variables](#53-complete-environment-variables)

</details>

<details>
<summary><b>6. Automated Testing</b></summary>

- [6.1. Strategy](#61-strategy)
  - [6.1.1. Unit Tests](#611-unit-tests)
  - [6.1.2. Integration Tests](#612-integration-tests)
- [6.2. Execution](#62-execution)
- [6.3. Coverage](#63-coverage)

</details>

## 1. Overview


### 1.1. System Purpose

**TaskManager** is a task management application developed as a practical project for a Software Engineering course. Its core purpose is not to operate in a real production scenario, but to serve as a hands-on platform for applying and demonstrating concepts of **software architecture, REST API development, and quality assurance**.

To achieve this goal, the system addresses the problem of routine organization by delivering the following core features:
* **Access Control:** User registration and secure authentication.
* **Task and User CRUD:** Creating, reading, updating, and deleting activities and users.
* **Organization:** Task filtering and sorting mechanisms.
* **External Synchronization:** Integration of tasks with Google Calendar for appointment management.

From a technical and educational standpoint, the system aims to demonstrate students' ability to implement industry best practices, such as layered organization, separation of concerns, route standardization, error handling, and high automated test coverage.

---

### 1.2. Usage Context

**TaskManager** operates in a controlled, academic environment, structured around the following usage and operational characteristics:

* **End User Type:** Students and evaluators of the Software Engineering course (who interact with the system to validate code quality criteria), as well as a fictional everyday user looking to manage their daily tasks.
* **Expected Usage Frequency:** Intermittent and focused on development, validation, and automated testing cycles during the academic period.
* **External Integrations:** The system connects directly with **Google Calendar**, allowing tasks created on the platform to be synced with the user's external calendar.
* **Domain and Product Constraints:** The system is strictly guided by a set of functional and non-functional requirements previously defined by the course. It has rigid architectural constraints focused on **maintainability, testability, and quality**, prioritizing learning over commercial viability or large-scale deployment.

---

### 1.3. Installation

**Prerequisites**
- Node.js >= `18.x`
- PostgreSQL >= `14.x`

> Check out the step by step guide [here](#51-step-by-step)

## 2. Architectural Decisions

### 2.1. Adopted Architecture

**TaskManager** was designed following the principles of *Clean Architecture*, a software design pattern that prioritizes strict separation of concerns and technological independence. The central goal of this architecture is to isolate the system's purest business rules from operational and technical details such as web frameworks, database drivers, and third-party tools. This ensures the application is highly testable, easy to maintain, and resilient to technological changes over time.

The fundamental pillar of Clean Architecture is the **Dependency Rule**, which establishes that inner layer code must never know or depend on outer layer code. In TaskManager, this translates into a flow where the Domain layer occupies the most isolated core, wrapped by the Application layer, which in turn is wrapped by the Infrastructure (Infra) layer. Dependencies point exclusively from the outside in, allowing business logic to remain intact even if the database or HTTP framework are completely replaced.

By adopting this structure, the project solves common software development problems such as excessive coupling and difficulty writing unit tests. The application's use cases communicate with the outside world through interfaces (abstractions), enabling the use of dependency inversion. As a result, TaskManager becomes a modular system where each component has a single, well-defined responsibility, isolated from external side effects.

---

### 2.2. Rationale

The design of **TaskManager** was guided by strategic decisions aimed at aligning the academic requirements of the Software Engineering course with industry best practices. Below are the justifications for the adopted architecture and the chosen technology stack.

---

#### 2.2.1 Architectural Approach Rationale (Clean Architecture)

The decision to structure the system into three main layers (**Domain, Application, and Infra**) was based on the need to reduce coupling and ensure a clear separation of responsibilities. Each layer plays a strategic role in the software's sustainability:

* **Domain Isolation (*Domain*):** As the innermost layer, the domain is shielded from any external dependency (such as frameworks or database drivers). Its responsibility is limited to validating entity structures and declaring the system's semantic errors. This isolation ensures that changes in infrastructure technologies do not interfere with the fundamental business rules.
* **Orchestration and Flow (*Application*):** Through Use Cases, this layer centralizes the execution of the business flow with single responsibility per function. The decision to separate structural entity validation (done in the *Domain*) from context- and permission-based validation (such as checking whether a user has admin privileges, done in the *Application*) improves code clarity and reduces system coupling.
* **Technological Segregation (*Infra*):** By concentrating Express, the database, third-party services, and testing tools in the Infrastructure layer, implementation details are kept at the system's periphery. As the layer with the highest technological coupling, its isolation prevents the volatility of external tools from contaminating the application's core rules.

---

#### 2.2.2. Technology Stack Rationale

The selection of tools and libraries was made after analyzing the project's scope, engineering requirements, and the development team's technical profile.

| Technology / Tool | Chosen Option | Rationale |
| :--- | :--- | :--- |
| **Environment and Framework** | `Node.js` + `Express` | Chosen due to team members' prior familiarity with the platform and Express's simplicity in route management. This combination enabled agile development, perfectly suited to the project's scope. |
| **Database Paradigm** | `Relational Database` | Chosen over NoSQL. Relational databases are widely established in the industry and proved ideal for this project due to its small number of entities, which required high data consistency and well-structured relationships. |
| **Data Access** | `Knex.js` + `Mappers` | ORMs (such as *TypeORM*) were evaluated, but the Knex query builder was chosen due to the simplicity of the required database operations and the untyped nature of JavaScript. To maintain adherence to *Clean Architecture*, the **Mapper** pattern was implemented to convert raw database rows into domain entity class instances. |
| **Quality Assurance** | `Jest` + `SuperTest` | Tools chosen to enable automated test coverage (unit and integration), allowing end-to-end validation of use case behavior and the reliability of the API's HTTP routes. |
| **Security** | `bcrypt` | Adopted to securely hash user passwords before storage in the database, meeting the application's quality and security requirements. |
| **Logging** | `winston` | Selected due to its support for multiple simultaneous transports, enabling the separation of log records according to severity levels and facilitating monitoring and troubleshooting activities. |

---

### 2.3. Applied Patterns

### 2.3. Applied Design Patterns

To ensure the sustainability, testability, and decoupling proposed by the architecture, **TaskManager** uses established design patterns and concepts inspired by *Domain-Driven Design* (DDD). These patterns solve specific problems around isolating external resources and communication between layers.

---

#### **2.3.1. Domain Layer and DDD Practices**

The domain layer uses tactical **Domain-Driven Design (DDD)** patterns to ensure the system's core is rich, expressive, and self-validating.

* **Entities (`domain/entities/`):** Represent the central business objects that have a unique identity over time (e.g., User or Task ID). They encapsulate state and contain structural business rules, ensuring an object never enters an invalid state.
* **Value Objects / Enums (`domain/enums/`):** Centralize the domain's types, categories, and states. Using Enums avoids magic strings or numbers scattered throughout the code, standardizing attributes such as a task's status.
* **Domain Errors (`domain/errors/`):** Errors are treated as first-class citizens in the domain. Instead of throwing generic strings or HTTP codes (which the domain knows nothing about), semantic, business-specific error classes are created.

---

#### **2.3.2. Application Layer**

* **Use Case Pattern / Command Pattern (`application/use-cases/`):** Each file in this folder encapsulates a single business operation or intent (e.g., `CreateTask.js`). It acts as a *Command* or *Interactor*, strictly following the Single Responsibility Principle (SRP) by dictating the exact flow for that feature.

---

#### **2.3.3. Infrastructure Layer (Infra)**

The Infrastructure layer adopts industry patterns to isolate the technological ecosystem (database and HTTP protocol) from the business rules.

* **Repository Pattern (`infra/database/repositories/`):** Completely abstracts data access, acting as an in-memory collection for the application. The *Domain* and *Application* do not know (and do not need to know) whether data comes from PostgreSQL, MySQL, or an external API; they simply interact with the repository.
* **Mapper Pattern (`infra/database/mappers/`):** Responsible for converting data between the system's two realities. It transforms persistence models (e.g., `snake_case` columns from the database) into rich domain entities (in `camelCase`), preventing database details from leaking into the business logic.
* **Middleware Pipeline / Chain of Responsibility (`infra/http/middleware/`):** Implements chain-of-responsibility behavior for the HTTP protocol. Each middleware (authentication, logging, validation) processes the request sequentially. If one fails or blocks access, the chain is interrupted before reaching the controller.
* **Query Builder Abstraction (`infra/database/knex/`):** Isolates the query builder tool (Knex.js) in its own layer. This isolation delimits schema management responsibilities, keeping the `migrations/` and `seeds/` folders organized and focused solely on the database's evolution.

---

### 2.4. Project Layers

#### **2.4.1. Layer: Domain**
The heart of the system. Contains the purest business logic and domain rules. It is a completely isolated layer with no external dependencies — no frameworks, persistence libraries, or APIs.

- ``entities/``: Classes representing the core business concepts and objects (e.g., User, Task). They encapsulate the domain's state and basic behavior.

- ``enums/``: Global enumerators used by entities to standardize states, categories, or types (e.g., Task Status as PENDING, COMPLETED).

- ``errors/``: Standardized, custom domain error classes. They allow the application to throw clear business exceptions without relying on HTTP status codes in this layer.

---

#### **2.4.2. Layer: Application**
Responsible for orchestrating and dictating the system's behavior. Acts as an intermediary bridge, consuming domain entities and defining the exact flow of what should happen for each feature.

- ``use-cases/``: Implementation of the system's use cases (e.g., CreateTask, AuthenticateUser). Each use case represents an action the user can perform, determining which repositories or external services must be called to complete the operation.

---

#### **2.4.3. Layer: Infra (Infrastructure)**
The outermost layer of the architecture. Contains everything that provides operational support to the application and interacts with the external environment, including frameworks, databases, web servers, and third-party tools.

- `services`/: Concrete implementations of integrations with external services.

  - `GoogleCalendarService.js`: Manages communication with the Google Calendar API, including the creation and deletion of events synchronized with the application's tasks.

  - `JwtService.js`: Responsible for issuing and validating JWT tokens used for user authentication.

  - `PasswordHasher.js`: Encapsulates password hashing and comparison routines using bcrypt, ensuring that credentials are never stored in plain text.

  - `LoggerService.js`: Centralizes all application instrumentation using winston. It records requests and errors in three separate files within the logs/ directory: combined.log (all events), errors.log (domain errors), and bugs.log (internal server errors, HTTP status 500).

- `database/`: Concentrates all persistence and data storage logic.

  - `repositories`: Classes responsible for queries and read/write operations on the database, implementing the interfaces required by the use cases.

  - ``mappers/``: Responsible for data conversion. They transform raw rows returned from the database into domain entity instances, keeping the layers decoupled.

  - ``knex/``: Knex.js query builder-specific configurations.

    - ``migrations/``: Files recording the history and evolution of the database schema (table creation and alteration).

    - ``seeds/``: Sample data populated in the database to facilitate automated testing and validation in the development environment.

- ``http/``: Centralizes the REST API communication protocol, built on top of Express.js.

  - ``middleware/``: Interception functions executed before controllers, responsible for prior validations such as authentication, authorization, and data validation.

  - ``controllers/``: Receive the HTTP request, extract data (body, params, query), call the use cases, and return formatted (JSON) responses to the client.

  - ``routes/``: Definition of API endpoints, mapping routes and HTTP methods (GET, POST, PUT, DELETE) to their respective controllers and middlewares.

-----

### 2.5. Layer Visualization

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

## 3. Data Modeling

### 3.1. Diagram

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

### 3.2. Table Descriptions


#### **3.2.1 `users`**

| Column | Type | Description |
|---|---|---|
| `id` | `INTEGER` PK | Unique user identifier. |
| `name` | `VARCHAR(100)` | User's full name. |
| `username` | `VARCHAR(20)` UNIQUE | Login identifier. |
| `password` | `VARCHAR(255)` | Password hash. |
| `role` | `VARCHAR(100)` | User's role or position in the system. |
| `access_level` | `INTEGER` | Access level; values controlled by the `AccessLevel` enum. |
| `disabled` | `BOOLEAN` | Indicates whether the user is deactivated. |
| `token_version` | `INTEGER` | Authentication token version; used to invalidate sessions. |
| `google_access_token` | `VARCHAR(512)` | Google OAuth access token. |
| `google_refresh_token` | `VARCHAR(512)` | Google OAuth refresh token. |
| `google_token_expiry` | `DATETIME` | Expiration date of the Google access token. |

---

#### **3.2.1. `tasks`**

| Column | Type | Description |
|---|---|---|
| `id` | `INTEGER` PK | Unique task identifier. |
| `user_id` | `INTEGER` FK | Reference to the task's owner user. |
| `title` | `VARCHAR(100)` | Task title. |
| `description` | `VARCHAR(1000)` | Optional description. |
| `status` | `INTEGER` | Current status; values controlled by the `TaskStatus` enum. |
| `priority` | `INTEGER` | Priority; values controlled by the `TaskPriority` enum. |
| `due_date` | `TIMESTAMP` | Deadline for completion. |
| `completion_date` | `TIMESTAMP` | Date the task was completed. |
| `disabled` | `BOOLEAN` | Indicates whether the task has been logically deleted. |
| `google_event_id` | `VARCHAR` | ID of the corresponding event in Google Calendar. |


## 4. Request Flow

> See [OpenAPI](docs/OpenAPI.yaml) documentation

All endpoints that require authentication must include the header:

```
Authorization: Bearer <token>
```

Errors follow the standard format:

```json
{
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

---

### 4.1. Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/login` | Authenticates the user and returns a JWT. | No |
| `POST` | `/auth/logout` | Invalidates the current session token. | Yes |

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

Errors: `400` when `username` or `password` are not provided. `401` when credentials are invalid.

---

#### **4.1.2. POST /auth/logout**

No body. Invalidates the authenticated user's `token_version`, making the current token invalid for future requests.

Response `200`:
```json
{
  "message": "Logged out successfully"
}
```

Errors: `401` when token is not provided or is invalid. `404` when user is not found.

---

### 4.2. Google Calendar

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/google/login` | Generates the Google OAuth authentication URL. | Yes |
| `GET` | `/auth/google/callback` | Receives the authorization code from Google and saves the tokens. | No |
| `POST` | `/auth/google/logout` | Removes the user's Google Calendar tokens. | Yes |

---

#### **4.2.1. GET /auth/google/login**

No body. Returns the URL for the user to authorize access to Google Calendar.

Response `200`:
```json
{
  "message": "Access the URL to log into your google account",
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

Errors: `401` when token is not provided or is invalid.

---

#### **4.2.2. GET /auth/google/callback**

Called automatically by Google after user authorization. Should not be called directly.

Query parameters:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `code` | `string` | Yes | Authorization code returned by Google. |
| `state` | `string` | Yes | Identifier of the authenticated user. |

Response `200`: HTML page confirming the connection.

Errors: `400` for invalid data. `404` when user is not found.

---

#### **4.2.3. POST /auth/google/logout**

No body. Removes the Google Calendar tokens from the authenticated user.

Response `200`:
```json
{
  "message": "Logged out successfully"
}
```

Errors: `401` when token is not provided or is invalid. `404` when user is not found.

---

### 4.3. Users

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/users` | Creates a new user. | No |
| `GET` | `/users/:id` | Returns a user's information. | Yes |
| `PUT` | `/users/:id` | Updates a user's information. | Yes |
| `DELETE` | `/users/:id` | Logically removes a user (soft delete). | Yes |

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

Required fields: `name`, `username`, `password`, `role`.

Response `201`:
```json
{
  "id": 1
}
```

Errors: `400` for invalid data. `409` when the `username` already exists.

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

Errors: `400`, `401`, `404`.

---

#### **4.3.3. PUT /users/:id**

Allowed by the user themselves or by an administrator.

Request:
```json
{
  "name": "Gabriel Pacheco",
  "username": "gabriel.pacheco",
  "role": "developer"
}
```

All fields are optional.

Response `200`: same format as `GET /users/:id`.

Errors: `400`, `401`, `403`, `404`, `409` when the new `username` already exists.

---

#### **4.3.4. DELETE /users/:id**

No body. Performs a soft delete by setting `disabled = true`.

Response `204`: no body.

Errors: `400`, `401`, `403`, `404`.

---

### 4.4. Tasks

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/tasks` | Creates a new task. | Yes |
| `GET` | `/tasks` | Lists the authenticated user's tasks with optional filters. | Yes |
| `GET` | `/tasks/:id` | Returns the details of a task. | Yes |
| `PUT` | `/tasks/:id` | Updates an existing task. | Yes |
| `DELETE` | `/tasks/:id` | Logically removes a task (soft delete). | Yes |

---

#### **4.4.1. POST /tasks**

If the user has Google Calendar connected, the API automatically attempts to create a corresponding event.

Request:
```json
{
  "title": "Implement JWT authentication",
  "description": "Create login with token generation and validation",
  "dueDate": "2026-06-20T18:00:00.000Z",
  "priority": 3
}
```

Required fields: `title`, `dueDate`. When `completionDate` is provided, `status` is automatically set to `3 (Completed)`.

Accepted values for `status`: `1 (Pending)`, `2 (In Progress)`, `3 (Completed)`. Default: `1 (Pending)`.

Accepted values for `priority`: `1 (Low)`, `2 (Medium)`, `3 (High)`. Default: `1 (Low)`.

Response `201`:
```json
{
  "id": 1
}
```

Errors: `400`, `401`.

---

#### **4.4.2. GET /tasks**

Supports the following query parameters:

| Parameter | Type | Description |
|---|---|---|
| `status` | `string` | Filter by status: `pending`, `in_progress`, `completed`. |
| `priority` | `string` | Filter by priority: `low`, `medium`, `high`. |
| `dueBefore` | `ISO 8601` | Returns tasks with `dueDate` on or before the given date. |
| `dueAfter` | `ISO 8601` | Returns tasks with `dueDate` on or after the given date. |
| `completed` | `boolean` | `true`/`1`/`yes` returns completed tasks; `false`/`0`/`no` returns pending ones. |
| `title` | `string` | Case-insensitive partial search on the title. |
| `sortBy` | `string` | Sort field: `id`, `title`, `status`, `priority`, `dueDate`, `completionDate`. Default: `dueDate`. |
| `order` | `asc` \| `desc` | Sort direction. Default: `asc`. |

Example:
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

Errors: `400`, `401`.

---

#### **4.4.3. GET /tasks/:id**

Accessible by the task's owner or by an administrator.

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

Errors: `400`, `401`, `403`, `404`.

---

#### **4.4.4. PUT /tasks/:id**

Allowed by the task's owner or by an administrator. When `completionDate` is filled in, `status` is automatically set to `completed`.

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

All fields are optional.

Response `200`: same format as `GET /tasks/:id`.

Errors: `400`, `401`, `403`, `404`.

---

#### **4.4.5. DELETE /tasks/:id**

Performs a soft delete by setting `disabled = true`. If the task has a linked event in Google Calendar, the API automatically attempts to remove it.

Response `204`: no body.

Errors: `400`, `401`, `403`, `404`.

---

### 4.5. Response Codes

| Code | Meaning |
|---|---|
| `200` | Successful request. |
| `201` | Resource created successfully. |
| `204` | Successful request with no response body. |
| `400` | Validation error in the submitted data. |
| `401` | Unauthenticated or invalid credentials. |
| `403` | No permission to access the resource. |
| `404` | Resource not found. |
| `409` | Conflict with existing data (e.g., duplicate `username`). |
| `500` | Internal server error. |

---

## 5. Configuration and Deployment

### 5.1. Step by Step

#### **1. Clone and install dependencies**
```bash
git clone https://github.com/ismareis/TaskManager.git
npm install
```

#### **2. Configure environment variables**
```bash
cp .env.example .env
```
Fill in the `.env` with the actual values — detailed in the variables section below.

#### **3. Create the databases**

Create two databases in PostgreSQL: one for development and one for testing (the project uses `NODE_ENV=test` to switch between them).
```sql
CREATE DATABASE taskmanager;
CREATE DATABASE taskmanager_test;
```

#### **4. Run the migrations**
```bash
npm run migrate
```

#### **5. (Optional) Seed the database with initial data**
```bash
npm run seed
```

#### **6. Start the server**
```bash
npm run start
```

---

### 5.2. Google Calendar - How to obtain credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Create a project (or select an existing one).
3. Navigate to **APIs & Services → Library** and enable the **Google Calendar API**.
4. Go to **APIs & Services → OAuth consent screen**, and you will be redirected to the Google Auth Platform.
5. Go to **Overview → Get Started**, and fill in the configuration information. (Ensure **Audience** is set to **External**)
6. Go to **Audience → Test Users**, and register all email addresses that will be used for authentication.
7. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
8. Select **Web application** as the type and add the authorized redirect URI (e.g., `http://localhost:3000/auth/google/callback` in development).
9. Copy the generated **Client ID** and **Client Secret** into the `.env` file.

---

### 5.3. Complete environment variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port. | `3000` |
| `DB_HOST` | Database host. | `localhost` |
| `DB_PORT` | PostgreSQL port. | `5432` |
| `DB_USER` | Database user. | `postgres` |
| `DB_PASSWORD` | Database password. | — |
| `DB_DATABASE` | Development database name. | `taskmanager` |
| `DB_DATABASE_TEST` | Test database name. | `taskmanager_test` |
| `JWT_SECRET` | Secret for signing JWTs. | long random string |
| `GOOGLE_CLIENT_ID` | Client ID generated in Google Cloud. | — |
| `GOOGLE_CLIENT_SECRET` | Client Secret generated in Google Cloud. | — |

## 6. Automated Testing

### 6.1. Strategy

The project adopts two levels of testing:

#### **6.1.1. Unit Tests**

All repositories and external services are replaced with mocks via `jest.mock()`, so that tests exclusively validate the behavior of each component without infrastructure dependencies. Tests were written for:

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

#### Database Persistence and Functionality (`tests/infra/database/`):
- `repositories/TaskRepository.test.js`
- `repositories/UsrRepository.test.js`
- `knex/migrations.test.js`

---

#### **6.1.2. Integration Tests**

Run against a real PostgreSQL test database, ensuring that repositories, mappers, and migrations work correctly together.

Files:
- `UserRepository.test.js`
- `TaskRepository.test.js`
- `AuthController.test.js`

Integration tests run in series (`--runInBand`) to avoid race conditions between suites that share the same database.

---

### 6.2. Execution

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# All tests
npm run test

# Test coverage
npm run test:coverage
```

---

### 6.3. Coverage

Metrics obtained with `npm run test:coverage` (Jest, base: statements/lines):

| Layer | Statements | Branches | Funcs | Lines | 
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