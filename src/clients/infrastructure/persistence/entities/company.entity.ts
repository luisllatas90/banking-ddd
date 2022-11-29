import { ChildEntity, Column } from 'typeorm';
import { ClientType } from '../../../domain/aggregates/client/client-type.enum';
import { CompanyNameValue } from '../values/company-name.value';
import { RucValue } from '../values/ruc.value';
import { ClientEntity } from './client.entity';

@ChildEntity(ClientType.COMPANY)
export class CompanyEntity extends ClientEntity {
  @Column((type) => CompanyNameValue, { prefix: false })
  public companyName: CompanyNameValue;

  @Column((type) => RucValue, { prefix: false })
  public ruc: RucValue;
}