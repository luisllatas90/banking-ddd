import { TransactionStatus } from '../enums/transaction.status.enum';
import { DateTime } from '../../../shared/domain/values/date-time.value';

export class MoneyDeposited {
  constructor(
    public readonly transactionId: number,
    public readonly accountIdFrom: number,
    public readonly amount: number,
    public readonly status: TransactionStatus,
    public readonly createdAt: DateTime
  ) {
  }
}