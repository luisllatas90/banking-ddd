import { Inject, Injectable } from '@nestjs/common';
import { AccountRepository, ACCOUNT_REPOSITORY } from 'src/accounts/domain/aggregates/account/account.repository';
import { Account } from 'src/accounts/domain/aggregates/account/account.root.entity';
import { AppNotification } from 'src/shared/application/app.notification';
import { WithdrawMoney } from '../messages/commands/withdraw-money.command';

@Injectable()
export class WithdrawMoneyValidator {
  constructor(
    @Inject(ACCOUNT_REPOSITORY) 
    private accountRepository: AccountRepository) {}

  public async validate(withdrawMoney: WithdrawMoney): Promise<AppNotification> {
    let notification: AppNotification = new AppNotification();
    const accountNumber: string = withdrawMoney.accountNumber.trim();
    if (accountNumber.length <= 0) {
      notification.addError('Account number is required', null);
    }
    if (notification.hasErrors()) {
      return notification;
    }
    const account: Account = await this.accountRepository.getByNumber(accountNumber);
    if (account == null) {
      notification.addError('Account number not found', null);
    }
    const amount: number = withdrawMoney.amount;
    if (amount <= 0) {
      notification.addError('Amount must be greater than zero', null);
    }
    return notification;
  }
}