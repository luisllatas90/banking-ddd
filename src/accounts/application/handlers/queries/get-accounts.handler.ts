import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { GetAccounts } from '../../messages/queries/get-accounts.query';
import { AccountDto } from '../../dtos/response/account.dto';
import { AccountMapper } from '../../mappers/account.mapper';

@QueryHandler(GetAccounts)
export class GetAccountsHandler implements IQueryHandler<GetAccounts> {
  constructor(private dataSource: DataSource) {}

  async execute(query: GetAccounts) {
    const manager = this.dataSource.createEntityManager();
    const sql = `
    SELECT
      a.id,
      a.number,
      a.balance,
      a.client_id,
      a.created_at,
      a.created_by,
      a.updated_at,
      a.updated_by
    FROM 
      accounts a
    ORDER BY
      a.created_at DESC;`;
    const rows = await manager.query(sql);
    if (rows.length <= 0) return [];
    const accounts: AccountDto[] = rows.map(function (row: any) {
      return AccountMapper.toDto(row);
    });
    return accounts;
  }
}