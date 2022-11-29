import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AccountNumberValue } from '../values/account-number.value';
import { BalanceValue } from '../values/balance.value';
import { AuditTrailValue } from '../../../../shared/infrastructure/persistence/values/audit-trail.value';
import { ClientIdValue } from '../values/client-id.value';

@Entity('accounts')
export class AccountEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', name: 'id', unsigned: true })
  public id: number;

  @Column((type) => AccountNumberValue, { prefix: false })
  public number: AccountNumberValue;

  @Column((type) => BalanceValue, { prefix: false })
  public balance: BalanceValue;

  @Column((type) => ClientIdValue, { prefix: false })
  public clientId: ClientIdValue;

  @Column((type) => AuditTrailValue, { prefix: false })
  public auditTrail: AuditTrailValue;
}