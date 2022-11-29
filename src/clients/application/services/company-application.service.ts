import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AppNotification } from 'src/shared/application/app.notification';
import { Result } from 'typescript-result';
import { RegisterCompanyValidator } from '../validators/register-company.validator';
import { RegisterCompany } from '../messages/commands/register-company.command';
import { RegisterCompanyRequest } from '../dtos/request/register-company-request.dto';
import { RegisterCompanyResponse } from '../dtos/response/register-company-response.dto';
import { CompanyRepository, COMPANY_REPOSITORY } from 'src/clients/domain/aggregates/client/company.repository';
import { CompanyMapper } from '../mappers/company.mapper';
import { Company } from 'src/clients/domain/aggregates/client/company.entity';

@Injectable()
export class CompanyApplicationService {
  constructor(
    private commandBus: CommandBus,
    private registerCompanyValidator: RegisterCompanyValidator,
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  async getById(id: number) {
    return await this.companyRepository.getById(id);
  }

  async register(registerCompanyRequest: RegisterCompanyRequest): Promise<Result<AppNotification, RegisterCompanyResponse>> {
    const registerCompany: RegisterCompany = CompanyMapper.dtoRequestToCommand(registerCompanyRequest);
    const notification: AppNotification = await this.registerCompanyValidator.validate(registerCompany);
    if (notification.hasErrors()) return Result.error(notification);
    const company: Company = await this.commandBus.execute(registerCompany);
    const response: RegisterCompanyResponse = CompanyMapper.domainToDtoResponse(company);
    return Result.ok(response);
  }
}