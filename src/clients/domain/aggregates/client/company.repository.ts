import { Company } from "./company.entity";

export const COMPANY_REPOSITORY = 'CompanyRepository';

export interface CompanyRepository {
  create(company: Company): Promise<Company>;
  update(company: Company): Promise<Company>;
  delete(companyId: number): Promise<boolean>;
  getById(id: number): Promise<Company>;
  getByName(name: string): Promise<Company>;
  getByRuc(ruc: string): Promise<Company>;
}