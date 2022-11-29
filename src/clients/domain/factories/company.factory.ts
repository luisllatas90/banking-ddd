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