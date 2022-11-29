export class RegisterCompanyResponse {
  constructor(
    public id: number,
    public readonly name: string,
    public readonly ruc: string,
    public readonly createdAt: string,
    public readonly createdBy: number
  ) {}
}