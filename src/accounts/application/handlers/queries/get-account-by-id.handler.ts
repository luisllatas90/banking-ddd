import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { AccountDto } from '../../dtos/response/account.dto';
import { AccountMapper } from '../../mappers/account.mapper';
import { GetAccountById } from '../../messages/queries/get-account-by-id.query';

@QueryHandler(GetAccountById)
export class GetAccountByIdHandler implements IQueryHandler<GetAccountById> {
  constructor(private dataSource: DataSource) {}

  async execute(query: GetAccountById) {
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
    WHERE
      a.id = ?;`;
    const rows = await manager.query(sql, [query.accountId]);
    if (rows.length <= 0) return {};
    const accountDto: AccountDto = AccountMapper.toDto(rows[0]);
    return accountDto;
  }
}