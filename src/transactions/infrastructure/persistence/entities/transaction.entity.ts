import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TransactionStatus } from '../../../domain/enums/transaction.status.enum';
import { AuditTrailValue } from 'src/shared/infrastructure/persistence/values/audit-trail.value';
import { AmountValue } from '../values/amount.value';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', name: 'id', unsigned: true })
  public id: number;

  @Column('char', { name: 'type', length: 1, nullable: false })
  public type: string;

  @Column('bigint', { name: 'from_account_id', nullable: false, unsigned: true })
  public accountIdFrom: number;

  @Column('bigint', { name: 'to_account_id', nullable: true, unsigned: true })
  public accountIdTo: number;

  @Column(() => AmountValue, { prefix: false })
  public amount: AmountValue;

  @Column('tinyint', { name: 'status', width: 2, unsigned: true, nullable: false, })
  public status: TransactionStatus;

  @Column(() => AuditTrailValue, { prefix: false })
  public auditTrail: AuditTrailValue;
}