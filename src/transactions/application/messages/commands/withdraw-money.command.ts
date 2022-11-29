import { TransactionStatus } from '../../../domain/enums/transaction.status.enum';
import { DateTime } from '../../../../shared/domain/values/date-time.value';

export class WithdrawMoney {
  constructor(
    public readonly accountNumber: string,
    public readonly amount: number,
    public readonly status: TransactionStatus,
    public readonly createdAt: DateTime
  ) {}
}