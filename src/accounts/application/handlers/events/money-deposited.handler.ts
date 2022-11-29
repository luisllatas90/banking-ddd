import { CommandBus, IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { MoneyDeposited } from '../../../../transactions/domain/events/money-deposited.event';
import { DataSource } from 'typeorm';
import { Account } from '../../../domain/aggregates/account/account.root.entity';
import { AppNotification } from '../../../../shared/application/app.notification';
import { Money } from '../../../../shared/domain/values/money.value';
import { Currency } from '../../../../shared/domain/enums/currency.enum';
import { CompleteTransaction } from '../../../../transactions/application/messages/commands/complete-transaction.command';
import { Inject } from '@nestjs/common';
import { AccountRepository, ACCOUNT_REPOSITORY } from 'src/accounts/domain/aggregates/account/account.repository';

@EventsHandler(MoneyDeposited)
export class MoneyDepositedHandler implements IEventHandler<MoneyDeposited> {
  constructor(
    private dataSource: DataSource,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepository,
    private commandBus: CommandBus
  ) {}

  async handle(event: MoneyDeposited) {
    let account: Account = await this.accountRepository.getById(Number(event.accountIdFrom));
    if (account == null) { return; }
    const depositAmount: Money = Money.create(event.amount, Currency.SOLES);
    const depositNotification: AppNotification = account.deposit(depositAmount);
    if (depositNotification.hasErrors()) return;
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