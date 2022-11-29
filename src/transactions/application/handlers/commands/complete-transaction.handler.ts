import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionRepository } from 'src/transactions/domain/aggregates/transaction/transaction.repository';
import { CompleteTransaction } from '../../messages/commands/complete-transaction.command';
import { TRANSACTION_REPOSITORY } from '../../../domain/aggregates/transaction/transaction.repository';
import { Inject } from '@nestjs/common';
import { Transaction } from 'src/transactions/domain/aggregates/transaction/transaction.entity';
import { DataSource } from 'typeorm';

@CommandHandler(CompleteTransaction)
export class CompleteTransactionHandler implements ICommandHandler<CompleteTransaction> {
  constructor(
    private dataSource: DataSource,
    @Inject(TRANSACTION_REPOSITORY)
    private transactionRepository: TransactionRepository
  ) {
  }

  async execute(command: CompleteTransaction) {
    const transactionId: number = command.transactionId;
    let transaction: Transaction = await this.transactionRepository.getById(transactionId);
    if (transaction == null) return false;
    transaction.complete();
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      transaction = await this.transactionRepository.update(transaction);
      await queryRunner.commitTransaction();
    } catch(err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
    return transaction == null ? false : true;
  }
}