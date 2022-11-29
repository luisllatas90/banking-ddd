import { Inject, Injectable } from '@nestjs/common';
import { AccountRepository, ACCOUNT_REPOSITORY } from 'src/accounts/domain/aggregates/account/account.repository';
import { Account } from 'src/accounts/domain/aggregates/account/account.root.entity';
import { AppNotification } from 'src/shared/application/app.notification';
import { DepositMoney } from '../messages/commands/deposit-money.command';

@Injectable()
export class DepositMoneyValidator {
  constructor(
    @Inject(ACCOUNT_REPOSITORY) 
    private accountRepository: AccountRepository) {}

  public async validate(depositMoney: DepositMoney): Promise<AppNotification> {
    let notification: AppNotification = new AppNotification();
    const accountNumber: string = depositMoney.accountNumber.trim();
    if (accountNumber.length <= 0) {
      notification.addError('Account number is required', null);
    }
    if (notification.hasErrors()) {
      return notification;
    }
    const Account: Account = await this.accountRepository.getByNumber(accountNumber);
    if (Account == null) {
      notification.addError('Account number not found', null);
    }
    const amount: number = depositMoney.amount;
    if (amount <= 0) {
      notification.addError('Amount must be greater than zero', null);
    }
    return notification;
  }
}