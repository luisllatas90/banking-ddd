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