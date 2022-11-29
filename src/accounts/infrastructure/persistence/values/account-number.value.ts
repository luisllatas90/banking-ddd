import { Column, Unique } from 'typeorm';

export class AccountNumberValue {
  @Column('varchar', { name: 'number', length: 15, nullable: false })
  value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static from(value: string): AccountNumberValue {
    return new AccountNumberValue(value);
  }
}