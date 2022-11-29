import { Inject, Injectable } from '@nestjs/common';
import { Company } from 'src/clients/domain/aggregates/client/company.entity';
import { CompanyRepository, COMPANY_REPOSITORY } from 'src/clients/domain/aggregates/client/company.repository';
import { AppNotification } from 'src/shared/application/app.notification';
import { RegisterCompany } from '../messages/commands/register-company.command';

@Injectable()
export class RegisterCompanyValidator {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private companyRepository: CompanyRepository,
  ) {
  }

  public async validate(registerCompany: RegisterCompany): Promise<AppNotification> {
    let notification: AppNotification = new AppNotification();
    const name: string = registerCompany.name.trim();
    if (name.length <= 0) {
      notification.addError('name is required', null);
    }
    const ruc: string = registerCompany.ruc.trim();
    if (ruc.length <= 0) {
      notification.addError('ruc is required', null);
    }
    if (notification.hasErrors()) {
      return notification;
    }
    let company: Company = await this.companyRepository.getByName(name);
    if (company != null) {
      notification.addError('name is taken', null);
      return notification;
    }
    company = await this.companyRepository.getByRuc(ruc);
    if (company != null) {
      notification.addError('ruc is taken', null);
    }
    return notification;
  }
}