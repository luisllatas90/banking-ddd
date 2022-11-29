import { Column } from 'typeorm';

export class ClientIdValue {
  @Column('bigint', { name: 'client_id', unsigned: true })
  public value: number;

  private constructor(value: number) {
    this.value = Number(value);
  }

  public static from(value: number): ClientIdValue  {
    return new ClientIdValue(value);
  }
}