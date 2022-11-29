export class OpenAccountRequest {
  constructor(
    public readonly clientId: number,
    public readonly number: string
  ) {
  }
}