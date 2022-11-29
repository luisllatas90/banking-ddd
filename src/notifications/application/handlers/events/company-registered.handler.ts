import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { CompanyRegistered } from '../../../../clients/domain/events/company-registered.event';

@EventsHandler(CompanyRegistered)
export class CompanyRegisteredHandler implements IEventHandler<CompanyRegistered> {
  constructor() {}

  async handle(event: CompanyRegistered) {
    console.log(event);
  }
}