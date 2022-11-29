import { Account } from "./account.root.entity";
import { AccountFactory } from '../../factories/account.factory';
import { AccountId } from "./account-id.value";
import { AccountNumber } from "./account-number.value";
import { AuditTrail } from "src/shared/domain/values/audit-trail.value";
import { ClientId } from "src/clients/domain/aggregates/client/client-id.value";
import { Money } from "src/shared/domain/values/money.value";
import { Currency } from "src/shared/domain/enums/currency.enum";

describe('Account', () => {
  let account: Account;
  let accountId: AccountId;
  let accountNumber: AccountNumber;
  let clientId: ClientId;
  let auditTrail: AuditTrail;

  beforeEach(() => {
    accountId = AccountId.of(1);
    accountNumber = AccountNumber.create('123456789').getOrNull();
    clientId = ClientId.of(1);
  });

  describe('deposit', () => {
    it('should be deposited', () => {
      const currency: Currency = Currency.SOLES;
      
      const balanceAmount: number = 10;
      let balance: Money = Money.create(balanceAmount, currency);

      const depositAmount: number = 60;
      const amount: Money = Money.create(depositAmount, currency);

      const balanceExpected: number = balanceAmount + depositAmount;
      
      account = AccountFactory.withId(accountId, accountNumber, balance, clientId, auditTrail);
      
      account.deposit(amount);
      
      expect(account.getBalance().getAmount()).toBe(balanceExpected);
    });
  });

  describe('withdraw', () => {
    it('should be withdrawn', () => {
      const currency: Currency = Currency.SOLES;

      const balanceAmount: number = 250;
      let balance: Money = Money.create(balanceAmount, currency);

      const withdrawAmount: number = 150;
      const amount: Money = Money.create(withdrawAmount, currency);
      
      const balanceExpected: number = balanceAmount - withdrawAmount;
      
      account = AccountFactory.withId(accountId, accountNumber, balance, clientId, auditTrail);
      
      account.withdraw(amount);
      
      expect(account.getBalance().getAmount()).toBe(balanceExpected);
    });
  });
});