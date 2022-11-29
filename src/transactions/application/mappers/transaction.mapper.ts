import { AccountId } from 'src/accounts/domain/aggregates/account/account-id.value';
import { Currency } from 'src/shared/domain/enums/currency.enum';
import { AuditTrail } from 'src/shared/domain/values/audit-trail.value';
import { DateTime } from 'src/shared/domain/values/date-time.value';
import { Money } from 'src/shared/domain/values/money.value';
import { AuditTrailValue } from 'src/shared/infrastructure/persistence/values/audit-trail.value';
import { TransactionId } from 'src/transactions/domain/aggregates/transaction/transaction-id.value';
import { TransactionType } from 'src/transactions/domain/enums/transaction-type.enum';
import { TransactionStatus } from 'src/transactions/domain/enums/transaction.status.enum';
import { TransactionFactory } from 'src/transactions/domain/factories/transaction.factory';
import { TransactionEntity } from 'src/transactions/infrastructure/persistence/entities/transaction.entity';
import { AmountValue } from 'src/transactions/infrastructure/persistence/values/amount.value';
import { UserId } from 'src/users/domain/agreggates/user/user-id.value';
import { Transaction } from '../../domain/aggregates/transaction/transaction.entity';
import { TransferMoney } from '../messages/commands/transfer-money.command';
import { WithdrawMoney } from '../messages/commands/withdraw-money.command';

export class TransactionMapper {
  public static withdrawMoneyToDomain(command: WithdrawMoney, accountId: AccountId): Transaction {
    const amount: Money = Money.create(command.amount, Currency.SOLES);
    const auditTrail: AuditTrail = AuditTrail.from(
      DateTime.utcNow(),
      UserId.of(1),
      null,
      null
    );
    let transaction: Transaction = TransactionFactory.create(
      TransactionType.WITHDRAW, 
      TransactionStatus.STARTED, 
      accountId, 
      null, 
      amount,
      auditTrail);
    return transaction;
  }

  public static depositMoneyToDomain(command: WithdrawMoney, accountId: AccountId): Transaction {
    const amount: Money = Money.create(command.amount, Currency.SOLES);
    const auditTrail: AuditTrail = AuditTrail.from(
      DateTime.utcNow(),
      UserId.of(1),
      null,
      null
    );
    let transaction: Transaction = TransactionFactory.create(
      TransactionType.DEPOSIT, 
      TransactionStatus.STARTED, 
      accountId, 
      null, 
      amount,
      auditTrail);
    return transaction;
  }

  public static transferMoneyToDomain(command: TransferMoney, fromAccountId: AccountId, toAccountId: AccountId): Transaction {
    const amount: Money = Money.create(command.amount, Currency.SOLES);
    const auditTrail: AuditTrail = AuditTrail.from(
      DateTime.utcNow(),
      UserId.of(1),
      null,
      null
    );
    let transaction: Transaction = TransactionFactory.create(
      TransactionType.TRANSFER, 
      TransactionStatus.STARTED, 
      fromAccountId, 
      toAccountId,
      amount,
      auditTrail);
    return transaction;
  }

  public static domainToEntity(transaction: Transaction): TransactionEntity {
    const transactionEntity: TransactionEntity = new TransactionEntity();
    transactionEntity.type = transaction.getType();
    transactionEntity.status = transaction.getStatus();
    transactionEntity.accountIdFrom = transaction.getAccountFrom().getValue();
    transactionEntity.accountIdTo = (transaction.getAccountTo() != null && transaction.getAccountTo().getValue() > 0) ? transaction.getAccountTo().getValue() : null;
    transactionEntity.amount = AmountValue.from(transaction.getAmount().getAmount(), transaction.getAmount().getCurrency());
    transactionEntity.auditTrail = transaction.getAuditTrail() != null ? AuditTrailValue.from(
      transaction.getAuditTrail().getCreatedAt().format(),
      transaction.getAuditTrail().getCreatedBy().getValue(),
      transaction.getAuditTrail().getUpdatedAt() != null ? transaction.getAuditTrail().getUpdatedAt().format() : null,
      transaction.getAuditTrail().getUpdatedBy() != null ? transaction.getAuditTrail().getUpdatedBy().getValue() : null) : null;
    return transactionEntity;
  }

  public static entityToDomain(transactionEntity: TransactionEntity): Transaction {
    const amount: Money = Money.create(transactionEntity.amount.amount, transactionEntity.amount.currency);
    const auditTrail: AuditTrail = AuditTrail.from(
      transactionEntity.auditTrail.createdAt != '' ? DateTime.fromString(transactionEntity.auditTrail.createdAt) : null,
      transactionEntity.auditTrail.createdBy > 0 ? UserId.of(transactionEntity.auditTrail.createdBy) : null,
      transactionEntity.auditTrail.updatedAt != '' ? DateTime.fromString(transactionEntity.auditTrail.updatedAt) : null,
      transactionEntity.auditTrail.updatedBy > 0 ? UserId.of(transactionEntity.auditTrail.updatedBy) : null
    );
    const fromAccountId: AccountId = AccountId.of(transactionEntity.accountIdFrom);
    const toAccountId: AccountId = (transactionEntity.accountIdTo != null && transactionEntity.accountIdTo > 0) ? AccountId.of(transactionEntity.accountIdTo) : null;
    const transactionId: TransactionId = TransactionId.of(transactionEntity.id);
    let transaction: Transaction = TransactionFactory.withId(
      transactionId,
      transactionEntity.type == 'T' ? TransactionType.TRANSFER : transactionEntity.type == 'D' ? TransactionType.DEPOSIT : TransactionType.WITHDRAW,
      TransactionStatus.STARTED, 
      fromAccountId,
      toAccountId,
      amount,
      auditTrail);
    return transaction;
  }
}