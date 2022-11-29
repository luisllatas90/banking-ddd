import { TransactionStatus } from '../../../domain/enums/transaction.status.enum';
import { DateTime } from '../../../../shared/domain/values/date-time.value';

export class TransferMoney {
  constructor(
    public fromAccountNumber: string,
    public toAccountNumber: string,
    public amount: number,
    public status: TransactionStatus,
    public createdAt: DateTime
  ) {}
}