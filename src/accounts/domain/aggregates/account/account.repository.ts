import { Account } from "./account.root.entity";

export const ACCOUNT_REPOSITORY = 'AccountRepository';

export interface AccountRepository {
  create(account: Account): Promise<Account>;
  update(account: Account): Promise<Account>;
  delete(accountId: number): Promise<boolean>;
  getById(id: number): Promise<Account>;
  getByNumber(number: string): Promise<Account>;
}