# Banking DDD Scratch

## Description
Domain-Driven Design example using [Nest](https://github.com/nestjs/nest) framework.
Persistence layer is implemented using [TypeORM](https://typeorm.io/) with MySQL Database.

## Install NodeJS (LTS version)
- https://nodejs.org/en/download
```
$ node --version
$ npm --version
```

## Install NestJS
- https://nestjs.com
- https://es.stackoverflow.com/questions/321611/problema-con-scripts-en-visual-studio-code
```
$ npm i -g @nestjs/cli
$ nest --version
```

## Install MySQL 8 (MSI)
- https://dev.mysql.com/downloads/mysql
- https://dev.mysql.com/get/Downloads/MySQLInstaller/mysql-installer-community-8.0.31.0.msi

- https://www.mysql.com/products/workbench
- https://dev.mysql.com/get/Downloads/MySQLGUITools/mysql-workbench-community-8.0.31-winx64.msi

## Other Requisites
- https://www.postman.com/downloads
- https://git-scm.com/downloads
- https://desktop.github.com

## Go to workspace
```
$ cd documents/workspace-upc
```


## Create a new app
```
$ nest new banking-ddd-scratch
```

## Run app
```
$ npm run start:dev
```

## Test app
- http://localhost:3000

## Install Dependencies
```
$ npm i --save typeorm mysql2 node-sql-reader @nestjs/typeorm @nestjs/cqrs
```

## package.json so far
```
"dependencies": {
    "@nestjs/common": "^9.0.0",
    "@nestjs/core": "^9.0.0",
    "@nestjs/cqrs": "^9.0.1",
    "@nestjs/platform-express": "^9.0.0",
    "@nestjs/typeorm": "^9.0.1",
    "mysql2": "^2.3.3",
    "node-sql-reader": "^0.1.3",
    "reflect-metadata": "^0.1.13",
    "rimraf": "^3.0.2",
    "rxjs": "^7.2.0",
    "typeorm": "^0.3.10"
},
```

## Install Dev Dependencies
```
$ npm i --save-dev npm-run-all
```

## package.json so far
```
"devDependencies": {
    ...,
    "npm-run-all": "^4.1.5",
    ...
  },
```

## Scripts at package.json
Add typeorm command under scripts section in package.json
```
"scripts": {
    ...,
    "typeorm": "typeorm-ts-node-commonjs"
}
```

## Create migrations folder
```
src/shared/infrastructure/persistence/migrations
```

## Setup database connection at app.module.ts file inside imports section
```
imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      url: 'mysql://root:root@localhost:3306/banking-ddd-scratch',
      migrationsRun: true,
      logging: true,
      timezone: '+00:00',
      bigNumberStrings: false,
      entities: [
        'dist/**/infrastructure/persistence/entities/*{.ts,.js}'
      ],
      subscribers: [],
      migrations: [
        'dist/shared/infrastructure/persistence/migrations/*{.ts,.js}'
      ],
      migrationsTableName: "migrations"
    })
],
```
## Import TypeOrmModule package at app.module.ts file
```
import { TypeOrmModule } from '@nestjs/typeorm';
```

## Create Database
```
banking-ddd-scratch
```

## Migrations

```
$ npm run typeorm migration:create ./src/shared/infrastructure/persistence/migrations/InitialSchema
$ npm run typeorm migration:create ./src/shared/infrastructure/persistence/migrations/MasterData
```

```
public async up(queryRunner: QueryRunner): Promise<void> {
    const folder = __dirname;
    const path = folder + '/initial-schema.sql';
    let queries = SqlReader.readSqlFile(path);
    for (let query of queries) {
        await queryRunner.query(query);
    }
}
```
## Scripts at package.json
Add the following commands under scripts section in package.json (not include build command)
```
"scripts": {
    ...,
    "copy:package": "node -e \"require('fs').copyFile('./package.json', './dist/package.json', function(err) { if (err) console.log(err); else console.log('package.json copied!') })\"",
    "copy:initial-schema": "node -e \"require('fs').copyFile('src/shared/infrastructure/persistence/migrations/initial-schema.sql', './dist/shared/infrastructure/persistence/migrations/initial-schema.sql', function(err) { if (err) console.log(err); else console.log('initial-schema.sql copied!') })\"",
    "copy:master-data": "node -e \"require('fs').copyFile('src/shared/infrastructure/persistence/migrations/master-data.sql', './dist/shared/infrastructure/persistence/migrations/master-data.sql', function(err) { if (err) console.log(err); else console.log('master-data.sql copied!') })\"",
    "build": "nest build",
    "postbuild": "run-p copy:package copy:initial-schema copy:master-data",
}
```

## Run app in dev mode
```
$ npm run build
$ npm run start:dev
```

## Install Dependencies

```
$ npm i --save typescript-result moment-timezone
```

## Create a clients module

```
$ nest g resource clients
```

## Modify clients module to align with DDD layers

```
- domain (aggregates, events, services)
- interface (rest)
- application (services, dtos, mappers, validators, messages, handlers)
- infrastructure (persistence)
```

## Create the following root entities(client.root.entity.ts, person.entity.ts, company.entity.ts), value objects (client-id.value.ts), enums(client-type.enum.ts) inside client aggregate in clients context

```
import { AggregateRoot } from '@nestjs/cqrs';
import { AuditTrail } from 'src/shared/domain/values/audit-trail.value';
import { ClientId } from './client-id.value';
import { ClientType } from './client-type.enum';

export class Client extends AggregateRoot {
  protected id: ClientId;
  protected type: ClientType;
  protected readonly auditTrail: AuditTrail;

  public constructor(type: ClientType, auditTrail: AuditTrail) {
    super();
    this.type = type;
    this.auditTrail = auditTrail;
  }

  public getId(): ClientId {
    return this.id;
  }

  public getType(): ClientType {
    return this.type;
  }

  public getAuditTrail(): AuditTrail {
    return this.auditTrail;
  }

  public changeId(id: ClientId) {
    this.id = id;
  }
}
```
```
import { ClientType } from 'src/clients/domain/aggregates/client/client-type.enum';
import { PersonRegistered } from 'src/clients/domain/events/person-registered.event';
import { AuditTrail } from 'src/shared/domain/values/audit-trail.value';
import { PersonName } from 'src/shared/domain/values/person-name.value';
import { ClientId } from './client-id.value';
import { Dni } from '../../../../shared/domain/values/dni.value';
import { Client } from './client.root.entity';

export class Person extends Client {
  private name: PersonName;
  private dni: Dni;

  public constructor(name: PersonName, dni: Dni, auditTrail: AuditTrail) {
    super(ClientType.PERSON, auditTrail);
    this.name = name;
    this.dni = dni;
  }

  public register() {
    const event = new PersonRegistered(this.id.getValue(), this.name.getFirstName(), this.name.getLastName(), this.dni.getValue());
    this.apply(event);
  }

  public getId(): ClientId {
    return this.id;
  }

  public getName(): PersonName {
    return this.name;
  }

  public getDni(): Dni {
    return this.dni;
  }

  public getAuditTrail(): AuditTrail {
    return this.auditTrail;
  }

  public changeName(name: PersonName): void {
    this.name = name;
  }

  public changeDni(dni: Dni): void {
    this.dni = dni;
  }
}
```
```
import { ClientId } from './client-id.value';
import { Client } from './client.root.entity';
import { Ruc } from '../../../../shared/domain/values/ruc.value';
import { CompanyName } from 'src/shared/domain/values/company-name.value';
import { AuditTrail } from 'src/shared/domain/values/audit-trail.value';
import { ClientType } from 'src/clients/domain/aggregates/client/client-type.enum';
import { CompanyRegistered } from 'src/clients/domain/events/company-registered.event';

export class Company extends Client {
  private name: CompanyName;
  private ruc: Ruc;

  public constructor(name: CompanyName, ruc: Ruc, auditTrail: AuditTrail) {
    super(ClientType.COMPANY, auditTrail);
    this.name = name;
    this.ruc = ruc;
  }

  public register() {
    const event = new CompanyRegistered(this.id.getValue(), this.name.getValue(), this.ruc.getValue());
    this.apply(event);
  }

  public getId(): ClientId {
    return this.id;
  }

  public getName(): CompanyName {
    return this.name;
  }

  public getRuc(): Ruc {
    return this.ruc;
  }

  public changeName(name: CompanyName): void {
    this.name = name;
  }

  public changeRuc(ruc: Ruc): void {
    this.ruc = ruc;
  }
}
```
```
import { IdNumber } from "src/shared/domain/values/id-number.value";

export class ClientId extends IdNumber {
}
```
```
export enum ClientType {
  COMPANY = 'C',
  PERSON = 'P'
}
```

## Create the following events (person-registered.event.ts, company-registered.event.ts) in clients context
```
export class PersonRegistered {
  constructor(
    public readonly id: number,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly dni: string,
  ) {
  }
}
```
```
export class CompanyRegistered {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly ruc: string,
  ) {
  }
}
```

## Create the following value objects (id-number.value.ts, audit-trail.value.ts, date-time.value.ts, dni.value.ts, person-name.value.ts, ruc.value.ts, company-name.value.ts) in shared context
```
export class IdNumber {
  protected readonly value: number;

  protected constructor(value: number) {
    this.value = Number(value);
  }

  public static of(value: number): IdNumber {
    return new IdNumber(value);
  }

  public getValue(): number {
    return Number(this.value);
  }
}
```
```
import { UserId } from 'src/users/domain/aggregates/user/user-id.value';
import { DateTime } from './date-time.value';

export class AuditTrail {
  private readonly createdAt: DateTime;
  private readonly createdBy: UserId;
  private readonly updatedAt: DateTime;
  private readonly updatedBy: UserId;

  private constructor(createdAt: DateTime, createdBy: UserId, updatedAt: DateTime, updatedBy: UserId) {
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.updatedAt = updatedAt;
    this.updatedBy = updatedBy;
  }

  public static from(createdAt: DateTime, createdBy: UserId, updatedAt: DateTime, updatedBy: UserId) {
    return new AuditTrail(createdAt, createdBy, updatedAt, updatedBy);
  }

  public getCreatedAt(): DateTime {
    return this.createdAt;
  }

  public getCreatedBy(): UserId {
    return this.createdBy;
  }

  public getUpdatedAt(): DateTime {
    return this.updatedAt;
  }

  public getUpdatedBy(): UserId {
    return this.updatedBy;
  }
}
```
```
import * as moment from 'moment-timezone';

export class DateTime {
  private datetime: Date;

  private constructor(
    datetime: Date
  ) {
    this.datetime = datetime;
  }

  public static from(datetime: Date) {
    return new DateTime(
      datetime
    );
  }

  public static fromString(datetime: string) {
    const date: Date = moment(datetime, 'YYYY-MM-DD HH:mm:ss').toDate();
    return new DateTime(
      date
    );
  }


  public static utcNow() {
    moment.tz.setDefault('UTC');
    const datetime = moment.tz().toDate();
    return new DateTime(
      datetime
    );
  }

  public format() {
    return moment(this.datetime).format();
  }
}
```
```
import { AppNotification } from "src/shared/application/app.notification";
import { Result } from "typescript-result";

export class Dni {
  private readonly value: string;
  private static MAX_LENGTH: number = 8;

  private constructor(value: string) {
    this.value = value;
  }

  public getValue(): string {
    return this.value;
  }

  public static create(value: string): Dni
  {
    value = (value ?? "").trim();
    return new Dni(value);
  }

  public static createResult(value: string): Result<AppNotification, Dni>
  {
    let notification: AppNotification = new AppNotification();
    value = (value ?? "").trim();
    if (value === "") {
      notification.addError('dni is required', null);
    }
    if (value.length != this.MAX_LENGTH) {
      notification.addError('dni field must have ' + Dni.MAX_LENGTH + ' characters', null);
    }
    const regExp = new RegExp('^[0-9]+$');
    if (regExp.test(value) === false) {
      notification.addError('dni format is invalid', null);
    }
    if (notification.hasErrors()) {
      return Result.error(notification);
    }
    return Result.ok(new Dni(value));
  }
}
```
```
import { Result } from 'typescript-result';
import { AppNotification } from '../../application/app.notification';

export class PersonName {
  private readonly firstName: string;
  private readonly lastName: string;
  private static MAX_LENGTH: number = 75;

  private constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  public getFirstName(): string {
    return this.firstName;
  }

  public getLastName(): string {
    return this.lastName;
  }

  public static create(firstName: string, lastName: string): PersonName {
    firstName = (firstName ?? "").trim();
    lastName = (lastName ?? "").trim();
    return new PersonName(firstName, lastName);
  }

  public static createv2(firstName: string, lastName: string): Result<AppNotification, PersonName> {
    let notification: AppNotification = new AppNotification();
    firstName = (firstName ?? "").trim();
    lastName = (lastName ?? "").trim();
    if (firstName === "") {
      notification.addError('firstName is required', null);
    }
    if (lastName === "") {
      notification.addError('lastName is required', null);
    }
    if (firstName.length > this.MAX_LENGTH) {
      notification.addError('The maximum length of an firstName is ' + this.MAX_LENGTH + ' characters including spaces', null);
    }
    if (lastName.length > this.MAX_LENGTH) {
      notification.addError('The maximum length of an lastName is ' + this.MAX_LENGTH + ' characters including spaces', null);
    }
    if (notification.hasErrors()) {
      return Result.error(notification);
    }
    return Result.ok(new PersonName(firstName, lastName));
  }
}
```
```
import { AppNotification } from "src/shared/application/app.notification";
import { Result } from "typescript-result";

export class Ruc {
  private value: string;
  private static MAX_LENGTH: number = 11;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(ruc: string): Ruc
  {
    ruc = (ruc ?? "").trim();
    return new Ruc(ruc);
  }

  public static createResult(ruc: string): Result<AppNotification, Ruc>
  {
    let notification: AppNotification = new AppNotification();
    ruc = (ruc ?? "").trim();
    if (ruc === "") {
      notification.addError('ruc is required', null);
    }
    if (ruc.length != this.MAX_LENGTH) {
      notification.addError('ruc field must have ' + Ruc.MAX_LENGTH + ' characters', null);
    }
    const regExp = new RegExp('^[0-9]+$');
    if (regExp.test(ruc) === false) {
      notification.addError('ruc format is invalid', null);
    }
    if (notification.hasErrors()) {
      return Result.error(notification);
    }
    return Result.ok(new Ruc(ruc));
  }

  public getValue(): string {
    return this.value;
  }
}
```
```
import { Result } from 'typescript-result';
import { AppNotification } from '../../application/app.notification';

export class CompanyName {
  private readonly value: string;
  private static MAX_LENGTH: number = 150;

  private constructor(value: string) {
    this.value = value;
  }

  public getValue(): string {
    return this.value;
  }

  public static create(name: string): CompanyName {
    name = (name ?? "").trim();
    return new CompanyName(name);
  }

  public static createv2(name: string): Result<AppNotification, CompanyName> {
    let notification: AppNotification = new AppNotification();
    name = (name ?? "").trim();
    if (name === "") {
      notification.addError('name is required', null);
    }
    if (name.length > this.MAX_LENGTH) {
      notification.addError('The maximum length of an name is ' + this.MAX_LENGTH + ' characters including spaces', null);
    }
    if (notification.hasErrors()) {
      return Result.error(notification);
    }
    return Result.ok(new CompanyName(name));
  }
}
```

## Create the following factories (person.factory.ts, company.factory.ts) in clients context
```
import { AuditTrail } from '../../../shared/domain/values/audit-trail.value';
import { PersonName } from '../../../shared/domain/values/person-name.value';
import { Person } from '../aggregates/client/person.entity';
import { ClientId } from '../aggregates/client/client-id.value';
import { Dni } from '../../../shared/domain/values/dni.value';

export class PersonFactory {
  public static withId(id: ClientId, name: PersonName, dni: Dni, auditTrail: AuditTrail): Person {
    let person: Person = new Person(name, dni, auditTrail);
    person.changeId(id);
    return person;
  }

  public static from(name: PersonName, dni: Dni, auditTrail: AuditTrail): Person {
    return new Person(name, dni, auditTrail);
  }
}
```
```
import { AuditTrail } from '../../../shared/domain/values/audit-trail.value';
import { CompanyName } from '../../../shared/domain/values/company-name.value';
import { Company } from '../aggregates/client/company.entity';
import { ClientId } from '../aggregates/client/client-id.value';
import { Ruc } from '../../../shared/domain/values/ruc.value';

export class CompanyFactory {
  public static withId(id: ClientId, name: CompanyName, ruc: Ruc, auditTrail: AuditTrail): Company {
    let company: Company = new Company(name, ruc, auditTrail);
    company.changeId(id);
    return company;
  }

  public static from(name: CompanyName, ruc: Ruc, auditTrail: AuditTrail): Company {
    return new Company(name, ruc, auditTrail);
  }
}
```

## Create the following repositories (person.repository.ts, company.repository.ts) inside client aggregate in clients context
```
import { Person } from "./person.entity";

export const PERSON_REPOSITORY = 'PersonRepository';

export interface PersonRepository {
  create(person: Person): Promise<Person>;
  update(person: Person): Promise<Person>;
  delete(personId: number): Promise<boolean>;
  getById(id: number): Promise<Person>;
  getByDni(dni: string): Promise<Person>;
}
```
```
import { Company } from "./company.entity";

export const COMPANY_REPOSITORY = 'CompanyRepository';

export interface CompanyRepository {
  create(company: Company): Promise<Company>;
  update(company: Company): Promise<Company>;
  delete(companyId: number): Promise<boolean>;
  getById(id: number): Promise<Company>;
  getByName(name: string): Promise<Company>;
  getByRuc(ruc: string): Promise<Company>;
}
```

## Create the following mappers (person.mapper.ts, company.mapper.ts) in clients context (application layer)
```
import { Person } from 'src/clients/domain/aggregates/client/person.entity';
import { AuditTrailValue } from 'src/shared/infrastructure/persistence/values/audit-trail.value';
import { RegisterPerson } from '../messages/commands/register-person.command';
import { PersonName } from 'src/shared/domain/values/person-name.value';
import { Dni } from 'src/shared/domain/values/dni.value';
import { AuditTrail } from 'src/shared/domain/values/audit-trail.value';
import { DateTime } from 'src/shared/domain/values/date-time.value';
import { PersonFactory } from 'src/clients/domain/factories/person.factory';
import { PersonClientDto } from '../dtos/response/person-client.dto';
import { ClientId } from 'src/clients/domain/aggregates/client/client-id.value';
import { RegisterPersonRequest } from '../dtos/request/register-person-request.dto';
import { RegisterPersonResponse } from '../dtos/response/register-person-response.dto';
import { PersonEntity } from 'src/clients/infrastructure/persistence/entities/person.entity';
import { PersonNameValue } from 'src/clients/infrastructure/persistence/values/person-name.value';
import { DniValue } from 'src/clients/infrastructure/persistence/values/dni.value';
import { UserId } from 'src/users/domain/aggregates/user/user-id.value';

export class PersonMapper {
  public static dtoRequestToCommand(registerPersonRequest: RegisterPersonRequest) {
    return new RegisterPerson(
      registerPersonRequest.firstName,
      registerPersonRequest.lastName,
      registerPersonRequest.dni,
    );
  }

  public static domainToDtoResponse(person: Person) {
    return new RegisterPersonResponse(
      person.getId().getValue(),
      person.getName().getFirstName(),
      person.getName().getLastName(),
      person.getDni().getValue(),
      person.getAuditTrail().getCreatedAt().format(),
      person.getAuditTrail().getCreatedBy().getValue()
    );
  }
  
  public static commandToDomain(command: RegisterPerson, userId: number): Person {
    const personName: PersonName = PersonName.create(command.firstName, command.lastName);
    const dni: Dni = Dni.create(command.dni);
    const auditTrail: AuditTrail = AuditTrail.from(
      DateTime.utcNow(),
      UserId.of(userId),
      null,
      null
    );
    let person: Person = PersonFactory.from(personName, dni, auditTrail);
    return person;
  }

  public static domainToEntity(person: Person): PersonEntity {
    const personEntity: PersonEntity = new PersonEntity();
    personEntity.name = PersonNameValue.from(person.getName().getFirstName(), person.getName().getLastName());
    personEntity.dni = DniValue.from(person.getDni().getValue());
    const createdAt: string = person.getAuditTrail() != null && person.getAuditTrail().getCreatedAt() != null ? person.getAuditTrail().getCreatedAt().format() : null;
    const createdBy: number = person.getAuditTrail() != null && person.getAuditTrail().getCreatedBy() != null ? person.getAuditTrail().getCreatedBy().getValue() : null;
    const updatedAt: string = person.getAuditTrail() != null && person.getAuditTrail().getUpdatedAt() != null ? person.getAuditTrail().getUpdatedAt().format() : null;
    const updatedBy: number = person.getAuditTrail() != null && person.getAuditTrail().getUpdatedBy() != null ? person.getAuditTrail().getUpdatedBy().getValue() : null;
    const auditTrailValue: AuditTrailValue = AuditTrailValue.from(createdAt, createdBy, updatedAt, updatedBy);
    personEntity.auditTrail = auditTrailValue;
    return personEntity;
  }

  public static entityToDomain(personEntity: PersonEntity): Person {
    if (personEntity == null) return null;
    const personName: PersonName = PersonName.create(personEntity.name.firstName, personEntity.name.lastName);
    const dni: Dni = Dni.create(personEntity.dni.value);
    const auditTrail: AuditTrail = AuditTrail.from(
      personEntity.auditTrail.createdAt != null ? DateTime.fromString(personEntity.auditTrail.createdAt) : null,
      personEntity.auditTrail.createdBy != null ? UserId.of(personEntity.auditTrail.createdBy) : null,
      personEntity.auditTrail.updatedAt != null ? DateTime.fromString(personEntity.auditTrail.updatedAt) : null,
      personEntity.auditTrail.updatedBy != null ? UserId.of(personEntity.auditTrail.updatedBy) : null
    );
    const clientId: ClientId = ClientId.of(personEntity.id);
    let person: Person = PersonFactory.withId(clientId, personName, dni, auditTrail);
    return person;
  }

  public static ormToPersonClientDto(row: any): PersonClientDto {
    let dto = new PersonClientDto();
    dto.id = Number(row.id);
    dto.firstName = row.firstName;
    dto.lastName = row.lastName;
    dto.dni = row.dni;
    return dto;
  }
}
```
```
import { Company } from 'src/clients/domain/aggregates/client/company.entity';
import { ClientId } from 'src/clients/domain/aggregates/client/client-id.value';
import { Ruc } from 'src/shared/domain/values/ruc.value';
import { CompanyFactory } from 'src/clients/domain/factories/company.factory';
import { AuditTrail } from 'src/shared/domain/values/audit-trail.value';
import { CompanyName } from 'src/shared/domain/values/company-name.value';
import { DateTime } from 'src/shared/domain/values/date-time.value';
import { AuditTrailValue } from 'src/shared/infrastructure/persistence/values/audit-trail.value';
import { CompanyClientDto } from '../dtos/response/company-client.dto';
import { RegisterCompany } from '../messages/commands/register-company.command';
import { RegisterCompanyRequest } from '../dtos/request/register-company-request.dto';
import { RegisterCompanyResponse } from '../dtos/response/register-company-response.dto';
import { CompanyEntity } from 'src/clients/infrastructure/persistence/entities/company.entity';
import { RucValue } from 'src/clients/infrastructure/persistence/values/ruc.value';
import { CompanyNameValue } from 'src/clients/infrastructure/persistence/values/company-name.value';
import { UserId } from 'src/users/domain/aggregates/user/user-id.value';

export class CompanyMapper {
  public static dtoRequestToCommand(registerCompanyRequest: RegisterCompanyRequest): RegisterCompany {
    return new RegisterCompany(
      registerCompanyRequest.name,
      registerCompanyRequest.ruc,
    );
  }

  public static domainToDtoResponse(company: Company): RegisterCompanyResponse {
    return new RegisterCompanyResponse(
      company.getId().getValue(),
      company.getName().getValue(),
      company.getRuc().getValue(),
      company.getAuditTrail().getCreatedAt().format(),
      company.getAuditTrail().getCreatedBy().getValue()
    );
  }

  public static commandToDomain(command: RegisterCompany, userId: number): Company {
    const companyName: CompanyName = CompanyName.create(command.name);
    const ruc: Ruc = Ruc.create(command.ruc);
    const auditTrail: AuditTrail = AuditTrail.from(
      DateTime.utcNow(),
      UserId.of(userId),
      null,
      null
    );
    let company: Company = CompanyFactory.from(companyName, ruc, auditTrail);
    return company;
  }

  public static domainToEntity(company: Company): CompanyEntity {
    const companyEntity: CompanyEntity = new CompanyEntity();
    companyEntity.companyName = CompanyNameValue.from(company.getName().getValue());
    companyEntity.ruc = RucValue.from(company.getRuc().getValue());
    const createdAt: string = company.getAuditTrail() != null && company.getAuditTrail().getCreatedAt() != null ? company.getAuditTrail().getCreatedAt().format() : null;
    const createdBy: number = company.getAuditTrail() != null && company.getAuditTrail().getCreatedBy() != null ? company.getAuditTrail().getCreatedBy().getValue() : null;
    const updatedAt: string = company.getAuditTrail() != null && company.getAuditTrail().getUpdatedAt() != null ? company.getAuditTrail().getUpdatedAt().format() : null;
    const updatedBy: number = company.getAuditTrail() != null && company.getAuditTrail().getUpdatedBy() != null ? company.getAuditTrail().getUpdatedBy().getValue() : null;
    const auditTrailValue: AuditTrailValue = AuditTrailValue.from(createdAt, createdBy, updatedAt, updatedBy);
    companyEntity.auditTrail = auditTrailValue;
    return companyEntity;
  }

  public static entityToDomain(companyEntity: CompanyEntity): Company {
    if (companyEntity == null) return null;
    const companyName: CompanyName = CompanyName.create(companyEntity.companyName.value);
    const ruc: Ruc = Ruc.create(companyEntity.ruc.value);
    const auditTrail: AuditTrail = AuditTrail.from(
      companyEntity.auditTrail.createdAt != null ? DateTime.fromString(companyEntity.auditTrail.createdAt) : null,
      companyEntity.auditTrail.createdBy != null ? UserId.of(companyEntity.auditTrail.createdBy) : null,
      companyEntity.auditTrail.updatedAt != null ? DateTime.fromString(companyEntity.auditTrail.updatedAt) : null,
      companyEntity.auditTrail.updatedBy != null ? UserId.of(companyEntity.auditTrail.updatedBy) : null
    );
    const clientId: ClientId = ClientId.of(companyEntity.id);
    let company: Company = CompanyFactory.withId(clientId, companyName, ruc, auditTrail);
    return company;
  }

  public static ormToCompanyClientDto(row: any): CompanyClientDto {
    let dto = new CompanyClientDto();
    dto.id = Number(row.id);
    dto.companyName = row.companyName;
    dto.ruc = row.ruc;
    return dto;
  }
}
```

## Create the following infrastructure entities (client.entity.ts, person.entity.ts, company.entity.ts) in clients context (infrastructure layer)
```
import { ClientType } from 'src/clients/domain/aggregates/client/client-type.enum';
import { AuditTrailValue } from 'src/shared/infrastructure/persistence/values/audit-trail.value';
import { Column, Entity, PrimaryGeneratedColumn, TableInheritance } from 'typeorm';

@Entity('clients')
@TableInheritance({ column: 'type', })
export class ClientEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', name: 'id', unsigned: true })
  public id: number;

  @Column((type) => AuditTrailValue, { prefix: false })
  public auditTrail: AuditTrailValue;

  @Column({ name: 'type', type: 'enum', enum: ClientType, default: ClientType.COMPANY })
  readonly type: ClientType;
}
```
```
import { ChildEntity, Column } from 'typeorm';
import { ClientType } from '../../../domain/aggregates/client/client-type.enum';
import { DniValue } from '../values/dni.value';
import { PersonNameValue } from '../values/person-name.value';
import { ClientEntity } from './client.entity';

@ChildEntity(ClientType.PERSON)
export class PersonEntity extends ClientEntity {
  @Column((type) => PersonNameValue, { prefix: false })
  public name: PersonNameValue;

  @Column((type) => DniValue, { prefix: false })
  public dni: DniValue;
}
```
```
import { ChildEntity, Column } from 'typeorm';
import { ClientType } from '../../../domain/aggregates/client/client-type.enum';
import { CompanyNameValue } from '../values/company-name.value';
import { RucValue } from '../values/ruc.value';
import { ClientEntity } from './client.entity';

@ChildEntity(ClientType.COMPANY)
export class CompanyEntity extends ClientEntity {
  @Column((type) => CompanyNameValue, { prefix: false })
  public companyName: CompanyNameValue;

  @Column((type) => RucValue, { prefix: false })
  public ruc: RucValue;
}
```

## Create the following infrastructure values (dni.value.ts, person-name.value.ts, ruc.value.ts, company-name.value.ts) in clients context (infrastructure layer)
```
import { Column, Unique } from 'typeorm';

export class DniValue {
  @Column('varchar', { name: 'dni', length: 8, nullable: false })
  value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static from(value: string): DniValue {
    return new DniValue(value);
  }
}
```
```
import { Column } from 'typeorm';

export class PersonNameValue {
  @Column('varchar', { name: 'first_name', length: 75, nullable: true })
  public firstName: string;

  @Column('varchar', { name: 'last_name', length: 75, nullable: true })
  public lastName: string;

  private constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  public static from(firstName: string, lastName: string): PersonNameValue {
    return new PersonNameValue(firstName, lastName);
  }
}
```
```
import { Column } from 'typeorm';

export class RucValue {
  @Column('varchar', { name: 'ruc', length: 11, nullable: true })
  value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static from(value: string): RucValue {
    return new RucValue(value);
  }
}
```
```
import { Column } from 'typeorm';

export class CompanyNameValue {
  @Column('varchar', { name: 'company_name', length: 150, nullable: true })
  public value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static from(name: string): CompanyNameValue {
    return new CompanyNameValue(name);
  }
}
```

## Create the following infrastructure values (audit-trail.value.ts) in shared context (infrastructure layer)
```
import { Column } from 'typeorm';

export class AuditTrailValue {
  @Column('datetime', { name: 'created_at', nullable: true })
  public createdAt: string;

  @Column('bigint', { name: 'created_by', nullable: true })
  public createdBy: number;

  @Column('datetime', { name: 'updated_at', nullable: true })
  public updatedAt: string;

  @Column('bigint', { name: 'updated_by', nullable: true })
  public updatedBy: number;

  private constructor(createdAt: string, createdBy: number, updatedAt: string, updatedBy: number) {
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.updatedAt = updatedAt;
    this.updatedBy = updatedBy;
  }

  public static from(createdAt: string, createdBy: number, updatedAt: string, updatedBy: number): AuditTrailValue {
    return new AuditTrailValue(createdAt, createdBy, updatedAt, updatedBy);
  }
}
```

## Create the following request dtos (register-person-request.dto.ts, register-company-request.dto.ts, edit-person-request.dto.ts, edit-company-request.dto.ts) in clients context (application layer)
```
export class RegisterPersonRequest {
  constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly dni: string,
  ) {}
}
```
```
export class RegisterCompanyRequest {
  constructor(
    public readonly name: string,
    public readonly ruc: string,
  ) {}
}
```
```
export class EditPersonRequest {
  constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly dni: string,
  ) {}
}
```
```
export class EditCompanyRequest {
  constructor(
    public readonly name: string,
    public readonly ruc: string
  ) {}
}
```

## Create the following response dtos (register-person-response.dto.ts, register-company-response.dto.ts, person-client.dto.ts, company-client.dto.ts) in clients context (application layer)
```
export class RegisterPersonResponse {
  constructor(
    public id: number,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly dni: string,
    public readonly createdAt: string,
    public readonly createdBy: number
  ) {}
}
```
```
export class RegisterCompanyResponse {
  constructor(
    public id: number,
    public readonly name: string,
    public readonly ruc: string,
    public readonly createdAt: string,
    public readonly createdBy: number
  ) {}
}
```
```
export class PersonClientDto {
  public id: number;
  public firstName: string;
  public lastName: string;
  public dni: string;
}
```
```
export class CompanyClientDto {
  public id: number;
  public companyName: string;
  public ruc: string;
}
```

## Create the following commands(register-person.command.ts, register-company.command.ts) in clients context (application layer)
```
export class RegisterPerson {
  constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly dni: string
  ) {}
}
```
```
export class RegisterCompany {
  constructor(
    public readonly name: string,
    public readonly ruc: string
  ) {}
}
```

## Create the following files (app.notification.ts, app.error.ts, app-util.ts, app-settings.ts) in shared context (application layer)
```
import { AppError } from './app.error';

export class AppNotification {
  private errors: AppError[] = [];
  private cause: Error;

  public addError(message: string, cause: Error): void {
    this.errors.push(new AppError(message, cause));
  }

  public hasErrors(): boolean {
    return this.errors.length > 0;
  }

  public getErrors(): AppError[] {
    return this.errors;
  }
}
```
```
export class AppError {
  constructor(public readonly message: string, public readonly cause: Error) {}
}
```
```
export class AppUtil {
  public static delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}
```
```
export class AppSettings {
  public static SUPER_ADMIN = 1
}
```

## Create the following repositories (person.repository.ts, company.repository.ts) in clients context (infrastructure layer)
```
import { InjectRepository } from "@nestjs/typeorm";
import { PersonMapper } from "src/clients/application/mappers/person.mapper";
import { Person } from "src/clients/domain/aggregates/client/person.entity";
import { PersonRepository } from "src/clients/domain/aggregates/client/person.repository";
import { Repository } from "typeorm";
import { PersonEntity } from "../entities/person.entity";

export class PersonEntityRepository implements PersonRepository  {
  constructor(
    @InjectRepository(PersonEntity)
    private personRepository: Repository<PersonEntity>,
  ) {}

  async create(person: Person): Promise<Person> {
    let personEntity: PersonEntity = PersonMapper.domainToEntity(person);
    personEntity = await this.personRepository.save(personEntity);
    return PersonMapper.entityToDomain(personEntity);
  }

  async update(person: Person): Promise<Person> {
    let personEntity: PersonEntity = PersonMapper.domainToEntity(person);
    let personId: number = person.getId().getValue();
    await this.personRepository.update({ id: personId }, personEntity);
    return person;
  }

  async delete(personId: number): Promise<boolean> {
    await this.personRepository.delete({ id: personId });
    return true;
  }

  async getById(id: number): Promise<Person> {
    let personEntity: PersonEntity = await this.personRepository.findOne({ where: { id: id } });
    return PersonMapper.entityToDomain(personEntity);
  }

  async getByDni(dni: string): Promise<Person> {
    let personEntity: PersonEntity = await this.personRepository.createQueryBuilder().where("dni = :dni", { dni }).getOne();
    return PersonMapper.entityToDomain(personEntity);
  }
}
```
```
import { InjectRepository } from "@nestjs/typeorm";
import { Company } from "src/clients/domain/aggregates/client/company.entity";
import { CompanyRepository } from "src/clients/domain/aggregates/client/company.repository";
import { Repository } from "typeorm";
import { CompanyEntity } from "../entities/company.entity";
import { CompanyMapper } from '../../../application/mappers/company.mapper';

export class CompanyEntityRepository implements CompanyRepository  {
  constructor(
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
  ) {}

  async create(company: Company): Promise<Company> {
    let companyEntity: CompanyEntity = CompanyMapper.domainToEntity(company);
    companyEntity = await this.companyRepository.save(companyEntity);
    return CompanyMapper.entityToDomain(companyEntity);
  }

  async update(company: Company): Promise<Company> {
    let companyEntity: CompanyEntity = CompanyMapper.domainToEntity(company);
    let companyId: number = company.getId().getValue();
    await this.companyRepository.update({ id: companyId }, companyEntity);
    return company;
  }

  async delete(companyId: number): Promise<boolean> {
    await this.companyRepository.delete({ id: companyId });
    return true;
  }

  async getById(id: number): Promise<Company> {
    let companyEntity: CompanyEntity = await this.companyRepository.findOne({ where: { id: id } });
    return CompanyMapper.entityToDomain(companyEntity);
  }

  async getByName(name: string): Promise<Company> {
    let companyEntity: CompanyEntity = await this.companyRepository.createQueryBuilder('company').where("company.companyName.value = :companyName", { companyName: name }).getOne();
    return CompanyMapper.entityToDomain(companyEntity);
  }
  
  async getByRuc(ruc: string): Promise<Company> {
    let companyEntity: CompanyEntity = await this.companyRepository.createQueryBuilder().where("ruc = :ruc", { ruc }).getOne();
    return CompanyMapper.entityToDomain(companyEntity);
  }
}
```

## Create a users module

```
$ nest g resource users
```

## Modify users module to align with DDD layers

```
- domain (aggregates, events, services)
- interface (rest)
- application (services, dtos, mappers, validators, messages, handlers)
- infrastructure (persistence)
```

## Create the user-id.value.ts file for UserId class
```
import { IdNumber } from "src/shared/domain/values/id-number.value";

export class UserId extends IdNumber {
}
```

## Create the following controllers (person.controller.ts, company.controller.ts) in clients context (interface layer)
```
import { Controller, Post, Body, Res, Get, Param } from '@nestjs/common';
import { Result } from 'typescript-result';
import { QueryBus } from '@nestjs/cqrs';
import { RegisterPersonRequest } from 'src/clients/application/dtos/request/register-person-request.dto';
import { PersonApplicationService } from 'src/clients/application/services/person-application.service';
import { AppNotification } from 'src/shared/application/app.notification';
import { RegisterPersonResponse } from 'src/clients/application/dtos/response/register-person-response.dto';
import { ApiController } from 'src/shared/interface/rest/api.controller';
import { GetPersonClients } from 'src/clients/application/messages/queries/get-person-clients.query';

@Controller('clients/person')
export class PersonController {
  constructor(
    private readonly personApplicationService: PersonApplicationService,
    private readonly queryBus: QueryBus
  ) {}

  @Post('')
  async register(
    @Body() registerPersonRequest: RegisterPersonRequest,
    @Res({ passthrough: true }) response
  ): Promise<object> {
    try {
      const result: Result<AppNotification, RegisterPersonResponse> = await this.personApplicationService.register(registerPersonRequest);
      if (result.isSuccess()) {
          return ApiController.created(response, result.value);
      }
      return ApiController.error(response, result.error.getErrors());
    } catch (error) {
      return ApiController.serverError(response, error);
    }
  }

  @Get('')
  async getAll(@Res({ passthrough: true }) response): Promise<object> {
    try {
      const customers = await this.queryBus.execute(new GetPersonClients());
      return ApiController.ok(response, customers);
    } catch (error) {
      return ApiController.serverError(response, error);
    }
  }

  @Get('/:id')
  async getById(@Param('id') id: number, @Res({ passthrough: true }) response): Promise<object> {
    try {
      const person = await this.personApplicationService.getById(id);
      return ApiController.ok(response, person);
    } catch (error) {
      return ApiController.serverError(response, error);
    }
  }
}
```
```
import { Controller, Post, Body, Res, Get, Param } from '@nestjs/common';
import { Result } from 'typescript-result';
import { QueryBus } from '@nestjs/cqrs';
import { CompanyApplicationService } from 'src/clients/application/services/company-application.service';
import { AppNotification } from 'src/shared/application/app.notification';
import { ApiController } from 'src/shared/interface/rest/api.controller';
import { RegisterCompanyRequest } from 'src/clients/application/dtos/request/register-company-request.dto';
import { RegisterCompanyResponse } from 'src/clients/application/dtos/response/register-company-response.dto';
import { GetCompanyClients } from 'src/clients/application/messages/queries/get-company-clients.query';

@Controller('clients/company')
export class CompanyController {
  constructor(
    private readonly companyApplicationService: CompanyApplicationService,
    private readonly queryBus: QueryBus
  ) {}

  @Post('')
  async register(
    @Body() registerCompanyRequest: RegisterCompanyRequest,
    @Res({ passthrough: true }) response
  ): Promise<object> {
    try {
      const result: Result<AppNotification, RegisterCompanyResponse> = await this.companyApplicationService.register(registerCompanyRequest);
      if (result.isSuccess()) {
        return ApiController.created(response, result.value);
      }
      return ApiController.error(response, result.error.getErrors());
    } catch (error) {
      return ApiController.serverError(response, error);
    }
  }

  @Get('')
  async getAll(@Res({ passthrough: true }) response): Promise<object> {
    try {
      const customers = await this.queryBus.execute(new GetCompanyClients());
      return ApiController.ok(response, customers);
    } catch (error) {
      return ApiController.serverError(response, error);
    }
  }

  @Get('/:id')
  async getById(@Param('id') id: number, @Res({ passthrough: true }) response): Promise<object> {
    try {
      const person = await this.companyApplicationService.getById(id);
      return ApiController.ok(response, person);
    } catch (error) {
      return ApiController.serverError(response, error);
    }
  }
}
```

## Create the following files (api.controller.ts, envelope.ts) in shared context (interface layer)
```
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { Envelope } from './envelope';
import { AppError } from '../../application/app.error';

export class ApiController {
  static ok(response: Response, result: object): Envelope {
    response.status(HttpStatus.OK);
    return Envelope.ok(result);
  }

  static created(response: Response, result: object): Envelope {
      response.status(HttpStatus.CREATED);
      return Envelope.ok(result);
  }

  static error(response: Response, errors: AppError[]): Envelope {
      response.status(HttpStatus.BAD_REQUEST);
      return Envelope.error(errors);
  }

  static serverError(response: Response, error): Envelope {
      console.log(error);
      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return Envelope.serverError();
  }

  static notFound(response: Response): Envelope {
      response.status(HttpStatus.NOT_FOUND);
    return Envelope.notFound();
  }
}
```
```
import { AppError } from '../../application/app.error';

export class Envelope {
  constructor(
    public readonly result: any,
    public readonly errors: AppError[],
  ) {}

  static ok(result: any): Envelope {
    return new Envelope(result, []);
  }

  static error(errors: AppError[]): Envelope {
    if (errors == null) errors = [];
    return new Envelope(null, errors);
  }

  static serverError(): Envelope {
    const errors: AppError[] = [];
    errors.push(new AppError('Internal Server Error', null));
    return new Envelope(null, errors);
  }

  static notFound(): Envelope {
    const errors: AppError[] = [];
    errors.push(new AppError('Entity Not Found', null));
    return new Envelope(null, errors);
  }
}
```

## Create the following services (person-application.service.ts, company-application.service.ts) in clients context (application layer)
```
import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterPersonRequest } from '../dtos/request/register-person-request.dto';
import { RegisterPersonResponse } from '../dtos/response/register-person-response.dto';
import { RegisterPersonValidator } from '../validators/register-person.validator';
import { AppNotification } from 'src/shared/application/app.notification';
import { Result } from 'typescript-result';
import { RegisterPerson } from '../messages/commands/register-person.command';
import { PersonRepository, PERSON_REPOSITORY } from 'src/clients/domain/aggregates/client/person.repository';
import { Person } from 'src/clients/domain/aggregates/client/person.entity';
import { PersonMapper } from '../mappers/person.mapper';

@Injectable()
export class PersonApplicationService {
  constructor(
    private commandBus: CommandBus,
    private registerPersonValidator: RegisterPersonValidator,
    @Inject(PERSON_REPOSITORY)
    private readonly personRepository: PersonRepository,
  ) {}

  async register(
    registerPersonRequest: RegisterPersonRequest,
  ): Promise<Result<AppNotification, RegisterPersonResponse>> {
    const registerPerson: RegisterPerson = PersonMapper.dtoRequestToCommand(registerPersonRequest);
    const notification: AppNotification = await this.registerPersonValidator.validate(registerPerson);
    if (notification.hasErrors()) return Result.error(notification);
    const person: Person = await this.commandBus.execute(registerPerson);
    const response: RegisterPersonResponse = PersonMapper.domainToDtoResponse(person);
    return Result.ok(response);
  }

  async getById(id: number) {
    return await this.personRepository.getById(id);
  }
}
```
```
import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AppNotification } from 'src/shared/application/app.notification';
import { Result } from 'typescript-result';
import { RegisterCompanyValidator } from '../validators/register-company.validator';
import { RegisterCompany } from '../messages/commands/register-company.command';
import { RegisterCompanyRequest } from '../dtos/request/register-company-request.dto';
import { RegisterCompanyResponse } from '../dtos/response/register-company-response.dto';
import { CompanyRepository, COMPANY_REPOSITORY } from 'src/clients/domain/aggregates/client/company.repository';
import { CompanyMapper } from '../mappers/company.mapper';
import { Company } from 'src/clients/domain/aggregates/client/company.entity';

@Injectable()
export class CompanyApplicationService {
  constructor(
    private commandBus: CommandBus,
    private registerCompanyValidator: RegisterCompanyValidator,
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  async getById(id: number) {
    return await this.companyRepository.getById(id);
  }

  async register(registerCompanyRequest: RegisterCompanyRequest): Promise<Result<AppNotification, RegisterCompanyResponse>> {
    const registerCompany: RegisterCompany = CompanyMapper.dtoRequestToCommand(registerCompanyRequest);
    const notification: AppNotification = await this.registerCompanyValidator.validate(registerCompany);
    if (notification.hasErrors()) return Result.error(notification);
    const company: Company = await this.commandBus.execute(registerCompany);
    const response: RegisterCompanyResponse = CompanyMapper.domainToDtoResponse(company);
    return Result.ok(response);
  }
}
```

## Create the following validators (register-person.validator.ts, register-company.validator.ts) in clients context (application layer)
```
import { Inject, Injectable } from '@nestjs/common';
import { AppNotification } from 'src/shared/application/app.notification';
import { RegisterPerson } from '../messages/commands/register-person.command';
import { PersonRepository, PERSON_REPOSITORY } from 'src/clients/domain/aggregates/client/person.repository';
import { Person } from 'src/clients/domain/aggregates/client/person.entity';

@Injectable()
export class RegisterPersonValidator {
  constructor(
    @Inject(PERSON_REPOSITORY)
    private personRepository: PersonRepository,
  ) {
  }

  public async validate(registerPerson: RegisterPerson,): Promise<AppNotification> {
    let notification: AppNotification = new AppNotification();
    const firstName: string = registerPerson.firstName ? registerPerson.firstName.trim() : '';
    if (firstName.length <= 0) {
      notification.addError('firstName is required', null);
    }
    const lastName: string = registerPerson.lastName ? registerPerson.lastName.trim() : '';
    if (lastName.length <= 0) {
      notification.addError('lastName is required', null);
    }
    const dni: string = registerPerson.dni ? registerPerson.dni.trim() : '';
    if (dni.length <= 0) {
      notification.addError('dni is required', null);
    }
    if (notification.hasErrors()) {
      return notification;
    }
    const person: Person = await this.personRepository.getByDni(dni);
    if (person != null) notification.addError('dni is taken', null);
    
    return notification;
  }
}
```
```
import { Inject, Injectable } from '@nestjs/common';
import { Company } from 'src/clients/domain/aggregates/client/company.entity';
import { CompanyRepository, COMPANY_REPOSITORY } from 'src/clients/domain/aggregates/client/company.repository';
import { AppNotification } from 'src/shared/application/app.notification';
import { RegisterCompany } from '../messages/commands/register-company.command';

@Injectable()
export class RegisterCompanyValidator {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private companyRepository: CompanyRepository,
  ) {
  }

  public async validate(registerCompany: RegisterCompany): Promise<AppNotification> {
    let notification: AppNotification = new AppNotification();
    const name: string = registerCompany.name.trim();
    if (name.length <= 0) {
      notification.addError('name is required', null);
    }
    const ruc: string = registerCompany.ruc.trim();
    if (ruc.length <= 0) {
      notification.addError('ruc is required', null);
    }
    if (notification.hasErrors()) {
      return notification;
    }
    let company: Company = await this.companyRepository.getByName(name);
    if (company != null) {
      notification.addError('name is taken', null);
      return notification;
    }
    company = await this.companyRepository.getByRuc(ruc);
    if (company != null) {
      notification.addError('ruc is taken', null);
    }
    return notification;
  }
}
```

## Create the following queries (get-person-clients.query.ts, get-company-clients.query.ts) in clients context (application layer)
```
export class GetPersonClients {
}
```
```
export class GetCompanyClients {
}
```

## Create the following command handlers (register-person.handler.ts, register-company.handler.ts) in clients context (application layer)
```
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RegisterPerson } from '../../messages/commands/register-person.command';
import { PersonMapper } from '../../mappers/person.mapper';
import { Person } from 'src/clients/domain/aggregates/client/person.entity';
import { Inject } from '@nestjs/common';
import { PersonRepository, PERSON_REPOSITORY } from 'src/clients/domain/aggregates/client/person.repository';
import { AppSettings } from 'src/shared/application/app-settings';
import { DataSource } from 'typeorm';

@CommandHandler(RegisterPerson)
export class RegisterPersonHandler
  implements ICommandHandler<RegisterPerson> {
  constructor(
    private dataSource: DataSource,
    @Inject(PERSON_REPOSITORY)
    private readonly personRepository: PersonRepository,
    private publisher: EventPublisher
  ) {
  }

  async execute(command: RegisterPerson) {
    let person: Person = PersonMapper.commandToDomain(command, AppSettings.SUPER_ADMIN);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      person = await this.personRepository.create(person);
      if (person == null) throw new Error("");
      person = this.publisher.mergeObjectContext(person);
      person.register();
      person.commit();
      await queryRunner.commitTransaction();
    } catch(err) {
      await queryRunner.rollbackTransaction();
      person = null;
    } finally {
      await queryRunner.release();
    }
    return person;
  }
}
```
```
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RegisterCompany } from 'src/clients/application/messages/commands/register-company.command';
import { CompanyMapper } from '../../mappers/company.mapper';
import { Company } from 'src/clients/domain/aggregates/client/company.entity';
import { Inject } from '@nestjs/common';
import { CompanyRepository, COMPANY_REPOSITORY } from 'src/clients/domain/aggregates/client/company.repository';
import { AppSettings } from 'src/shared/application/app-settings';
import { DataSource } from 'typeorm';

@CommandHandler(RegisterCompany)
export class RegisterCompanyHandler
  implements ICommandHandler<RegisterCompany> {
  constructor(
    private dataSource: DataSource,
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    private publisher: EventPublisher,
  ) {
  }

  async execute(command: RegisterCompany) {
    let company: Company = CompanyMapper.commandToDomain(command, AppSettings.SUPER_ADMIN);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      company = await this.companyRepository.create(company);
      if (company == null) throw new Error("");
      company = this.publisher.mergeObjectContext(company);
      company.register();
      company.commit();
      await queryRunner.commitTransaction();
    } catch(err) {
      await queryRunner.rollbackTransaction();
      company = null;
    } finally {
      await queryRunner.release();
    }
    return company;
  }
}
```

## Create the following query handlers (get-person-clients.handler.ts, get-company-clients.handler.ts) in clients context (application layer)
```
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { PersonClientDto } from '../../dtos/response/person-client.dto';
import { GetPersonClients } from '../../messages/queries/get-person-clients.query';
import { PersonMapper } from '../../mappers/person.mapper';

@QueryHandler(GetPersonClients)
export class GetPersonClientsHandler implements IQueryHandler<GetPersonClients> {
  constructor(private dataSource: DataSource) {}

  async execute(query: GetPersonClients) {
    const manager = this.dataSource.createEntityManager();
    const sql = `
    SELECT 
      id,
      first_name as firstName,
      last_name as lastName,
      dni
    FROM 
      clients
    WHERE
      type = 'P'
    ORDER BY
      last_name, first_name;`;
    const rows = await manager.query(sql);
    if (rows.length <= 0) return [];
    const personClients: PersonClientDto[] = rows.map(function (row: any) {
      return PersonMapper.ormToPersonClientDto(row);
    });
    return personClients;
  }
}
```
```
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { CompanyClientDto } from '../../dtos/response/company-client.dto';
import { CompanyMapper } from '../../mappers/company.mapper';
import { GetCompanyClients } from '../../messages/queries/get-company-clients.query';

@QueryHandler(GetCompanyClients)
export class GetCompanyClientsHandler implements IQueryHandler<GetCompanyClients> {
  constructor(private dataSource: DataSource) {}

  async execute(query: GetCompanyClients) {
    const manager = this.dataSource.createEntityManager();
    const sql = `
    SELECT 
      id,
      company_name as companyName,
      ruc
    FROM 
      clients
    WHERE
      type = 'C'
    ORDER BY
      company_name;`;
    const rows = await manager.query(sql);
    if (rows.length <= 0) return [];
    const companyClients: CompanyClientDto[] = rows.map(function (row: any) {
      return CompanyMapper.ormToCompanyClientDto(row);
    });
    return companyClients;
  }
}
```

## Edit clients.module.ts
```
import { Module } from '@nestjs/common';
import { CompanyApplicationService } from './application/services/company-application.service';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterPersonValidator } from './application/validators/register-person.validator';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterCompanyHandler } from './application/handlers/commands/register-company.handler';
import { PersonRegisteredHandler } from '../notifications/application/handlers/events/person-registered.handler';
import { GetPersonClientsHandler } from './application/handlers/queries/get-person-clients.handler';
import { PersonApplicationService } from './application/services/person-application.service';
import { RegisterCompanyValidator } from './application/validators/register-company.validator';
import { RegisterPersonHandler } from './application/handlers/commands/register-person.handler';
import { CompanyRegisteredHandler } from '../notifications/application/handlers/events/company-registered.handler';
import { ClientEntity } from './infrastructure/persistence/entities/client.entity';
import { PersonEntity } from './infrastructure/persistence/entities/person.entity';
import { CompanyEntity } from './infrastructure/persistence/entities/company.entity';
import { PersonController } from './interface/rest/person.controller';
import { CompanyController } from './interface/rest/company.controller';
import { PersonEntityRepository } from './infrastructure/persistence/repositories/person.repository';
import { CompanyEntityRepository } from './infrastructure/persistence/repositories/company.repository';
import { GetCompanyClientsHandler } from './application/handlers/queries/get-company-clients.handler';
import { PERSON_REPOSITORY } from './domain/aggregates/client/person.repository';
import { COMPANY_REPOSITORY } from './domain/aggregates/client/company.repository';

export const CommandHandlers = [RegisterPersonHandler, RegisterCompanyHandler];
export const EventHandlers = [PersonRegisteredHandler, CompanyRegisteredHandler];
export const QueryHandlers = [GetPersonClientsHandler, GetCompanyClientsHandler];

@Module({
  imports: [
  CqrsModule,
    TypeOrmModule.forFeature([ClientEntity, PersonEntity, CompanyEntity]),
  ],
  exports: [TypeOrmModule],
  controllers: [PersonController, CompanyController],
  providers: [
    { useClass: PersonEntityRepository, provide: PERSON_REPOSITORY },
    { useClass: CompanyEntityRepository, provide: COMPANY_REPOSITORY },
    PersonApplicationService,
    CompanyApplicationService,
    RegisterPersonValidator,
    RegisterCompanyValidator,
    PersonEntityRepository,
    CompanyEntityRepository,
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers
  ]
})
export class ClientsModule {}
```

## Create a notifications module

```
$ nest g resource notifications
```

## Modify notifications module to align with DDD layers

```
- domain (aggregates, events, services)
- interface (rest)
- application (services, dtos, mappers, validators, messages, handlers)
- infrastructure (persistence)
```

## Create the following event handlers (person-registered.handler.ts, company-registered.handler.ts) in notifications context (application layer)
```
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { PersonRegistered } from '../../../../clients/domain/events/person-registered.event';

@EventsHandler(PersonRegistered)
export class PersonRegisteredHandler implements IEventHandler<PersonRegistered> {
  constructor() {}

  async handle(event: PersonRegistered) {
    console.log(event);
  }
}
```
```
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { CompanyRegistered } from '../../../../clients/domain/events/company-registered.event';

@EventsHandler(CompanyRegistered)
export class CompanyRegisteredHandler implements IEventHandler<CompanyRegistered> {
  constructor() {}

  async handle(event: CompanyRegistered) {
    console.log(event);
  }
}
```

## Edit notifications.module.ts
```
import { Module } from '@nestjs/common';

@Module({
  controllers: [],
  providers: []
})
export class NotificationsModule {}
```

## Environment variables

```
BANKING_DDD_NEST_MYSQL=mysql://{user}:{password}@{host}:{port}/{database}
BANKING_DDD_NEST_MYSQL=mysql://root:root@localhost:3306/banking-ddd-nest
ENVIRONMENT=local
ENVIRONMENT=prod
```
Note: Password must be URL encoded, %25 is the url encoding of %.

## Fix issue with MySQL 8

Client does not support authentication protocol requested by server; consider upgrading MySQL client.
To fix it, run the following command changing the values with your credentials:

```
ALTER USER '{user}'@'{host}' IDENTIFIED WITH mysql_native_password BY '{password}'
FLUSH PRIVILEGES;
```

### Example:

```
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root'
FLUSH PRIVILEGES;
```