import { AccountId } from 'src/accounts/domain/aggregates/account/account-id.value';
import { AccountNumber } from 'src/accounts/domain/aggregates/account/account-number.value';
import { AccountFactory } from 'src/accounts/domain/factories/account.factory';
import { AccountEntity } from 'src/accounts/infrastructure/persistence/entities/account.entity';
import { AccountNumberValue } from 'src/accounts/infrastructure/persistence/values/account-number.value';
import { BalanceValue } from 'src/accounts/infrastructure/persistence/values/balance.value';
import { ClientIdValue } from 'src/accounts/infrastructure/persistence/values/client-id.value';
import { ClientId } from 'src/clients/domain/aggregates/client/client-id.value';
import { AuditTrail } from 'src/shared/domain/values/audit-trail.value';
import { DateTime } from 'src/shared/domain/values/date-time.value';
import { Money } from 'src/shared/domain/values/money.value';
import { UserId } from 'src/users/domain/agreggates/user/user-id.value';
import { Account } from '../../domain/aggregates/account/account.root.entity';
import { AccountDto } from '../dtos/response/account.dto';
import { OpenAccount } from '../messages/commands/open-account.command';
import { Currency } from 'src/shared/domain/enums/currency.enum';
import { AppNotification } from 'src/shared/application/app.notification';
import { Result } from 'typescript-result';
import { AuditTrailValue } from 'src/shared/infrastructure/persistence/values/audit-trail.value';

export class AccountMapper {
  public static openAccountToDomain(openAccount: OpenAccount): Account {
    if (openAccount == null) return null;
    const accountNumberResult: Result<AppNotification, AccountNumber> = AccountNumber.create(openAccount.number);
    if (accountNumberResult.isFailure()) return null;
    const balance: Money = Money.create(0, Currency.SOLES);
    const auditTrail: AuditTrail = AuditTrail.from(
      DateTime.utcNow(),
      UserId.of(1),
      null,
      null
    );
    const clientId: ClientId = ClientId.of(openAccount.clientId);
    let account: Account = AccountFactory.withId(null, accountNumberResult.value, balance, clientId, auditTrail);
    return account;
  }
  
  public static domainToEntity(account: Account): AccountEntity {
    if (account == null) return null;
    const accountEntity: AccountEntity = new AccountEntity();
    accountEntity.id = account.getId() != null ? account.getId().getValue() : 0;
    accountEntity.number = account.getNumber() != null ? AccountNumberValue.from(account.getNumber().getValue()) : null;
    accountEntity.balance = account.getBalance() != null ? BalanceValue.from(account.getBalance().getAmount(), account.getBalance().getCurrency()) : null;
    accountEntity.clientId = account.getClientId() != null ? ClientIdValue.from(account.getClientId().getValue()) : null;
    accountEntity.auditTrail = account.getAuditTrail() != null ? AuditTrailValue.from(
      account.getAuditTrail().getCreatedAt().format(),
      account.getAuditTrail().getCreatedBy().getValue(),
      account.getAuditTrail().getUpdatedAt() != null ? account.getAuditTrail().getUpdatedAt().format() : null,
      account.getAuditTrail().getUpdatedBy() != null ? account.getAuditTrail().getUpdatedBy().getValue() : null) : null;
    return accountEntity;
  }

  public static entityToDomain(accountEntity: AccountEntity): Account {
    if (accountEntity == null) return null;
    const accountNumberResult: Result<AppNotification, AccountNumber> = AccountNumber.create(accountEntity.number.value);
    if (accountNumberResult.isFailure()) return null;
    const balance: Money = Money.create(accountEntity.balance.balance, accountEntity.balance.currency);
    const auditTrail: AuditTrail = AuditTrail.from(
      accountEntity.auditTrail.createdAt != '' ? DateTime.fromString(accountEntity.auditTrail.createdAt) : null,
      accountEntity.auditTrail.createdBy > 0 ? UserId.of(accountEntity.auditTrail.createdBy) : null,
      accountEntity.auditTrail.updatedAt != '' ? DateTime.fromString(accountEntity.auditTrail.updatedAt) : null,
      accountEntity.auditTrail.updatedBy > 0 ? UserId.of(accountEntity.auditTrail.updatedBy) : null
    );
    const clientId: ClientId = ClientId.of(accountEntity.clientId.value);
    const accountId: AccountId = AccountId.of(accountEntity.id);
    let account: Account = AccountFactory.withId(accountId, accountNumberResult.value, balance, clientId, auditTrail);
    return account;
  }

  public static toDto(row: any): AccountDto {
    let accountDto = new AccountDto();
    accountDto.id = Number(row.id);
    accountDto.number = row.number;
    accountDto.balance = Number(row.balance);
    accountDto.clientId = Number(row.client_id);
    accountDto.createdAt = row.created_at;
    accountDto.createdBy = row.created_by;
    accountDto.updatedAt = row.updated_at;
    accountDto.updatedBy = row.updated_by;
    return accountDto;
  }
}