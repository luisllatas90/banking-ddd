import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { AccountOpened } from '../../../../accounts/domain/events/account-opened.event';

@EventsHandler(AccountOpened)
export class AccountOpenedHandler implements IEventHandler<AccountOpened> {
  constructor() {}

  async handle(event: AccountOpened) {
    console.log(event);
  }
}