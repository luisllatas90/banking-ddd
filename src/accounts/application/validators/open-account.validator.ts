import { Inject, Injectable } from '@nestjs/common';
import { AccountRepository } from 'src/accounts/domain/aggregates/account/account.repository';
import { AppNotification } from 'src/shared/application/app.notification';
import { OpenAccountRequest } from '../dtos/request/open-account-request.dto';
import { ACCOUNT_REPOSITORY } from '../../domain/aggregates/account/account.repository';
import { Account } from 'src/accounts/domain/aggregates/account/account.root.entity';

@Injectable()
export class OpenAccountValidator {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private accountRepository: AccountRepository) {}

  public async validate(openAccountRequestDto: OpenAccountRequest): Promise<AppNotification> {
    let notification: AppNotification = new AppNotification();
    const number: string = openAccountRequestDto.number.trim();
    if (number.length <= 0) {
      notification.addError('Account number is required', null);
    }
    if (notification.hasErrors()) {
      return notification;
    }
    const account: Account = await this.accountRepository.getByNumber(number);
    if (account != null) {
      notification.addError('Account number is taken', null);
    }
    return notification;
  }
}