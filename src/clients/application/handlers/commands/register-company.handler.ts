import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RegisterCompany } from 'src/clients/application/messages/commands/register-company.command';
import { CompanyMapper } from '../../mappers/company.mapper';
import { Company } from 'src/clients/domain/aggregates/client/company.entity';
import { Inject } from '@nestjs/common';
import { CompanyRepository, COMPANY_REPOSITORY } from 'src/clients/domain/aggregates/client/company.repository';
import { AppSettings } from 'src/shared/application/app-settings';
import { DataSource } from 'typeorm';

@CommandHandler(RegisterCompany)
export class RegisterCompanyHandler
  implements ICommandHandler<RegisterCompany> {
  constructor(
    private dataSource: DataSource,
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    private publisher: EventPublisher,
  ) {
  }

  async execute(command: RegisterCompany) {
    let company: Company = CompanyMapper.commandToDomain(command, AppSettings.SUPER_ADMIN);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      company = await this.companyRepository.create(company);
      if (company == null) throw new Error("");
      company = this.publisher.mergeObjectContext(company);
      company.register();
      company.commit();
      await queryRunner.commitTransaction();
    } catch(err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
    return company;
  }
}