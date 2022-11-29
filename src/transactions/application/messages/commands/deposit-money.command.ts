import { DateTime } from '../../../../shared/domain/values/date-time.value';
import { TransactionStatus } from '../../../domain/enums/transaction.status.enum';

export class DepositMoney {
  constructor(
    public readonly accountNumber: string,
    public readonly amount: number,
    public readonly status: TransactionStatus,
    public readonly createdAt: DateTime
  ) {}
}