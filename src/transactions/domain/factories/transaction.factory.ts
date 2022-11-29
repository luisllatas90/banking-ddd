import { AuditTrail } from '../../../shared/domain/values/audit-trail.value';
import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionStatus } from '../enums/transaction.status.enum';
import { AccountId } from '../../../accounts/domain/aggregates/account/account-id.value';
import { Transaction } from '../aggregates/transaction/transaction.entity';
import { Money } from '../../../shared/domain/values/money.value';
import { TransactionId } from '../aggregates/transaction/transaction-id.value';

export class TransactionFactory {
  public static withId(transactionId: TransactionId, type: TransactionType, status: TransactionStatus, accountIdFrom: AccountId, 
                       accountIdTo: AccountId, amount: Money, auditTrail: AuditTrail): Transaction {
    return new Transaction(transactionId, type, status, accountIdFrom, accountIdTo, amount, auditTrail);
  }

  public static create(
    type: TransactionType, status: TransactionStatus, accountIdFrom: AccountId, accountIdTo: AccountId, amount: Money, auditTrail: AuditTrail): Transaction {
    return new Transaction(null, type, status, accountIdFrom, accountIdTo, amount, auditTrail);
  }
}