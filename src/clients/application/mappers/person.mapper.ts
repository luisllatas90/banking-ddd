import { PersonEntity } from 'src/clients/infrastructure/persistence/entities/person.entity';
import { Person } from 'src/clients/domain/aggregates/client/person.entity';
import { PersonNameValue } from 'src/clients/infrastructure/persistence/values/person-name.value';
import { AuditTrailValue } from 'src/shared/infrastructure/persistence/values/audit-trail.value';
import { RegisterPerson } from '../messages/commands/register-person.command';
import { PersonName } from 'src/shared/domain/values/person-name.value';
import { Dni } from 'src/shared/domain/values/dni.value';
import { AuditTrail } from 'src/shared/domain/values/audit-trail.value';
import { DateTime } from 'src/shared/domain/values/date-time.value';
import { UserId } from 'src/users/domain/agreggates/user/user-id.value';
import { PersonFactory } from 'src/clients/domain/factories/person.factory';
import { PersonClientDto } from '../dtos/response/person-client.dto';
import { ClientId } from 'src/clients/domain/aggregates/client/client-id.value';
import { RegisterPersonRequest } from '../dtos/request/register-person-request.dto';
import { RegisterPersonResponse } from '../dtos/response/register-person-response.dto';
import { AppNotification } from 'src/shared/application/app.notification';
import { Result } from 'typescript-result';
import { DniValue } from '../../infrastructure/persistence/values/dni.value';

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
    const personNameResult: Result<AppNotification, PersonName> = PersonName.create(command.firstName, command.lastName);
    if (personNameResult.isFailure()) return null;
    const dniResult: Result<AppNotification, Dni> = Dni.create(command.dni);
    if (dniResult.isFailure()) return null;
    const auditTrail: AuditTrail = AuditTrail.from(
      DateTime.utcNow(),
      UserId.of(userId),
      null,
      null
    );
    let person: Person = PersonFactory.from(personNameResult.value, dniResult.value, auditTrail);
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
    const personNameResult: Result<AppNotification, PersonName> = PersonName.create(personEntity.name.firstName, personEntity.name.lastName);
    if (personNameResult.isFailure()) return null;
    const dniResult: Result<AppNotification, Dni> = Dni.create(personEntity.dni.value);
    if (dniResult.isFailure()) return null;
    const auditTrail: AuditTrail = AuditTrail.from(
      personEntity.auditTrail.createdAt != null ? DateTime.fromString(personEntity.auditTrail.createdAt) : null,
      personEntity.auditTrail.createdBy != null ? UserId.of(personEntity.auditTrail.createdBy) : null,
      personEntity.auditTrail.updatedAt != null ? DateTime.fromString(personEntity.auditTrail.updatedAt) : null,
      personEntity.auditTrail.updatedBy != null ? UserId.of(personEntity.auditTrail.updatedBy) : null
    );
    const clientId: ClientId = ClientId.of(personEntity.id);
    let person: Person = PersonFactory.withId(clientId, personNameResult.value, dniResult.value, auditTrail);
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