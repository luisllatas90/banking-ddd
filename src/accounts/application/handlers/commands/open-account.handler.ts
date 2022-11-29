import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { OpenAccount } from '../../messages/commands/open-account.command';
import { Account } from '../../../domain/aggregates/account/account.root.entity';
import { AccountMapper } from '../../mappers/account.mapper';
import { AccountRepository, ACCOUNT_REPOSITORY } from 'src/accounts/domain/aggregates/account/account.repository';
import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';

@CommandHandler(OpenAccount)
export class OpenAccountHandler
  implements ICommandHandler<OpenAccount> {
  constructor(
    private dataSource: DataSource,
    @Inject(ACCOUNT_REPOSITORY)
    private accountRepository: AccountRepository,
    private publisher: EventPublisher
  ) {
  }

  async execute(command: OpenAccount): Promise<Account> {
    let account: Account = AccountMapper.openAccountToDomain(command);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      account = await this.accountRepository.create(account);
      if (account == null) throw new Error("");
      account = this.publisher.mergeObjectContext(account);
      account.open();
      account.commit();
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