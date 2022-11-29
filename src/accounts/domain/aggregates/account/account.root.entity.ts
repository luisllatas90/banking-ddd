import { Money } from '../../../../shared/domain/values/money.value';
import { AppNotification } from '../../../../shared/application/app.notification';
import { AggregateRoot } from '@nestjs/cqrs';
import { AccountId } from './account-id.value';
import { AuditTrail } from '../../../../shared/domain/values/audit-trail.value';
import { AccountNumber } from './account-number.value';
import { AccountOpened } from '../../events/account-opened.event';
import { ClientId } from 'src/clients/domain/aggregates/client/client-id.value';

export class Account extends AggregateRoot {
  private id: AccountId;
  private readonly number: AccountNumber;
  private balance: Money;
  private readonly clientId: ClientId;
  private readonly auditTrail: AuditTrail;

  public constructor(number: AccountNumber, balance: Money, clientId: ClientId, auditTrail: AuditTrail) {
    super();
    this.number = number;
    this.balance = balance;
    this.clientId = clientId;
    this.auditTrail = auditTrail;
  }

  public open() {
    const event = new AccountOpened(this.id.getValue(), this.number.getValue(), this.clientId.getValue());
    this.apply(event);
  }

  public deposit(amount: Money): AppNotification {
    const notification: AppNotification = this.validate(amount);
    if (notification.hasErrors()) return notification;
    this.balance = this.balance.add(amount);
    return notification;
  }

  public withdraw(amount: Money): AppNotification {
    const notification: AppNotification = this.validate(amount);
    if (this.balance.getAmount() < amount.getAmount()) notification.addError('Cannot withdraw in the account, amount is greater than balance', null);
    if (notification.hasErrors()) return notification;
    this.balance = this.balance.subtract(amount);
    return notification;
  }

  public validate(amount: Money): AppNotification {
    const notification: AppNotification = new AppNotification();
    if (amount.getAmount() <= 0) notification.addError('The amount must be greater than zero', null);
    if (!this.hasIdentity()) notification.addError('The account has no identity', null);
    return notification;
  }

  public exist(): boolean {
    return this.id != null && this.id.getValue() > 0;
  }

  public doesNotExist(): boolean {
    return !this.exist();
  }

  public hasIdentity(): boolean {
    return this.number.getValue().trim().length > 0;
  }

  public getId(): AccountId {
    return this.id;
  }

  public getNumber(): AccountNumber {
    return this.number;
  }

  public getBalance(): Money {
    return this.balance;
  }

  public getClientId(): ClientId {
    return this.clientId;
  }

  public getAuditTrail(): AuditTrail {
    return this.auditTrail;
  }

  public changeId(id: AccountId) {
    this.id = id;
  }
}