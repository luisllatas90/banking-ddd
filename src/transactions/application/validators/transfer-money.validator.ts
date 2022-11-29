import { Inject, Injectable } from '@nestjs/common';
import { AccountRepository, ACCOUNT_REPOSITORY } from 'src/accounts/domain/aggregates/account/account.repository';
import { Account } from 'src/accounts/domain/aggregates/account/account.root.entity';
import { AppNotification } from 'src/shared/application/app.notification';
import { TransferMoney } from '../messages/commands/transfer-money.command';

@Injectable()
export class TransferMoneyValidator {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private accountRepository: AccountRepository
  ) {}

  public async validate(transferMoney: TransferMoney): 
    Promise<AppNotification> {
    let notification: AppNotification = new AppNotification();
    const fromAccountNumber: string = transferMoney.fromAccountNumber.trim();
    if (fromAccountNumber.length <= 0) {
      notification.addError('From account number is required', null);
    }
    const toAccountNumber: string = transferMoney.toAccountNumber.trim();
    if (toAccountNumber.length <= 0) {
      notification.addError('To account number is required', null);
    }
    const amount: number = transferMoney.amount;
    if (amount <= 0) {
      notification.addError('Amount must be greater than zero', null);
    }
    if (notification.hasErrors()) {
      return notification;
    }
    const fromAccount: Account = await this.accountRepository.getByNumber(fromAccountNumber);
    if (fromAccount == null) {
      notification.addError('From account number not found', null);
    }
    const toAccount: Account = await this.accountRepository.getByNumber(toAccountNumber);
    if (toAccount == null) {
      notification.addError('To account number not found', null);
    }
    return notification;
  }
}