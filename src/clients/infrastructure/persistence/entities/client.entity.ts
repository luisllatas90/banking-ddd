import { AuditTrailValue } from 'src/shared/infrastructure/persistence/values/audit-trail.value';
import { Column, Entity, PrimaryGeneratedColumn, TableInheritance } from 'typeorm';
import { ClientType } from '../../../domain/aggregates/client/client-type.enum';

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