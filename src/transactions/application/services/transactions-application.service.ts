import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AppNotification } from 'src/shared/application/app.notification';
import { Result } from 'typescript-result';
import { DepositMoneyValidator } from '../validators/deposit-money.validator';
import { TransferMoneyValidator } from '../validators/transfer-money.validator';
import { WithdrawMoneyValidator } from '../validators/withdraw-money.validator';
import { DepositRequestDto } from '../dtos/request/deposit-request.dto';
import { DepositMoney } from '../messages/commands/deposit-money.command';
import { DateTime } from '../../../shared/domain/values/date-time.value';
import { TransactionStatus, TransactionStatusLabel } from '../../domain/enums/transaction.status.enum';
import { DepositResponseDto } from '../dtos/response/deposit-response.dto';
import { WithdrawRequestDto } from '../dtos/request/withdraw-request.dto';
import { WithdrawMoney } from '../messages/commands/withdraw-money.command';
import { WithdrawResponseDto } from '../dtos/response/withdraw-response.dto';
import { TransferRequestDto } from '../dtos/request/transfer-request.dto';
import { TransferMoney } from '../messages/commands/transfer-money.command';
import { TransferResponseDto } from '../dtos/response/transfer-response.dto';
import { TransactionType } from '../../domain/enums/transaction-type.enum';
import { Transaction } from 'src/transactions/domain/aggregates/transaction/transaction.entity';

@Injectable()
export class TransactionsApplicationService {
  constructor(
    private commandBus: CommandBus,
    private depositValidator: DepositMoneyValidator,
    private withdrawValidator: WithdrawMoneyValidator,
    private transferValidator: TransferMoneyValidator
  ) {}

  async deposit(depositRequestDto: DepositRequestDto): Promise<Result<AppNotification, DepositResponseDto>> {
    const depositMoney: DepositMoney = new DepositMoney(
      depositRequestDto.accountNumber,
      depositRequestDto.amount,
      TransactionStatus.STARTED,
      DateTime.utcNow()
    );
    const notification: AppNotification = await this.depositValidator.validate(depositMoney);
    if (notification.hasErrors()) return Result.error(notification);
    const transaction: Transaction = await this.commandBus.execute(depositMoney);
    const depositResponseDto: DepositResponseDto = new DepositResponseDto(
      transaction.getId().getValue(),
      TransactionType.DEPOSIT,
      depositRequestDto.accountNumber,
      depositRequestDto.amount,
      TransactionStatusLabel.get(TransactionStatus.STARTED),
      transaction.getAuditTrail() != null && transaction.getAuditTrail().getCreatedAt() != null ? transaction.getAuditTrail().getCreatedAt().format() : null,
    );
    return Result.ok(depositResponseDto);
  }

  async withdraw(withdrawRequestDto: WithdrawRequestDto): Promise<Result<AppNotification, WithdrawResponseDto>> {
    const withdrawMoney: WithdrawMoney = new WithdrawMoney(
      withdrawRequestDto.accountNumber,
      withdrawRequestDto.amount,
      TransactionStatus.STARTED,
      DateTime.utcNow()
    );
    const notification: AppNotification = await this.withdrawValidator.validate(withdrawMoney);
    if (notification.hasErrors()) return Result.error(notification);
    const transaction: Transaction = await this.commandBus.execute(withdrawMoney);
    const withdrawResponseDto: WithdrawResponseDto = new WithdrawResponseDto(
      transaction.getId().getValue(),
      TransactionType.WITHDRAW,
      withdrawRequestDto.accountNumber,
      withdrawRequestDto.amount,
      TransactionStatusLabel.get(TransactionStatus.STARTED),
      transaction.getAuditTrail() != null && transaction.getAuditTrail().getCreatedAt() != null ? transaction.getAuditTrail().getCreatedAt().format() : null,
    );
    return Result.ok(withdrawResponseDto);
  }

  async transfer(transferRequestDto: TransferRequestDto): 
    Promise<Result<AppNotification, TransferResponseDto>> {
    const transferMoney: TransferMoney = new TransferMoney(
      transferRequestDto.fromAccountNumber,
      transferRequestDto.toAccountNumber,
      transferRequestDto.amount,
      TransactionStatus.STARTED,
      DateTime.utcNow()
    );
    const notification: AppNotification = await this.transferValidator.validate(transferMoney);
    if (notification.hasErrors()) return Result.error(notification);
    const transaction: Transaction = await this.commandBus.execute(transferMoney);
    const transferResponseDto: TransferResponseDto = new TransferResponseDto(
      transaction.getId().getValue(),
      TransactionType.TRANSFER,
      transferRequestDto.fromAccountNumber,
      transferRequestDto.toAccountNumber,
      transferRequestDto.amount,
      TransactionStatusLabel.get(TransactionStatus.STARTED),
      transaction.getAuditTrail() != null && transaction.getAuditTrail().getCreatedAt() != null ? transaction.getAuditTrail().getCreatedAt().format() : null,
    );
    return Result.ok(transferResponseDto);
  }
}