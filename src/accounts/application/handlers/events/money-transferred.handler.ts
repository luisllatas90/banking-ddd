import { CommandBus, IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { DataSource } from 'typeorm';
import { Account } from '../../../domain/aggregates/account/account.root.entity';
import { Money } from '../../../../shared/domain/values/money.value';
import { Currency } from '../../../../shared/domain/enums/currency.enum';
import { MoneyTransferred } from '../../../../transactions/domain/events/money-transferred.event';
import { CompleteTransaction } from '../../../../transactions/application/messages/commands/complete-transaction.command';
import { MoneyTransferService } from 'src/accounts/domain/services/money-transfer.service';
import { Inject } from '@nestjs/common';
import { AccountRepository, ACCOUNT_REPOSITORY } from 'src/accounts/domain/aggregates/account/account.repository';

@EventsHandler(MoneyTransferred)
export class MoneyTransferredHandler implements IEventHandler<MoneyTransferred> {
  constructor(
    private dataSource: DataSource,
    private readonly moneyTransferService: MoneyTransferService,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepository,
    private commandBus: CommandBus
  ) {}

  async handle(event: MoneyTransferred) {
    let fromAccount: Account = await this.accountRepository.getById(Number(event.accountIdFrom));
    let toAccount: Account = await this.accountRepository.getById(Number(event.accountIdTo));
    if (fromAccount == null) { return; }
    if (toAccount == null) { return; }
    const amount: Money = Money.create(event.amount, Currency.SOLES);
    const transferOk = this.moneyTransferService.transfer(fromAccount, toAccount, amount);
    if (!transferOk) return;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.accountRepository.update(fromAccount);
      await this.accountRepository.update(toAccount);
      const completeTransaction: CompleteTransaction = new CompleteTransaction(event.transactionId);
      await this.commandBus.execute(completeTransaction);
      await queryRunner.commitTransaction();
    } catch(err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}