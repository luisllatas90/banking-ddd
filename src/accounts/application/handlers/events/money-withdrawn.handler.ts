import { CommandBus, IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { Account } from '../../../domain/aggregates/account/account.root.entity';
import { AppNotification } from '../../../../shared/application/app.notification';
import { Money } from '../../../../shared/domain/values/money.value';
import { Currency } from '../../../../shared/domain/enums/currency.enum';
import { MoneyWithdrawn } from '../../../../transactions/domain/events/money-withdrawn.event';
import { CompleteTransaction } from '../../../../transactions/application/messages/commands/complete-transaction.command';
import { AccountRepository, ACCOUNT_REPOSITORY } from 'src/accounts/domain/aggregates/account/account.repository';
import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';

@EventsHandler(MoneyWithdrawn)
export class MoneyWithdrawnHandler implements IEventHandler<MoneyWithdrawn> {
  constructor(
    private dataSource: DataSource,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepository,
    private commandBus: CommandBus
  ) {}

  async handle(event: MoneyWithdrawn) {
    let account: Account = await this.accountRepository.getById(Number(event.accountIdFrom));
    if (account == null) { return; }
    const amount: Money = Money.create(event.amount, Currency.SOLES);
    const withdrawNotification: AppNotification = account.withdraw(amount);
    if (withdrawNotification.hasErrors()) return;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      account = await this.accountRepository.update(account);
      if (account == null) throw new Error("");
      const completeTransaction: CompleteTransaction = new CompleteTransaction(event.transactionId);
      await this.commandBus.execute(completeTransaction);
      await queryRunner.commitTransaction();
    } catch(err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
    return account;
  }
}