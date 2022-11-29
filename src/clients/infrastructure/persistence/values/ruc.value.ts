import { Column } from 'typeorm';

export class RucValue {
  @Column('varchar', { name: 'ruc', length: 11, nullable: true })
  value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static from(value: string): RucValue {
    return new RucValue(value);
  }
}