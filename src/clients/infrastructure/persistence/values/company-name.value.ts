import { Column } from 'typeorm';

export class CompanyNameValue {
  @Column('varchar', { name: 'company_name', length: 150, nullable: true })
  public value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static from(name: string): CompanyNameValue {
    return new CompanyNameValue(name);
  }
}