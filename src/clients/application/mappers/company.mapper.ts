import { Company } from 'src/clients/domain/aggregates/client/company.entity';
import { ClientId } from 'src/clients/domain/aggregates/client/client-id.value';
import { Ruc } from 'src/shared/domain/values/ruc.value';
import { CompanyFactory } from 'src/clients/domain/factories/company.factory';
import { CompanyEntity } from 'src/clients/infrastructure/persistence/entities/company.entity';
import { CompanyNameValue } from 'src/clients/infrastructure/persistence/values/company-name.value';
import { RucValue } from 'src/clients/infrastructure/persistence/values/ruc.value';
import { AuditTrail } from 'src/shared/domain/values/audit-trail.value';
import { CompanyName } from 'src/shared/domain/values/company-name.value';
import { DateTime } from 'src/shared/domain/values/date-time.value';
import { AuditTrailValue } from 'src/shared/infrastructure/persistence/values/audit-trail.value';
import { UserId } from 'src/users/domain/agreggates/user/user-id.value';
import { CompanyClientDto } from '../dtos/response/company-client.dto';
import { RegisterCompany } from '../messages/commands/register-company.command';
import { RegisterCompanyRequest } from '../dtos/request/register-company-request.dto';
import { RegisterCompanyResponse } from '../dtos/response/register-company-response.dto';
import { Result } from 'typescript-result';
import { AppNotification } from 'src/shared/application/app.notification';
import { DniValue } from '../../infrastructure/persistence/values/dni.value';

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
    const companyNameResult: Result<AppNotification, CompanyName> = CompanyName.create(command.name);
    if (companyNameResult.isFailure()) return null;
    const rucResult: Result<AppNotification, Ruc> = Ruc.create(command.ruc);
    if (rucResult.isFailure()) return null;
    const auditTrail: AuditTrail = AuditTrail.from(
      DateTime.utcNow(),
      UserId.of(userId),
      null,
      null
    );
    let company: Company = CompanyFactory.from(
      companyNameResult.value, rucResult.value, auditTrail
    );
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
    const auditTrailValue: AuditTrailValue = AuditTrailValue.from(
      createdAt, createdBy, updatedAt, updatedBy
    );
    companyEntity.auditTrail = auditTrailValue;
    return companyEntity;
  }

  public static entityToDomain(companyEntity: CompanyEntity): Company {
    if (companyEntity == null) return null;
    const companyNameResult: Result<AppNotification, CompanyName> = CompanyName.create(companyEntity.companyName.value);
    if (companyNameResult.isFailure()) return null;
    const rucResult: Result<AppNotification, Ruc> = Ruc.create(companyEntity.ruc.value);
    if (rucResult.isFailure()) return null;
    const auditTrail: AuditTrail = AuditTrail.from(
      companyEntity.auditTrail.createdAt != null ? DateTime.fromString(companyEntity.auditTrail.createdAt) : null,
      companyEntity.auditTrail.createdBy != null ? UserId.of(companyEntity.auditTrail.createdBy) : null,
      companyEntity.auditTrail.updatedAt != null ? DateTime.fromString(companyEntity.auditTrail.updatedAt) : null,
      companyEntity.auditTrail.updatedBy != null ? UserId.of(companyEntity.auditTrail.updatedBy) : null
    );
    const clientId: ClientId = ClientId.of(companyEntity.id);
    let company: Company = CompanyFactory.withId(
      clientId, companyNameResult.value, rucResult.value, auditTrail
    );
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