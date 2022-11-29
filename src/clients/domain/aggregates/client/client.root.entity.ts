import { AggregateRoot } from '@nestjs/cqrs';
import { ClientType } from 'src/clients/domain/aggregates/client/client-type.enum';
import { AuditTrail } from 'src/shared/domain/values/audit-trail.value';
import { ClientId } from './client-id.value';

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