import { Account } from '../aggregates/account/account.root.entity';
import { Money } from '../../../shared/domain/values/money.value';
import { AppNotification } from 'src/shared/application/app.notification';

export class MoneyTransferService {
  public transfer(fromAccount: Account, toAccount: Account, amount: Money): boolean {
    const withdrawNotification: AppNotification = fromAccount.withdraw(amount);
    const depositNotification: AppNotification = toAccount.deposit(amount);
    if (withdrawNotification.hasErrors() || depositNotification.hasErrors()) {
      return false;
    }
    return true;
  }
}