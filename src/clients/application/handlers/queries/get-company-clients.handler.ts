import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { CompanyClientDto } from '../../dtos/response/company-client.dto';
import { CompanyMapper } from '../../mappers/company.mapper';
import { GetCompanyClients } from '../../messages/queries/get-company-clients.query';

@QueryHandler(GetCompanyClients)
export class GetCompanyClientsHandler implements IQueryHandler<GetCompanyClients> {
  constructor(private dataSource: DataSource) {}

  async execute(query: GetCompanyClients) {
    const manager = this.dataSource.createEntityManager();
    const sql = `
    SELECT 
      id,
      company_name as companyName,
      ruc
    FROM 
      clients
    WHERE
      type = 'C'
    ORDER BY
      company_name;`;
    const rows = await manager.query(sql);
    if (rows.length <= 0) return [];
    const companyClients: CompanyClientDto[] = rows.map(function (row: any) {
      return CompanyMapper.ormToCompanyClientDto(row);
    });
    return companyClients;
  }
}