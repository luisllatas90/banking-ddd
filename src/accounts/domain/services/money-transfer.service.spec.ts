import { AuditTrail } from "src/shared/domain/values/audit-trail.value";
import { ClientId } from "src/clients/domain/aggregates/client/client-id.value";
import { Money } from "src/shared/domain/values/money.value";
import { Currency } from "src/shared/domain/enums/currency.enum";
import { Account } from "../aggregates/account/account.root.entity";
import { AccountId } from "../aggregates/account/account-id.value";
import { AccountNumber } from "../aggregates/account/account-number.value";
import { AccountFactory } from "../factories/account.factory";
import { MoneyTransferService } from './money-transfer.service';

describe('MoneyTransferService', () => {
  let moneyTransferService: MoneyTransferService;
  
  let fromAccount: Account;
  let fromAccountId: AccountId;
  let fromAccountNumber: AccountNumber;
  
  let toAccount: Account;
  let toAccountId: AccountId;
  let toAccountNumber: AccountNumber;
  
  let clientId: ClientId;
  let auditTrail: AuditTrail;

  beforeEach(() => {
    moneyTransferService = new MoneyTransferService();
    
    fromAccountId = AccountId.of(1);
    fromAccountNumber = AccountNumber.create('123456789').getOrNull();
    
    toAccountId = AccountId.of(2);
    toAccountNumber = AccountNumber.create('123456788').getOrNull();
    
    clientId = ClientId.of(1);
  });

  describe('transfer', () => {
    it('should be transfered', () => {
      const currency = Currency.SOLES;

      const fromBalanceAmount: number = 500;
      let fromAccountBalance = Money.create(fromBalanceAmount, currency);

      const toBalanceAmount: number = 200;
      let toAccountBalance = Money.create(toBalanceAmount, currency);

      const transferAmount: number = 100;
      const amount = Money.create(transferAmount, currency);

      const fromBalanceExpected: number = fromBalanceAmount - transferAmount;

      const toBalanceExpected: number = toBalanceAmount + transferAmount;
      
      fromAccount = AccountFactory.withId(fromAccountId, fromAccountNumber, fromAccountBalance, clientId, auditTrail);
      
      toAccount = AccountFactory.withId(toAccountId, toAccountNumber, toAccountBalance, clientId, auditTrail);
      
      moneyTransferService.transfer(fromAccount, toAccount, amount);
      
      expect(fromAccount.getBalance().getAmount()).toBe(fromBalanceExpected);
      expect(toAccount.getBalance().getAmount()).toBe(toBalanceExpected);
    });
  });
});