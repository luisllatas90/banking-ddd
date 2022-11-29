import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { OpenAccount } from '../messages/commands/open-account.command';
import { OpenAccountResponse } from '../dtos/response/open-account-response.dto';
import { OpenAccountValidator } from '../validators/open-account.validator';
import { AppNotification } from 'src/shared/application/app.notification';
import { Result } from 'typescript-result';
import { OpenAccountRequest } from '../dtos/request/open-account-request.dto';
import { Account } from 'src/accounts/domain/aggregates/account/account.root.entity';

@Injectable()
export class AccountsApplicationService {
  constructor(
    private commandBus: CommandBus,
    private openAccountValidator: OpenAccountValidator,
  ) {}

  async open(openAccountRequestDto: OpenAccountRequest): Promise<Result<AppNotification, OpenAccountResponse>> {
    const notification: AppNotification = await this.openAccountValidator.validate(openAccountRequestDto);
    if (notification.hasErrors()) return Result.error(notification);
    const openAccount: OpenAccount = new OpenAccount(
      openAccountRequestDto.clientId,
      openAccountRequestDto.number
    );
    const account: Account = await this.commandBus.execute(openAccount);
    const openAccountResponse: OpenAccountResponse = new OpenAccountResponse(
      account.getId().getValue(), openAccount.number, 0, account.getAuditTrail().getCreatedAt().format(), 1, null, null, openAccount.clientId
    );
    return Result.ok(openAccountResponse);
  }
}