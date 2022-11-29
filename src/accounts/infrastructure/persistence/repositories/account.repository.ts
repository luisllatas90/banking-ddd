import { InjectRepository } from "@nestjs/typeorm";
import { AccountMapper } from "src/accounts/application/mappers/account.mapper";
import { AccountRepository } from "src/accounts/domain/aggregates/account/account.repository";
import { Account } from "src/accounts/domain/aggregates/account/account.root.entity";
import { Repository } from "typeorm";
import { AccountEntity } from "../entities/account.entity";

export class AccountEntityRepository implements AccountRepository  {
  constructor(
    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>,
  ) {}

  async create(account: Account): Promise<Account> {
    let accountEntity: AccountEntity = AccountMapper.domainToEntity(account);
    accountEntity = await this.accountRepository.save(accountEntity);
    return AccountMapper.entityToDomain(accountEntity);
  }

  async update(account: Account): Promise<Account> {
    let accountEntity: AccountEntity = AccountMapper.domainToEntity(account);
    let accountId: number = account.getId().getValue();
    await this.accountRepository.update({ id: accountId }, accountEntity);
    return account;
  }

  async delete(accountId: number): Promise<boolean> {
    await this.accountRepository.delete({ id: accountId });
    return true;
  }

  async getById(id: number): Promise<Account> {
    let accountEntity: AccountEntity = await this.accountRepository.findOne({ where: { id: id } });
    return AccountMapper.entityToDomain(accountEntity);
  }

  async getByNumber(number: string): Promise<Account> {
    let accountEntity: AccountEntity = await this.accountRepository.createQueryBuilder().where("number = :number", { number }).getOne();
    return AccountMapper.entityToDomain(accountEntity);
  }
}