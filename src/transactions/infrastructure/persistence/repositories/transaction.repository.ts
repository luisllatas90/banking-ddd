import { InjectRepository } from "@nestjs/typeorm";
import { TransactionMapper } from "src/transactions/application/mappers/transaction.mapper";
import { Transaction } from "src/transactions/domain/aggregates/transaction/transaction.entity";
import { TransactionRepository } from "src/transactions/domain/aggregates/transaction/transaction.repository";
import { Repository } from "typeorm";
import { TransactionEntity } from "../entities/transaction.entity";

export class TransactionEntityRepository implements TransactionRepository  {
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
  ) {}

  async create(transaction: Transaction): Promise<Transaction> {
    let transactionEntity: TransactionEntity = TransactionMapper.domainToEntity(transaction);
    transactionEntity = await this.transactionRepository.save(transactionEntity);
    return TransactionMapper.entityToDomain(transactionEntity);
  }

  async update(transaction: Transaction): Promise<Transaction> {
    let transactionEntity: TransactionEntity = TransactionMapper.domainToEntity(transaction);
    let transactionId: number = transaction.getId().getValue();
    await this.transactionRepository.update({ id: transactionId }, transactionEntity);
    return transaction;
  }

  async getById(id: number): Promise<Transaction> {
    let transactionEntity: TransactionEntity = await this.transactionRepository.findOne({ where: { id: id } });
    return TransactionMapper.entityToDomain(transactionEntity);
  }
}