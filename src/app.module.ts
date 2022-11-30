import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ClientsModule } from './clients/clients.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { NotificationsModule } from './notifications/notifications.module';

console.log("cccc "+process.env.ENVIRONMENT);

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      url: process.env.BANKING_DDD_NEST_MYSQL,
      migrationsRun: true,
      logging: true,
      timezone: '+00:00',
      bigNumberStrings: false,
      entities: [
        process.env.ENVIRONMENT == 'prd' ? 
        '**/infrastructure/persistence/entities/*{.ts,.js}' : 
        'dist/**/infrastructure/persistence/entities/*{.ts,.js}'
      ],
      subscribers: [],
      migrations: [
        process.env.ENVIRONMENT == 'prd' ? 
        'shared/infrastructure/persistence/migrations/*{.ts,.js}' : 
        'dist/shared/infrastructure/persistence/migrations/*{.ts,.js}'
      ],
      migrationsTableName: "migrations"
    }),
    ClientsModule,
    AccountsModule,
    TransactionsModule,
    NotificationsModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}