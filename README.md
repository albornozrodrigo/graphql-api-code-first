# API NestJS com GraphQL (Code-First)

## Visão Geral

Esta é uma API escalável construída com **NestJS**, utilizando **GraphQL** na abordagem _Code-First_. O projeto serve como um exemplo prático de como estruturar uma aplicação moderna, com foco em performance, boas práticas e testabilidade.

A API utiliza um banco de dados **PostgreSQL** gerenciado pela ORM **TypeORM**, com autenticação baseada em **JWT (JSON Web Tokens)** e otimizações de consulta para resolver o problema N+1 usando **DataLoaders** e análise de **AST (Abstract Syntax Tree)**.

## Tecnologias Principais

- **Framework**: NestJS
- **API**: GraphQL (Apollo Server, Code-First)
- **Banco de Dados**: PostgreSQL
- **ORM**: TypeORM
- **Autenticação**: JWT (JSON Web Tokens)
- **Testes**: Jest para testes unitários
- **Linguagem**: TypeScript

## Arquitetura e Conceitos Chave

### 1. NestJS

O projeto é estruturado em módulos, controladores (resolvers) e serviços, seguindo a arquitetura modular do NestJS. Isso promove uma clara separação de responsabilidades e facilita a manutenção e o crescimento da aplicação. A injeção de dependência é usada extensivamente para gerenciar os serviços e outras dependências, aproveitando o poder do TypeScript.

### 2. GraphQL (Code-First com Apollo)

A abordagem _Code-First_ foi adotada, utilizando **Apollo Server** e o ecossistema NestJS GraphQL. Isso significa que o schema GraphQL é gerado automaticamente a partir de classes e decoradores TypeScript, tornando o código a fonte única de verdade para a definição da API. As vantagens incluem:

- **Consistência de Código**: O schema é derivado diretamente do código TypeScript, garantindo que as definições de tipo e os resolvers estejam sempre sincronizados.
- **Desenvolvimento Ágil**: Permite um desenvolvimento mais rápido, pois não há necessidade de manter um arquivo de schema `.graphql` separado.
- **Tipagem Forte**: Aproveita ao máximo o TypeScript para definir tipos de entrada, objetos e argumentos, proporcionando uma experiência de desenvolvimento robusta e com menos erros.

Os resolvers do NestJS, definidos com decoradores como `@Query`, `@Mutation` e `@ResolveField`, implementam a lógica para cada campo do schema gerado.

### 3. Otimização de Performance

Para garantir que a API seja rápida e eficiente, duas técnicas principais de otimização foram implementadas:

#### a. DataLoader

O padrão **DataLoader** é utilizado para resolver o clássico problema de consulta N+1 em GraphQL. Ele agrupa múltiplas requisições de dados que ocorreriam em um único ciclo de eventos em uma única consulta ao banco de dados.

No projeto, o `PostLoader` (por `tagId` e `userId`) são exemplos claros dessa implementação. Eles recebem uma lista de IDs, buscam todas as tags correspondentes de uma só vez e as distribuem de volta para os resolvers corretos.

#### b. Análise de AST (Abstract Syntax Tree)

Para evitar a busca de dados desnecessários no banco de dados (_over-fetching_), a API analisa a Árvore de Sintaxe Abstrata (AST) da consulta GraphQL.

A função utilitária `getAttributes` inspeciona o objeto `GraphQLResolveInfo` para determinar exatamente quais campos foram solicitados pelo cliente. Apenas esses campos são incluídos na consulta ao banco de dados feita pelo TypeORM, resultando em queries mais leves e eficientes.

### 4. Banco de Dados e ORM (Postgres & TypeORM)

O **PostgreSQL** foi escolhido como o banco de dados relacional, e o **TypeORM** atua como a camada de ORM (Object-Relational Mapping). O TypeORM facilita a definição de entidades, a execução de migrações e a interação com o banco de dados de forma segura e produtiva, usando objetos e métodos TypeScript em vez de SQL bruto.

### 5. Autenticação com JWT e Autorização Baseada em Papéis (Role-Based Authorization)

A segurança das rotas que exigem autenticação é garantida por meio de JSON Web Tokens (JWT). Além disso, a API implementa **Autorização Baseada em Papéis (Role-Based Authorization - RBA)** para controlar o acesso a recursos específicos. O fluxo geral é:

1. O usuário faz login com suas credenciais.
2. A API valida as credenciais e gera um token JWT assinado, contendo informações do usuário (como o `userId` e seus `roles`).
3. O cliente armazena o token e o envia no cabeçalho `Authorization` de cada requisição subsequente.
4. Um `Guard` do NestJS intercepta as requisições, valida o token e anexa os dados do usuário (payload) ao objeto da requisição.
5. Os `Guards` e `Decorators` personalizados verificam os `roles` do usuário na requisição para autorizar ou negar o acesso a resolvers ou campos específicos (ex: verificar se o usuário tem permissão para editar ou deletar um comentário).

### 6. Testes Unitários

O projeto possui uma suíte de testes unitários construída com **Jest**. Os testes focam em isolar e validar a lógica de negócio nos serviços e a correta implementação dos `DataLoaders`, utilizando mocks para simular dependências como serviços e o banco de dados. Isso garante que novas alterações não quebrem a funcionalidade existente.

## Como Executar

1.  **Configurar Variáveis de Ambiente**
    Crie um arquivo `.env` na raiz do projeto a partir do `.env.example` e preencha as variáveis necessárias (banco de dados, segredo do JWT, etc.).

2.  **Instalar Dependências**

    ```bash
    pnpm install
    ```

3.  **Executar a Aplicação**
    ```bash
    pnpm start:dev
    ```

A API estará disponível em `http://localhost:3000/graphql`.

## Executando os Testes

Para rodar a suíte de testes unitários, execute:

```bash
npm test
```

Para ver a cobertura de testes:

```bash
npm run test:cov
```
