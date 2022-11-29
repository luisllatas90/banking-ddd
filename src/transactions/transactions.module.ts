import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositMoneyHandler } from './application/handlers/commands/deposit-money.handler';
import { TransactionsApplicationService } from './application/services/transactions-application.service';
import { TransactionsController } from './interface/rest/transactions.controller';
import { DepositMoneyValidator } from './application/validators/deposit-money.validator';
import { WithdrawMoneyValidator } from './application/validators/withdraw-money.validator';
import { TransferMoneyValidator } from './application/validators/transfer-money.validator';
import { WithdrawMoneyHandler } from './application/handlers/commands/withdraw-money.handler';
import { TransferMoneyHandler } from './application/handlers/commands/transfer-money.handler';
import { CompleteTransactionHandler } from './application/handlers/commands/complete-transaction.handler';
import { AccountEntity } from 'src/accounts/infrastructure/persistence/entities/account.entity';
import { TransactionEntity } from './infrastructure/persistence/entities/transaction.entity';
import { TransactionEntityRepository } from './infrastructure/persistence/repositories/transaction.repository';
import { TRANSACTION_REPOSITORY } from './domain/aggregates/transaction/transaction.repository';
import { ACCOUNT_REPOSITORY } from 'src/accounts/domain/aggregates/account/account.repository';
import { AccountEntityRepository } from 'src/accounts/infrastructure/persistence/repositories/account.repository';

export const CommandHandlers = [DepositMoneyHandler, WithdrawMoneyHandler, TransferMoneyHandler, CompleteTransactionHandler];
export const EventHandlers = [];
export const QueryHandlers = [];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([TransactionEntity, AccountEntity]),
  ],
  controllers: [TransactionsController],
  providers: [
    { useClass: AccountEntityRepository, provide: ACCOUNT_REPOSITORY },
    { useClass: TransactionEntityRepository, provide: TRANSACTION_REPOSITORY },
    TransactionsApplicationService,
    DepositMoneyValidator,
    WithdrawMoneyValidator,
    TransferMoneyValidator,
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers
  ]
})
export class TransactionsModule {}