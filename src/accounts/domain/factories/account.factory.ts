import { Money } from '../../../shared/domain/values/money.value';
import { Account } from '../aggregates/account/account.root.entity';
import { AuditTrail } from '../../../shared/domain/values/audit-trail.value';
import { AccountNumber } from '../aggregates/account/account-number.value';
import { AccountId } from '../aggregates/account/account-id.value';
import { ClientId } from 'src/clients/domain/aggregates/client/client-id.value';

export class AccountFactory {
  public static withId(accountId: AccountId, number: AccountNumber, balance: Money, clientId: ClientId, auditTrail: AuditTrail): Account {
    let account: Account = new Account(number, balance, clientId, auditTrail);
    account.changeId(accountId);
    return account;
  }

  public static create(number: AccountNumber, balance: Money, clientId: ClientId, auditTrail: AuditTrail): Account {
    return new Account(number, balance, clientId, auditTrail);
  }
}