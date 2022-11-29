import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { TransferMoney } from '../../messages/commands/transfer-money.command';
import { Transaction } from '../../../domain/aggregates/transaction/transaction.entity';
import { TransactionMapper } from '../../mappers/transaction.mapper';
import { AccountRepository, ACCOUNT_REPOSITORY } from 'src/accounts/domain/aggregates/account/account.repository';
import { TransactionRepository, TRANSACTION_REPOSITORY } from 'src/transactions/domain/aggregates/transaction/transaction.repository';
import { Inject } from '@nestjs/common';
import { Account } from 'src/accounts/domain/aggregates/account/account.root.entity';
import { DataSource } from 'typeorm';

@CommandHandler(TransferMoney)
export class TransferMoneyHandler
  implements ICommandHandler<TransferMoney> {
  constructor(
    private dataSource: DataSource,
    @Inject(ACCOUNT_REPOSITORY)
    private accountRepository: AccountRepository,
    @Inject(TRANSACTION_REPOSITORY)
    private transactionRepository: TransactionRepository,
    private publisher: EventPublisher,
  ) {
  }

  async execute(command: TransferMoney): Promise<Transaction> {
    const fromAccount: Account = await this.accountRepository.getByNumber(command.fromAccountNumber);
    const toAccount: Account = await this.accountRepository.getByNumber(command.toAccountNumber);
    if (fromAccount == null) return null;
    if (toAccount == null) return null;
    let transaction: Transaction = TransactionMapper.transferMoneyToDomain(command, fromAccount.getId(), toAccount.getId());
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      transaction = await this.transactionRepository.create(transaction);
      if (transaction == null) throw new Error("");
      transaction = this.publisher.mergeObjectContext(transaction);
      transaction.transfer();
      transaction.commit();
      await queryRunner.commitTransaction();
    } catch(err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
    return transaction;
  }
}