# ACME Banking

## Description
Domain-Driven Design example using [Nest](https://github.com/nestjs/nest) framework.
Persistence layer is implemented using [TypeORM](https://typeorm.io/) with MySQL Database.

## Installation

```bash
$ npm i -g @nestjs/cli
$ nest --version
$ npm install
```

## Generating the dist folder
```bash
$ npm run build
```
## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
npm i --save @nestjs/testing

# unit tests
$ npm run test
```

## Swagger
```bash
npm install --save @nestjs/swagger
```

## Environment variables

```
ENVIRONMENT
BANKING_DDD_NEST_MYSQL
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
TypeORM is [MIT licensed](https://github.com/typeorm/typeorm/blob/master/LICENSE)


## SYNC (Real-Time 10%) - CONSISTENCIA INMEDIATA - 60-70% Availability
```
BEGIN
1. Crea Transaction - Status 1 (STARTED)
2. Actualiza Account (Saldo)
3. Actualiza Transaction - Status 2 (COMPLETED)
COMMIT
```
## ASYNC (Near Real-Time 90% Casos) - DDD - CONSISTENCIA EVENTUAL - 99% Availability
```
BC Transactions
BEGIN
1. Crea Transaction - Status 1 (STARTED) -> Publica Evento
COMMIT
```
```
BC Accounts
BEGIN (Reacciona al Evento)
2. Actualiza Account (Saldo) -> Ejecutar Command (CompleteTransaction)
COMMIT
```
```
BC Transactions
BEGIN
3. Actualiza Transaction - Status 2 (COMPLETED)
COMMIT
```
### Delay
```
await AppUtil.delay(30000);
```
