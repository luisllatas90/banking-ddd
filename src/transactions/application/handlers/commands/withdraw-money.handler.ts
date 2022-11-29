import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { WithdrawMoney } from '../../messages/commands/withdraw-money.command';
import { Transaction } from '../../../domain/aggregates/transaction/transaction.entity';
import { TransactionMapper } from '../../mappers/transaction.mapper';
import { TransactionRepository, TRANSACTION_REPOSITORY } from 'src/transactions/domain/aggregates/transaction/transaction.repository';
import { AccountRepository, ACCOUNT_REPOSITORY } from 'src/accounts/domain/aggregates/account/account.repository';
import { Inject } from '@nestjs/common';
import { Account } from 'src/accounts/domain/aggregates/account/account.root.entity';
import { DataSource } from 'typeorm';

@CommandHandler(WithdrawMoney)
export class WithdrawMoneyHandler
  implements ICommandHandler<WithdrawMoney> {
  constructor(
    private dataSource: DataSource,
    @Inject(ACCOUNT_REPOSITORY)
    private accountRepository: AccountRepository,
    @Inject(TRANSACTION_REPOSITORY)
    private transactionRepository: TransactionRepository,
    private publisher: EventPublisher
  ) {
  }

  async execute(command: WithdrawMoney): Promise<Transaction> {
    const account: Account = await this.accountRepository.getByNumber(command.accountNumber);
    if (account == null) return null;
    let transaction: Transaction = TransactionMapper.withdrawMoneyToDomain(command, account.getId());
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      transaction = await this.transactionRepository.create(transaction);
      if (transaction == null) return null;
      transaction = this.publisher.mergeObjectContext(transaction);
      transaction.withdraw();
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