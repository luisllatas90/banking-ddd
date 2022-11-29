import { Transaction } from "./transaction.entity";

export const TRANSACTION_REPOSITORY = 'TransactionRepository';

export interface TransactionRepository {
  create(transaction: Transaction): Promise<Transaction>;
  update(transaction: Transaction): Promise<Transaction>;
  getById(id: number): Promise<Transaction>;
}